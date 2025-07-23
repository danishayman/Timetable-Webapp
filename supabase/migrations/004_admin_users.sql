-- Enable the auth schema extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admin users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_admin_users()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON admin_users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_admin_users();

-- Create a function to handle new user signup through Supabase Auth
-- This will be triggered when a new user signs up through Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow users with admin emails to sign up
  IF NEW.email LIKE '%@admin.com' OR NEW.email LIKE '%@yourschool.edu' THEN
    -- Insert the new user into the admin_users table
    INSERT INTO public.admin_users (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  ELSE
    -- For non-admin emails, you might want to delete the auth user
    -- or implement another strategy
    RAISE EXCEPTION 'Only admin emails are allowed to sign up';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_admin_user();

-- Insert a test admin user
-- Note: In a real application, you would create this user through Supabase Auth
-- This is just for testing purposes
INSERT INTO admin_users (id, email, full_name)
VALUES 
  (uuid_generate_v4(), 'admin@admin.com', 'Test Admin');

-- Add a comment to remind that in production, users should be created through Auth
COMMENT ON TABLE admin_users IS 'Admin users table. In production, users should be created through Supabase Auth.'; 