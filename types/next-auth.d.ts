import 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      plan: string;
      maxOAuthApps: number;
      maxSamlEnvs: number;
      maxExpiry: number;
      apiAccess: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    plan?: string;
    maxOAuthApps?: number;
    maxSamlEnvs?: number;
    maxExpiry?: number;
    apiAccess?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    plan?: string;
    maxOAuthApps?: number;
    maxSamlEnvs?: number;
    maxExpiry?: number;
    apiAccess?: boolean;
  }
}
