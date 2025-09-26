-- Create a default admin user for testing
-- This will create the user in the profiles table with admin role

-- Insert admin profile (this assumes the user exists in auth.users)
-- You need to create the user in Supabase Auth Dashboard first with email: admin@panoramafarmaceutico.com

-- Update any existing user to admin (replace with actual user ID)
-- First, let's create a function to make a user admin by email

CREATE OR REPLACE FUNCTION make_user_admin(user_email text)
RETURNS void AS $$
DECLARE
    user_uuid uuid;
BEGIN
    -- Get the user ID from auth.users
    SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
    
    IF user_uuid IS NOT NULL THEN
        -- Insert or update the profile
        INSERT INTO public.profiles (id, email, full_name, user_type, role, created_at, updated_at)
        VALUES (user_uuid, user_email, 'Administrador', 'admin', 'admin', now(), now())
        ON CONFLICT (id) 
        DO UPDATE SET 
            user_type = 'admin',
            role = 'admin',
            updated_at = now();
            
        RAISE NOTICE 'User % has been made admin', user_email;
    ELSE
        RAISE NOTICE 'User % not found in auth.users', user_email;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION make_user_admin(text) TO authenticated;

-- Example usage (uncomment and modify email as needed):
-- SELECT make_user_admin('admin@panoramafarmaceutico.com');
