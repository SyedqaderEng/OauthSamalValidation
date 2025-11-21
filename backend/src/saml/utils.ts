import fs from 'fs';
import path from 'path';
import { config } from '../config/env';

export const getCertificates = () => {
  const certPath = path.join(config.saml.certPath, 'saml-public.crt');
  const keyPath = path.join(config.saml.certPath, 'saml-private.key');

  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    throw new Error(
      'SAML certificates not found. Run: npm run generate-cert'
    );
  }

  const cert = fs.readFileSync(certPath, 'utf-8');
  const privateKey = fs.readFileSync(keyPath, 'utf-8');

  return { cert, privateKey };
};

export const formatCertificate = (cert: string): string => {
  // Remove headers and newlines
  return cert
    .replace(/-----BEGIN CERTIFICATE-----/, '')
    .replace(/-----END CERTIFICATE-----/, '')
    .replace(/\n/g, '')
    .trim();
};

export const extractEntityId = (xml: string): string | null => {
  const entityIdMatch = xml.match(/entityID="([^"]+)"/);
  return entityIdMatch ? entityIdMatch[1] : null;
};

export const validateSamlResponse = (response: any): boolean => {
  // Basic validation - check for required fields
  if (!response) return false;
  if (!response.issuer) return false;
  if (!response.nameID) return false;
  return true;
};
