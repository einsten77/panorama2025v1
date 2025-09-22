-- Create leads table for benefit requests
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  exhibitor_id uuid references public.exhibitors(id) on delete cascade not null,
  visitor_email text not null,
  visitor_phone text,
  visitor_name text,
  lead_type text check (lead_type in ('benefit', 'meeting')) not null,
  status text check (status in ('pending', 'contacted', 'completed')) default 'pending',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.leads enable row level security;

-- RLS policies for leads
create policy "leads_select_exhibitor"
  on public.leads for select
  using (
    exists (
      select 1 from public.exhibitors e
      where e.id = exhibitor_id and e.user_id = auth.uid()
    ) or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and user_type = 'admin'
    )
  );

create policy "leads_insert_all"
  on public.leads for insert
  with check (true); -- Anyone can create leads (visitors don't need accounts)

create policy "leads_update_exhibitor"
  on public.leads for update
  using (
    exists (
      select 1 from public.exhibitors e
      where e.id = exhibitor_id and e.user_id = auth.uid()
    ) or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and user_type = 'admin'
    )
  );
