import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import prisma from './config/database';

// Import routes
import authRoutes from './api/auth';
import metadataRoutes from './api/metadata';
import samlRoutes from './api/saml';
import samlConfigRoutes from './api/samlConfig';

const app: Application = express();

// Middleware
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/metadata', metadataRoutes);
app.use('/api/saml-config', samlConfigRoutes);
app.use('/saml', samlRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'SAML Test Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
      },
      metadata: {
        import: 'POST /api/metadata/import',
        exportSp: 'GET /api/metadata/export/sp',
        exportIdp: 'GET /api/metadata/export/idp',
        list: 'GET /api/metadata/list',
      },
      saml: {
        spMetadata: 'GET /saml/metadata',
        spLogin: 'GET /saml/login/:idpEntityId',
        acs: 'POST /saml/acs',
        idpMetadata: 'GET /saml/idp/metadata',
        idpSso: 'GET /saml/idp/sso',
        logs: 'GET /saml/logs',
      },
      config: {
        get: 'GET /api/saml-config',
        update: 'PUT /api/saml-config',
      },
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(
  (
    err: Error,
    req: Request,
    res: Response,
    next: express.NextFunction
  ) => {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? err.message : undefined,
    });
  }
);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Start listening
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
      console.log(`🔗 Backend URL: ${config.backendUrl}`);
      console.log(`\n🔐 SAML Endpoints:`);
      console.log(`   SP Metadata: ${config.backendUrl}/saml/metadata`);
      console.log(`   IdP Metadata: ${config.backendUrl}/saml/idp/metadata`);
      console.log(`   ACS: ${config.backendUrl}/saml/acs`);
      console.log(`   IdP SSO: ${config.backendUrl}/saml/idp/sso`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export default app;
