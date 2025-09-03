import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 8080,
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  llmApiKey: process.env.LLM_API_KEY,
};

if (!config.databaseUrl) {
  console.error('FATAL ERROR: DATABASE_URL is not defined.');
  process.exit(1);
}

export default config;
