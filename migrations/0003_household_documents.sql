create table if not exists household_documents (
  id text primary key,
  household_id text not null,
  user_id text not null,
  filename text not null,
  mime_type text not null,
  size_bytes integer not null,
  kind text not null default 'file',
  notes_text text,
  content_b64 text,
  created_at timestamptz not null default now()
);

create index if not exists household_documents_hh_idx
  on household_documents (user_id, household_id, created_at desc);
