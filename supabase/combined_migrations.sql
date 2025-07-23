-- Combined migrations file for easy execution in Supabase SQL Editor
-- This file combines all migrations in order

-- ==========================================
-- 001_initial_schema.sql
-- ==========================================

-- Create subjects table
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,           -- e.g., "CS101"
  name TEXT NOT NULL,                  -- e.g., "Introduction to Programming"
  credits INTEGER DEFAULT 3,
  description TEXT,
  semester TEXT,                       -- e.g., "Fall 2024"
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample subjects
INSERT INTO subjects (code, name, credits, description, semester, department) VALUES
  ('CS101', 'Introduction to Programming', 3, 'Fundamentals of programming using Python', 'Fall 2024', 'Computer Science'),
  ('MATH201', 'Calculus I', 4, 'Limits, derivatives, and integrals of algebraic and transcendental functions', 'Fall 2024', 'Mathematics'),
  ('ENG105', 'Academic Writing', 3, 'Principles of academic writing and research', 'Fall 2024', 'English');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_subjects_updated_at
BEFORE UPDATE ON subjects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 002_class_schedules.sql
-- ==========================================

-- Create class schedules table
CREATE TABLE class_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('lecture', 'tutorial', 'lab', 'practical')),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue TEXT NOT NULL,
  instructor TEXT,
  max_capacity INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_class_schedules_subject_id ON class_schedules(subject_id);
CREATE INDEX idx_class_schedules_day_of_week ON class_schedules(day_of_week);

-- Insert sample class schedules for the existing subjects
INSERT INTO class_schedules (subject_id, type, day_of_week, start_time, end_time, venue, instructor) VALUES
  -- CS101 lectures
  ((SELECT id FROM subjects WHERE code = 'CS101'), 'lecture', 1, '09:00', '10:30', 'Room A101', 'Dr. Smith'),
  ((SELECT id FROM subjects WHERE code = 'CS101'), 'lecture', 3, '09:00', '10:30', 'Room A101', 'Dr. Smith'),
  -- CS101 lab
  ((SELECT id FROM subjects WHERE code = 'CS101'), 'lab', 5, '14:00', '16:00', 'Computer Lab 1', 'Dr. Johnson'),
  
  -- MATH201 lectures
  ((SELECT id FROM subjects WHERE code = 'MATH201'), 'lecture', 2, '11:00', '12:30', 'Room B201', 'Prof. Williams'),
  ((SELECT id FROM subjects WHERE code = 'MATH201'), 'lecture', 4, '11:00', '12:30', 'Room B201', 'Prof. Williams'),
  -- MATH201 tutorial
  ((SELECT id FROM subjects WHERE code = 'MATH201'), 'tutorial', 5, '10:00', '11:00', 'Room B205', 'Prof. Williams'),
  
  -- ENG105 lectures
  ((SELECT id FROM subjects WHERE code = 'ENG105'), 'lecture', 1, '14:00', '15:30', 'Room C301', 'Dr. Brown'),
  ((SELECT id FROM subjects WHERE code = 'ENG105'), 'lecture', 4, '14:00', '15:30', 'Room C301', 'Dr. Brown');

-- ==========================================
-- 003_tutorial_groups.sql
-- ==========================================

-- Create tutorial groups table
CREATE TABLE tutorial_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,            -- e.g., "Tutorial Group A"
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue TEXT NOT NULL,
  instructor TEXT,
  max_capacity INTEGER DEFAULT 25,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_tutorial_groups_subject_id ON tutorial_groups(subject_id);
CREATE INDEX idx_tutorial_groups_day_of_week ON tutorial_groups(day_of_week);

-- Insert sample tutorial groups for CS101
INSERT INTO tutorial_groups (subject_id, group_name, day_of_week, start_time, end_time, venue, instructor) VALUES
  -- CS101 tutorial groups
  ((SELECT id FROM subjects WHERE code = 'CS101'), 'Tutorial Group A', 2, '13:00', '14:00', 'Room A105', 'Dr. Johnson'),
  ((SELECT id FROM subjects WHERE code = 'CS101'), 'Tutorial Group B', 2, '14:00', '15:00', 'Room A105', 'Dr. Johnson'),
  ((SELECT id FROM subjects WHERE code = 'CS101'), 'Tutorial Group C', 4, '13:00', '14:00', 'Room A105', 'Ms. Davis');

-- Insert sample tutorial groups for MATH201
INSERT INTO tutorial_groups (subject_id, group_name, day_of_week, start_time, end_time, venue, instructor) VALUES
  -- MATH201 tutorial groups
  ((SELECT id FROM subjects WHERE code = 'MATH201'), 'Tutorial Group A', 3, '14:00', '15:00', 'Room B202', 'Mr. Wilson'),
  ((SELECT id FROM subjects WHERE code = 'MATH201'), 'Tutorial Group B', 3, '15:00', '16:00', 'Room B202', 'Mr. Wilson');

-- Insert sample tutorial groups for ENG105
INSERT INTO tutorial_groups (subject_id, group_name, day_of_week, start_time, end_time, venue, instructor) VALUES
  -- ENG105 tutorial groups
  ((SELECT id FROM subjects WHERE code = 'ENG105'), 'Tutorial Group A', 2, '16:00', '17:00', 'Room C305', 'Ms. Taylor'),
  ((SELECT id FROM subjects WHERE code = 'ENG105'), 'Tutorial Group B', 5, '11:00', '12:00', 'Room C305', 'Ms. Taylor');

-- ==========================================
-- 004_admin_users.sql
-- ==========================================

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