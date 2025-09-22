-- Create QR codes table for event entry
create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  user_type text check (user_type in ('exhibitor', 'visitor')) not null,
  user_email text not null,
  user_name text,
  company_name text, -- for exhibitors
  is_used boolean default false,
  used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.qr_codes enable row level security;

-- RLS policies for QR codes
create policy "qr_codes_select_admin"
  on public.qr_codes for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and user_type = 'admin'
    )
  );

create policy "qr_codes_insert_admin"
  on public.qr_codes for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and user_type = 'admin'
    )
  );

create policy "qr_codes_update_admin"
  on public.qr_codes for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and user_type = 'admin'
    )
  );
