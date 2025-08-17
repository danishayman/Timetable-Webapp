-- Updated database schema with schools replacing departments
-- This script creates a new structure where schools contain multiple subjects

-- Create schools table (replaces department concept)
CREATE TABLE public.schools (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT schools_pkey PRIMARY KEY (id)
);

-- Create admin_users table (unchanged)
CREATE TABLE public.admin_users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  full_name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_users_pkey PRIMARY KEY (id)
);

-- Create subjects table (modified to reference schools instead of department)
CREATE TABLE public.subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  semester text,
  school_id uuid NOT NULL,
  credits integer DEFAULT 3,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subjects_pkey PRIMARY KEY (id),
  CONSTRAINT subjects_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE RESTRICT
);

-- Create class_schedules table (unchanged, still references subjects)
CREATE TABLE public.class_schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_id uuid,
  type text NOT NULL CHECK (type = ANY (ARRAY['lecture'::text, 'tutorial'::text, 'lab'::text, 'practical'::text])),
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  venue text NOT NULL,
  instructor text,
  max_capacity integer DEFAULT 30,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT class_schedules_pkey PRIMARY KEY (id),
  CONSTRAINT class_schedules_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE
);

-- Create tutorial_groups table (unchanged, still references subjects)
CREATE TABLE public.tutorial_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_id uuid,
  group_name text NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  venue text NOT NULL,
  instructor text,
  max_capacity integer DEFAULT 25,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tutorial_groups_pkey PRIMARY KEY (id),
  CONSTRAINT tutorial_groups_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_subjects_school_id ON public.subjects(school_id);
CREATE INDEX idx_subjects_code ON public.subjects(code);
CREATE INDEX idx_class_schedules_subject_id ON public.class_schedules(subject_id);
CREATE INDEX idx_tutorial_groups_subject_id ON public.tutorial_groups(subject_id);

-- Insert sample schools data
INSERT INTO public.schools (name, description) VALUES 
('School of Engineering', 'Engineering and technology programs'),
('School of Business', 'Business administration and management programs'),
('School of Science', 'Natural and applied sciences programs'),
('School of Arts', 'Liberal arts and humanities programs'),
('School of Medicine', 'Medical and health sciences programs');

