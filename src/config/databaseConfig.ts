import dotenv from "dotenv";

dotenv.config();

export const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 27017,
  database: process.env.DB_NAME || "Authdatabase",
};
