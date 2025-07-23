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