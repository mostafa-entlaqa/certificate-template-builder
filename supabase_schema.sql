-- Enable uuid extension if not already enabled
create extension if not exists "uuid-ossp";

-- Organizations table (auto-incrementing integer id)
create table organizations (
  id serial primary key,
  name text unique not null,
  created_at timestamp with time zone default now()
);

-- Users table (uuid id)
create table users (
  id uuid primary key default uuid_generate_v4(),
  auth_id uuid unique references auth.users(id),
  email text,
  org_id integer references organizations(id),
  created_at timestamp with time zone default now()
);

-- Templates table (auto-incrementing integer id)
create table templates (
  id serial primary key,
  name text not null,
  org_id integer references organizations(id),
  created_by uuid references users(id),
  elements jsonb,
  created_at timestamp with time zone default now()
);

-- Students table (auto-incrementing integer id)
create table students (
  id serial primary key,
  org_id integer references organizations(id),
  name text not null,
  email text,
  course text,
  created_at timestamp with time zone default now()
);

-- Certificates table (auto-incrementing integer id)
create table certificates (
  id serial primary key,
  template_id integer references templates(id),
  student_id integer references students(id),
  issued_by uuid references users(id),
  issued_at timestamp with time zone default now(),
  data jsonb -- stores dynamic fields like student name, course, etc.
);

-- Trigger function to add new users from auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (auth_id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- =========================
-- Row Level Security (RLS)
-- =========================

-- Enable RLS on all tables
alter table organizations enable row level security;
alter table users enable row level security;
alter table templates enable row level security;
alter table students enable row level security;
alter table certificates enable row level security;

-- Policies for users table
create policy "Users can view their own user row"
  on users for select
  using (auth.uid() = auth_id);

create policy "Users can update their own user row"
  on users for update
  using (auth.uid() = auth_id);

-- Policies for organizations table
create policy "Users can view their org"
  on organizations for select
  using (exists (
    select 1 from users where users.org_id = organizations.id and users.auth_id = auth.uid()
  ));

-- Policies for templates table
create policy "Users can view templates in their org"
  on templates for select
  using (exists (
    select 1 from users where users.org_id = templates.org_id and users.auth_id = auth.uid()
  ));

create policy "Users can insert templates in their org"
  on templates for insert
  with check (exists (
    select 1 from users where users.org_id = templates.org_id and users.auth_id = auth.uid()
  ));

create policy "Users can update templates they created"
  on templates for update
  using (created_by = (select id from users where auth_id = auth.uid()));

-- Policies for students table
create policy "Users can view students in their org"
  on students for select
  using (exists (
    select 1 from users where users.org_id = students.org_id and users.auth_id = auth.uid()
  ));

create policy "Users can insert students in their org"
  on students for insert
  with check (exists (
    select 1 from users where users.org_id = students.org_id and users.auth_id = auth.uid()
  ));

-- Policies for certificates table
create policy "Users can view certificates in their org"
  on certificates for select
  using (exists (
    select 1 from students s join users u on s.org_id = u.org_id
    where certificates.student_id = s.id and u.auth_id = auth.uid()
  ));

create policy "Users can insert certificates in their org"
  on certificates for insert
  with check (exists (
    select 1 from students s join users u on s.org_id = u.org_id
    where certificates.student_id = s.id and u.auth_id = auth.uid()
  )); 