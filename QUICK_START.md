# 🚀 Quick Start - Fix Authentication Now

## What Was Fixed
I've already configured your authentication system with:
- ✅ Secure secrets (NEXTAUTH_SECRET, ENCRYPTION_KEY, JWT_SECRET)
- ✅ Firebase credentials (already working)
- ✅ OpenAI API key (already set)

## 🎯 Get Authentication Working in 2 Minutes

### Option 1: SQLite (Easiest - No External Setup)

The DATABASE_URL is already configured for SQLite. Just run:

```bash
# Create the database (using existing Prisma client)
touch dev.db

# Start the development server
npm run dev
```

Then:
1. Go to http://localhost:3000/signup
2. Create an account with email/password
3. Go to http://localhost:3000/login and sign in

**Note**: If you get Prisma errors, see Option 2 below.

### Option 2: Free Cloud Database (Recommended)

#### Using Supabase (100% Free):
1. Visit https://supabase.com and sign up
2. Create a new project
3. Go to Project Settings → Database
4. Copy the "Connection string" (URI format)
5. Update `.env.local`:
   ```bash
   # Replace this line:
   DATABASE_URL="file:./dev.db"

   # With your Supabase connection string:
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres"
   ```
6. Run:
   ```bash
   npx prisma db push
   npm run dev
   ```

## 🔓 What Works Right Now

### ✅ Username/Password Login
Once database is set up:
- Signup: http://localhost:3000/signup
- Login: http://localhost:3000/login

### ⚠️ Social Login (Google/GitHub)
**Status**: Not configured yet

Social login requires OAuth credentials. To enable:

**Google OAuth:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `.env.local`:
   ```bash
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

**GitHub OAuth:**
1. Go to https://github.com/settings/developers
2. Create new OAuth App
3. Set callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env.local`:
   ```bash
   GITHUB_CLIENT_ID="your-client-id"
   GITHUB_CLIENT_SECRET="your-client-secret"
   ```

5. **Enable in Firebase:**
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable Google and GitHub providers
   - Use the same OAuth credentials

## 🐛 Troubleshooting

### Error: "PrismaClientInitializationError"
**Cause**: Database not connected
**Fix**: Follow Option 2 above (Use Supabase)

### Error: "Invalid email or password"
**Causes**:
1. You haven't created an account yet → Go to `/signup` first
2. Database isn't set up → Follow Option 1 or 2 above
3. Wrong password → Use the password you created during signup

### Error: "signIn is not defined" or "NextAuth error"
**Cause**: Environment variables not loaded
**Fix**: Restart dev server after changing `.env.local`

### Social Login Button Does Nothing
**Causes**:
1. OAuth credentials not set → See "Social Login" section above
2. Redirect URIs don't match → Check URLs in Google/GitHub settings
3. Provider not enabled in Firebase → Enable in Firebase Console

## 📋 Environment Variables Checklist

Check your `.env.local` file has these (without placeholders):

```bash
# ✅ Already Configured
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...         # ✅
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...            # ✅
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...             # ✅
NEXTAUTH_SECRET=Yi05oaB...                      # ✅
ENCRYPTION_KEY=5287829a...                      # ✅
JWT_SECRET=PIC+e1J4d...                         # ✅
OPENAI_API_KEY=sk-proj-...                      # ✅

# ⚠️ REQUIRED - Must Set Up
DATABASE_URL="file:./dev.db"                    # ⚠️ Set to Supabase URL

# ⚠️ OPTIONAL - For Social Login Only
GOOGLE_CLIENT_ID="..."                          # ⚠️ Not set
GOOGLE_CLIENT_SECRET="..."                      # ⚠️ Not set
GITHUB_CLIENT_ID="..."                          # ⚠️ Not set
GITHUB_CLIENT_SECRET="..."                      # ⚠️ Not set
```

## 🎯 Recommended Next Steps

1. **For Quick Testing**: Use Option 1 (SQLite) - Already configured!
2. **For Production-Ready**: Use Option 2 (Supabase) - Takes 5 minutes
3. **For Social Login**: Set up OAuth credentials (Optional)

## 📚 More Help

- Detailed setup guide: `AUTHENTICATION_SETUP.md`
- Authentication architecture: See auth.ts and lib/firebase.ts
- Issues? Check the troubleshooting section above

## 🎉 Test Your Setup

After setting up the database, test these flows:

1. **Create Account**:
   - Go to http://localhost:3000/signup
   - Fill in: Name, Email, Password
   - Click "Create Account"
   - Should redirect to login

2. **Login**:
   - Go to http://localhost:3000/login
   - Enter your email and password
   - Click "Sign In"
   - Should redirect to dashboard

3. **Social Login** (if configured):
   - Go to http://localhost:3000/login
   - Click "Google" or "GitHub"
   - Authorize the app
   - Should redirect to dashboard

## ⏱️ Time Estimates

- Option 1 (SQLite): 1 minute
- Option 2 (Supabase): 5 minutes
- Google OAuth: 10 minutes
- GitHub OAuth: 5 minutes

---

**TL;DR**:
1. Use Supabase for DATABASE_URL
2. Run: `npx prisma db push && npm run dev`
3. Test at http://localhost:3000/signup
