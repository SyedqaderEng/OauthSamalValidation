# Authentication Setup Guide

## Issue Summary
Your authentication was failing due to:
1. ❌ Missing database connection (DATABASE_URL)
2. ❌ Missing encryption keys (ENCRYPTION_KEY, JWT_SECRET)
3. ❌ Weak NextAuth secret
4. ❌ Missing OAuth credentials (Google, GitHub)

## ✅ Fixed
I've already configured:
- ✅ Secure NEXTAUTH_SECRET
- ✅ ENCRYPTION_KEY for encrypting OAuth client secrets
- ✅ JWT_SECRET for signing tokens
- ✅ All Firebase credentials are properly set

## 🔧 Remaining Setup Steps

### Step 1: Set Up Database (Choose One Option)

#### Option A: Supabase (Recommended - Free & Easy)
1. Go to [https://supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Go to Project Settings → Database
5. Copy the "Connection string" (URI format)
6. Update `.env.local`:
   ```bash
   DATABASE_URL="your-supabase-connection-string"
   ```

#### Option B: Neon (Alternative Free Option)
1. Go to [https://neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Update `.env.local`:
   ```bash
   DATABASE_URL="your-neon-connection-string"
   ```

#### Option C: Local PostgreSQL
If you have PostgreSQL installed and running:
```bash
# Create database
createdb mockauth

# Update .env.local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mockauth"
```

### Step 2: Run Database Migrations
After setting up the database, run:
```bash
npx prisma generate
npx prisma db push
```

### Step 3: Set Up Google OAuth (For Social Login)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (for production)
7. Copy Client ID and Client Secret
8. Update `.env.local`:
   ```bash
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

### Step 4: Set Up GitHub OAuth (For Social Login)

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: MockAuth (or your app name)
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Generate a new client secret
6. Update `.env.local`:
   ```bash
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   ```

### Step 5: Enable OAuth in Firebase Console

For Firebase social authentication to work alongside NextAuth:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `mockoauth-ed565`
3. Go to "Authentication" → "Sign-in method"
4. Enable "Google" provider
   - Use the same Google OAuth credentials from Step 3
5. Enable "GitHub" provider
   - Use the same GitHub OAuth credentials from Step 4
6. Add authorized domains:
   - `localhost` (already enabled)
   - Your production domain (when deploying)

## 🧪 Testing Authentication

### Test Username/Password Login:
1. Start the dev server: `npm run dev`
2. Go to `http://localhost:3000/signup`
3. Create an account
4. Go to `http://localhost:3000/login`
5. Sign in with your credentials

### Test Social Login:
1. Make sure OAuth credentials are configured (Steps 3-5)
2. Go to `http://localhost:3000/login`
3. Click "Google" or "GitHub" button
4. Authorize the app
5. You should be redirected to the dashboard

## 🔒 Environment Variables Summary

Your `.env.local` should have:
```bash
# Firebase (✅ Already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

# OpenAI (✅ Already configured)
OPENAI_API_KEY=...

# NextAuth (✅ Already configured)
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# Database (⚠️ TODO: Set this up)
DATABASE_URL="postgresql://..."

# Encryption (✅ Already configured)
ENCRYPTION_KEY=...
JWT_SECRET=...

# OAuth Providers (⚠️ TODO: Set these up)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

## 🚨 Common Issues

### Issue: "PrismaClientInitializationError"
**Solution**: Database not configured. Complete Step 1 and Step 2.

### Issue: "Invalid email or password"
**Solution**:
- Make sure you created an account via `/signup` first
- Database migrations must be run (Step 2)

### Issue: Social login redirects but doesn't log in
**Solution**:
- Check that OAuth credentials are correctly set in `.env.local`
- Verify redirect URIs in Google/GitHub OAuth settings match exactly
- Check Firebase Console has providers enabled

### Issue: "Error: NEXTAUTH_SECRET is not set"
**Solution**: Already fixed! Just restart your dev server.

## 📝 Quick Start Script

After setting up the database URL, run:
```bash
# Install dependencies (if needed)
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Start development server
npm run dev
```

## Need Help?

1. **Database Issues**: The app requires a PostgreSQL database. Supabase is the easiest free option.
2. **OAuth Setup**: You can skip OAuth setup and just use email/password login for testing.
3. **Production**: Update `NEXTAUTH_URL` and OAuth redirect URIs when deploying.
