const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_0zmEFx3qiKnP@ep-raspy-leaf-ap2jjnk1.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function run() {
  try {
    await client.connect();
    
    console.log("Updating trips table...");
    await client.query(`
      ALTER TABLE trips ADD COLUMN IF NOT EXISTS budget DECIMAL(10, 2) DEFAULT 5000;
    `);
    
    console.log("Creating community_post_comments table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS community_post_comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log("Database schema updated successfully!");
  } catch (err) {
    console.error("Error updating schema:", err);
  } finally {
    await client.end();
  }
}

run();
