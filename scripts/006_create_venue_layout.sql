-- Create venue layout tables
create table if not exists public.venue_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  area_type text default 'exhibition' check (area_type in ('exhibition', 'conference', 'networking', 'catering', 'registration')),
  capacity integer,
  facilities text[],
  floor_plan_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create booth positions table
create table if not exists public.booth_positions (
  id uuid primary key default gen_random_uuid(),
  area_id uuid references public.venue_areas(id) on delete cascade,
  position_number text not null,
  position_name text,
  size_sqm numeric,
  position_type text default 'standard' check (position_type in ('standard', 'premium', 'corner', 'island')),
  coordinates jsonb, -- {x: number, y: number, width: number, height: number}
  amenities text[],
  price_tier text default 'standard' check (price_tier in ('standard', 'premium', 'vip')),
  is_available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create booth assignments table
create table if not exists public.booth_assignments (
  id uuid primary key default gen_random_uuid(),
  booth_id uuid references public.booth_positions(id) on delete cascade,
  exhibitor_id uuid references public.exhibitors(id) on delete cascade,
  assignment_status text default 'assigned' check (assignment_status in ('assigned', 'confirmed', 'setup', 'active', 'breakdown')),
  setup_time timestamp with time zone,
  breakdown_time timestamp with time zone,
  special_requirements text,
  contact_person text,
  contact_phone text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  assigned_by uuid references auth.users(id)
);

-- Enable RLS
alter table public.venue_areas enable row level security;
alter table public.booth_positions enable row level security;
alter table public.booth_assignments enable row level security;

-- Create policies
create policy "Anyone can view venue areas"
  on public.venue_areas for select
  using (true);

create policy "Anyone can view booth positions"
  on public.booth_positions for select
  using (true);

create policy "Anyone can view booth assignments"
  on public.booth_assignments for select
  using (true);

create policy "Admins can manage venue areas"
  on public.venue_areas for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can manage booth positions"
  on public.booth_positions for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can manage booth assignments"
  on public.booth_assignments for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create indexes
create index if not exists venue_areas_area_type_idx on public.venue_areas(area_type);
create index if not exists booth_positions_area_id_idx on public.booth_positions(area_id);
create index if not exists booth_positions_position_number_idx on public.booth_positions(position_number);
create index if not exists booth_assignments_booth_id_idx on public.booth_assignments(booth_id);
create index if not exists booth_assignments_exhibitor_id_idx on public.booth_assignments(exhibitor_id);

-- Create unique constraint
alter table public.booth_assignments add constraint unique_booth_assignment unique (booth_id);
