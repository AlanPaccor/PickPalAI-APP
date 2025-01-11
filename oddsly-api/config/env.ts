export const config = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY!,
  STRIPE_PRODUCT_ID_TRIAL: process.env.STRIPE_PRODUCT_ID_TRIAL!,
  STRIPE_PRODUCT_ID_ANNUAL: process.env.STRIPE_PRODUCT_ID_ANNUAL!,
  STRIPE_PRODUCT_ID_MONTHLY: process.env.STRIPE_PRODUCT_ID_MONTHLY!,
};

// Validate required environment variables
const requiredEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_PRODUCT_ID_TRIAL',
  'STRIPE_PRODUCT_ID_ANNUAL',
  'STRIPE_PRODUCT_ID_MONTHLY',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const env = process.env; 