-- This seed file can be used to populate the database with test data
-- It will be run when you execute 'supabase db reset'

-- Additional sample subjects (if needed beyond what's in the migration)
INSERT INTO subjects (code, name, credits, description, semester, department) VALUES
  ('PHYS101', 'Introduction to Physics', 4, 'Basic principles of mechanics, thermodynamics, and waves', 'Fall 2024', 'Physics'),
  ('CHEM110', 'General Chemistry', 4, 'Fundamental principles of chemistry', 'Fall 2024', 'Chemistry'),
  ('BUS200', 'Business Management', 3, 'Introduction to business management principles', 'Fall 2024', 'Business'); 