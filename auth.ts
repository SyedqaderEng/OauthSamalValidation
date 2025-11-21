import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { verifyPassword } from './lib/crypto';
import prisma from './lib/prisma';

async function getUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user || !user.password) return null;

          const passwordsMatch = await verifyPassword(password, user.password);
          if (passwordsMatch) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            };
          }
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth sign-ins, create or update user
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            // Create new user with free plan
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
                plan: 'free',
                maxOAuthApps: 5,
                maxSamlEnvs: 3,
                maxExpiry: 30,
                apiAccess: false,
              },
            });
          } else {
            // Update existing user's image if needed
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
              },
            });
          }

          // Link account if not already linked
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
          });

          if (!existingAccount) {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email! },
            });
            if (dbUser) {
              await prisma.account.create({
                data: {
                  userId: dbUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              });
            }
          }
        } catch (error) {
          console.error('OAuth sign-in error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Fetch user from database to get plan info
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { id: true, plan: true, maxOAuthApps: true, maxSamlEnvs: true, maxExpiry: true, apiAccess: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.plan = dbUser.plan;
          token.maxOAuthApps = dbUser.maxOAuthApps;
          token.maxSamlEnvs = dbUser.maxSamlEnvs;
          token.maxExpiry = dbUser.maxExpiry;
          token.apiAccess = dbUser.apiAccess;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.plan = token.plan as string;
        session.user.maxOAuthApps = token.maxOAuthApps as number;
        session.user.maxSamlEnvs = token.maxSamlEnvs as number;
        session.user.maxExpiry = token.maxExpiry as number;
        session.user.apiAccess = token.apiAccess as boolean;
      }
      return session;
    },
  },
});
