-- Insert sample exhibitors data for testing
-- Note: This will only work after users are created through auth

-- Sample QR codes for testing
insert into public.qr_codes (code, user_type, user_email, user_name, company_name) values
  ('QR001PANO2025', 'exhibitor', 'farmacia.central@email.com', 'Dr. María González', 'Farmacia Central'),
  ('QR002PANO2025', 'exhibitor', 'laboratorios.vida@email.com', 'Dr. Carlos Rodríguez', 'Laboratorios Vida'),
  ('QR003PANO2025', 'exhibitor', 'medisalud@email.com', 'Dra. Ana Martínez', 'MediSalud'),
  ('QR004PANO2025', 'visitor', 'visitante1@email.com', 'Pedro Pérez', null),
  ('QR005PANO2025', 'visitor', 'visitante2@email.com', 'Laura Silva', null);

-- Create admin user QR code
insert into public.qr_codes (code, user_type, user_email, user_name) values
  ('ADMIN2025PANO', 'exhibitor', 'admin@panoramafarmaceutico.com', 'Administrador Sistema');
