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