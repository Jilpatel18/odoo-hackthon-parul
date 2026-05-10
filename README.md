# 🌍 Traveloop - All-in-One Travel Companion

Traveloop is a premium travel planning and community platform designed to help travelers organize their adventures, manage their budgets, and share their experiences with a global community.

![Traveloop Header](https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000&auto=format&fit=crop)

> [!IMPORTANT]
> ### 🚀 Quick Demo Access
> 
> **Admin Panel** (`/admin/login`)
> - **Email:** `admin@traveloop.com`
> - **Password:** `admin123`
> 
> **Demo User** (`/login`)
> - **Email:** `demo@example.com`
> - **Password:** `password123`

## ✨ Features

### 📅 Trip Planning & Itinerary
- Create detailed multi-day trips with custom destinations and dates.
- Build granular timelines for each day including transport, lodging, and activities.
- **New:** Upload custom cover images for your trips directly from your device.

### 💰 Budget & Expense Management
- Set a total budget for each trip.
- Track real-time spending with category-based expense logging (Food, Transport, Lodging, etc.).
- Visual spending charts (Daily Spending & Category Breakdown) to keep you on track.
- **INR (₹) Support:** Fully localized currency formatting for the Indian market.

### 🎒 Packing & Organization
- Manage dynamic packing checklists for every trip.
- Integrated Journal/Notes system to capture memories or important details on the go.

### 👥 Community & Social
- Share your travel stories and photos with a dedicated community feed.
- Interact with fellow travelers through likes, comments, and follows.
- Explore beautiful destination posts and get inspired for your next journey.

### 🛡️ Secure Account Management
- Secure authentication with JWT and HTTP-only cookies.
- Comprehensive Settings page to update your profile, bio, and security.
- **Security Toggle:** Password visibility icons for secure input verification.

### 🔑 Admin Panel
- Dedicated dashboard for administrators to manage platform data.
- Overview of platform stats, users, and destinations.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router)
- **Database:** PostgreSQL (Neon / Local)
- **Styling:** Tailwind CSS (Dark Mode supported)
- **Animations:** Framer Motion
- **Icons:** Lucide-react
- **Notifications:** React Hot Toast
- **Database Driver:** `pg` (node-postgres)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.x or higher
- A PostgreSQL database (Neon recommended)

### 2. Installation
```bash
git clone <repository-url>
cd traveloop
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:
```env
DATABASE_URL=postgres://...
JWT_SECRET=your_secret_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Cloudinary for Image Uploads
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 4. Database Setup & Seeding
Initialize the database tables and seed with demo data:
```bash
# Initialize schema
node scripts/init-db.js

# Seed demo user and content
node --env-file=.env.local scripts/seed-demo-user.js
```

### 5. Run the App
```bash
npm run dev
```

---



## 📝 License
This project is for demonstration and hackathon purposes.
