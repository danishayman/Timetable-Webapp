-- Migration script to transition from department-based to school-based structure
-- Run this script on your existing database to apply the changes

-- Step 1: Create the new schools table
CREATE TABLE IF NOT EXISTS public.schools (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT schools_pkey PRIMARY KEY (id)
);

-- Step 2: Insert sample schools (you can modify these based on your actual departments)
INSERT INTO public.schools (name, description) VALUES 
('School of Engineering', 'Engineering and technology programs'),
('School of Business', 'Business administration and management programs'),
('School of Science', 'Natural and applied sciences programs'),
('School of Arts', 'Liberal arts and humanities programs'),
('School of Medicine', 'Medical and health sciences programs')
ON CONFLICT (name) DO NOTHING;

-- Step 3: Add the new school_id column to subjects table
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS school_id uuid;

-- Step 4: Update existing subjects to map departments to schools
-- You'll need to customize this mapping based on your actual departments
-- Example mappings (modify as needed):
UPDATE public.subjects 
SET school_id = (SELECT id FROM public.schools WHERE name = 'School of Engineering')
WHERE department IN ('Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering');

UPDATE public.subjects 
SET school_id = (SELECT id FROM public.schools WHERE name = 'School of Business')
WHERE department IN ('Business Administration', 'Marketing', 'Finance', 'Accounting');

UPDATE public.subjects 
SET school_id = (SELECT id FROM public.schools WHERE name = 'School of Science')
WHERE department IN ('Mathematics', 'Physics', 'Chemistry', 'Biology');

UPDATE public.subjects 
SET school_id = (SELECT id FROM public.schools WHERE name = 'School of Arts')
WHERE department IN ('English', 'History', 'Philosophy', 'Art');

UPDATE public.subjects 
SET school_id = (SELECT id FROM public.schools WHERE name = 'School of Medicine')
WHERE department IN ('Medicine', 'Nursing', 'Pharmacy');

-- Step 5: For any subjects that don't match the above, assign them to a default school
-- First, let's see if there are any unmapped subjects
-- UPDATE public.subjects 
-- SET school_id = (SELECT id FROM public.schools WHERE name = 'School of Science')
-- WHERE school_id IS NULL;

-- Step 6: Make school_id NOT NULL (after all subjects have been assigned)
ALTER TABLE public.subjects ALTER COLUMN school_id SET NOT NULL;

-- Step 7: Add foreign key constraint
ALTER TABLE public.subjects 
ADD CONSTRAINT subjects_school_id_fkey 
FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE RESTRICT;

-- Step 8: Remove the old department column
ALTER TABLE public.subjects DROP COLUMN IF EXISTS department;

-- Step 9: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subjects_school_id ON public.subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON public.subjects(code);
CREATE INDEX IF NOT EXISTS idx_class_schedules_subject_id ON public.class_schedules(subject_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_groups_subject_id ON public.tutorial_groups(subject_id);

-- Step 10: Verify the migration
-- You can run these queries to check the results:
-- SELECT s.name as school_name, COUNT(sub.id) as subject_count 
-- FROM public.schools s 
-- LEFT JOIN public.subjects sub ON s.id = sub.school_id 
-- GROUP BY s.id, s.name 
-- ORDER BY s.name;

