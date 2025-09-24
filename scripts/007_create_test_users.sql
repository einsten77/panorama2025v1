-- Script para crear usuarios de prueba
-- IMPORTANTE: Estos usuarios deben crearse a través de Supabase Auth Dashboard
-- Este script solo documenta las credenciales y actualiza los perfiles

-- Después de crear los usuarios en Supabase Auth Dashboard, ejecuta estas consultas:

-- Actualizar perfil de administrador (reemplaza 'USER_UUID_AQUI' con el UUID real del usuario)
-- UPDATE public.profiles 
-- SET user_type = 'admin', role = 'admin', full_name = 'Administrador Sistema'
-- WHERE email = 'admin@panoramafarmaceutico.com';

-- Actualizar perfil de expositor de prueba
-- UPDATE public.profiles 
-- SET user_type = 'exhibitor', full_name = 'Dr. María González'
-- WHERE email = 'expositor@test.com';

-- Insertar datos de exhibitor para el usuario de prueba
-- INSERT INTO public.exhibitors (user_id, company_name, contact_person, email, phone, description, booth_number)
-- SELECT id, 'Farmacia Central', 'Dr. María González', 'expositor@test.com', '+1234567890', 'Farmacia especializada en medicamentos', 'A-01'
-- FROM public.profiles WHERE email = 'expositor@test.com';

-- Crear algunos leads de prueba
INSERT INTO public.leads (visitor_name, visitor_email, visitor_phone, company_name, notes, status) VALUES
  ('Juan Pérez', 'juan.perez@email.com', '+1234567890', 'Clínica San José', 'Interesado en productos cardiovasculares', 'new'),
  ('María García', 'maria.garcia@email.com', '+0987654321', 'Hospital Central', 'Solicita información sobre antibióticos', 'contacted'),
  ('Carlos López', 'carlos.lopez@email.com', '+1122334455', 'Farmacia del Pueblo', 'Quiere distribución regional', 'qualified'),
  ('Ana Martínez', 'ana.martinez@email.com', '+5566778899', 'Centro Médico Norte', 'Interesada en equipos médicos', 'new');
