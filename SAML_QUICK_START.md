# SAML Test Platform - Quick Start Guide

Get up and running with the SAML Test Platform in 5 minutes.

## 🚀 Quick Start (Docker - Recommended)

### 1. Run the Setup Script

```bash
./setup-saml-platform.sh
```

This will:
- Start PostgreSQL database
- Build and start the backend API
- Build and start the frontend app
- Generate SAML certificates

### 2. Access the Application

Open your browser and navigate to:
```
http://localhost:3002
```

### 3. Create Your Account

1. Click **"Sign up"**
2. Fill in:
   - Email: `your@email.com`
   - Username: `testuser`
   - Password: `password123` (min 6 characters)
   - Display Name: `Test User` (optional)
3. Click **"Sign up"**

You'll be automatically logged in and redirected to the dashboard.

## 📋 Testing SAML Flows

### Test as Service Provider (SP)

**Scenario**: Your app authenticates users via an external IdP

1. **Import IdP Metadata**
   - Go to Dashboard → "Import Metadata"
   - Use the sample file: `examples/sample-idp-metadata.xml`
   - Or paste your own IdP metadata XML
   - Click "Import Metadata"

2. **Export Your SP Metadata**
   - Go to Dashboard → "Export Metadata"
   - Click "Load SP Metadata"
   - Click "Download XML"
   - Share this with your IdP administrator

3. **Test SP Login**
   - Go to Dashboard → "SAML Test Console"
   - Under "SP-Initiated Login Test"
   - Select the imported IdP from dropdown
   - Click "Start SP-Initiated Login"

### Test as Identity Provider (IdP)

**Scenario**: Your app authenticates users for external SPs

1. **Import SP Metadata**
   - Go to Dashboard → "Import Metadata"
   - Use the sample file: `examples/sample-sp-metadata.xml`
   - Or paste your own SP metadata XML
   - Click "Import Metadata"

2. **Export Your IdP Metadata**
   - Go to Dashboard → "Export Metadata"
   - Click "Load IdP Metadata"
   - Click "Download XML"
   - Share this with your SP administrator

3. **Test IdP Login**
   - Go to Dashboard → "SAML Test Console"
   - Under "IdP-Initiated Login Test"
   - Select the imported SP from dropdown
   - Click "Start IdP-Initiated Login"

## 🔍 View SAML Logs

After testing flows:

1. Go to **"SAML Test Console"**
2. Scroll to **"SAML Request/Response Logs"**
3. See all SAML events:
   - Timestamp
   - Event Type (SP_INITIATED, IDP_INITIATED, etc.)
   - Status (SUCCESS, FAILURE, PENDING)
   - Entity ID
   - User email

## 🛠️ Manual Setup (Without Docker)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run generate-cert
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Access: http://localhost:3000 (frontend) and http://localhost:3001 (backend)

## 📡 Important Endpoints

### Public Endpoints (No Auth Required)
- **SP Metadata**: `http://localhost:3001/saml/metadata`
- **IdP Metadata**: `http://localhost:3001/saml/idp/metadata`
- **ACS (POST)**: `http://localhost:3001/saml/acs`
- **IdP SSO**: `http://localhost:3001/saml/idp/sso`

### Protected Endpoints (Auth Required)
- **Dashboard**: `http://localhost:3002/dashboard`
- **Import Metadata**: `http://localhost:3002/import-metadata`
- **Export Metadata**: `http://localhost:3002/export-metadata`
- **SAML Console**: `http://localhost:3002/saml-console`

## 🧪 Example: Full SP Flow

1. **Sign up** at http://localhost:3002/signup
2. **Import IdP metadata** from `examples/sample-idp-metadata.xml`
3. **Get your SP metadata** from Export page
4. **Configure external IdP** with your SP metadata
5. **Test login** from SAML Console
6. **View logs** to see the flow

## 🧪 Example: Full IdP Flow

1. **Sign up** at http://localhost:3002/signup
2. **Import SP metadata** from `examples/sample-sp-metadata.xml`
3. **Get your IdP metadata** from Export page
4. **Configure external SP** with your IdP metadata
5. **Test login** from SAML Console
6. **View logs** to see the flow

## 🔐 Default Configuration

The app starts in **BOTH** mode (acts as both SP and IdP).

**Change app role:**
- Backend: Update via API `PUT /api/saml-config`
- Options: `SP`, `IDP`, or `BOTH`

**Default credentials** (after you create them):
- Email: (your email)
- Password: (your password)

## 🛑 Stopping the Platform

```bash
docker-compose -f docker-compose.saml.yml down
```

To remove all data:
```bash
docker-compose -f docker-compose.saml.yml down -v
```

## 📚 Next Steps

1. ✅ **Read the full README**: `SAML_PLATFORM_README.md`
2. ✅ **Explore the dashboard**: All features accessible via UI
3. ✅ **Import real metadata**: Test with real IdPs/SPs
4. ✅ **Check API docs**: Visit http://localhost:3001
5. ✅ **Review logs**: Monitor SAML flows in console

## 🐛 Troubleshooting

**Can't access http://localhost:3002:**
- Check Docker containers: `docker ps`
- Check logs: `docker-compose -f docker-compose.saml.yml logs frontend`

**Backend errors:**
- Check logs: `docker-compose -f docker-compose.saml.yml logs backend`
- Verify database: `docker-compose -f docker-compose.saml.yml logs postgres`

**SAML errors:**
- Check certificates exist: `ls backend/certificates/`
- Review SAML logs in Test Console
- Verify metadata is correctly imported

**Reset everything:**
```bash
docker-compose -f docker-compose.saml.yml down -v
./setup-saml-platform.sh
```

## ✨ Key Features to Try

- ✅ Local user signup/login
- ✅ SAML SP-initiated login
- ✅ SAML IdP-initiated login
- ✅ Import IdP metadata
- ✅ Import SP metadata
- ✅ Export your SP metadata
- ✅ Export your IdP metadata
- ✅ View SAML request/response logs
- ✅ Test console with real-time feedback
- ✅ User dashboard with activity

---

**Enjoy testing SAML! 🎉**

For detailed documentation, see [SAML_PLATFORM_README.md](./SAML_PLATFORM_README.md)
