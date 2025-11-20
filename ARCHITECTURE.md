# MockAuth - Production Architecture

## System Overview
MockAuth is a production-grade SaaS platform for OAuth 2.0 and SAML 2.0 testing and development.

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Radix UI primitives
- **State Management**: React Context + Server Components
- **Forms**: React Hook Form + Zod validation

### Backend
- **Runtime**: Node.js 18+
- **API**: Next.js API Routes (App Router)
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Session**: JWT + Database sessions
- **Email**: Resend (or Nodemailer fallback)
- **Cron Jobs**: node-cron for cleanup tasks

### OAuth/SAML Libraries
- **OAuth 2.0**: `oauth2-server`, custom implementation
- **SAML**: `saml2-js`, `xml-crypto`, `xmlbuilder2`
- **JWT**: `jsonwebtoken`, `jose`
- **Crypto**: `node:crypto`, `bcryptjs`

### DevOps
- **Containerization**: Docker + Docker Compose
- **Database Migrations**: Prisma Migrate
- **Environment**: `.env` with validation
- **Logging**: Winston or Pino
- **Monitoring**: Built-in health checks

## Database Schema

### Users
- id, email, password_hash, name, created_at, updated_at
- email_verified, verification_token
- subscription_tier (free, pro, enterprise)

### OAuth Apps
- id, user_id, name, description
- client_id, client_secret_hash
- grant_types[], redirect_uris[], scopes[]
- access_token_lifetime, refresh_token_lifetime
- auto_approve, is_public
- created_at, expires_at, deleted_at

### SAML Environments
- id, user_id, name, description, type (idp/sp)
- entity_id, sso_url, slo_url
- certificate, private_key
- attribute_mappings (JSON)
- nameid_format, assertion_lifetime
- sign_assertions, sign_response, encrypt_assertions
- created_at, expires_at, deleted_at

### API Keys
- id, user_id, name, key_hash
- permissions[], last_used_at
- created_at, expires_at, revoked_at

### Sessions (OAuth/SAML test sessions)
- id, app_id/environment_id
- session_data (JSON), ip_address
- created_at, expires_at

### Audit Logs
- id, user_id, action, resource_type, resource_id
- metadata (JSON), ip_address, user_agent
- created_at

## Security Features

### Authentication
- Bcrypt password hashing (10 rounds)
- Email verification required
- Password reset with time-limited tokens
- Session management with secure cookies

### Authorization
- Row-level security (users can only access their resources)
- API key-based auth for programmatic access
- Role-based permissions (user, admin)

### Rate Limiting
- Per-user: 100 requests/minute
- Per-IP: 300 requests/minute
- API keys: 1000 requests/minute

### Data Protection
- Client secrets encrypted at rest
- SAML private keys encrypted at rest
- API keys hashed (non-reversible)
- HTTPS only in production
- CORS properly configured

### Compliance
- 30-day automatic data deletion
- XML backup emails before deletion
- GDPR-compliant data export
- Audit logging for all actions

## API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/verify-email
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

### OAuth Apps
- GET /api/oauth/apps
- POST /api/oauth/apps
- GET /api/oauth/apps/:id
- PATCH /api/oauth/apps/:id
- DELETE /api/oauth/apps/:id

### SAML Environments
- GET /api/saml/environments
- POST /api/saml/environments
- GET /api/saml/environments/:id
- PATCH /api/saml/environments/:id
- DELETE /api/saml/environments/:id
- GET /api/saml/environments/:id/metadata (XML download)

### OAuth Mock Provider
- GET /oauth/authorize
- POST /oauth/token
- GET /oauth/userinfo
- POST /oauth/revoke
- GET /.well-known/oauth-authorization-server

### SAML Mock Provider
- POST /saml/:id/sso (IdP SSO endpoint)
- POST /saml/:id/slo (IdP SLO endpoint)
- GET /saml/:id/metadata (IdP metadata)
- POST /saml/:id/acs (SP ACS endpoint)

### Tools (Public)
- POST /api/tools/jwt/decode
- POST /api/tools/saml/decode
- POST /api/tools/base64/encode
- POST /api/tools/base64/decode

### API Keys
- GET /api/keys
- POST /api/keys
- DELETE /api/keys/:id

### User Management
- GET /api/user/profile
- PATCH /api/user/profile
- DELETE /api/user/account
- GET /api/user/export (GDPR data export)

## Cron Jobs

### Cleanup Job (Daily at 2 AM UTC)
1. Find resources expiring in 3 days → send warning email with XML backup
2. Find resources expiring today → send final email with XML backup
3. Soft-delete expired resources (set deleted_at)
4. Hard-delete soft-deleted resources older than 90 days

### Session Cleanup (Every hour)
1. Delete expired OAuth/SAML test sessions
2. Delete expired email verification tokens

## Email Templates

### Welcome Email
- Subject: Welcome to MockAuth
- Content: Account created, email verification link

### Expiry Warning (3 days)
- Subject: Your MockAuth resources expire in 3 days
- Content: List of expiring resources, XML backup attachments

### Final Expiry Notice
- Subject: Your MockAuth resources expire today
- Content: Final warning, XML backup attachments

### Resource Deleted
- Subject: Your MockAuth resources have been deleted
- Content: Confirmation of deletion

## Environment Variables

```env
# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://mockauth.dev

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/mockauth

# Auth
NEXTAUTH_URL=https://mockauth.dev
NEXTAUTH_SECRET=<random-secret>
JWT_SECRET=<random-secret>

# Email
RESEND_API_KEY=<key>
EMAIL_FROM=noreply@mockauth.dev

# Encryption
ENCRYPTION_KEY=<32-byte-hex>

# Rate Limiting
UPSTASH_REDIS_URL=<optional>

# Monitoring
SENTRY_DSN=<optional>
```

## Deployment Architecture

```
                    ┌─────────────┐
                    │   Vercel    │
                    │  (Next.js)  │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │             │
            ┌───────┴────┐  ┌────┴─────┐
            │ PostgreSQL │  │  Resend  │
            │  (Supabase)│  │ (Email)  │
            └────────────┘  └──────────┘
```

## Performance Targets

- Page Load: < 2s (p95)
- API Response: < 200ms (p95)
- OAuth Flow: < 500ms (end-to-end)
- SAML Assertion: < 300ms
- Database Queries: < 50ms (p95)

## Scalability

- Horizontal scaling via stateless architecture
- Database connection pooling (max 20 connections)
- CDN for static assets
- Server-side caching for public pages
- Lazy loading for heavy components

## Monitoring & Observability

- Health check endpoint: /api/health
- Metrics: Request count, latency, error rate
- Alerts: High error rate, database issues
- Logging: Structured JSON logs with correlation IDs
