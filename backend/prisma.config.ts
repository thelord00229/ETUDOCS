import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },

  datasource: {
    url: process.env.DATABASE_URL ?? env("DATABASE_URL"),
    directUrl: process.env.DIRECT_URL ?? env("DIRECT_URL"),
  },
});
