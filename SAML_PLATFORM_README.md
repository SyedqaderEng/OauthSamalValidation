# SAML Test Platform

A complete full-stack web application that acts as **both** a SAML Service Provider (SP) and Identity Provider (IdP). Built for testing, development, and understanding SAML authentication flows.

## 🎯 Features

### Core Functionality
- ✅ **Dual Mode Operation**: Acts as both SP and IdP
- ✅ **Local Authentication**: Username/email/password with PostgreSQL
- ✅ **SAML Authentication**: Full SP and IdP SAML 2.0 support
- ✅ **Metadata Management**: Import/export SAML metadata
- ✅ **SAML Test Console**: Interactive testing interface
- ✅ **Activity Dashboard**: User info and SAML login logs

### SAML Capabilities
- **Service Provider (SP) Mode**:
  - SP-initiated login flows
  - Assertion Consumer Service (ACS)
  - Metadata generation and export
  - SAML response validation

- **Identity Provider (IdP) Mode**:
  - IdP-initiated login flows
  - SAML assertion generation
  - User attribute mapping
  - Metadata generation and export

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **SAML Library**: samlify
- **Authentication**: JWT + bcrypt
- **Containerization**: Docker + Docker Compose

### Project Structure
```
.
├── backend/                    # Backend API
│   ├── src/
│   │   ├── api/               # REST API routes
│   │   │   ├── auth.ts        # Local authentication
│   │   │   ├── metadata.ts    # Metadata import/export
│   │   │   ├── saml.ts        # SAML endpoints
│   │   │   └── samlConfig.ts  # SAML configuration
│   │   ├── config/            # Configuration
│   │   │   ├── database.ts    # Prisma client
│   │   │   ├── env.ts         # Environment variables
│   │   │   └── jwt.ts         # JWT utilities
│   │   ├── middleware/        # Express middleware
│   │   │   └── auth.ts        # Authentication middleware
│   │   ├── saml/              # SAML implementation
│   │   │   ├── samlSp.ts      # Service Provider
│   │   │   ├── samlIdp.ts     # Identity Provider
│   │   │   ├── metadata.ts    # Metadata parser
│   │   │   ├── utils.ts       # SAML utilities
│   │   │   └── generateCertificate.ts
│   │   ├── db/
│   │   │   └── schema.prisma  # Database schema
│   │   └── server.ts          # Express server
│   ├── certificates/          # SAML certificates
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── pages/             # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ImportMetadata.tsx
│   │   │   ├── ExportMetadata.tsx
│   │   │   ├── SamlTestConsole.tsx
│   │   │   └── SamlCallback.tsx
│   │   ├── components/        # Reusable components
│   │   │   └── SamlStatusCard.tsx
│   │   ├── services/          # API services
│   │   │   └── api.ts
│   │   ├── hooks/             # React hooks
│   │   │   └── useAuth.tsx
│   │   ├── types/             # TypeScript types
│   │   │   └── index.ts
│   │   ├── App.tsx            # Main app component
│   │   ├── index.tsx          # Entry point
│   │   └── index.css          # Global styles
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── examples/                   # Sample metadata files
│   ├── sample-sp-metadata.xml
│   └── sample-idp-metadata.xml
│
├── docker-compose.saml.yml    # Docker Compose configuration
└── SAML_PLATFORM_README.md    # This file
```

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose (recommended)
- OR Node.js 18+ and PostgreSQL 15+ (for local development)
- OpenSSL (for certificate generation)

### Quick Start with Docker

1. **Start the application**:
```bash
docker-compose -f docker-compose.saml.yml up -d
```

2. **Wait for services to be healthy** (about 30-60 seconds)

3. **Access the application**:
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:3001

4. **Create an account**:
   - Navigate to http://localhost:3002
   - Click "Sign up"
   - Fill in the registration form

### Manual Setup (Without Docker)

#### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Generate SAML certificates**:
```bash
npm run generate-cert
```

5. **Set up database**:
```bash
npx prisma generate
npx prisma db push
```

6. **Start the backend**:
```bash
npm run dev
```

Backend will run on http://localhost:3001

#### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start the frontend**:
```bash
npm start
```

Frontend will run on http://localhost:3000

## 📚 Database Schema

### Users
- `id`: UUID (primary key)
- `email`: String (unique)
- `username`: String (unique)
- `passwordHash`: String
- `displayName`: String (optional)
- `createdAt`: DateTime
- `lastLoginAt`: DateTime (optional)

### SAML Entities
- `id`: UUID (primary key)
- `type`: 'SP' or 'IDP'
- `entityId`: String (unique)
- `rawXml`: Text (original metadata XML)
- `parsedJson`: JSON (parsed metadata)
- `ssoUrl`: String (optional)
- `sloUrl`: String (optional)
- `acsUrls`: String[] (ACS endpoints)
- `certificates`: String[] (X.509 certificates)
- `active`: Boolean

### SAML Logs
- `id`: UUID (primary key)
- `entityId`: String
- `userId`: UUID (foreign key to users)
- `eventType`: String ('LOGIN', 'LOGOUT', 'SP_INITIATED', 'IDP_INITIATED', 'ERROR')
- `status`: String ('SUCCESS', 'FAILURE', 'PENDING')
- `details`: JSON (SAML attributes, errors, etc.)
- `createdAt`: DateTime

### SAML Config
- `id`: UUID (primary key)
- `appRole`: 'SP', 'IDP', or 'BOTH'
- `defaultEntityId`: String
- `signingKey`: Text (optional)
- `signingCert`: Text (optional)
- `encryptionKey`: Text (optional)
- `encryptionCert`: Text (optional)

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user (requires auth)
- `GET /api/auth/saml-logs` - Get user's SAML logs (requires auth)

### Metadata Management
- `POST /api/metadata/import` - Import SAML metadata XML (requires auth)
- `GET /api/metadata/export/sp` - Export SP metadata (public)
- `GET /api/metadata/export/idp` - Export IdP metadata (public)
- `GET /api/metadata/list` - List all imported metadata (requires auth)
- `GET /api/metadata/:entityId` - Get specific metadata (requires auth)
- `DELETE /api/metadata/:entityId` - Delete metadata (requires auth)

### SAML Configuration
- `GET /api/saml-config` - Get SAML configuration (requires auth)
- `PUT /api/saml-config` - Update SAML configuration (requires auth)

### SAML Endpoints

#### Service Provider (SP) Mode
- `GET /saml/metadata` - SP metadata (public)
- `GET /saml/login/:idpEntityId` - Initiate SP login
- `POST /saml/acs` - Assertion Consumer Service (public)
- `GET /saml/slo` - Single Logout

#### Identity Provider (IdP) Mode
- `GET /saml/idp/metadata` - IdP metadata (public)
- `GET /saml/idp/sso` - SSO endpoint (public)
- `POST /saml/idp/sso/process` - Process IdP login (requires auth)
- `GET /saml/idp/slo` - IdP Single Logout

### Logs
- `GET /saml/logs?limit=50` - Get SAML logs (requires auth)

## 🧪 Testing SAML Flows

### SP-Initiated Login Flow

1. **Import IdP Metadata**:
   - Navigate to "Import Metadata"
   - Upload or paste IdP metadata XML
   - Submit

2. **Test SP Login**:
   - Go to "SAML Test Console"
   - Select an imported IdP
   - Click "Start SP-Initiated Login"
   - You'll be redirected to the IdP for authentication
   - After successful auth at IdP, you'll be redirected back

3. **View Logs**:
   - Check the logs section to see the SAML flow details

### IdP-Initiated Login Flow

1. **Import SP Metadata**:
   - Navigate to "Import Metadata"
   - Upload or paste SP metadata XML
   - Submit

2. **Test IdP Login**:
   - Go to "SAML Test Console"
   - Select an imported SP
   - Click "Start IdP-Initiated Login"
   - System creates SAML response
   - Automatically POSTs to SP's ACS

3. **View Logs**:
   - Check the logs section to see the SAML flow details

### Testing with Sample Metadata

Sample metadata files are provided in the `examples/` directory:
- `sample-sp-metadata.xml` - Example SP metadata
- `sample-idp-metadata.xml` - Example IdP metadata

You can use these as templates or import them for testing.

## 🔧 Configuration

### Environment Variables (Backend)

```env
# Database
DATABASE_URL=postgresql://saml_user:saml_password@localhost:5432/saml_platform

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server
PORT=3001
NODE_ENV=development

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001

# SAML
SAML_ISSUER=http://localhost:3001
SAML_CALLBACK_URL=http://localhost:3001/saml/acs
SAML_ENTRY_POINT=http://localhost:3001/saml/idp/sso
```

### SAML Certificates

The application requires X.509 certificates for signing SAML assertions.

**Generate certificates** (if not using Docker):
```bash
cd backend
npm run generate-cert
```

This creates:
- `backend/certificates/saml-private.key` - Private key
- `backend/certificates/saml-public.crt` - Public certificate

⚠️ **For production**: Use proper certificates from a CA.

## 🎨 Frontend Features

### Dashboard
- User profile information
- SAML configuration summary
- Quick access to key features
- Recent SAML activity
- Imported entities overview

### Import Metadata
- Upload XML file
- Paste metadata directly
- Automatic validation
- Entity type detection (SP/IdP)
- Extracts:
  - Entity ID
  - SSO/SLO URLs
  - ACS URLs
  - Certificates

### Export Metadata
- Download SP metadata
- Download IdP metadata
- Copy to clipboard
- View metadata URLs
- Display as formatted XML

### SAML Test Console
- Test SP-initiated flows
- Test IdP-initiated flows
- Real-time SAML logs
- Detailed event information
- Status indicators
- Endpoint reference

## 🔍 Troubleshooting

### Common Issues

**Backend won't start**:
- Check if PostgreSQL is running
- Verify DATABASE_URL is correct
- Run `npx prisma generate`

**SAML certificates error**:
- Run `npm run generate-cert` in backend directory
- Ensure OpenSSL is installed

**Frontend can't connect to backend**:
- Verify backend is running on port 3001
- Check REACT_APP_API_URL in frontend/.env

**SAML login fails**:
- Check that certificates are generated
- Verify metadata is correctly imported
- Check SAML logs for detailed errors
- Ensure Entity IDs match

**Docker issues**:
- Run `docker-compose -f docker-compose.saml.yml down -v`
- Run `docker-compose -f docker-compose.saml.yml up --build`

## 📖 SAML Concepts

### Service Provider (SP)
An application that consumes SAML assertions from an Identity Provider. In this platform, when operating in SP mode:
- Creates SAML AuthnRequests
- Receives SAML Responses at ACS endpoint
- Validates signatures
- Extracts user attributes
- Creates local user sessions

### Identity Provider (IdP)
An application that authenticates users and provides SAML assertions. In this platform, when operating in IdP mode:
- Receives SAML AuthnRequests (or initiates directly)
- Authenticates users locally
- Creates signed SAML Responses
- Sends assertions to SP's ACS endpoint
- Includes user attributes

### Metadata
XML documents describing SAML entities:
- **Entity ID**: Unique identifier
- **Endpoints**: SSO, SLO, ACS URLs
- **Certificates**: For signature validation
- **Capabilities**: Supported bindings and features

## 🛡️ Security Considerations

⚠️ **This is a test platform. For production use**:

1. **Use proper certificates** from a trusted CA
2. **Change all default secrets** (JWT_SECRET, database passwords)
3. **Enable HTTPS** for all endpoints
4. **Implement rate limiting**
5. **Add input sanitization**
6. **Enable audit logging**
7. **Secure database** with strong credentials
8. **Review and harden** SAML configuration
9. **Implement session management** best practices
10. **Add CSRF protection**

## 🚢 Deployment

### Docker Production Deployment

1. **Update environment variables** for production
2. **Generate production certificates**
3. **Set up proper database**
4. **Configure reverse proxy** (nginx, traefik)
5. **Enable HTTPS**
6. **Run**:
```bash
docker-compose -f docker-compose.saml.yml up -d
```

### Manual Production Deployment

1. **Build backend**:
```bash
cd backend
npm run build
npm start
```

2. **Build frontend**:
```bash
cd frontend
npm run build
# Serve build/ directory with nginx or similar
```

## 📝 License

MIT License - feel free to use for testing and development.

## 🤝 Contributing

This is a test platform. Contributions welcome:
- Bug fixes
- Feature enhancements
- Documentation improvements
- Test cases

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review SAML logs in the console
3. Check backend logs
4. Verify metadata is correctly configured

## 🎓 Learning Resources

- [SAML 2.0 Specification](https://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html)
- [Understanding SAML](https://developer.okta.com/docs/concepts/saml/)
- [SAML Debugging](https://www.samltool.com/online_tools.php)

---

**Happy SAML Testing! 🚀**
