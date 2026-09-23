create table if not exists households (
  id text primary key,
  user_id text not null,
  display_name text not null,
  status text not null default 'discovery',
  advisor_name text not null default '',
  meeting_date text,
  pq_json text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists households_user_id_idx on households (user_id);
create index if not exists households_updated_idx on households (user_id, updated_at desc);
