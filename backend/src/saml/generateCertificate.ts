import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const certDir = path.resolve(__dirname, '../../certificates');

// Ensure certificates directory exists
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

const generateCertificates = () => {
  console.log('Generating SAML certificates...');

  const keyPath = path.join(certDir, 'saml-private.key');
  const certPath = path.join(certDir, 'saml-public.crt');

  // Check if certificates already exist
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    console.log('Certificates already exist. Skipping generation.');
    return;
  }

  try {
    // Generate private key
    execSync(
      `openssl req -x509 -new -newkey rsa:2048 -nodes -subj '/CN=localhost' -keyout "${keyPath}" -out "${certPath}" -days 3650`,
      { stdio: 'inherit' }
    );

    console.log('✅ Certificates generated successfully!');
    console.log(`Private Key: ${keyPath}`);
    console.log(`Public Certificate: ${certPath}`);
  } catch (error) {
    console.error('❌ Failed to generate certificates:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  generateCertificates();
}

export default generateCertificates;
