# Supabase Configuration

This directory contains the configuration files for Supabase.

## Setup Instructions

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Get your project URL and API keys from the project settings
3. Add them to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Schema

The database schema is defined in the `migrations` directory. Each migration file contains SQL statements to create tables and other database objects.

### Running Migrations

You can run migrations manually in the Supabase dashboard SQL editor, or use the Supabase CLI:

```bash
supabase db reset
```

## Seed Data

The `seed.sql` file contains sample data that can be used to populate the database. You can run it manually in the SQL editor or as part of `supabase db reset`.

## Local Development (Optional)

If you want to develop locally with Supabase:

1. Install the Supabase CLI: [https://supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)
2. Start a local Supabase instance:

```bash
supabase start
```

3. Update your `.env.local` file with the local URLs and keys. 