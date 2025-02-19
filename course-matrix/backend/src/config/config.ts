import { config } from "dotenv";

const configFile = `./.env`;
config({ path: configFile });

const { PORT, NODE_ENV, CLIENT_APP_URL, DATABASE_URL, DATABASE_KEY } =
  process.env;

export default {
  PORT,
  env: NODE_ENV,
  CLIENT_APP_URL,
  DATABASE_URL,
  DATABASE_KEY,
};
