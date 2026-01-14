// Prisma Configuration for Apna Safar Backend
// Prisma v7: schema + db.adapter only. Connection URLs come from environment.
// For migrations, pass DIRECT_URL via CLI: `npx prisma db push --url %DIRECT_URL%`
import "dotenv/config";
import { defineConfig } from "prisma/config";

// Use a loosely-typed config object to avoid TS issues with Prisma's evolving config shape.
// Prisma CLI only cares about the runtime shape, not TypeScript typings.
const config: any = {
  schema: "prisma/schema.prisma",

  // Top-level datasource - required for prisma db push (uses DIRECT_URL)
  datasource: {
    url: process.env.DIRECT_URL!,
  },

  // Runtime queries use DATABASE_URL (Transaction Pooler, port 6543)
  db: {
    adapter: {
      provider: "postgresql",
      url: process.env.DATABASE_URL!, // Used by Prisma Client at runtime
    },
  },
};

export default defineConfig(config);
