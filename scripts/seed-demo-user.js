const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedDemoUser() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Seeding new demo user data...');

    // 1. Create or update demo user
    const email = 'demo@example.com';
    const name = 'Alex Explorer';
    const passwordHash = '$2b$10$K.qe788igzaCbz7gWxsaxOkMd2eJ2/FkcwNRbdFlJmrsL6/5tej0O'; // password123 (real hash)

    let userId;
    const userRes = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rows.length > 0) {
      userId = userRes.rows[0].id;
      // Delete existing data for clean slate
      console.log(`Found existing demo user (${userId}). Clearing old data...`);
      await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);
      await client.query('DELETE FROM trips WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM community_posts WHERE user_id = $1', [userId]);
    } else {
      const insertRes = await client.query(
        'INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id',
        [email, name, passwordHash]
      );
      userId = insertRes.rows[0].id;
      console.log(`Created new demo user (${userId}).`);
    }

    // Insert user profile
    await client.query(`
      INSERT INTO user_profiles (user_id, location, bio, cover_url, avatar_url) 
      VALUES ($1, 'Seattle, WA', 'I live to explore. 25 countries down, many more to go!', 
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000&auto=format&fit=crop', 
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop')
      ON CONFLICT (user_id) DO UPDATE SET 
      location = EXCLUDED.location, bio = EXCLUDED.bio, cover_url = EXCLUDED.cover_url, avatar_url = EXCLUDED.avatar_url
    `, [userId]);

    // 2. Create Trips
    const upcomingTripRes = await client.query(`
      INSERT INTO trips (user_id, title, description, start_date, end_date, cover_image, budget)
      VALUES ($1, 'Tokyo Cyberpunk Adventure', 'Tokyo, Japan', CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '17 days', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop', 3500)
      RETURNING id
    `, [userId]);
    const upcomingTripId = upcomingTripRes.rows[0].id;

    const completedTripRes = await client.query(`
      INSERT INTO trips (user_id, title, description, start_date, end_date, cover_image, budget)
      VALUES ($1, 'Swiss Alps Retreat', 'Zermatt, Switzerland', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '50 days', 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1200&auto=format&fit=crop', 5000)
      RETURNING id
    `, [userId]);
    
    // 3. Add Itinerary Items (Tokyo)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 10);
    
    // Day 1
    const day1str = startDate.toISOString().split('T')[0];
    await client.query(`
      INSERT INTO itinerary_items (trip_id, title, description, start_time, estimated_cost)
      VALUES 
      ($1, 'Narita Express to City', 'Transport from NRT', '${day1str} 10:00:00', 3),
      ($1, 'Check-in Shinjuku Hotel', 'Lodging', '${day1str} 14:00:00', 2),
      ($1, 'Robot Restaurant Show', 'Entertainment', '${day1str} 19:00:00', 1)
    `, [upcomingTripId]);

    // 4. Add Budget Expenses (Tokyo)
    await client.query(`
      INSERT INTO expenses (trip_id, description, category, amount, expense_date)
      VALUES 
      ($1, 'ANA Roundtrip Flight', 'Flights', 1200, CURRENT_DATE),
      ($1, 'Shinjuku Hotel Deposit', 'Lodging', 400, CURRENT_DATE),
      ($1, 'JR Pass 7-Day', 'Transport', 250, CURRENT_DATE)
    `, [upcomingTripId]);

    // 5. Add Packing List (Tokyo)
    await client.query(`
      INSERT INTO packing_items (trip_id, item_name, category, is_packed)
      VALUES 
      ($1, 'Passport', 'Essentials', false),
      ($1, 'Universal Power Adapter', 'Electronics', true),
      ($1, 'Camera & Lenses', 'Electronics', false),
      ($1, 'Comfortable Walking Shoes', 'Clothing', false)
    `, [upcomingTripId]);

    // 6. Create Community Posts
    await client.query(`
      INSERT INTO community_posts (user_id, title, description, image_url, tags)
      VALUES 
      ($1, 'Just booked my flights to Tokyo!', 'Anyone have recommendations for hidden ramen spots in Shinjuku? 🍜⛩️', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop', '["Tokyo", "Japan"]'),
      ($1, 'Missing the Swiss Alps today.', 'The Matterhorn was absolutely breathtaking at sunrise! ⛰️❄️', 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1200&auto=format&fit=crop', '["Switzerland", "Alps"]')
    `, [userId]);

    await client.query('COMMIT');
    console.log('✅ Demo user seeded successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding demo user:', error);
  } finally {
    client.release();
    pool.end();
  }
}

seedDemoUser();
