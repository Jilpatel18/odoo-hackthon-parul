import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST() {
  try {
    // 1. Create a dummy system user for posts
    const passwordHash = await bcrypt.hash("system", 10);
    const systemUserRes = await query(
      `INSERT INTO users (name, email, password_hash) 
       VALUES ('System Admin', 'system@traveloop.com', $1) 
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [passwordHash]
    );
    const systemUserId = systemUserRes.rows[0].id;

    // 2. Insert dummy destinations
    await query(`
      INSERT INTO destinations (name, country, trips_count, rating) VALUES
      ('Kyoto', 'Japan', 1450, 4.9),
      ('Paris', 'France', 2100, 4.8),
      ('Bali', 'Indonesia', 980, 4.7),
      ('Reykjavik', 'Iceland', 450, 4.9),
      ('Cape Town', 'South Africa', 720, 4.8)
      ON CONFLICT (name, country) DO NOTHING;
    `);

    // 3. Insert dummy activities
    await query(`
      INSERT INTO activities (title, type, destination, added_count) VALUES
      ('Fushimi Inari Shrine Tour', 'Sightseeing', 'Kyoto, Japan', 342),
      ('Eiffel Tower Skip-the-Line', 'Attraction', 'Paris, France', 890),
      ('Ubud Monkey Forest Walk', 'Nature', 'Bali, Indonesia', 512),
      ('Golden Circle & Glacier Tour', 'Adventure', 'Reykjavik, Iceland', 230),
      ('Table Mountain Cable Car', 'Sightseeing', 'Cape Town, South Africa', 410)
      ON CONFLICT DO NOTHING;
    `);

    // 4. Insert dummy community posts
    // Check if we already have system posts to avoid duplicates
    const existingPosts = await query("SELECT id FROM community_posts WHERE user_id = $1 LIMIT 1", [systemUserId]);
    
    if (existingPosts.rows.length === 0) {
      await query(`
        INSERT INTO community_posts (user_id, title, description, image_url, tags) VALUES
        ($1, 'Hidden Gems of Kyoto', 'Found this amazing little tea house away from the tourist traps. The matcha was incredible!', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop', '["Japan", "Food", "Culture"]'),
        ($1, 'Iceland Roadtrip Tips', 'Just finished a 10-day ring road tour. Make sure you book your campervan months in advance!', 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=1200&auto=format&fit=crop', '["Iceland", "Roadtrip", "Advice"]'),
        ($1, 'Sunset at Uluwatu', 'Pictures don''t do this justice. The cliffside temple is mesmerizing during golden hour.', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200&auto=format&fit=crop', '["Bali", "Nature", "Photography"]')
      `, [systemUserId]);
    }

    return NextResponse.json({ success: true, message: "Database seeded successfully with dummy data." });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ success: false, error: "Failed to seed database: " + error.message }, { status: 500 });
  }
}
