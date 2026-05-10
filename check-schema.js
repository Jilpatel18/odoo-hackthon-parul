const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_0zmEFx3qiKnP@ep-raspy-leaf-ap2jjnk1.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function run() {
  try {
    await client.connect();
    
    const tables = ['users', 'trips', 'trip_stops', 'itinerary_items', 'expenses', 'packing_items', 'notes'];
    
    for (const table of tables) {
      console.log(`\n--- Schema for ${table} ---`);
      const res = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '${table}'
        ORDER BY ordinal_position;
      `);
      console.table(res.rows);
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
