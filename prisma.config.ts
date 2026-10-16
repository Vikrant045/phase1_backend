// Prisma CLI configuration (Prisma ORM v7).
// Docs: https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // CLI commands (migrate, studio, db seed) connect DIRECTLY to Neon,
    // while the API server connects through the pooler (see src/utils/prisma.ts).
    url: env('DIRECT_URL'),
  },
});