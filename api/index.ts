import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';

// Copy pre-seeded SQLite database to writable /tmp directory in Vercel serverless environment
const tmpDbPath = '/tmp/dev.db';

try {
  // Source path in Vercel function deployment bundle
  const sourceDbPath = path.join(process.cwd(), 'backend', 'prisma', 'dev.db');

  if (!fs.existsSync(tmpDbPath)) {
    if (fs.existsSync(sourceDbPath)) {
      fs.copyFileSync(sourceDbPath, tmpDbPath);
      console.log('✅ Copied pre-seeded dev.db to /tmp/dev.db');
    } else {
      console.warn('⚠️ Source dev.db not found at', sourceDbPath);
    }
  }
} catch (e) {
  console.error('Failed to setup /tmp/dev.db:', e);
}

process.env.DATABASE_URL = `file:${tmpDbPath}`;

import { app } from '../backend/src/index';

export default app;
