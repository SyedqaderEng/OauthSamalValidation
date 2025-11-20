# MockAuth - OAuth & SAML Testing Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A production-grade SaaS platform for testing OAuth 2.0 and SAML 2.0 authentication flows without the complexity of setting up real identity providers.

## Features

### OAuth 2.0
- ✅ All grant types: Authorization Code, PKCE, Client Credentials, Refresh Token
- ✅ Configurable token lifetimes
- ✅ Custom scopes and redirect URIs
- ✅ Auto-approve for testing
- ✅ Well-known discovery endpoint

### SAML 2.0
- ✅ Identity Provider (IdP) mode
- ✅ Service Provider (SP) mode
- ✅ Metadata generation and import
- ✅ Configurable attribute mappings
- ✅ Signed assertions and responses
- ✅ Encrypted assertions (optional)

### Developer Tools
- 🔓 JWT Decoder with signature verification
- 📄 SAML Response Decoder (Base64 and XML)
- 🔤 Base64 Encoder/Decoder
- 📊 Test user management
- 🔍 Audit logging

### Production Ready
- 🔒 Secure password hashing (bcrypt)
- 🔐 Client secrets encrypted at rest (AES-256-GCM)
- ⏱️ Rate limiting on all endpoints
- 📧 Email notifications with XML backups
- 🗑️ Automatic 30-day resource expiry
- 🐳 Docker deployment ready
- 📈 Health check endpoints

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (production) / SQLite (development)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **Email**: Nodemailer
- **Cron**: node-cron

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL (production) or SQLite (development)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd OauthSamalValidation
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

For **local development**:
```bash
cp local.env .env
```

For **production**:
```bash
cp prod.env .env
# Edit .env with your production values
```

The `local.env` file is pre-configured with working defaults for local development. For production, update all values in `.env` after copying from `prod.env`.

Generate secure secrets for production:
```bash
# For NEXTAUTH_SECRET and JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# For ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma migrate dev
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Create `.env` file with production values**
```bash
cp prod.env .env
# Edit .env with your production values
```

2. **Start all services**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Redis (for distributed rate limiting)
- MockAuth application

3. **Access the application**
```
http://localhost:3000
```

### Using Docker only

1. **Build the image**
```bash
docker build -t mockauth .
```

2. **Run the container**
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e JWT_SECRET="your-jwt-secret" \
  -e ENCRYPTION_KEY="your-encryption-key" \
  mockauth
```

## Database Schema

The application uses the following main models:

- **User** - User accounts with authentication
- **OAuthApp** - OAuth 2.0 application configurations
- **OAuthToken** - Issued OAuth tokens
- **SamlEnvironment** - SAML IdP/SP configurations
- **SamlSession** - Active SAML sessions
- **ApiKey** - API key management
- **AuditLog** - Audit trail for all actions

All schema details can be found in `prisma/schema.prisma`.

## API Endpoints

### Authentication
```
POST /api/auth/register      - Register new user
POST /api/auth/signin        - Sign in
POST /api/auth/signout       - Sign out
```

### OAuth Management
```
GET    /api/oauth/apps       - List OAuth apps
POST   /api/oauth/apps       - Create OAuth app
GET    /api/oauth/apps/:id   - Get OAuth app details
PATCH  /api/oauth/apps/:id   - Update OAuth app
DELETE /api/oauth/apps/:id   - Delete OAuth app
```

### OAuth Endpoints
```
GET  /oauth/authorize         - Authorization endpoint
POST /oauth/token             - Token endpoint
GET  /oauth/userinfo          - UserInfo endpoint
POST /oauth/revoke            - Token revocation
GET  /.well-known/oauth-authorization-server  - Discovery
```

### SAML Management
```
GET    /api/saml/environments       - List SAML environments
POST   /api/saml/environments       - Create SAML environment
GET    /api/saml/environments/:id   - Get environment details
PATCH  /api/saml/environments/:id   - Update environment
DELETE /api/saml/environments/:id   - Delete environment
```

### SAML Endpoints
```
GET  /saml/:id/metadata      - IdP/SP metadata XML
POST /saml/:id/sso           - SSO endpoint
POST /saml/:id/acs           - Assertion Consumer Service
POST /saml/:id/slo           - Single Logout
```

### Tools
```
POST /api/tools/jwt          - Decode JWT
POST /api/tools/saml         - Decode SAML
POST /api/tools/base64       - Encode/Decode Base64
```

### Health
```
GET /api/health              - Health check endpoint
```

## Configuration

### Rate Limiting

Configure rate limits in `lib/rate-limit.ts`:

```typescript
export const rateLimitConfigs = {
  auth: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 10,            // 10 requests per window
  },
  api: {
    windowMs: 60 * 1000,        // 1 minute
    maxRequests: 100,           // 100 requests per window
  },
};
```

### Cleanup Cron Job

Configure automatic resource cleanup in `.env`:

```env
CLEANUP_ENABLED=true
CLEANUP_CRON="0 2 * * *"      # Daily at 2 AM
RESOURCE_EXPIRY_DAYS=30
```

The cleanup job:
1. Sends warning emails 3 days before expiry
2. Sends final notification on expiry day
3. Soft-deletes expired resources
4. Hard-deletes soft-deleted resources after 90 days

### Email Configuration

Configure SMTP settings in `.env`:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@mockauth.dev"
```

## Security

### Authentication
- Bcrypt password hashing (10 rounds)
- JWT-based sessions with NextAuth.js
- Secure HTTP-only cookies

### Data Protection
- Client secrets encrypted at rest (AES-256-GCM)
- SAML private keys encrypted at rest
- API keys hashed (non-reversible)

### Rate Limiting
- Per-IP rate limiting on all endpoints
- Configurable limits per endpoint type
- 429 responses with Retry-After headers

### Compliance
- 30-day automatic resource expiry
- Email notifications before deletion
- GDPR-compliant data export
- Audit logging for all actions

## Development

### Project Structure

```
OauthSamalValidation/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   └── page.tsx           # Landing page
├── lib/                   # Core libraries
│   ├── crypto.ts          # Encryption utilities
│   ├── oauth/             # OAuth service
│   ├── saml/              # SAML service
│   ├── email/             # Email service
│   ├── cron/              # Cleanup jobs
│   └── rate-limit.ts      # Rate limiting
├── prisma/                # Database schema
│   └── schema.prisma
├── public/                # Static assets
├── auth.ts                # NextAuth configuration
├── middleware.ts          # Route protection
├── next.config.ts         # Next.js config
├── local.env              # Local development config template
├── prod.env               # Production config template
├── Dockerfile             # Docker build configuration
└── docker-compose.yml     # Docker Compose setup
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check

# Prisma commands
npx prisma generate  # Generate Prisma Client
npx prisma migrate dev  # Run migrations (development)
npx prisma migrate deploy  # Run migrations (production)
npx prisma studio    # Open Prisma Studio
```

### Testing OAuth Flow

1. Create an OAuth app in the dashboard
2. Copy the Client ID and Client Secret
3. Use the authorization URL:
```
http://localhost:3000/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=YOUR_REDIRECT_URI&
  response_type=code&
  scope=openid profile email
```

4. Exchange the code for tokens:
```bash
curl -X POST http://localhost:3000/oauth/token \
  -d "grant_type=authorization_code" \
  -d "code=AUTH_CODE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=YOUR_REDIRECT_URI"
```

### Testing SAML Flow

1. Create a SAML IdP environment in the dashboard
2. Download the metadata XML
3. Configure your SP with the metadata
4. Initiate SSO from your SP
5. MockAuth will generate a SAML assertion and redirect back

## Production Deployment

### Vercel (Recommended for Next.js)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Docker on VPS/Cloud

1. Set up PostgreSQL database
2. Configure environment variables
3. Build and run with Docker Compose:
```bash
docker-compose up -d
```

### Environment Variables (Production)

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=...
JWT_SECRET=...
ENCRYPTION_KEY=...
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM=...
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication powered by [NextAuth.js](https://next-auth.js.org/)
- Database ORM by [Prisma](https://www.prisma.io/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
