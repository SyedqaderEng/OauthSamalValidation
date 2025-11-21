import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  jwtExpiresIn: '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
  
  // SAML Configuration
  saml: {
    issuer: process.env.SAML_ISSUER || 'http://localhost:3001',
    callbackUrl: process.env.SAML_CALLBACK_URL || 'http://localhost:3001/saml/acs',
    entryPoint: process.env.SAML_ENTRY_POINT || 'http://localhost:3001/saml/idp/sso',
    certPath: path.resolve(__dirname, '../../certificates'),
  },
};

// Validate required environment variables
if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is required in environment variables');
}
