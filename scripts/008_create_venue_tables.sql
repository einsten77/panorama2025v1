-- Create venue and booth management tables

-- Venue areas table
CREATE TABLE IF NOT EXISTS venue_areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  area_name VARCHAR(255) NOT NULL,
  area_description TEXT,
  area_type VARCHAR(50) DEFAULT 'exhibition', -- exhibition, conference, networking, catering, entrance
  capacity INTEGER DEFAULT 0,
  width_meters DECIMAL(5,2),
  height_meters DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Booth positions table
CREATE TABLE IF NOT EXISTS booth_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_area_id UUID REFERENCES venue_areas(id) ON DELETE CASCADE,
  booth_number VARCHAR(50) NOT NULL UNIQUE,
  position_x DECIMAL(8,2) NOT NULL, -- X coordinate in meters
  position_y DECIMAL(8,2) NOT NULL, -- Y coordinate in meters
  width_meters DECIMAL(5,2) DEFAULT 3.0,
  height_meters DECIMAL(5,2) DEFAULT 3.0,
  booth_type VARCHAR(50) DEFAULT 'standard', -- standard, premium, corner, island
  has_power BOOLEAN DEFAULT true,
  has_internet BOOLEAN DEFAULT true,
  has_water BOOLEAN DEFAULT false,
  price_per_day DECIMAL(10,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Booth assignments table (links exhibitors to booth positions)
CREATE TABLE IF NOT EXISTS booth_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booth_position_id UUID REFERENCES booth_positions(id) ON DELETE CASCADE,
  exhibitor_id UUID REFERENCES exhibitors(id) ON DELETE CASCADE,
  assignment_date DATE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  setup_time TIME,
  breakdown_time TIME,
  special_requirements TEXT,
  assignment_status VARCHAR(50) DEFAULT 'assigned', -- assigned, confirmed, setup, active, breakdown, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(booth_position_id, assignment_date)
);

-- Venue facilities table
CREATE TABLE IF NOT EXISTS venue_facilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_name VARCHAR(255) NOT NULL,
  facility_type VARCHAR(50) NOT NULL, -- restroom, food_court, information, first_aid, storage, office
  venue_area_id UUID REFERENCES venue_areas(id) ON DELETE CASCADE,
  position_x DECIMAL(8,2),
  position_y DECIMAL(8,2),
  description TEXT,
  is_accessible BOOLEAN DEFAULT true,
  operating_hours VARCHAR(100),
  contact_info VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_booth_positions_area ON booth_positions(venue_area_id);
CREATE INDEX IF NOT EXISTS idx_booth_positions_number ON booth_positions(booth_number);
CREATE INDEX IF NOT EXISTS idx_booth_assignments_booth ON booth_assignments(booth_position_id);
CREATE INDEX IF NOT EXISTS idx_booth_assignments_exhibitor ON booth_assignments(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_venue_facilities_area ON venue_facilities(venue_area_id);

-- Enable RLS
ALTER TABLE venue_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE booth_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE booth_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_facilities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Venue areas - readable by all, writable by admins
CREATE POLICY "Venue areas are viewable by everyone" ON venue_areas
  FOR SELECT USING (true);

CREATE POLICY "Venue areas are editable by admins" ON venue_areas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- Booth positions - readable by all, writable by admins
CREATE POLICY "Booth positions are viewable by everyone" ON booth_positions
  FOR SELECT USING (true);

CREATE POLICY "Booth positions are editable by admins" ON booth_positions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- Booth assignments - readable by all, writable by admins
CREATE POLICY "Booth assignments are viewable by everyone" ON booth_assignments
  FOR SELECT USING (true);

CREATE POLICY "Booth assignments are editable by admins" ON booth_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- Venue facilities - readable by all, writable by admins
CREATE POLICY "Venue facilities are viewable by everyone" ON venue_facilities
  FOR SELECT USING (true);

CREATE POLICY "Venue facilities are editable by admins" ON venue_facilities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- Update exhibitors table to link with booth assignments
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS booth_assignment_id UUID REFERENCES booth_assignments(id);
