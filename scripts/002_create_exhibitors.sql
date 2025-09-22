-- Create exhibitors table
create table if not exists public.exhibitors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  company_name text not null,
  company_description text,
  logo_url text,
  booth_number text,
  contact_email text not null,
  contact_phone text,
  website_url text,
  benefit_title text not null default 'Descuento Especial',
  benefit_description text not null default 'Obtén un 5% de descuento completando nuestro formulario',
  benefit_percentage integer default 5,
  advisor_name text,
  advisor_email text,
  advisor_phone text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.exhibitors enable row level security;

-- RLS policies for exhibitors
create policy "exhibitors_select_all"
  on public.exhibitors for select
  using (is_active = true);

create policy "exhibitors_insert_own"
  on public.exhibitors for insert
  with check (
    auth.uid() = user_id or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and user_type = 'admin'
    )
  );

create policy "exhibitors_update_own"
  on public.exhibitors for update
  using (
    auth.uid() = user_id or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and user_type = 'admin'
    )
  );

create policy "exhibitors_delete_admin"
  on public.exhibitors for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and user_type = 'admin'
    )
  );
