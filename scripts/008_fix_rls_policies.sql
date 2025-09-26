-- Fix RLS policies for all tables
-- This script ensures proper access to all tables

-- Enable RLS on all tables if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exhibitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booth_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booth_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Exhibitors can view own data" ON public.exhibitors;
DROP POLICY IF EXISTS "Admins can manage exhibitors" ON public.exhibitors;
DROP POLICY IF EXISTS "Public can view active exhibitors" ON public.exhibitors;

DROP POLICY IF EXISTS "Exhibitors can manage own leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;

DROP POLICY IF EXISTS "Admins can manage QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Public can view QR codes" ON public.qr_codes;

DROP POLICY IF EXISTS "Admins can manage sessions" ON public.event_sessions;
DROP POLICY IF EXISTS "Public can view sessions" ON public.event_sessions;

DROP POLICY IF EXISTS "Admins can manage presentations" ON public.presentations;
DROP POLICY IF EXISTS "Public can view presentations" ON public.presentations;

DROP POLICY IF EXISTS "Admins can manage venue areas" ON public.venue_areas;
DROP POLICY IF EXISTS "Public can view venue areas" ON public.venue_areas;

DROP POLICY IF EXISTS "Admins can manage booth positions" ON public.booth_positions;
DROP POLICY IF EXISTS "Public can view booth positions" ON public.booth_positions;

DROP POLICY IF EXISTS "Admins can manage booth assignments" ON public.booth_assignments;
DROP POLICY IF EXISTS "Public can view booth assignments" ON public.booth_assignments;

-- Create comprehensive policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create policies for exhibitors
CREATE POLICY "Exhibitors can view own data" ON public.exhibitors
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Exhibitors can update own data" ON public.exhibitors
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all exhibitors" ON public.exhibitors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Public can view active exhibitors" ON public.exhibitors
    FOR SELECT USING (is_active = true);

-- Create policies for leads
CREATE POLICY "Exhibitors can manage own leads" ON public.leads
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.exhibitors 
            WHERE id = leads.exhibitor_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all leads" ON public.leads
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create policies for QR codes
CREATE POLICY "Admins can manage QR codes" ON public.qr_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Public can view QR codes" ON public.qr_codes
    FOR SELECT USING (true);

-- Create policies for event sessions
CREATE POLICY "Admins can manage sessions" ON public.event_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Public can view sessions" ON public.event_sessions
    FOR SELECT USING (true);

-- Create policies for presentations
CREATE POLICY "Admins can manage presentations" ON public.presentations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Exhibitors can manage own presentations" ON public.presentations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.exhibitors 
            WHERE id = presentations.exhibitor_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view presentations" ON public.presentations
    FOR SELECT USING (true);

-- Create policies for venue areas
CREATE POLICY "Admins can manage venue areas" ON public.venue_areas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Public can view venue areas" ON public.venue_areas
    FOR SELECT USING (true);

-- Create policies for booth positions
CREATE POLICY "Admins can manage booth positions" ON public.booth_positions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Public can view booth positions" ON public.booth_positions
    FOR SELECT USING (true);

-- Create policies for booth assignments
CREATE POLICY "Admins can manage booth assignments" ON public.booth_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Exhibitors can view own assignments" ON public.booth_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.exhibitors 
            WHERE id = booth_assignments.exhibitor_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view booth assignments" ON public.booth_assignments
    FOR SELECT USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Ensure auth.users can be accessed
GRANT SELECT ON auth.users TO authenticated;
