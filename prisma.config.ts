import { defineConfig, env } from 'prisma/config';
import { loadEnvFile } from './src/config/env';

loadEnvFile();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
