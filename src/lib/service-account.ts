/**
 * Utility to construct GCP service account credentials from environment variables
 * This eliminates the need for a separate JSON file
 */

export interface ServiceAccountCredentials {
  type?: string;
  project_id?: string;
  private_key_id?: string;
  private_key?: string;
  client_email?: string;
  client_id?: string;
  auth_uri?: string;
  token_uri?: string;
  auth_provider_x509_cert_url?: string;
  client_x509_cert_url?: string;
  universe_domain?: string;
}

/**
 * Build service account credentials object from environment variables
 * Returns null if required fields are missing
 */
export function getServiceAccountCredentials(): ServiceAccountCredentials | null {
  const privateKey = process.env.GCP_SERVICE_ACCOUNT_PRIVATE_KEY;
  const clientEmail = process.env.GCP_SERVICE_ACCOUNT_CLIENT_EMAIL;
  const projectId = process.env.GCP_SERVICE_ACCOUNT_PROJECT_ID;

  // Check required fields
  if (!privateKey || !clientEmail || !projectId) {
    console.warn('[ServiceAccount] Missing required credentials in environment variables');
    return null;
  }

  return {
    type: process.env.GCP_SERVICE_ACCOUNT_TYPE || 'service_account',
    project_id: projectId,
    private_key_id: process.env.GCP_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
    private_key: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
    client_email: clientEmail,
    client_id: process.env.GCP_SERVICE_ACCOUNT_CLIENT_ID,
    auth_uri: process.env.GCP_SERVICE_ACCOUNT_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
    token_uri: process.env.GCP_SERVICE_ACCOUNT_TOKEN_URI || 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: process.env.GCP_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.GCP_SERVICE_ACCOUNT_CLIENT_CERT_URL,
    universe_domain: process.env.GCP_SERVICE_ACCOUNT_UNIVERSE_DOMAIN || 'googleapis.com',
  };
}

/**
 * Get simplified credentials for BigQuery (only needs project_id, private_key, client_email)
 */
export function getBigQueryCredentials() {
  const privateKey = process.env.GCP_SERVICE_ACCOUNT_PRIVATE_KEY;
  const clientEmail = process.env.GCP_SERVICE_ACCOUNT_CLIENT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error('Missing GCP service account credentials. Required: GCP_SERVICE_ACCOUNT_PRIVATE_KEY and GCP_SERVICE_ACCOUNT_CLIENT_EMAIL');
  }

  return {
    client_email: clientEmail,
    private_key: privateKey.replace(/\\n/g, '\n'),
  };
}

/**
 * Get credentials for Firebase Admin SDK
 */
export function getFirebaseAdminCredentials() {
  const projectId = process.env.GCP_SERVICE_ACCOUNT_PROJECT_ID;
  const privateKey = process.env.GCP_SERVICE_ACCOUNT_PRIVATE_KEY;
  const clientEmail = process.env.GCP_SERVICE_ACCOUNT_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    throw new Error('Missing GCP service account credentials. Required: GCP_SERVICE_ACCOUNT_PROJECT_ID, GCP_SERVICE_ACCOUNT_PRIVATE_KEY, and GCP_SERVICE_ACCOUNT_CLIENT_EMAIL');
  }

  return {
    projectId,
    privateKey: privateKey.replace(/\\n/g, '\n'),
    clientEmail,
  };
}
