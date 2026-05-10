const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Load .env.local for local script execution parity with Next.js runtime.
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
} catch {
  // Ignore if dotenv is unavailable; process.env may already be populated.
}

if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
      const envLines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
      for (const line of envLines) {
        if (!line || line.trim().startsWith('#')) continue;
        const eqIndex = line.indexOf('=');
        if (eqIndex <= 0) continue;
        const key = line.slice(0, eqIndex).trim();
        const value = line.slice(eqIndex + 1).trim().replace(/^['\"]|['\"]$/g, '');
        if (!(key in process.env)) {
          process.env[key] = value;
        }
      }
    }
  } catch {
    // Ignore parse errors and allow existing validation to fail with a clear message.
  }
}

async function initDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Error: DATABASE_URL is not set in the environment.');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to the database successfully.');

    const schemaPath = path.join(__dirname, '..', 'src', 'lib', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('Executing schema.sql...');
    await client.query(schemaSql);
    
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await client.end();
  }
}

initDb();
