-- 001_initial_schema.sql

-- Seasons
create table if not exists seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_current boolean default false,
  created_at timestamptz default now()
);

-- Divisions
create table if not exists divisions (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete cascade not null,
  name text not null,
  display_order int default 0,
  created_at timestamptz default now()
);

-- Teams
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text,
  home_venue text,
  logo_url text,
  created_at timestamptz default now()
);

-- Team-Division enrollment
create table if not exists team_divisions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade not null,
  division_id uuid references divisions(id) on delete cascade not null,
  unique(team_id, division_id)
);

-- Fixtures
create table if not exists fixtures (
  id uuid primary key default gen_random_uuid(),
  division_id uuid references divisions(id) on delete cascade not null,
  home_team_id uuid references teams(id) not null,
  away_team_id uuid references teams(id) not null,
  scheduled_at timestamptz not null,
  venue text,
  status text default 'scheduled' check (status in ('scheduled', 'live', 'finished', 'postponed', 'walkover')),
  created_at timestamptz default now()
);

-- Results
create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid references fixtures(id) on delete cascade not null unique,
  home_score int not null,
  away_score int not null,
  notes text,
  created_at timestamptz default now()
);

-- Standings
create table if not exists standings (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade not null,
  division_id uuid references divisions(id) on delete cascade not null,
  played int default 0,
  won int default 0,
  lost int default 0,
  points_for int default 0,
  points_against int default 0,
  points int default 0,
  updated_at timestamptz default now(),
  unique(team_id, division_id)
);

-- News
create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  body text not null,
  tag text default 'News',
  published_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_fixtures_division on fixtures(division_id);
create index if not exists idx_fixtures_scheduled on fixtures(scheduled_at);
create index if not exists idx_standings_division on standings(division_id);
create index if not exists idx_results_fixture on results(fixture_id);

-- RLS
alter table seasons enable row level security;
alter table divisions enable row level security;
alter table teams enable row level security;
alter table team_divisions enable row level security;
alter table fixtures enable row level security;
alter table results enable row level security;
alter table standings enable row level security;
alter table news enable row level security;

create policy "Public read seasons" on seasons for select using (true);
create policy "Public read divisions" on divisions for select using (true);
create policy "Public read teams" on teams for select using (true);
create policy "Public read team_divisions" on team_divisions for select using (true);
create policy "Public read fixtures" on fixtures for select using (true);
create policy "Public read results" on results for select using (true);
create policy "Public read standings" on standings for select using (true);
create policy "Public read news" on news for select using (true);

create policy "Admin insert seasons" on seasons for insert with check (auth.uid() is not null);
create policy "Admin update seasons" on seasons for update using (auth.uid() is not null);
create policy "Admin insert divisions" on divisions for insert with check (auth.uid() is not null);
create policy "Admin insert teams" on teams for insert with check (auth.uid() is not null);
create policy "Admin update teams" on teams for update using (auth.uid() is not null);
create policy "Admin insert team_divisions" on team_divisions for insert with check (auth.uid() is not null);
create policy "Admin insert fixtures" on fixtures for insert with check (auth.uid() is not null);
create policy "Admin update fixtures" on fixtures for update using (auth.uid() is not null);
create policy "Admin delete fixtures" on fixtures for delete using (auth.uid() is not null);
create policy "Admin insert results" on results for insert with check (auth.uid() is not null);
create policy "Admin update results" on results for update using (auth.uid() is not null);
create policy "Admin delete results" on results for delete using (auth.uid() is not null);
create policy "Admin insert standings" on standings for insert with check (auth.uid() is not null);
create policy "Admin update standings" on standings for update using (auth.uid() is not null);
create policy "Admin insert news" on news for insert with check (auth.uid() is not null);
create policy "Admin update news" on news for update using (auth.uid() is not null);
create policy "Admin delete news" on news for delete using (auth.uid() is not null);

-- Recalculate standings function
create or replace function recalculate_standings(p_division_id uuid)
returns void language plpgsql security definer as $$
declare
  r record;
begin
  update standings set
    played = 0, won = 0, lost = 0,
    points_for = 0, points_against = 0, points = 0,
    updated_at = now()
  where division_id = p_division_id;

  for r in
    select
      f.home_team_id, f.away_team_id,
      res.home_score, res.away_score
    from fixtures f
    join results res on res.fixture_id = f.id
    where f.division_id = p_division_id
      and f.status = 'finished'
  loop
    insert into standings (team_id, division_id, played, won, lost, points_for, points_against, points)
    values (
      r.home_team_id, p_division_id, 1,
      case when r.home_score > r.away_score then 1 else 0 end,
      case when r.home_score < r.away_score then 1 else 0 end,
      r.home_score, r.away_score,
      case when r.home_score > r.away_score then 2 else 1 end
    )
    on conflict (team_id, division_id) do update set
      played = standings.played + 1,
      won = standings.won + case when r.home_score > r.away_score then 1 else 0 end,
      lost = standings.lost + case when r.home_score < r.away_score then 1 else 0 end,
      points_for = standings.points_for + r.home_score,
      points_against = standings.points_against + r.away_score,
      points = standings.points + case when r.home_score > r.away_score then 2 else 1 end,
      updated_at = now();

    insert into standings (team_id, division_id, played, won, lost, points_for, points_against, points)
    values (
      r.away_team_id, p_division_id, 1,
      case when r.away_score > r.home_score then 1 else 0 end,
      case when r.away_score < r.home_score then 1 else 0 end,
      r.away_score, r.home_score,
      case when r.away_score > r.home_score then 2 else 1 end
    )
    on conflict (team_id, division_id) do update set
      played = standings.played + 1,
      won = standings.won + case when r.away_score > r.home_score then 1 else 0 end,
      lost = standings.lost + case when r.away_score < r.home_score then 1 else 0 end,
      points_for = standings.points_for + r.away_score,
      points_against = standings.points_against + r.home_score,
      points = standings.points + case when r.away_score > r.home_score then 2 else 1 end,
      updated_at = now();
  end loop;
end;
$$;

-- =============================================================================
-- SEED DATA
-- =============================================================================

insert into seasons (id, name, is_current) values
  ('11111111-0000-0000-0000-000000000001', '2025/26', true)
on conflict do nothing;

insert into divisions (id, season_id, name, display_order) values
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Division 1', 1),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'Division 2', 2),
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'Division 3', 3),
  ('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001', 'Division 4', 4)
on conflict do nothing;

insert into teams (id, name, short_name, home_venue) values
  ('33333333-0001-0000-0000-000000000001', 'Tolka Rovers Eclipse', 'Tolka', 'Beneavin College D11 NH7E'),
  ('33333333-0002-0000-0000-000000000001', 'Eanna BC', 'Eanna', 'Colaiste Eanna'),
  ('33333333-0003-0000-0000-000000000001', 'Dublin Lions', 'Lions', 'Colaiste Bride'),
  ('33333333-0004-0000-0000-000000000001', 'Greystones Sharks', 'Sharks', 'St David''s Holy Faith, Greystones'),
  ('33333333-0005-0000-0000-000000000001', 'Rathmines BC', 'Rathmines', 'St Mary''s College Rathmines'),
  ('33333333-0006-0000-0000-000000000001', 'Oblate BC', 'Oblate', 'Oblate Hall Inchicore'),
  ('33333333-0007-0000-0000-000000000001', 'NEIC Trojans', 'Trojans', 'Beneavin College D11 NH7E'),
  ('33333333-0008-0000-0000-000000000001', 'Glasnevin BC', 'Glasnevin', 'St David''s Holy Faith Greystones'),
  ('33333333-0009-0000-0000-000000000001', 'Malahide Mens BC', 'Malahide', 'Trinity Sports & Leisure Club D13'),
  ('33333333-0010-0000-0000-000000000001', 'UCD Marian BC', 'UCD Marian', 'Oatlands College Stillorgan'),
  ('33333333-0011-0000-0000-000000000001', 'Dublin Raiders', 'Raiders', 'National Basketball Arena Dublin'),
  ('33333333-0012-0000-0000-000000000001', 'St. Vincents BC', 'Vincents', 'St Vincents Glasnevin'),
  ('33333333-0013-0000-0000-000000000001', 'Bray Bullets', 'Bullets', 'Presentation College Bray'),
  ('33333333-0014-0000-0000-000000000001', 'Killester BC', 'Killester', 'St Davids Artane'),
  ('33333333-0015-0000-0000-000000000001', 'KUBS BC', 'KUBS', 'National Basketball Arena Dublin'),
  ('33333333-0016-0000-0000-000000000001', 'Lusk Ravens BC', 'Lusk', 'Mount Temple School Malahide Road'),
  ('33333333-0017-0000-0000-000000000001', 'Tridents BC', 'Tridents', 'Trinity Sports & Leisure Club D13'),
  ('33333333-0018-0000-0000-000000000001', 'Liffey Celtics', 'Celtics', 'Colaiste De Hide Tallaght'),
  ('33333333-0019-0000-0000-000000000001', 'St Kevin''s Knights', 'Knights', 'Colaiste De Hide Tallaght'),
  ('33333333-0020-0000-0000-000000000001', 'Declans', 'Declans', 'National Basketball Arena Dublin')
on conflict do nothing;

insert into team_divisions (team_id, division_id) values
  ('33333333-0001-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001'),
  ('33333333-0002-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001'),
  ('33333333-0003-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001'),
  ('33333333-0004-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001'),
  ('33333333-0005-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001'),
  ('33333333-0006-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001'),
  ('33333333-0007-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001'),
  ('33333333-0008-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001'),
  ('33333333-0009-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001'),
  ('33333333-0010-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001'),
  ('33333333-0011-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001'),
  ('33333333-0012-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001')
on conflict do nothing;

insert into news (title, slug, body, tag, published_at) values
  ('AGM – Tuesday 12th May, 7:30pm', 'agm-may-2026', 'The Annual General Meeting of the Dublin Men''s Basketball Board will take place on Tuesday 12th May at 7:30pm. All member clubs are invited to attend. Venue to be confirmed.', 'Announcement', '2026-02-28'),
  ('2025/26 Season Registration Now Open', 'registration-2025-26', 'Registration for the 2025/26 DMBB season is now open. Clubs must submit their registration forms and fees by 1st September 2025.', 'Registration', '2025-09-01'),
  ('DMBB Cup Finals – Dates & Venues Confirmed', 'cup-finals-2025-26', 'The DMBB Cup Finals for the 2025/26 season have been confirmed. Further details on venues and times will be published shortly.', 'Cup Final', '2025-08-10')
on conflict do nothing;
