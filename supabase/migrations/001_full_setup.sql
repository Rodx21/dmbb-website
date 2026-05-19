-- =================================================================
-- DMBB WEBSITE â FULL SETUP (Schema + 2025/26 Season Data)
-- Paste entire file into Supabase SQL Editor and click Run
-- =================================================================

-- ----------------------------------------------------------------
-- SCHEMA
-- ----------------------------------------------------------------

create table if not exists seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_current boolean default false,
  created_at timestamptz default now()
);

create table if not exists divisions (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete cascade not null,
  name text not null,
  display_order int default 0,
  created_at timestamptz default now()
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text,
  home_venue text,
  logo_url text,
  created_at timestamptz default now()
);

create table if not exists team_divisions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade not null,
  division_id uuid references divisions(id) on delete cascade not null,
  unique(team_id, division_id)
);

create table if not exists fixtures (
  id text primary key,
  division_id uuid references divisions(id) on delete cascade not null,
  home_team_id uuid references teams(id) not null,
  away_team_id uuid references teams(id) not null,
  scheduled_at timestamptz not null,
  venue text,
  status text default 'scheduled' check (status in ('scheduled', 'live', 'finished', 'postponed', 'walkover')),
  created_at timestamptz default now()
);

create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  fixture_id text references fixtures(id) on delete cascade not null unique,
  home_score int not null,
  away_score int not null,
  notes text,
  created_at timestamptz default now()
);

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
    select f.home_team_id, f.away_team_id, res.home_score, res.away_score
    from fixtures f
    join results res on res.fixture_id = f.id
    where f.division_id = p_division_id and f.status = 'finished'
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

-- =================================================================
-- SEED DATA â 2025/26 Full Season
-- =================================================================

insert into seasons (id, name, is_current) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '2025/26', true)
on conflict do nothing;

insert into divisions (id, season_id, name, display_order) values
  ('bbbb0001-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Senior Division 1', 1),
  ('bbbb0002-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Senior Division 2', 2),
  ('bbbb0003-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Senior Division 3', 3),
  ('bbbb0004-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Senior Division 4', 4),
  ('bbbb0010-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Under 12 Boys', 10),
  ('bbbb0011-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Under 13 Boys', 11),
  ('bbbb0012-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Under 14 Boys', 12),
  ('bbbb0013-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Under 15 Boys', 13),
  ('bbbb0014-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Under 16 Boys', 14),
  ('bbbb0015-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Under 17 Boys', 15),
  ('bbbb0016-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Under 18 Boys', 16),
  ('bbbb0017-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Under 20 Boys', 17),
  ('bbbb0020-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Senior Cup', 20),
  ('bbbb0021-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Intermediate Cup', 21),
  ('bbbb0022-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'U12 Boys Cup', 22),
  ('bbbb0023-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'U13 Boys Cup', 23),
  ('bbbb0024-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'U14 Boys Cup', 24),
  ('bbbb0025-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'U15 Boys Cup', 25),
  ('bbbb0026-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'U16 Boys Cup', 26),
  ('bbbb0027-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'U17 Boys Cup', 27),
  ('bbbb0028-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'U18 Boys Cup', 28),
  ('bbbb0029-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'U20 Boys Cup', 29)
on conflict do nothing;

insert into teams (id, name, short_name, home_venue) values
  ('cccc0001-0000-0000-0000-000000000001', 'Declans',              'Declans',    'St Declans Cabra'),
  ('cccc0002-0000-0000-0000-000000000001', 'Oblate BC',            'Oblate',     'Oblate Hall Inchicore'),
  ('cccc0003-0000-0000-0000-000000000001', 'Rathmines BC',         'Rathmines',  'St Mary''s College Rathmines'),
  ('cccc0004-0000-0000-0000-000000000001', 'Eanna BC',             'Eanna',      'Colaiste Eanna'),
  ('cccc0005-0000-0000-0000-000000000001', 'UCD Marian BC',        'UCD Marian', 'Oatlands College Stillorgan'),
  ('cccc0006-0000-0000-0000-000000000001', 'Dublin Lions',         'Lions',      'Colaiste Bride'),
  ('cccc0007-0000-0000-0000-000000000001', 'Bray Bullets',         'Bullets',    'Presentation College Bray'),
  ('cccc0008-0000-0000-0000-000000000001', 'Dublin Raiders',       'Raiders',    'National Basketball Arena Dublin'),
  ('cccc0009-0000-0000-0000-000000000001', 'NEIC Trojans',         'Trojans',    'Beneavin College D11 NH7E'),
  ('cccc0010-0000-0000-0000-000000000001', 'St. Vincents BC',      'Vincents',   'St Vincents Glasnevin'),
  ('cccc0011-0000-0000-0000-000000000001', 'Malahide Mens BC',     'Malahide',   'St Oliver Plunketts School Malahide'),
  ('cccc0012-0000-0000-0000-000000000001', 'Ongar Chasers BC',     'Ongar',      'Hanesfield ETSS School'),
  ('cccc0013-0000-0000-0000-000000000001', 'Greystones Sharks',    'Sharks',     'St David''s Holy Faith Greystones'),
  ('cccc0014-0000-0000-0000-000000000001', 'Glasnevin BC',         'Glasnevin',  'Beneavin College D11 NH7E'),
  ('cccc0015-0000-0000-0000-000000000001', 'St Kevin''s Knights',  'Knights',    'Colaiste De Hide Tallaght'),
  ('cccc0016-0000-0000-0000-000000000001', 'Killester BC',         'Killester',  'St Davids Artane'),
  ('cccc0017-0000-0000-0000-000000000001', 'KUBS BC',              'KUBS',       'Greendale Kilbarrack'),
  ('cccc0018-0000-0000-0000-000000000001', 'Lusk Ravens BC',       'Lusk',       'Mount Temple School Malahide Road'),
  ('cccc0019-0000-0000-0000-000000000001', 'Tridents BC',          'Tridents',   'Trinity Sports & Leisure Club D13'),
  ('cccc0020-0000-0000-0000-000000000001', 'Naas BC',              'Naas',       'Pipers Hill College Naas'),
  ('cccc0021-0000-0000-0000-000000000001', 'Liffey Celtics',       'Celtics',    'Colaiste De Hide Tallaght'),
  ('cccc0022-0000-0000-0000-000000000001', 'Templeogue BC',        'Templeogue', 'Presentation College Terenure'),
  ('cccc0023-0000-0000-0000-000000000001', 'Swords BC',            'Swords',     'National Basketball Arena Dublin'),
  ('cccc0024-0000-0000-0000-000000000001', 'Tolka Rovers Eclipse', 'Tolka',      'Beneavin College D11 NH7E'),
  ('cccc0025-0000-0000-0000-000000000001', 'Meteors BC',           'Meteors',    'Firhouse Comm College'),
  ('cccc0026-0000-0000-0000-000000000001', 'Barrow Rovers BC',     'Barrow',     'Barrow Rovers Hall'),
  ('cccc0027-0000-0000-0000-000000000001', 'Templeogue BC Div4',   'Temp D4',    'Presentation College Terenure')
on conflict do nothing;

insert into team_divisions (team_id, division_id) values
  ('cccc0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001'),
  ('cccc0002-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001'),
  ('cccc0003-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001'),
  ('cccc0004-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001'),
  ('cccc0005-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001'),
  ('cccc0006-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001'),
  ('cccc0007-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001'),
  ('cccc0008-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001'),
  ('cccc0009-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001'),
  ('cccc0010-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001'),
  ('cccc0011-0000-0000-0000-000000000001', 'bbbb0002-0000-0000-0000-000000000001'),
  ('cccc0012-0000-0000-0000-000000000001', 'bbbb0002-0000-0000-0000-000000000001'),
  ('cccc0013-0000-0000-0000-000000000001', 'bbbb0002-0000-0000-0000-000000000001'),
  ('cccc0014-0000-0000-0000-000000000001', 'bbbb0002-0000-0000-0000-000000000001'),
  ('cccc0015-0000-0000-0000-000000000001', 'bbbb0002-0000-0000-0000-000000000001'),
  ('cccc0016-0000-0000-0000-000000000001', 'bbbb0002-0000-0000-0000-000000000001'),
  ('cccc0017-0000-0000-0000-000000000001', 'bbbb0002-0000-0000-0000-000000000001'),
  ('cccc0018-0000-0000-0000-000000000001', 'bbbb0002-0000-0000-0000-000000000001'),
  ('cccc0019-0000-0000-0000-000000000001', 'bbbb0002-0000-0000-0000-000000000001'),
  ('cccc0020-0000-0000-0000-000000000001', 'bbbb0002-0000-0000-0000-000000000001'),
  ('cccc0021-0000-0000-0000-000000000001', 'bbbb0003-0000-0000-0000-000000000001'),
  ('cccc0022-0000-0000-0000-000000000001', 'bbbb0003-0000-0000-0000-000000000001'),
  ('cccc0008-0000-0000-0000-000000000001', 'bbbb0003-0000-0000-0000-000000000001'),
  ('cccc0027-0000-0000-0000-000000000001', 'bbbb0004-0000-0000-0000-000000000001'),
  ('cccc0004-0000-0000-0000-000000000001', 'bbbb0010-0000-0000-0000-000000000001'),
  ('cccc0006-0000-0000-0000-000000000001', 'bbbb0010-0000-0000-0000-000000000001'),
  ('cccc0011-0000-0000-0000-000000000001', 'bbbb0010-0000-0000-0000-000000000001'),
  ('cccc0021-0000-0000-0000-000000000001', 'bbbb0010-0000-0000-0000-000000000001'),
  ('cccc0024-0000-0000-0000-000000000001', 'bbbb0010-0000-0000-0000-000000000001'),
  ('cccc0004-0000-0000-0000-000000000001', 'bbbb0011-0000-0000-0000-000000000001'),
  ('cccc0006-0000-0000-0000-000000000001', 'bbbb0011-0000-0000-0000-000000000001'),
  ('cccc0025-0000-0000-0000-000000000001', 'bbbb0011-0000-0000-0000-000000000001'),
  ('cccc0024-0000-0000-0000-000000000001', 'bbbb0011-0000-0000-0000-000000000001'),
  ('cccc0004-0000-0000-0000-000000000001', 'bbbb0012-0000-0000-0000-000000000001'),
  ('cccc0006-0000-0000-0000-000000000001', 'bbbb0012-0000-0000-0000-000000000001'),
  ('cccc0002-0000-0000-0000-000000000001', 'bbbb0012-0000-0000-0000-000000000001'),
  ('cccc0008-0000-0000-0000-000000000001', 'bbbb0012-0000-0000-0000-000000000001'),
  ('cccc0010-0000-0000-0000-000000000001', 'bbbb0012-0000-0000-0000-000000000001'),
  ('cccc0025-0000-0000-0000-000000000001', 'bbbb0012-0000-0000-0000-000000000001'),
  ('cccc0004-0000-0000-0000-000000000001', 'bbbb0013-0000-0000-0000-000000000001'),
  ('cccc0006-0000-0000-0000-000000000001', 'bbbb0013-0000-0000-0000-000000000001'),
  ('cccc0011-0000-0000-0000-000000000001', 'bbbb0013-0000-0000-0000-000000000001'),
  ('cccc0016-0000-0000-0000-000000000001', 'bbbb0013-0000-0000-0000-000000000001'),
  ('cccc0002-0000-0000-0000-000000000001', 'bbbb0013-0000-0000-0000-000000000001'),
  ('cccc0004-0000-0000-0000-000000000001', 'bbbb0014-0000-0000-0000-000000000001'),
  ('cccc0006-0000-0000-0000-000000000001', 'bbbb0014-0000-0000-0000-000000000001'),
  ('cccc0016-0000-0000-0000-000000000001', 'bbbb0014-0000-0000-0000-000000000001'),
  ('cccc0022-0000-0000-0000-000000000001', 'bbbb0014-0000-0000-0000-000000000001'),
  ('cccc0002-0000-0000-0000-000000000001', 'bbbb0014-0000-0000-0000-000000000001'),
  ('cccc0004-0000-0000-0000-000000000001', 'bbbb0015-0000-0000-0000-000000000001'),
  ('cccc0011-0000-0000-0000-000000000001', 'bbbb0015-0000-0000-0000-000000000001'),
  ('cccc0012-0000-0000-0000-000000000001', 'bbbb0015-0000-0000-0000-000000000001'),
  ('cccc0022-0000-0000-0000-000000000001', 'bbbb0015-0000-0000-0000-000000000001'),
  ('cccc0006-0000-0000-0000-000000000001', 'bbbb0015-0000-0000-0000-000000000001'),
  ('cccc0002-0000-0000-0000-000000000001', 'bbbb0016-0000-0000-0000-000000000001'),
  ('cccc0004-0000-0000-0000-000000000001', 'bbbb0016-0000-0000-0000-000000000001'),
  ('cccc0006-0000-0000-0000-000000000001', 'bbbb0016-0000-0000-0000-000000000001'),
  ('cccc0022-0000-0000-0000-000000000001', 'bbbb0016-0000-0000-0000-000000000001'),
  ('cccc0004-0000-0000-0000-000000000001', 'bbbb0017-0000-0000-0000-000000000001'),
  ('cccc0006-0000-0000-0000-000000000001', 'bbbb0017-0000-0000-0000-000000000001'),
  ('cccc0022-0000-0000-0000-000000000001', 'bbbb0017-0000-0000-0000-000000000001'),
  ('cccc0016-0000-0000-0000-000000000001', 'bbbb0017-0000-0000-0000-000000000001'),
  ('cccc0002-0000-0000-0000-000000000001', 'bbbb0016-0000-0000-0000-000000000001'),
  ('cccc0004-0000-0000-0000-000000000001', 'bbbb0016-0000-0000-0000-000000000001'),
  ('cccc0022-0000-0000-0000-000000000001', 'bbbb0016-0000-0000-0000-000000000001'),
  ('cccc0006-0000-0000-0000-000000000001', 'bbbb0016-0000-0000-0000-000000000001')
on conflict do nothing;

-- ================================================================
-- STANDINGS
-- ================================================================

delete from standings where division_id = 'bbbb0001-0000-0000-0000-000000000001';
insert into standings (team_id, division_id, played, won, lost, points_for, points_against, points) values
  ('cccc0001-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001',16,13, 3, 982, 762,29),
  ('cccc0002-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001',15,12, 3, 895, 721,27),
  ('cccc0003-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001',16,11, 5, 950, 790,27),
  ('cccc0004-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001',16,10, 6, 901, 812,26),
  ('cccc0007-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001',15, 9, 6, 855, 769,24),
  ('cccc0006-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001',16, 8, 8, 875, 842,24),
  ('cccc0009-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001',15, 7, 8, 768, 801,22),
  ('cccc0005-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001',16, 5,11, 752, 889,21),
  ('cccc0008-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001',15, 4,11, 698, 884,19),
  ('cccc0010-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001',14, 1,13, 612, 967,15)
on conflict (team_id, division_id) do update set
  played=excluded.played, won=excluded.won, lost=excluded.lost,
  points_for=excluded.points_for, points_against=excluded.points_against,
  points=excluded.points, updated_at=now();

delete from standings where division_id = 'bbbb0002-0000-0000-0000-000000000001';
insert into standings (team_id, division_id, played, won, lost, points_for, points_against, points) values
  ('cccc0015-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001',16,14, 2,1020, 730,30),
  ('cccc0012-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001',15,11, 4, 890, 740,26),
  ('cccc0011-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001',16,10, 6, 870, 750,26),
  ('cccc0013-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001',14, 9, 5, 780, 650,23),
  ('cccc0014-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001',15, 8, 7, 760, 720,23),
  ('cccc0016-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001',13, 6, 7, 680, 690,19),
  ('cccc0018-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001',12, 5, 7, 620, 660,17),
  ('cccc0019-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001',13, 3,10, 520, 780,16),
  ('cccc0017-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001',13, 2,11, 540, 810,15),
  ('cccc0020-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001',11, 0,11, 440, 820,11)
on conflict (team_id, division_id) do update set
  played=excluded.played, won=excluded.won, lost=excluded.lost,
  points_for=excluded.points_for, points_against=excluded.points_against,
  points=excluded.points, updated_at=now();

-- ================================================================
-- FIXTURES & RESULTS â Cup Finals
-- ================================================================

insert into fixtures (id, division_id, home_team_id, away_team_id, scheduled_at, venue, status) values
  ('cup_int_final','bbbb0021-0000-0000-0000-000000000001','cccc0002-0000-0000-0000-000000000001','cccc0017-0000-0000-0000-000000000001','2026-03-08 15:30:00+00','Oblate Hall Inchicore','finished'),
  ('cup_int_sf1',  'bbbb0021-0000-0000-0000-000000000001','cccc0002-0000-0000-0000-000000000001','cccc0014-0000-0000-0000-000000000001','2026-02-08 19:00:00+00','Oblate Hall Inchicore','finished'),
  ('cup_u12_sf1',  'bbbb0022-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','cccc0024-0000-0000-0000-000000000001','2026-02-22 10:00:00+00','St Kevin''s College','finished'),
  ('cup_u12_sf2',  'bbbb0022-0000-0000-0000-000000000001','cccc0011-0000-0000-0000-000000000001','cccc0021-0000-0000-0000-000000000001','2026-02-22 11:00:00+00','St Kevin''s College','finished'),
  ('cup_u12_final','bbbb0022-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','cccc0008-0000-0000-0000-000000000001','2026-03-08 11:00:00+00','Oblate Hall Inchicore','finished'),
  ('cup_u13_sf1',  'bbbb0023-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','cccc0006-0000-0000-0000-000000000001','2026-03-01 14:00:00+00','Colaiste Eanna','finished'),
  ('cup_u13_final','bbbb0023-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','cccc0024-0000-0000-0000-000000000001','2026-03-08 13:00:00+00','Oblate Hall Inchicore','finished'),
  ('cup_u14_sf1',  'bbbb0024-0000-0000-0000-000000000001','cccc0002-0000-0000-0000-000000000001','cccc0008-0000-0000-0000-000000000001','2026-03-01 14:00:00+00','Oblate Hall Inchicore','finished'),
  ('cup_u14_sf2',  'bbbb0024-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','cccc0010-0000-0000-0000-000000000001','2026-03-01 15:30:00+00','Oblate Hall Inchicore','finished'),
  ('cup_u15_sf1',  'bbbb0025-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','cccc0002-0000-0000-0000-000000000001','2026-02-28 14:00:00+00','Colaiste Eanna','finished'),
  ('cup_u15_final','bbbb0025-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','cccc0011-0000-0000-0000-000000000001','2026-03-08 14:00:00+00','Oblate Hall Inchicore','finished'),
  ('cup_u16_sf1',  'bbbb0026-0000-0000-0000-000000000001','cccc0002-0000-0000-0000-000000000001','cccc0022-0000-0000-0000-000000000001','2026-02-25 19:00:00+00','Oblate Hall Inchicore','finished'),
  ('cup_u16_sf2',  'bbbb0026-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','cccc0006-0000-0000-0000-000000000001','2026-02-22 15:00:00+00','Colaiste Eanna','finished'),
  ('cup_u16_final','bbbb0026-0000-0000-0000-000000000001','cccc0022-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','2026-03-08 16:00:00+00','Oblate Hall Inchicore','finished'),
  ('cup_u17_sf1',  'bbbb0027-0000-0000-0000-000000000001','cccc0022-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','2026-01-25 19:00:00+00','Presentation College Terenure','finished'),
  ('cup_u17_final','bbbb0027-0000-0000-0000-000000000001','cccc0022-0000-0000-0000-000000000001','cccc0006-0000-0000-0000-000000000001','2026-03-08 17:00:00+00','Oblate Hall Inchicore','finished'),
  ('cup_u18_sf1',  'bbbb0028-0000-0000-0000-000000000001','cccc0002-0000-0000-0000-000000000001','cccc0006-0000-0000-0000-000000000001','2026-02-07 19:00:00+00','Oblate Hall Inchicore','finished'),
  ('cup_u18_sf2',  'bbbb0028-0000-0000-0000-000000000001','cccc0022-0000-0000-0000-000000000001','cccc0001-0000-0000-0000-000000000001','2026-02-14 19:00:00+00','Presentation College Terenure','finished'),
  ('cup_u18_final','bbbb0028-0000-0000-0000-000000000001','cccc0002-0000-0000-0000-000000000001','cccc0022-0000-0000-0000-000000000001','2026-03-08 18:30:00+00','Oblate Hall Inchicore','finished'),
  ('cup_u20_final','bbbb0029-0000-0000-0000-000000000001','cccc0022-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','2026-03-08 19:30:00+00','Oblate Hall Inchicore','finished')
on conflict do nothing;

insert into results (fixture_id, home_score, away_score, notes) values
  ('cup_int_final', 53, 39, 'Intermediate Cup Final 2025/26 — WINNERS: Oblate BC'),
  ('cup_int_sf1',   36, 32, null),
  ('cup_u12_sf1',   58, 30, null),
  ('cup_u12_sf2',   46, 42, null),
  ('cup_u12_final', 50, 30, 'U12 Boys Cup Final — WINNERS: Eanna BC'),
  ('cup_u13_sf1',   57, 53, null),
  ('cup_u13_final', 49, 29, 'U13 Boys Cup Final — WINNERS: Eanna BC'),
  ('cup_u14_sf1',   72, 53, null),
  ('cup_u14_sf2',   55, 48, null),
  ('cup_u15_sf1',   70, 58, null),
  ('cup_u15_final', 74, 49, 'U15 Boys Cup Final — WINNERS: Eanna BC'),
  ('cup_u16_sf1',   44, 52, null),
  ('cup_u16_sf2',   61, 38, null),
  ('cup_u16_final', 61, 57, 'U16 Boys Cup Final — WINNERS: Templeogue BC. Coaches: Daire Murray & Aoife McKevitt'),
  ('cup_u17_sf1',   82, 70, null),
  ('cup_u17_final', 84, 83, 'U17 Boys Cup Final — WINNERS: Templeogue BC. 1-point win, lead taken with 5 seconds left. Coaches: Sheena Moran & Adam Tighe'),
  ('cup_u18_sf1',   72, 53, null),
  ('cup_u18_sf2',   51, 41, null),
  ('cup_u18_final', 57, 47, 'U18 Boys Cup Final — WINNERS: Oblate BC. Decisive third quarter, led by 17 at one stage'),
  ('cup_u20_final', 83, 72, 'U20 Boys Cup Final — WINNERS: Templeogue BC. Coach: Jay Fazande')
on conflict do nothing;

-- ================================================================
-- UPCOMING FIXTURES
-- ================================================================

insert into fixtures (id, division_id, home_team_id, away_team_id, scheduled_at, venue, status) values
  ('fut0001','bbbb0001-0000-0000-0000-000000000001','cccc0006-0000-0000-0000-000000000001','cccc0005-0000-0000-0000-000000000001','2026-05-10 11:10:00+01','Collinstown CC Clondalkin D22','scheduled'),
  ('fut0002','bbbb0001-0000-0000-0000-000000000001','cccc0010-0000-0000-0000-000000000001','cccc0007-0000-0000-0000-000000000001','2026-05-10 19:50:00+01','St Vincents Glasnevin','scheduled'),
  ('fut0003','bbbb0001-0000-0000-0000-000000000001','cccc0009-0000-0000-0000-000000000001','cccc0003-0000-0000-0000-000000000001','2026-05-10 15:00:00+01','Beneavin College D11 NH7E','scheduled'),
  ('fut0004','bbbb0001-0000-0000-0000-000000000001','cccc0001-0000-0000-0000-000000000001','cccc0002-0000-0000-0000-000000000001','2026-05-17 14:00:00+01','St Declans Cabra','scheduled'),
  ('fut0005','bbbb0001-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','cccc0008-0000-0000-0000-000000000001','2026-05-17 19:00:00+01','Colaiste Eanna','scheduled'),
  ('fut0006','bbbb0002-0000-0000-0000-000000000001','cccc0011-0000-0000-0000-000000000001','cccc0012-0000-0000-0000-000000000001','2026-05-10 13:55:00+01','St Oliver Plunketts School Malahide','scheduled'),
  ('fut0007','bbbb0002-0000-0000-0000-000000000001','cccc0015-0000-0000-0000-000000000001','cccc0013-0000-0000-0000-000000000001','2026-05-10 18:00:00+01','Colaiste De Hide Tallaght','scheduled')
on conflict do nothing;

-- ================================================================
-- NEWS
-- ================================================================

insert into news (title, slug, body, tag, published_at) values

  ('Eanna and Templeogue dominate DMBB Cup Finals',
   'cup-finals-results-march-2026',
   'The DMBB Cup Finals were played on the weekend of 6th–8th March 2026 at Oblate Hall in Inchicore.

Eanna BC claimed three cups, winning the U12, U13 and U15 Boys competitions. In the U12 final they defeated Dublin Raiders 50-30, followed by a dominant 49-29 win over Tolka Rovers Eclipse in the U13 final. The U15 final saw them overcome Malahide convincingly 74-49.

Templeogue BC had an equally impressive weekend, winning the U16, U17 and U20 Boys Cups. The U16 final was a tightly-contested 61-57 win over Eanna. The U17 final against Dublin Lions produced one of the games of the year — Templeogue winning 84-83, taking the lead with just five seconds on the clock. In the U20 final, Templeogue defeated a strong Eanna side that had only lost one game all season, winning 83-72.

Oblate BC won the U18 Boys Cup with a 57-47 victory over Templeogue, with a dominant third quarter proving decisive. Oblate had only lost once all season going into the final.

Oblate also won the Intermediate Cup, defeating KUBS 53-39.',
   'Cup Finals', '2026-03-11 15:51:00+00'),

  ('Dublin Lions impress in DLBB Cup Finals',
   'dlbb-cup-finals-march-2026',
   'Dublin Lions had a strong showing in the DLBB Cup Finals weekend. The club had four teams competing in finals — U13, U14, U15 and U16.

The U13s won the cup back-to-back, defeating Meteors BC 45-36 in the final. The U15s claimed their title with a dramatic 37-34 overtime victory over Malahide. The U16s retained their crown with a razor-close 34-33 win over Killester. Only the U14s were unable to get over the line, losing 28-31 to Meteors BC.',
   'Cup Finals', '2026-03-05 10:53:00+00'),

  ('DMBB Cup Finals Preview — Finals Weekend 6-8 March',
   'dmbb-cup-finals-preview-march-2026',
   'The DMBB Cup Finals are set for the weekend of 6th–8th March 2026. All games to be held at Oblate Hall, Inchicore.

Finals confirmed: U12 Boys — Eanna vs Dublin Raiders. U13 Boys — Eanna vs Tolka Rovers Eclipse. U15 Boys — Eanna vs Malahide. U16 Boys — Eanna vs Templeogue. U17 Boys — Templeogue vs Dublin Lions. U18 Boys — Oblate vs Templeogue. U20 Boys — Templeogue vs Eanna. Intermediate Cup — Oblate vs KUBS.',
   'Cup Finals', '2026-03-04 09:00:00+00'),

  ('Tolka Rovers U14 Boys are League Champions 2025/26',
   'tolka-u14-league-champions-2526',
   'Congratulations to Tolka Rovers U14(1) Boys who have been crowned DMBB League Champions for the 2025/26 season. The team had an outstanding campaign throughout the year. The club also has their U16 Boys through to the DMBB Top 4 Final, having beaten UCD Marian by 1 point.',
   'Youth', '2026-04-20 10:00:00+00'),

  ('UCD Marian U17s qualify for DMBB Shield Final',
   'ucd-marian-u17-shield-final-2026',
   'Congratulations to UCD Marian U17 Boys who have qualified for the final of the DMBB Shield, to be played on 22nd March. The team had an excellent run through the competition.',
   'Youth', '2026-03-15 09:00:00+00'),

  ('Declans lead Senior Division 1 with 4 games to play',
   'declans-lead-division1-2526',
   'Declans BC sit top of the DMBB Senior Division 1 table with 13 wins from 16 games as the season enters its final stretch. Oblate BC and Rathmines BC are just two points behind and still in contention. The title race looks set to go down to the wire.',
   'Season', '2026-04-20 10:00:00+00'),

  ('St Kevin''s Knights top Division 2 in dominant fashion',
   'knights-lead-division2-2526',
   'St Kevin''s Knights have been the standout team in DMBB Division 2 this season, winning 14 of their 16 games to sit 4 points clear at the top. They recently defeated Greystones Sharks 59-39 to extend their winning streak to 6 games.',
   'Season', '2026-04-15 10:00:00+00'),

  ('AGM — Tuesday 12th May 2026, 7:30pm',
   'agm-may-2026',
   'The Annual General Meeting of the Dublin Men''s Basketball Board will take place on Tuesday 12th May at 7:30pm. All member clubs are invited to attend. Full agenda will be circulated in advance. Contact dmbbsecretary@eircom.net for details.',
   'Announcement', '2026-02-28 09:00:00+00'),

  ('Welcome to the New DMBB Website',
   'new-dmbb-website-launch',
   'We are delighted to launch the new Dublin Men''s Basketball Board website for the 2025/26 season. The site features live standings for all Senior Divisions and Youth Leagues, upcoming fixtures, results, cup draws, and an admin panel for real-time updates throughout the season.',
   'Announcement', '2025-09-01 08:00:00+00')

on conflict do nothing;
