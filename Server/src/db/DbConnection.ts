import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as schema from "./schema"; // all tables imported via index.ts
dotenv.config();

// Parse database connection details explicitly
const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
};

// Create connection pool with explicit parameters
const pool = new Pool(dbConfig);

const db = drizzle(pool, { schema });
export { db };
