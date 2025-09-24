-- Create schedule-related tables for event management

-- Event sessions table
CREATE TABLE IF NOT EXISTS event_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  session_type VARCHAR(50) NOT NULL DEFAULT 'presentation', -- presentation, workshop, meeting, break
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  max_capacity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exhibitor presentations table
CREATE TABLE IF NOT EXISTS exhibitor_presentations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exhibitor_id UUID REFERENCES exhibitors(id) ON DELETE CASCADE,
  session_id UUID REFERENCES event_sessions(id) ON DELETE CASCADE,
  presentation_title VARCHAR(255) NOT NULL,
  presentation_description TEXT,
  presenter_name VARCHAR(255),
  presenter_title VARCHAR(255),
  materials_url VARCHAR(500),
  is_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session attendees table
CREATE TABLE IF NOT EXISTS session_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES event_sessions(id) ON DELETE CASCADE,
  attendee_email VARCHAR(255) NOT NULL,
  attendee_name VARCHAR(255) NOT NULL,
  attendee_type VARCHAR(50) DEFAULT 'visitor', -- visitor, exhibitor, speaker
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attendance_confirmed BOOLEAN DEFAULT false,
  UNIQUE(session_id, attendee_email)
);

-- Event agenda table (for general event information)
CREATE TABLE IF NOT EXISTS event_agenda (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_date DATE NOT NULL,
  event_title VARCHAR(255) NOT NULL,
  event_description TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(255),
  agenda_type VARCHAR(50) DEFAULT 'general', -- general, networking, meal, ceremony
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_sessions_start_time ON event_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_event_sessions_location ON event_sessions(location);
CREATE INDEX IF NOT EXISTS idx_exhibitor_presentations_exhibitor ON exhibitor_presentations(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_session_attendees_session ON session_attendees(session_id);
CREATE INDEX IF NOT EXISTS idx_event_agenda_date ON event_agenda(event_date);

-- Enable RLS
ALTER TABLE event_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitor_presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_agenda ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Event sessions - readable by all, writable by admins
CREATE POLICY "Event sessions are viewable by everyone" ON event_sessions
  FOR SELECT USING (true);

CREATE POLICY "Event sessions are editable by admins" ON event_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- Exhibitor presentations - readable by all, writable by admins and own exhibitors
CREATE POLICY "Exhibitor presentations are viewable by everyone" ON exhibitor_presentations
  FOR SELECT USING (true);

CREATE POLICY "Exhibitor presentations are editable by admins" ON exhibitor_presentations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Exhibitors can edit their own presentations" ON exhibitor_presentations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM exhibitors 
      WHERE exhibitors.id = exhibitor_presentations.exhibitor_id 
      AND exhibitors.user_id = auth.uid()
    )
  );

-- Session attendees - readable by admins, writable by all for registration
CREATE POLICY "Session attendees are viewable by admins" ON session_attendees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Anyone can register for sessions" ON session_attendees
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own registrations" ON session_attendees
  FOR UPDATE USING (
    attendee_email = (
      SELECT email FROM profiles WHERE profiles.id = auth.uid()
    )
  );

-- Event agenda - readable by all, writable by admins
CREATE POLICY "Event agenda is viewable by everyone" ON event_agenda
  FOR SELECT USING (true);

CREATE POLICY "Event agenda is editable by admins" ON event_agenda
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );
