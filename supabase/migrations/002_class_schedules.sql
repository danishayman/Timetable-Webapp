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