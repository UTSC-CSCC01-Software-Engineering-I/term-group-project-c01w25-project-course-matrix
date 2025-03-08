import { config } from "dotenv";

/**
 * Load environment variables from .env file
 */
const configFile = `./.env`;
config({ path: configFile });

const {
  PORT,
  NODE_ENV,
  CLIENT_APP_URL,
  DATABASE_URL,
  DATABASE_KEY,
  OPENAI_API_KEY,
  PINECONE_API_KEY,
  PINECONE_INDEX_NAME,
} = process.env;

/**
 * Configuration object containing environment variables.
 *
 * This object includes the PORT, NODE_ENV, CLIENT_APP_URL, DATABASE_URL, and DATABASE_KEY.
 * These values are loaded from the environment variables defined in the .env file.
 */
export default {
  PORT,
  env: NODE_ENV,
  CLIENT_APP_URL,
  DATABASE_URL,
  DATABASE_KEY,
  OPENAI_API_KEY,
  PINECONE_API_KEY,
  PINECONE_INDEX_NAME,
};
