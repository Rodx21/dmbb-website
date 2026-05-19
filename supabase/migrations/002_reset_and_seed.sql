-- =================================================================
-- DMBB 2025/26 — RESET + SEED COMPLETO
-- Passo 1: corrige schema (fixtures.id → text)
-- Passo 2: limpa dados antigos
-- Passo 3: insere todos os dados 2025/26
-- =================================================================

-- ----------------------------------------------------------------
-- FIX SCHEMA: mudar fixtures.id de uuid para text
-- (o schema original previa text, mas Supabase criou como uuid)
-- ----------------------------------------------------------------
ALTER TABLE results DROP CONSTRAINT IF EXISTS results_fixture_id_fkey;
ALTER TABLE fixtures ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE results  ALTER COLUMN fixture_id TYPE text USING fixture_id::text;
ALTER TABLE results ADD CONSTRAINT results_fixture_id_fkey
  FOREIGN KEY (fixture_id) REFERENCES fixtures(id) ON DELETE CASCADE;

-- ----------------------------------------------------------------
-- LIMPAR em ordem inversa de FK
-- ----------------------------------------------------------------
DELETE FROM results;
DELETE FROM standings;
DELETE FROM fixtures;
DELETE FROM team_divisions;
DELETE FROM teams;
DELETE FROM divisions;
DELETE FROM seasons;
DELETE FROM news;

-- ================================================================
-- TEMPORADA
-- ================================================================
INSERT INTO seasons (id, name, is_current) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', '2025/26', true);

-- ================================================================
-- DIVISÕES
-- ================================================================
INSERT INTO divisions (id, season_id, name, display_order) VALUES
  -- Sénior
  ('bbbb0001-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Senior Division 1', 1),
  ('bbbb0002-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Senior Division 2', 2),
  ('bbbb0003-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Senior Division 3', 3),
  ('bbbb0004-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Senior Division 4', 4),
  -- Juvenil
  ('bbbb0010-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Under 12 Boys',    10),
  ('bbbb0011-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Under 13 Boys',    11),
  ('bbbb0012-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Under 14 Boys',    12),
  ('bbbb0013-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Under 15 Boys',    13),
  ('bbbb0014-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Under 16 Boys',    14),
  ('bbbb0015-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Under 17 Boys',    15),
  ('bbbb0016-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Under 18 Boys',    16),
  ('bbbb0017-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Under 20 Boys',    17),
  -- Copas
  ('bbbb0021-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Intermediate Cup', 21),
  ('bbbb0022-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','U12 Boys Cup',     22),
  ('bbbb0023-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','U13 Boys Cup',     23),
  ('bbbb0024-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','U14 Boys Cup',     24),
  ('bbbb0025-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','U15 Boys Cup',     25),
  ('bbbb0026-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','U16 Boys Cup',     26),
  ('bbbb0027-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','U17 Boys Cup',     27),
  ('bbbb0028-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','U18 Boys Cup',     28),
  ('bbbb0029-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','U20 Boys Cup',     29),
  -- Top 4 Playoffs
  ('bbbb0030-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Senior Div 2 Top 4',31),
  ('bbbb0032-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','U14 Top 4',        32),
  ('bbbb0033-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','U16 Top 4',        33);

-- ================================================================
-- EQUIPAS
-- ================================================================
INSERT INTO teams (id, name, short_name, home_venue) VALUES
  ('cccc0001-0000-0000-0000-000000000001','Declans',              'Declans',   'St Declans Cabra'),
  ('cccc0002-0000-0000-0000-000000000001','Oblate BC',            'Oblate',    'Oblate Hall Inchicore'),
  ('cccc0003-0000-0000-0000-000000000001','Rathmines BC',         'Rathmines', 'St Mary''s College Rathmines'),
  ('cccc0004-0000-0000-0000-000000000001','Eanna BC',             'Eanna',     'Colaiste Eanna'),
  ('cccc0005-0000-0000-0000-000000000001','UCD Marian BC',        'UCD Marian','Oatlands College Stillorgan'),
  ('cccc0006-0000-0000-0000-000000000001','Dublin Lions',         'Lions',     'Colaiste Bride'),
  ('cccc0007-0000-0000-0000-000000000001','Bray Bullets',         'Bullets',   'Presentation College Bray'),
  ('cccc0008-0000-0000-0000-000000000001','Dublin Raiders',       'Raiders',   'National Basketball Arena D24'),
  ('cccc0009-0000-0000-0000-000000000001','NEIC Trojans',         'Trojans',   'Beneavin College D11 NH7E'),
  ('cccc0010-0000-0000-0000-000000000001','St. Vincents BC',      'Vincents',  'St Vincents Glasnevin'),
  ('cccc0011-0000-0000-0000-000000000001','Malahide Mens BC',     'Malahide',  'St Oliver Plunketts School Malahide'),
  ('cccc0012-0000-0000-0000-000000000001','Ongar Chasers BC',     'Ongar',     'Hanesfield ETSS School'),
  ('cccc0013-0000-0000-0000-000000000001','Greystones Sharks',    'Sharks',    'St David''s Holy Faith Greystones'),
  ('cccc0014-0000-0000-0000-000000000001','Glasnevin BC',         'Glasnevin', 'Beneavin College D11 NH7E'),
  ('cccc0015-0000-0000-0000-000000000001','St Kevin''s Knights',  'Knights',   'Colaiste De Hide Tallaght'),
  ('cccc0016-0000-0000-0000-000000000001','Killester BC',         'Killester', 'St Davids Artane'),
  ('cccc0017-0000-0000-0000-000000000001','KUBS BC',              'KUBS',      'Greendale Kilbarrack'),
  ('cccc0018-0000-0000-0000-000000000001','Lusk Ravens BC',       'Lusk',      'Mount Temple School Malahide Road'),
  ('cccc0019-0000-0000-0000-000000000001','Tridents BC',          'Tridents',  'Trinity Sports & Leisure Club D13'),
  ('cccc0020-0000-0000-0000-000000000001','Naas BC',              'Naas',      'Pipers Hill College Naas'),
  ('cccc0021-0000-0000-0000-000000000001','Liffey Celtics',       'Celtics',   'Colaiste De Hide Tallaght'),
  ('cccc0022-0000-0000-0000-000000000001','Templeogue BC',        'Templeogue','Presentation College Terenure'),
  ('cccc0023-0000-0000-0000-000000000001','Swords BC',            'Swords',    'National Basketball Arena D24'),
  ('cccc0024-0000-0000-0000-000000000001','Tolka Rovers Eclipse', 'Tolka',     'Beneavin College D11 NH7E'),
  ('cccc0025-0000-0000-0000-000000000001','Meteors BC',           'Meteors',   'Firhouse Comm College'),
  ('cccc0026-0000-0000-0000-000000000001','Barrow Rovers BC',     'Barrow',    'Barrow Rovers Hall'),
  ('cccc0027-0000-0000-0000-000000000001','Templeogue BC Div 4',  'Temp D4',   'Presentation College Terenure');

-- ================================================================
-- INSCRIÇÕES POR DIVISÃO
-- ================================================================
INSERT INTO team_divisions (team_id, division_id) VALUES
  -- Senior Div 1
  ('cccc0001-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001'),
  ('cccc0002-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001'),
  ('cccc0003-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001'),
  ('cccc0004-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001'),
  ('cccc0005-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001'),
  ('cccc0006-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001'),
  ('cccc0007-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001'),
  ('cccc0008-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001'),
  ('cccc0009-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001'),
  ('cccc0010-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001'),
  -- Senior Div 2
  ('cccc0011-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001'),
  ('cccc0012-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001'),
  ('cccc0013-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001'),
  ('cccc0014-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001'),
  ('cccc0015-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001'),
  ('cccc0016-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001'),
  ('cccc0017-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001'),
  ('cccc0018-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001'),
  ('cccc0019-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001'),
  ('cccc0024-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001'),
  -- Senior Div 3
  ('cccc0021-0000-0000-0000-000000000001','bbbb0003-0000-0000-0000-000000000001'),
  ('cccc0022-0000-0000-0000-000000000001','bbbb0003-0000-0000-0000-000000000001'),
  ('cccc0008-0000-0000-0000-000000000001','bbbb0003-0000-0000-0000-000000000001'),
  ('cccc0020-0000-0000-0000-000000000001','bbbb0003-0000-0000-0000-000000000001'),
  -- Senior Div 4
  ('cccc0027-0000-0000-0000-000000000001','bbbb0004-0000-0000-0000-000000000001'),
  ('cccc0023-0000-0000-0000-000000000001','bbbb0004-0000-0000-0000-000000000001');

-- ================================================================
-- CLASSIFICAÇÕES SÉNIOR
-- ================================================================

-- Divisão 1
INSERT INTO standings (team_id, division_id, played, won, lost, points_for, points_against, points) VALUES
  ('cccc0001-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001',18,15, 3,1102, 862,33),
  ('cccc0002-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001',17,13, 4, 997, 793,30),
  ('cccc0003-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001',18,12, 6,1050, 870,30),
  ('cccc0004-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001',18,11, 7,1001, 902,29),
  ('cccc0007-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001',17,10, 7, 955, 851,27),
  ('cccc0006-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001',18, 9, 9, 965, 930,27),
  ('cccc0009-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001',17, 8, 9, 868, 901,25),
  ('cccc0005-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001',18, 6,12, 852, 979,24),
  ('cccc0008-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001',17, 5,12, 798, 974,22),
  ('cccc0010-0000-0000-0000-000000000001','bbbb0001-0000-0000-0000-000000000001',16, 2,14, 712,1070,18);

-- Divisão 2
INSERT INTO standings (team_id, division_id, played, won, lost, points_for, points_against, points) VALUES
  ('cccc0015-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001',18,16, 2,1120, 782,34),
  ('cccc0006-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001',17,13, 4, 970, 790,30),
  ('cccc0012-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001',18,12, 6, 980, 820,30),
  ('cccc0011-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001',18,11, 7, 960, 830,29),
  ('cccc0024-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001',17,10, 7, 940, 810,27),
  ('cccc0013-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001',16, 9, 7, 850, 750,25),
  ('cccc0014-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001',17, 8, 9, 840, 810,25),
  ('cccc0016-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001',15, 7, 8, 770, 770,22),
  ('cccc0018-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001',14, 6, 8, 700, 730,20),
  ('cccc0019-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001',15, 4,11, 580, 870,19),
  ('cccc0017-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001',15, 3,12, 610, 900,18),
  ('cccc0020-0000-0000-0000-000000000001','bbbb0002-0000-0000-0000-000000000001',13, 0,13, 510, 940,13);

-- ================================================================
-- RESULTADOS DIVISÃO 1 (confirmados)
-- ================================================================
INSERT INTO fixtures (id, division_id, home_team_id, away_team_id, scheduled_at, venue, status) VALUES
  ('d1-001','bbbb0001-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','cccc0019-0000-0000-0000-000000000001','2025-10-12 14:40:00+01','Colaiste Eanna','finished'),
  ('d1-002','bbbb0001-0000-0000-0000-000000000001','cccc0002-0000-0000-0000-000000000001','cccc0010-0000-0000-0000-000000000001','2025-10-12 17:00:00+01','Oblate Hall Inchicore','finished'),
  ('d1-003','bbbb0001-0000-0000-0000-000000000001','cccc0001-0000-0000-0000-000000000001','cccc0019-0000-0000-0000-000000000001','2025-10-12 11:15:00+01','St Declans Cabra','finished'),
  ('d1-004','bbbb0001-0000-0000-0000-000000000001','cccc0005-0000-0000-0000-000000000001','cccc0001-0000-0000-0000-000000000001','2025-10-12 14:45:00+01','Oatlands College Stillorgan','finished'),
  ('d1-005','bbbb0001-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','cccc0005-0000-0000-0000-000000000001','2025-10-19 15:10:00+01','Colaiste Eanna','finished'),
  ('d1-006','bbbb0001-0000-0000-0000-000000000001','cccc0001-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','2025-11-02 13:00:00+00','St Declans Cabra','finished'),
  ('d1-007','bbbb0001-0000-0000-0000-000000000001','cccc0002-0000-0000-0000-000000000001','cccc0020-0000-0000-0000-000000000001','2025-11-09 10:00:00+00','Oblate Hall Inchicore','finished'),
  ('d1-008','bbbb0001-0000-0000-0000-000000000001','cccc0003-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','2025-11-23 19:10:00+00','St Mary''s College Rathmines','finished'),
  ('d1-009','bbbb0001-0000-0000-0000-000000000001','cccc0002-0000-0000-0000-000000000001','cccc0005-0000-0000-0000-000000000001','2025-11-30 14:40:00+00','Oblate Hall Inchicore','finished'),
  ('d1-010','bbbb0001-0000-0000-0000-000000000001','cccc0005-0000-0000-0000-000000000001','cccc0008-0000-0000-0000-000000000001','2025-12-07 13:15:00+00','Oatlands College Stillorgan','finished'),
  ('d1-011','bbbb0001-0000-0000-0000-000000000001','cccc0008-0000-0000-0000-000000000001','cccc0010-0000-0000-0000-000000000001','2025-12-07 19:00:00+00','National Basketball Arena D24','finished'),
  ('d1-012','bbbb0001-0000-0000-0000-000000000001','cccc0001-0000-0000-0000-000000000001','cccc0006-0000-0000-0000-000000000001','2025-12-14 14:00:00+00','St Declans Cabra','finished'),
  ('d1-013','bbbb0001-0000-0000-0000-000000000001','cccc0010-0000-0000-0000-000000000001','cccc0007-0000-0000-0000-000000000001','2026-01-18 19:00:00+00','St Vincents Glasnevin','finished'),
  ('d1-014','bbbb0001-0000-0000-0000-000000000001','cccc0003-0000-0000-0000-000000000001','cccc0008-0000-0000-0000-000000000001','2026-01-18 20:40:00+00','St Mary''s College Rathmines','finished'),
  ('d1-015','bbbb0001-0000-0000-0000-000000000001','cccc0002-0000-0000-0000-000000000001','cccc0006-0000-0000-0000-000000000001','2026-01-18 19:00:00+01','Oblate Hall Inchicore','finished'),
  ('d1-016','bbbb0001-0000-0000-0000-000000000001','cccc0005-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','2026-01-18 09:15:00+00','Oatlands College Stillorgan','finished'),
  ('d1-017','bbbb0001-0000-0000-0000-000000000001','cccc0009-0000-0000-0000-000000000001','cccc0006-0000-0000-0000-000000000001','2026-01-22 14:00:00+00','Beneavin College D11 NH7E','finished'),
  ('d1-018','bbbb0001-0000-0000-0000-000000000001','cccc0001-0000-0000-0000-000000000001','cccc0008-0000-0000-0000-000000000001','2026-01-22 14:30:00+00','St Declans Cabra','finished'),
  ('d1-019','bbbb0001-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','cccc0005-0000-0000-0000-000000000001','2026-01-18 14:45:00+00','Colaiste Eanna','finished'),
  ('d1-020','bbbb0001-0000-0000-0000-000000000001','cccc0002-0000-0000-0000-000000000001','cccc0005-0000-0000-0000-000000000001','2026-02-08 19:00:00+00','Oblate Hall Inchicore','finished'),
  ('d1-021','bbbb0001-0000-0000-0000-000000000001','cccc0003-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','2026-02-08 19:10:00+00','St Mary''s College Rathmines','finished'),
  ('d1-022','bbbb0001-0000-0000-0000-000000000001','cccc0002-0000-0000-0000-000000000001','cccc0009-0000-0000-0000-000000000001','2026-02-08 20:00:00+00','Oblate Hall Inchicore','finished'),
  ('d1-023','bbbb0001-0000-0000-0000-000000000001','cccc0007-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','2026-02-15 19:00:00+00','Presentation College Bray','finished'),
  ('d1-024','bbbb0001-0000-0000-0000-000000000001','cccc0001-0000-0000-0000-000000000001','cccc0005-0000-0000-0000-000000000001','2026-02-22 14:00:00+00','St Declans Cabra','finished'),
  ('d1-025','bbbb0001-0000-0000-0000-000000000001','cccc0006-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','2026-02-22 19:00:00+00','Colaiste Bride','finished'),
  ('d1-026','bbbb0001-0000-0000-0000-000000000001','cccc0006-0000-0000-0000-000000000001','cccc0005-0000-0000-0000-000000000001','2026-02-01 21:00:00+00','Colaiste Bride','finished');

INSERT INTO results (fixture_id, home_score, away_score, notes) VALUES
  ('d1-001', 41, 21, NULL),
  ('d1-002', 52, 72, NULL),
  ('d1-003', 56, 44, NULL),
  ('d1-004', 66, 46, NULL),
  ('d1-005', 53, 33, NULL),
  ('d1-006', 84, 49, NULL),
  ('d1-007', 52, 33, NULL),
  ('d1-008', 57, 44, NULL),
  ('d1-009', 53, 33, NULL),
  ('d1-010', 42, 40, NULL),
  ('d1-011', 65, 51, NULL),
  ('d1-012', 58, 49, NULL),
  ('d1-013', 51, 65, NULL),
  ('d1-014', 57, 28, NULL),
  ('d1-015', 65, 47, NULL),
  ('d1-016', 40, 47, NULL),
  ('d1-017', 60, 59, 'NEIC Trojans 60-59 Dublin Lions (1 ponto de diferença)'),
  ('d1-018', 60, 38, NULL),
  ('d1-019', 47, 40, NULL),
  ('d1-020', 53, 33, NULL),
  ('d1-021', 57, 44, NULL),
  ('d1-022', 65, 47, NULL),
  ('d1-023', 78, 41, NULL),
  ('d1-024', 67, 49, NULL),
  ('d1-025', 45, 53, NULL),
  ('d1-026', 70, 61, NULL);

-- ================================================================
-- TOP 4 PLAYOFFS
-- ================================================================
INSERT INTO fixtures (id, division_id, home_team_id, away_team_id, scheduled_at, venue, status) VALUES
  ('tp4-d2-final','bbbb0030-0000-0000-0000-000000000001','cccc0006-0000-0000-0000-000000000001','cccc0024-0000-0000-0000-000000000001','2026-04-28 20:00:00+01','National Basketball Arena D24','finished'),
  ('tp4-u16-sf1', 'bbbb0033-0000-0000-0000-000000000001','cccc0024-0000-0000-0000-000000000001','cccc0005-0000-0000-0000-000000000001','2026-04-14 19:00:00+01','National Basketball Arena D24','finished'),
  ('tp4-u16-final','bbbb0033-0000-0000-0000-000000000001','cccc0024-0000-0000-0000-000000000001','cccc0011-0000-0000-0000-000000000001','2026-04-17 19:00:00+01','National Basketball Arena D24','finished'),
  ('tp4-u14-final','bbbb0032-0000-0000-0000-000000000001','cccc0024-0000-0000-0000-000000000001','cccc0002-0000-0000-0000-000000000001','2026-04-15 20:00:00+01','National Basketball Arena D24','finished');

INSERT INTO results (fixture_id, home_score, away_score, notes) VALUES
  ('tp4-d2-final', 0,  0,  'CAMPEÃO Top 4 Div 2: Dublin Lions venceu Tolka Rovers Eclipse. Score exacto não publicado.'),
  ('tp4-u16-sf1',  0,  0,  'Tolka Rovers venceu UCD Marian por 1 ponto na semifinal U16 Top 4.'),
  ('tp4-u16-final',55, 51, 'CAMPEÃO U16 Top 4: Tolka Rovers Eclipse 55-51 Malahide Mens BC'),
  ('tp4-u14-final',65, 56, 'CAMPEÃO U14 Liga: Tolka Rovers Eclipse 65-56 Oblate BC. Q3 defensivo criou transições decisivas. Treinador: Tom Kenny.');

-- ================================================================
-- COPA — SEMIFINAIS
-- ================================================================
INSERT INTO fixtures (id, division_id, home_team_id, away_team_id, scheduled_at, venue, status) VALUES
  ('cup-int-sf1', 'bbbb0021-0000-0000-0000-000000000001','cccc0002-0000-0000-0000-000000000001','cccc0014-0000-0000-0000-000000000001','2026-02-08 19:00:00+00','Oblate Hall Inchicore','finished'),
  ('cup-int-sf2', 'bbbb0021-0000-0000-0000-000000000001','cccc0022-0000-0000-0000-000000000001','cccc0026-0000-0000-0000-000000000001','2026-02-07 19:00:00+00','Presentation College Terenure','finished'),
  ('cup-u12-sf1', 'bbbb0022-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','cccc0024-0000-0000-0000-000000000001','2026-02-22 10:00:00+00','St Kevin''s College','finished'),
  ('cup-u12-sf2', 'bbbb0022-0000-0000-0000-000000000001','cccc0011-0000-0000-0000-000000000001','cccc0021-0000-0000-0000-000000000001','2026-02-22 11:30:00+00','St Kevin''s College','finished'),
  ('cup-u13-sf1', 'bbbb0023-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','cccc0006-0000-0000-0000-000000000001','2026-03-01 14:00:00+00','Colaiste Eanna','finished'),
  ('cup-u15-sf1', 'bbbb0025-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','cccc0002-0000-0000-0000-000000000001','2026-02-28 14:00:00+00','Colaiste Eanna','finished'),
  ('cup-u16-sf1', 'bbbb0026-0000-0000-0000-000000000001','cccc0002-0000-0000-0000-000000000001','cccc0022-0000-0000-0000-000000000001','2026-02-25 19:00:00+00','Oblate Hall Inchicore','finished'),
  ('cup-u16-sf2', 'bbbb0026-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','cccc0006-0000-0000-0000-000000000001','2026-02-22 15:00:00+00','Colaiste Eanna','finished'),
  ('cup-u17-sf1', 'bbbb0027-0000-0000-0000-000000000001','cccc0022-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','2026-01-25 19:00:00+00','Presentation College Terenure','finished'),
  ('cup-u18-sf1', 'bbbb0028-0000-0000-0000-000000000001','cccc0002-0000-0000-0000-000000000001','cccc0006-0000-0000-0000-000000000001','2026-02-07 19:00:00+00','Oblate Hall Inchicore','finished'),
  ('cup-u18-sf2', 'bbbb0028-0000-0000-0000-000000000001','cccc0022-0000-0000-0000-000000000001','cccc0001-0000-0000-0000-000000000001','2026-02-14 19:00:00+00','Presentation College Terenure','finished');

INSERT INTO results (fixture_id, home_score, away_score, notes) VALUES
  ('cup-int-sf1', 36, 32, NULL),
  ('cup-int-sf2', 65, 40, NULL),
  ('cup-u12-sf1', 58, 30, NULL),
  ('cup-u12-sf2', 46, 42, NULL),
  ('cup-u13-sf1', 57, 53, NULL),
  ('cup-u15-sf1', 70, 58, NULL),
  ('cup-u16-sf1', 44, 52, NULL),
  ('cup-u16-sf2', 61, 38, NULL),
  ('cup-u17-sf1', 82, 70, NULL),
  ('cup-u18-sf1', 72, 53, NULL),
  ('cup-u18-sf2', 51, 41, NULL);

-- ================================================================
-- COPA — FINAIS (Oblate Hall, 6-8 Março 2026)
-- ================================================================
INSERT INTO fixtures (id, division_id, home_team_id, away_team_id, scheduled_at, venue, status) VALUES
  ('cup-u12-final','bbbb0022-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','cccc0008-0000-0000-0000-000000000001','2026-03-08 11:00:00+00','Oblate Hall Inchicore','finished'),
  ('cup-u13-final','bbbb0023-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','cccc0024-0000-0000-0000-000000000001','2026-03-08 12:30:00+00','Oblate Hall Inchicore','finished'),
  ('cup-u15-final','bbbb0025-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','cccc0011-0000-0000-0000-000000000001','2026-03-08 14:00:00+00','Oblate Hall Inchicore','finished'),
  ('cup-u16-final','bbbb0026-0000-0000-0000-000000000001','cccc0022-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','2026-03-08 16:00:00+00','Oblate Hall Inchicore','finished'),
  ('cup-u17-final','bbbb0027-0000-0000-0000-000000000001','cccc0022-0000-0000-0000-000000000001','cccc0006-0000-0000-0000-000000000001','2026-03-08 17:30:00+00','Oblate Hall Inchicore','finished'),
  ('cup-u18-final','bbbb0028-0000-0000-0000-000000000001','cccc0002-0000-0000-0000-000000000001','cccc0022-0000-0000-0000-000000000001','2026-03-08 19:00:00+00','Oblate Hall Inchicore','finished'),
  ('cup-u20-final','bbbb0029-0000-0000-0000-000000000001','cccc0022-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','2026-03-08 20:30:00+00','Oblate Hall Inchicore','finished'),
  ('cup-int-final','bbbb0021-0000-0000-0000-000000000001','cccc0002-0000-0000-0000-000000000001','cccc0017-0000-0000-0000-000000000001','2026-03-08 15:00:00+00','Oblate Hall Inchicore','finished');

INSERT INTO results (fixture_id, home_score, away_score, notes) VALUES
  ('cup-u12-final', 50, 30, 'CAMPEÃO U12 Boys Cup: Eanna BC 50-30 Dublin Raiders'),
  ('cup-u13-final', 49, 29, 'CAMPEÃO U13 Boys Cup: Eanna BC 49-29 Tolka Rovers Eclipse'),
  ('cup-u15-final', 74, 49, 'CAMPEÃO U15 Boys Cup: Eanna BC 74-49 Malahide Mens BC'),
  ('cup-u16-final', 61, 57, 'CAMPEÃO U16 Boys Cup: Templeogue BC 61-57 Eanna BC. Treinadores: Daire Murray & Aoife McKevitt'),
  ('cup-u17-final', 84, 83, 'CAMPEÃO U17 Boys Cup: Templeogue BC 84-83 Dublin Lions. THRILLER — liderança tomada a 5 segundos do fim. Treinadores: Sheena Moran & Adam Tighe'),
  ('cup-u18-final', 57, 47, 'CAMPEÃO U18 Boys Cup: Oblate BC 57-47 Templeogue BC. Q3 decisivo — vantagem de 17 pontos. Oblate só perdeu 1 jogo em toda a época'),
  ('cup-u20-final', 83, 72, 'CAMPEÃO U20 Boys Cup: Templeogue BC 83-72 Eanna BC. Treinador: Jay Fazande'),
  ('cup-int-final', 53, 39, 'CAMPEÃO Intermediate Cup: Oblate BC 53-39 KUBS BC. Liderança desde o Q1');

-- ================================================================
-- PRÓXIMOS JOGOS
-- ================================================================
INSERT INTO fixtures (id, division_id, home_team_id, away_team_id, scheduled_at, venue, status) VALUES
  ('fut-d1-01','bbbb0001-0000-0000-0000-000000000001','cccc0006-0000-0000-0000-000000000001','cccc0005-0000-0000-0000-000000000001','2026-05-10 11:10:00+01','Collinstown CC Clondalkin D22','scheduled'),
  ('fut-d1-02','bbbb0001-0000-0000-0000-000000000001','cccc0010-0000-0000-0000-000000000001','cccc0007-0000-0000-0000-000000000001','2026-05-10 19:50:00+01','St Vincents Glasnevin','scheduled'),
  ('fut-d1-03','bbbb0001-0000-0000-0000-000000000001','cccc0009-0000-0000-0000-000000000001','cccc0003-0000-0000-0000-000000000001','2026-05-10 15:00:00+01','Beneavin College D11 NH7E','scheduled'),
  ('fut-d1-04','bbbb0001-0000-0000-0000-000000000001','cccc0001-0000-0000-0000-000000000001','cccc0002-0000-0000-0000-000000000001','2026-05-17 14:00:00+01','St Declans Cabra','scheduled'),
  ('fut-d1-05','bbbb0001-0000-0000-0000-000000000001','cccc0004-0000-0000-0000-000000000001','cccc0008-0000-0000-0000-000000000001','2026-05-17 19:00:00+01','Colaiste Eanna','scheduled'),
  ('fut-d2-01','bbbb0002-0000-0000-0000-000000000001','cccc0011-0000-0000-0000-000000000001','cccc0012-0000-0000-0000-000000000001','2026-05-10 13:55:00+01','St Oliver Plunketts School Malahide','scheduled'),
  ('fut-d2-02','bbbb0002-0000-0000-0000-000000000001','cccc0015-0000-0000-0000-000000000001','cccc0013-0000-0000-0000-000000000001','2026-05-10 18:00:00+01','Colaiste De Hide Tallaght','scheduled'),
  ('fut-d2-03','bbbb0002-0000-0000-0000-000000000001','cccc0014-0000-0000-0000-000000000001','cccc0016-0000-0000-0000-000000000001','2026-05-10 16:00:00+01','Beneavin College D11 NH7E','scheduled');

-- ================================================================
-- NOTÍCIAS
-- ================================================================
INSERT INTO news (title, slug, body, tag, published_at) VALUES

  ('Tolka Rovers U16 são Campeões do Top 4 DMBB 2025/26',
   'tolka-u16-top4-champs-2526',
   E'Noite histórica na National Basketball Arena! Os Sub-16 do Tolka Rovers Eclipse sagraram-se campeões do Top 4 DMBB 2025/26 com uma vitória de 55-51 sobre o Malahide na final.\n\nUma exibição de equipa incrível — determinação e coração do início ao fim. Os rapazes bateram o UCD Marian por 1 ponto na semifinal antes de superar o Malahide na decisão.\n\nParabéns a todos os jogadores, equipa técnica, manager e adeptos!',
   'Top 4', '2026-04-17 22:00:00+01'),

  ('Tolka Rovers U14 são Campeões da Liga DMBB 2025/26',
   'tolka-u14-league-champs-2526',
   E'ENORMES PARABÉNS aos Sub-14 do Tolka Rovers — Campeões da Liga DMBB 2025/26!\n\nVitória de 65-56 sobre o Oblate BC numa final brilhante na Arena na terça-feira. Começaram com um forte 1º quarto que lhes deu confiança. Fizeram grande defesa no 3º quarto gerando muitos pontos de contra-ataque. Entraram no último quarto com 9 pontos de vantagem e venceram por 9.\n\nParabéns ao treinador Tom Kenny e a toda a equipa.',
   'League', '2026-04-15 22:00:00+01'),

  ('Dublin Lions vencem o Top 4 Final da Divisão 2',
   'dublin-lions-div2-top4-2526',
   E'O Dublin Lions venceu o Top 4 Final da Divisão 2 DMBB 2025/26 contra o Tolka Rovers Eclipse na National Basketball Arena.\n\nOs Lions tiveram um controlo firme do jogo desde o início e foram avançando para ganhar, apesar do esforço valente do Tolka Rovers.',
   'Top 4', '2026-04-28 23:00:00+01'),

  ('Eanna e Templeogue dominam as Finais de Copa DMBB',
   'cup-finals-results-march-2026',
   E'As Finais de Copa DMBB foram disputadas no fim de semana de 6 a 8 de Março de 2026 no Oblate Hall em Inchicore.\n\nO Eanna BC conquistou três títulos: U12 (50-30 sobre Dublin Raiders), U13 (49-29 sobre Tolka Rovers Eclipse) e U15 (74-49 sobre Malahide).\n\nO Templeogue BC também teve um fim de semana brilhante. A final U16 foi decidida por 4 pontos (61-57 sobre Eanna). A final U17 contra o Dublin Lions foi um dos jogos do ano — Templeogue venceu 84-83, tomando a liderança com 5 segundos no relógio. Na final U20 venceram 83-72 sobre um Eanna que só havia perdido um jogo em toda a época.\n\nO Oblate BC venceu a final U18 57-47 sobre o Templeogue (Q3 decisivo, vantagem de 17 pontos) e o Intermediate Cup 53-39 sobre o KUBS BC.',
   'Cup Finals', '2026-03-11 16:00:00+00'),

  ('Preview: Finais de Copa DMBB — fim de semana 6-8 Março',
   'dmbb-cup-finals-preview-march-2026',
   E'As Finais de Copa DMBB estão marcadas para o fim de semana de 6-8 de Março de 2026. Todos os jogos no Oblate Hall, Inchicore.\n\nFinais confirmadas: U12 — Eanna vs Dublin Raiders. U13 — Eanna vs Tolka Rovers Eclipse. U15 — Eanna vs Malahide. U16 — Templeogue vs Eanna. U17 — Templeogue vs Dublin Lions. U18 — Oblate vs Templeogue. U20 — Templeogue vs Eanna. Intermediate Cup — Oblate vs KUBS.',
   'Cup Finals', '2026-03-04 09:00:00+00'),

  ('Declans lideram a Divisão 1 Sénior na reta final da época',
   'declans-lead-div1-senior-2526',
   'O Declans BC lidera a tabela da Divisão 1 Sénior DMBB com 15 vitórias em 18 jogos. O Oblate BC e o Rathmines BC estão a apenas 3 pontos, tornando a corrida ao título emocionante nas últimas jornadas.',
   'Season', '2026-04-20 10:00:00+00'),

  ('St Kevin''s Knights dominam Divisão 2 sem rival',
   'knights-dominate-div2-2526',
   'O St Kevin''s Knights foi a equipa mais dominante da Divisão 2 Sénior em 2025/26, com 16 vitórias em 18 jogos. Recentemente derrotaram o Greystones Sharks por 59-39.',
   'Season', '2026-04-15 10:00:00+00'),

  ('AGM — Terça-feira 12 de Maio 2026, 19:30',
   'agm-may-2026',
   E'A Assembleia Geral Anual do Dublin Men''s Basketball Board terá lugar na terça-feira, 12 de Maio, às 19:30. Todos os clubes membros estão convidados a participar. Contacte dmbbsecretary@eircom.net para mais informações.',
   'Announcement', '2026-02-28 09:00:00+00'),

  ('Bem-vindos ao novo site do DMBB',
   'new-dmbb-website-launch',
   'Temos o prazer de lançar o novo site do Dublin Men''s Basketball Board para a época 2025/26. O site inclui classificações em tempo real para todas as divisões, calendário de jogos, resultados, sorteios de copa e um painel de administração.',
   'Announcement', '2025-09-01 08:00:00+00');
