-- Enable extensions
create extension if not exists "uuid-ossp";

-- Drop existing tables and their dependencies
drop table if exists "public"."exam_responses" cascade;
drop table if exists "public"."submissions" cascade;
drop table if exists "public"."exam_pdfs" cascade;
drop table if exists "public"."questions" cascade;
drop table if exists "public"."exams" cascade;
drop table if exists "public"."pdf_uploads" cascade;
drop table if exists "public"."profiles" cascade;

-- Drop existing triggers and functions
drop trigger if exists on_storage_update on storage.objects;
drop function if exists handle_storage_update();

-- Create storage bucket for PDFs
insert into storage.buckets (id, name, public)
values ('pdfs', 'pdfs', true)
on conflict (id) do nothing;

-- Create base tables first
create table if not exists "public"."profiles" (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  constraint username_length check (char_length(username) >= 3)
);

create table if not exists "public"."pdf_uploads" (
  "id" uuid not null default uuid_generate_v4(),
  "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
  "updated_at" timestamp with time zone default timezone('utc'::text, now()) not null,
  "title" text not null,
  "file_name" text not null,
  "storage_path" text not null,
  "size" bigint not null,
  "status" text not null default 'pending',
  "uploaded_by" uuid not null references auth.users(id) on delete cascade,
  primary key (id)
);

-- Create tables for exams and questions
create table if not exists "public"."exams" (
  "id" uuid not null default uuid_generate_v4(),
  "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
  "updated_at" timestamp with time zone default timezone('utc'::text, now()) not null,
  "title" text not null,
  "description" text,
  "duration" integer not null, -- in minutes
  "total_marks" integer not null,
  "pdf_id" uuid references public.pdf_uploads(id) on delete cascade,
  "created_by" uuid not null references auth.users(id) on delete cascade,
  "status" text not null default 'draft',
  primary key (id)
);

create table if not exists "public"."questions" (
  "id" uuid not null default uuid_generate_v4(),
  "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
  "updated_at" timestamp with time zone default timezone('utc'::text, now()) not null,
  "exam_id" uuid not null references public.exams(id) on delete cascade,
  "question_text" text not null,
  "options" jsonb not null default '[]'::jsonb,
  "correct_answer" text not null,
  "marks" integer not null default 1,
  "explanation" text,
  "page_number" integer,
  primary key (id)
);

create table if not exists "public"."exam_responses" (
  id uuid default uuid_generate_v4() primary key not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  exam_id uuid references public.exams not null,
  user_id uuid references auth.users not null,
  responses jsonb not null,
  total_marks numeric not null,
  submitted_at timestamp with time zone not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS on all tables
alter table "public"."profiles" enable row level security;
alter table "public"."pdf_uploads" enable row level security;
alter table "public"."exams" enable row level security;
alter table "public"."questions" enable row level security;
alter table "public"."exam_responses" enable row level security;

-- Create RLS policies for profiles
create policy "Public profiles are viewable by everyone"
  on "public"."profiles"
  for select
  using (true);

create policy "Users can insert their own profile"
  on "public"."profiles"
  for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on "public"."profiles"
  for update
  using (auth.uid() = id);

-- Create policies for pdf_uploads
create policy "Users can view their own PDF uploads"
  on "public"."pdf_uploads"
  for select
  using (auth.uid() = uploaded_by);

create policy "Users can create their own PDF uploads"
  on "public"."pdf_uploads"
  for insert
  with check (auth.uid() = uploaded_by);

create policy "Users can update their own PDF uploads"
  on "public"."pdf_uploads"
  for update
  using (auth.uid() = uploaded_by);

create policy "Users can delete their own PDF uploads"
  on "public"."pdf_uploads"
  for delete
  using (auth.uid() = uploaded_by);

-- Create policies for exams
create policy "Users can view their own exams"
  on "public"."exams"
  for select
  using (auth.uid() = created_by);

create policy "Users can create their own exams"
  on "public"."exams"
  for insert
  with check (auth.uid() = created_by);

create policy "Users can update their own exams"
  on "public"."exams"
  for update
  using (auth.uid() = created_by);

create policy "Users can delete their own exams"
  on "public"."exams"
  for delete
  using (auth.uid() = created_by);

-- Create policies for questions
create policy "Users can view questions for their exams"
  on "public"."questions"
  for select
  using (
    exists (
      select 1 from public.exams
      where id = exam_id
      and created_by = auth.uid()
    )
  );

create policy "Users can create questions for their exams"
  on "public"."questions"
  for insert
  with check (
    exists (
      select 1 from public.exams
      where id = exam_id
      and created_by = auth.uid()
    )
  );

create policy "Users can update questions for their exams"
  on "public"."questions"
  for update
  using (
    exists (
      select 1 from public.exams
      where id = exam_id
      and created_by = auth.uid()
    )
  );

create policy "Users can delete questions for their exams"
  on "public"."questions"
  for delete
  using (
    exists (
      select 1 from public.exams
      where id = exam_id
      and created_by = auth.uid()
    )
  );

-- Set up storage policies for PDFs
create policy "PDF files are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'pdfs' );

create policy "Users can upload PDF files"
  on storage.objects for insert
  with check (
    bucket_id = 'pdfs'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own PDF files"
  on storage.objects for update
  using (
    bucket_id = 'pdfs'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own PDF files"
  on storage.objects for delete
  using (
    bucket_id = 'pdfs'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create function to handle PDF upload tracking
create or replace function handle_storage_update()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  _user_id uuid;
  _file_name text;
  _size bigint;
begin
  -- Extract user ID from the first part of the path (before the first slash)
  _user_id := (regexp_split_to_array(new.name, '/'))[1]::uuid;
  
  -- Extract file name (everything after the last slash)
  _file_name := (regexp_split_to_array(new.name, '/'))[2];
  
  -- Get file size from metadata
  _size := coalesce((new.metadata->>'size')::bigint, 0);

  -- If size is 0, try to get it from the content length
  if _size = 0 then
    _size := coalesce((new.metadata->>'content-length')::bigint, 0);
  end if;

  -- Insert with a minimum size of 1 byte if no size is found
  insert into public.pdf_uploads (
    title,
    file_name,
    storage_path,
    size,
    uploaded_by
  )
  values (
    _file_name,
    _file_name,
    new.name,
    greatest(_size, 1),
    _user_id
  );
  return new;
end;
$$;

-- Drop existing trigger if it exists
drop trigger if exists on_storage_update on storage.objects;

-- Create trigger
create trigger on_storage_update
  after insert on storage.objects
  for each row
  when (new.bucket_id = 'pdfs')
  execute function handle_storage_update();

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on public.pdf_uploads to authenticated;
grant all on public.profiles to authenticated;
grant all on public.exams to authenticated;
grant all on public.questions to authenticated;
grant all on public.exam_responses to authenticated;
