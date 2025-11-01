/**
 * Production environment validation
 * Validates that all required environment variables are set before app starts
 */

const requiredEnvVars = {
  // Firebase (public - safe to expose)
  'NEXT_PUBLIC_FIREBASE_API_KEY': 'Firebase API Key',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': 'Firebase Auth Domain',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID': 'Firebase Project ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': 'Firebase Storage Bucket',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': 'Firebase Messaging Sender ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID': 'Firebase App ID',
  
  // Server-side secrets (MUST be private)
  'GEMINI_API_KEY': 'Google Gemini API Key',
  'GOOGLE_CLOUD_PROJECT_ID': 'Google Cloud Project ID',
  
  // GCP Service Account (inline credentials)
  'GCP_SERVICE_ACCOUNT_PROJECT_ID': 'GCP Service Account Project ID',
  'GCP_SERVICE_ACCOUNT_PRIVATE_KEY': 'GCP Service Account Private Key',
  'GCP_SERVICE_ACCOUNT_CLIENT_EMAIL': 'GCP Service Account Client Email',
} as const;

const optionalEnvVars = {
  'GOOGLE_SEARCH_API_KEY': 'Google Custom Search API Key (for public data enrichment)',
  'GOOGLE_SEARCH_ENGINE_ID': 'Google Custom Search Engine ID',
  'BIGQUERY_DATASET_ID': 'BigQuery Dataset ID (defaults to startup_benchmarks)',
  'GOOGLE_CLOUD_LOCATION': 'GCP Location (defaults to us-central1)',
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID': 'Firebase Analytics Measurement ID',
} as const;

export function validateEnvironment(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const [key, description] of Object.entries(requiredEnvVars)) {
    if (!process.env[key]) {
      errors.push(`❌ Missing required env var: ${key} (${description})`);
    } else if (process.env[key]?.includes('your_') || process.env[key]?.includes('your-')) {
      errors.push(`❌ ${key} appears to be a placeholder value. Update it in .env file.`);
    }
  }

  // Check optional variables
  for (const [key, description] of Object.entries(optionalEnvVars)) {
    if (!process.env[key]) {
      warnings.push(`⚠️  Optional env var not set: ${key} (${description})`);
    }
  }

  // Validate service account private key format
  const privateKey = process.env.GCP_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (privateKey && !privateKey.includes('BEGIN PRIVATE KEY')) {
    errors.push(`❌ GCP_SERVICE_ACCOUNT_PRIVATE_KEY appears to be invalid - should start with "-----BEGIN PRIVATE KEY-----"`);
  }
  
  // Validate service account email format
  const clientEmail = process.env.GCP_SERVICE_ACCOUNT_CLIENT_EMAIL;
  if (clientEmail && !clientEmail.includes('@') && !clientEmail.includes('your-')) {
    errors.push(`❌ GCP_SERVICE_ACCOUNT_CLIENT_EMAIL appears to be invalid - should be an email address`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function logEnvironmentStatus() {
  const { valid, errors, warnings } = validateEnvironment();

  console.log('\n🔍 Environment Validation:');
  console.log('━'.repeat(60));

  if (errors.length > 0) {
    console.error('\n❌ CRITICAL ERRORS:');
    errors.forEach(err => console.error(err));
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  WARNINGS:');
    warnings.forEach(warn => console.warn(warn));
  }

  if (valid && warnings.length === 0) {
    console.log('\n✅ All environment variables configured correctly!');
  } else if (valid) {
    console.log('\n✅ All required variables set (some optional features may be disabled)');
  } else {
    console.error('\n❌ Environment validation failed. Please check .env file.');
    console.error('   Copy .env.example to .env and fill in your values.\n');
  }

  console.log('━'.repeat(60) + '\n');

  if (!valid && process.env.NODE_ENV === 'production') {
    throw new Error('Production environment validation failed. Cannot start application.');
  }

  return valid;
}
