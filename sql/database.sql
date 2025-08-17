-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admin_users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  full_name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.class_schedules (
  subject_id uuid,
  type text NOT NULL CHECK (type = ANY (ARRAY['lecture'::text, 'tutorial'::text, 'lab'::text, 'practical'::text])),
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  venue text NOT NULL,
  instructor text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  max_capacity integer DEFAULT 30,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT class_schedules_pkey PRIMARY KEY (id),
  CONSTRAINT class_schedules_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
);
CREATE TABLE public.subjects (
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  semester text,
  department text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  credits integer DEFAULT 3,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subjects_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tutorial_groups (
  subject_id uuid,
  group_name text NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  venue text NOT NULL,
  instructor text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  max_capacity integer DEFAULT 25,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tutorial_groups_pkey PRIMARY KEY (id),
  CONSTRAINT tutorial_groups_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
);