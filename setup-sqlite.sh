#!/bin/bash

# Quick Setup Script for SQLite (No External Database Required)
# This script sets up a local SQLite database for quick testing

echo "🚀 MockAuth - Quick SQLite Setup"
echo "================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    exit 1
fi

echo "📦 Step 1: Backing up current Prisma schema..."
cp prisma/schema.prisma prisma/schema.postgres.backup
echo "✅ Backup created: prisma/schema.postgres.backup"
echo ""

echo "📝 Step 2: Switching to SQLite schema..."
cp prisma/schema.sqlite.prisma prisma/schema.prisma
echo "✅ SQLite schema activated"
echo ""

echo "🔧 Step 3: Updating DATABASE_URL in .env.local..."
# Use sed to update DATABASE_URL to use SQLite
if grep -q "^DATABASE_URL=" .env.local; then
    # Comment out old DATABASE_URL and add new one
    sed -i.bak 's|^DATABASE_URL=.*|# DATABASE_URL (PostgreSQL - commented out for SQLite testing)\n# &\nDATABASE_URL="file:./dev.db"|' .env.local
    echo "✅ DATABASE_URL updated to use SQLite (file:./dev.db)"
else
    echo 'DATABASE_URL="file:./dev.db"' >> .env.local
    echo "✅ DATABASE_URL added to .env.local"
fi
echo ""

echo "🔨 Step 4: Generating Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi
echo "✅ Prisma client generated"
echo ""

echo "📊 Step 5: Creating SQLite database..."
npx prisma db push --skip-generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to create database"
    exit 1
fi
echo "✅ Database created: dev.db"
echo ""

echo "✅ Setup Complete!"
echo ""
echo "📋 What was configured:"
echo "  ✅ SQLite database (dev.db)"
echo "  ✅ Prisma client generated"
echo "  ✅ All tables created"
echo ""
echo "🧪 Next Steps:"
echo "  1. Start the dev server: npm run dev"
echo "  2. Go to http://localhost:3000/signup"
echo "  3. Create an account with email/password"
echo "  4. Test login at http://localhost:3000/login"
echo ""
echo "⚠️  Note: Social login (Google/GitHub) requires OAuth setup."
echo "    See AUTHENTICATION_SETUP.md for instructions."
echo ""
echo "🔄 To switch back to PostgreSQL:"
echo "  cp prisma/schema.postgres.backup prisma/schema.prisma"
echo "  Update DATABASE_URL in .env.local"
echo "  npm prisma generate && npx prisma db push"
echo ""
