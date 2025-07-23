This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Student Timetable Web App

A web application that helps students create and manage their class timetables.

## Features

- Browse and search subjects
- Select subjects with tutorial options
- Generate timetable automatically
- See clash warnings
- Export as PDF
- Session persistence

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/timetable-app.git
cd timetable-app
```

2. Install dependencies:

```bash
npm install
```

3. Set up Supabase:
   - Create a project at [Supabase](https://supabase.com)
   - Get your project URL and API keys from the project settings
   - Create a `.env.local` file in the root directory with the following content:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. Set up the database:
   - Go to the SQL Editor in your Supabase dashboard
   - Run the SQL scripts from `supabase/migrations/001_initial_schema.sql`
   - Optionally run `supabase/seed.sql` for additional sample data

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Schema

The database schema includes the following tables:

- `subjects`: Information about courses offered
- `class_schedules`: Lecture schedules for subjects
- `tutorial_groups`: Optional tutorial groups for subjects
- `admin_users`: Admin authentication (no student authentication required)

See `supabase/migrations` for the complete schema.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
