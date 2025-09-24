-- Create event schedule tables
create table if not exists public.event_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  session_type text default 'presentation' check (session_type in ('presentation', 'workshop', 'networking', 'break')),
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  location text,
  max_capacity integer,
  current_attendees integer default 0,
  status text default 'scheduled' check (status in ('scheduled', 'ongoing', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id)
);

-- Create presentations table
create table if not exists public.presentations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.event_sessions(id) on delete cascade,
  exhibitor_id uuid references public.exhibitors(id) on delete cascade,
  title text not null,
  description text,
  presenter_name text not null,
  presenter_title text,
  duration_minutes integer default 30,
  presentation_order integer default 1,
  materials_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.event_sessions enable row level security;
alter table public.presentations enable row level security;

-- Create policies for sessions
create policy "Anyone can view scheduled sessions"
  on public.event_sessions for select
  using (status in ('scheduled', 'ongoing'));

create policy "Admins can manage all sessions"
  on public.event_sessions for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create policies for presentations
create policy "Anyone can view presentations"
  on public.presentations for select
  using (true);

create policy "Admins can manage all presentations"
  on public.presentations for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create indexes
create index if not exists event_sessions_start_time_idx on public.event_sessions(start_time);
create index if not exists event_sessions_location_idx on public.event_sessions(location);
create index if not exists presentations_session_id_idx on public.presentations(session_id);
create index if not exists presentations_exhibitor_id_idx on public.presentations(exhibitor_id);
