-- =============================================================================
-- Lepo — development seed data.
--
-- Six fictional Ljubljana salons (Center, Šiška, Bežigrad, Vič) with staff,
-- services, weekly hours and reviews. Idempotent: re-running this file deletes
-- previously seeded rows (identified by email suffix @seed.lepo.local and a
-- known slug list) before re-inserting.
--
-- Apply locally:    supabase db reset
-- Apply remotely:   pipe through the Supabase MCP execute_sql tool.
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Idempotency: tear down previous seed without touching real data.
-- ---------------------------------------------------------------------------
delete from public.businesses where slug in (
  'atelier-mojca',
  'brivnica-tabor',
  'studio-hana',
  'salon-lila',
  'refleks-bezigrad',
  'vic-beauty-lounge'
);
delete from auth.users where email like '%@seed.lepo.local';

-- ---------------------------------------------------------------------------
-- Fake auth users for seeded staff. Inert: no password, no identities, cannot
-- sign in. They exist only to satisfy business_members.user_id NOT NULL.
-- The on_auth_user_created trigger fans out public.profiles rows automatically.
-- ---------------------------------------------------------------------------
insert into auth.users (
  id, instance_id, aud, role, email, email_confirmed_at,
  raw_user_meta_data, raw_app_meta_data, created_at, updated_at
) values
  -- Atelier Mojca (Center)
  ('a0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mojca@seed.lepo.local', now(), '{"full_name":"Mojca Kralj"}', '{"provider":"seed"}', now(), now()),
  ('a0000001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ana.atelier@seed.lepo.local', now(), '{"full_name":"Ana Novak"}', '{"provider":"seed"}', now(), now()),
  ('a0000001-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tina.atelier@seed.lepo.local', now(), '{"full_name":"Tina Hribar"}', '{"provider":"seed"}', now(), now()),

  -- Brivnica Tabor (Center)
  ('a0000002-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'klemen@seed.lepo.local', now(), '{"full_name":"Klemen Bizjak"}', '{"provider":"seed"}', now(), now()),
  ('a0000002-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'jure.tabor@seed.lepo.local', now(), '{"full_name":"Jure Mlakar"}', '{"provider":"seed"}', now(), now()),

  -- Studio Hana (Šiška)
  ('a0000003-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hana@seed.lepo.local', now(), '{"full_name":"Hana Zupan"}', '{"provider":"seed"}', now(), now()),
  ('a0000003-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'eva.studio@seed.lepo.local', now(), '{"full_name":"Eva Petrič"}', '{"provider":"seed"}', now(), now()),
  ('a0000003-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sara.studio@seed.lepo.local', now(), '{"full_name":"Sara Vidmar"}', '{"provider":"seed"}', now(), now()),

  -- Salon Lila (Šiška)
  ('a0000004-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lila@seed.lepo.local', now(), '{"full_name":"Lila Kos"}', '{"provider":"seed"}', now(), now()),
  ('a0000004-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'maja.lila@seed.lepo.local', now(), '{"full_name":"Maja Černe"}', '{"provider":"seed"}', now(), now()),
  ('a0000004-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'luka.lila@seed.lepo.local', now(), '{"full_name":"Luka Horvat"}', '{"provider":"seed"}', now(), now()),
  ('a0000004-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tara.lila@seed.lepo.local', now(), '{"full_name":"Tara Krajnc"}', '{"provider":"seed"}', now(), now()),

  -- Refleks Bežigrad
  ('a0000005-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'marko.refleks@seed.lepo.local', now(), '{"full_name":"Marko Štih"}', '{"provider":"seed"}', now(), now()),
  ('a0000005-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'andrej.refleks@seed.lepo.local', now(), '{"full_name":"Andrej Pirc"}', '{"provider":"seed"}', now(), now()),
  ('a0000005-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'petra.refleks@seed.lepo.local', now(), '{"full_name":"Petra Golob"}', '{"provider":"seed"}', now(), now()),

  -- Vič Beauty Lounge
  ('a0000006-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tomaz.vic@seed.lepo.local', now(), '{"full_name":"Tomaž Lah"}', '{"provider":"seed"}', now(), now()),
  ('a0000006-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nika.vic@seed.lepo.local', now(), '{"full_name":"Nika Bernik"}', '{"provider":"seed"}', now(), now());

-- Make seeded profiles flagged as partners so role-based logic later treats
-- them correctly. We also drop the avatar URL onto profiles for completeness.
update public.profiles set role = 'partner', avatar_url = 'https://i.pravatar.cc/200?u=' || id where id in (
  select id from auth.users where email like '%@seed.lepo.local'
);

-- ---------------------------------------------------------------------------
-- Businesses (6 salons across Ljubljana)
-- ---------------------------------------------------------------------------
insert into public.businesses (
  id, slug, name, description, tier, city, neighborhood, address, geo,
  phone_e164, email, cover_url, vat_id, published_at
) values
  ('11111111-1111-1111-1111-111111111111',
   'atelier-mojca',
   'Atelier Mojca',
   'Vrhunski salon za striženje in barvanje las v samem centru Ljubljane. Mojca in njena ekipa s petnajstletnimi izkušnjami pri ustvarjanju barvnih prelivov in editorialnih frizur.',
   'premium', 'Ljubljana', 'Center', 'Trubarjeva cesta 24, 1000 Ljubljana',
   extensions.ST_SetSRID(extensions.ST_MakePoint(14.5077, 46.0524), 4326)::extensions.geography,
   '+38614253210', 'pozdrav@ateliermojca.si',
   'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80',
   'SI12345678', now() - interval '90 days'),

  ('22222222-2222-2222-2222-222222222222',
   'brivnica-tabor',
   'Brivnica Tabor',
   'Klasična brivnica z italijanskim pridihom. Britje s pravo britvico, brkat, masaža kože glave in cvet ječmena za vsako stranko.',
   'standard', 'Ljubljana', 'Center', 'Tabor 5, 1000 Ljubljana',
   extensions.ST_SetSRID(extensions.ST_MakePoint(14.5066, 46.0517), 4326)::extensions.geography,
   '+38612345678', 'info@brivnicatabor.si',
   'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1600&q=80',
   'SI23456789', now() - interval '120 days'),

  ('33333333-3333-3333-3333-333333333333',
   'studio-hana',
   'Studio Hana',
   'Lasje, ličenje, nohti. Studio Hana je vsestranski prostor za pripravo na vsak pomemben dogodek — od poročnih frizur do popoldanskega manikira.',
   'standard', 'Ljubljana', 'Šiška', 'Celovška cesta 156, 1000 Ljubljana',
   extensions.ST_SetSRID(extensions.ST_MakePoint(14.4900, 46.0746), 4326)::extensions.geography,
   '+38615095400', 'hello@studiohana.si',
   'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1600&q=80',
   'SI34567890', now() - interval '60 days'),

  ('44444444-4444-4444-4444-444444444444',
   'salon-lila',
   'Salon Lila',
   'Družinski salon za vse generacije. Striženje za otroke, klasične moške frizure, ženski barvni preliv in nega las z izdelki, narejenimi v Sloveniji.',
   'standard', 'Ljubljana', 'Šiška', 'Drenikova ulica 8, 1000 Ljubljana',
   extensions.ST_SetSRID(extensions.ST_MakePoint(14.4961, 46.0668), 4326)::extensions.geography,
   '+38615007821', 'salon@lila.si',
   'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=1600&q=80',
   'SI45678901', now() - interval '45 days'),

  ('55555555-5555-5555-5555-555555555555',
   'refleks-bezigrad',
   'Refleks Bežigrad',
   'Specialisti za barvne tehnike — balayage, ombré, lasna globinska nega in svetovanje za vsako strukturo las. Tih, svetel prostor blizu BTC-ja.',
   'premium', 'Ljubljana', 'Bežigrad', 'Dunajska cesta 100, 1000 Ljubljana',
   extensions.ST_SetSRID(extensions.ST_MakePoint(14.5081, 46.0742), 4326)::extensions.geography,
   '+38615304520', 'pozdrav@refleks.si',
   'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1600&q=80',
   'SI56789012', now() - interval '180 days'),

  ('66666666-6666-6666-6666-666666666666',
   'vic-beauty-lounge',
   'Vič Beauty Lounge',
   'Mehka in topla atmosfera za masažo, ličenje in pedikuro. Trenutek umirjenosti dvajset minut izven mestnega vrveža.',
   'standard', 'Ljubljana', 'Vič', 'Tržaška cesta 45, 1000 Ljubljana',
   extensions.ST_SetSRID(extensions.ST_MakePoint(14.4862, 46.0432), 4326)::extensions.geography,
   '+38612567890', 'lounge@vicbeauty.si',
   'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1600&q=80',
   'SI67890123', now() - interval '30 days');

-- ---------------------------------------------------------------------------
-- Business members (staff). user_id values match the auth.users rows above.
-- ---------------------------------------------------------------------------
insert into public.business_members (business_id, user_id, role, display_name, avatar_url, bio, sort_order) values
  -- Atelier Mojca
  ('11111111-1111-1111-1111-111111111111', 'a0000001-0000-0000-0000-000000000001', 'owner', 'Mojca Kralj',  'https://i.pravatar.cc/200?u=mojca',  'Lastnica in glavna stilistka. Specializirana za barvne prelive in editorialne frizure.', 0),
  ('11111111-1111-1111-1111-111111111111', 'a0000001-0000-0000-0000-000000000002', 'staff', 'Ana Novak',    'https://i.pravatar.cc/200?u=ana',    'Striženje, brushing, lasna nega.', 1),
  ('11111111-1111-1111-1111-111111111111', 'a0000001-0000-0000-0000-000000000003', 'staff', 'Tina Hribar',  'https://i.pravatar.cc/200?u=tina',   'Barvne tehnike in zaključno oblikovanje.', 2),
  -- Brivnica Tabor
  ('22222222-2222-2222-2222-222222222222', 'a0000002-0000-0000-0000-000000000001', 'owner', 'Klemen Bizjak','https://i.pravatar.cc/200?u=klemen', 'Brivec z dvanajstletno tradicijo. Britje, brki, klasične moške frizure.', 0),
  ('22222222-2222-2222-2222-222222222222', 'a0000002-0000-0000-0000-000000000002', 'staff', 'Jure Mlakar', 'https://i.pravatar.cc/200?u=jure',   'Fade, taper, sodobne moške frizure.', 1),
  -- Studio Hana
  ('33333333-3333-3333-3333-333333333333', 'a0000003-0000-0000-0000-000000000001', 'owner', 'Hana Zupan',   'https://i.pravatar.cc/200?u=hana',   'Lastnica, ličiteljica in stilistka las.', 0),
  ('33333333-3333-3333-3333-333333333333', 'a0000003-0000-0000-0000-000000000002', 'staff', 'Eva Petrič',  'https://i.pravatar.cc/200?u=eva',    'Manikira, gel lak, nail art.', 1),
  ('33333333-3333-3333-3333-333333333333', 'a0000003-0000-0000-0000-000000000003', 'staff', 'Sara Vidmar',  'https://i.pravatar.cc/200?u=sara',   'Pedikura, parafinska nega, ličenje.', 2),
  -- Salon Lila
  ('44444444-4444-4444-4444-444444444444', 'a0000004-0000-0000-0000-000000000001', 'owner', 'Lila Kos',     'https://i.pravatar.cc/200?u=lila',   'Družinski salon za vse generacije.', 0),
  ('44444444-4444-4444-4444-444444444444', 'a0000004-0000-0000-0000-000000000002', 'staff', 'Maja Černe',  'https://i.pravatar.cc/200?u=maja',   'Otroška in ženska striženja.', 1),
  ('44444444-4444-4444-4444-444444444444', 'a0000004-0000-0000-0000-000000000003', 'staff', 'Luka Horvat',  'https://i.pravatar.cc/200?u=luka',   'Moška striženja in fade.', 2),
  ('44444444-4444-4444-4444-444444444444', 'a0000004-0000-0000-0000-000000000004', 'staff', 'Tara Krajnc',  'https://i.pravatar.cc/200?u=tara',   'Barvanje in lasna nega.', 3),
  -- Refleks Bežigrad
  ('55555555-5555-5555-5555-555555555555', 'a0000005-0000-0000-0000-000000000001', 'owner', 'Marko Štih',   'https://i.pravatar.cc/200?u=marko',  'Specialist za barvne tehnike.', 0),
  ('55555555-5555-5555-5555-555555555555', 'a0000005-0000-0000-0000-000000000002', 'staff', 'Andrej Pirc', 'https://i.pravatar.cc/200?u=andrej', 'Striženje in oblikovanje.', 1),
  ('55555555-5555-5555-5555-555555555555', 'a0000005-0000-0000-0000-000000000003', 'staff', 'Petra Golob',  'https://i.pravatar.cc/200?u=petra',  'Balayage in poslovne frizure.', 2),
  -- Vič Beauty Lounge
  ('66666666-6666-6666-6666-666666666666', 'a0000006-0000-0000-0000-000000000001', 'owner', 'Tomaž Lah',    'https://i.pravatar.cc/200?u=tomaz',  'Masaže in telesna nega.', 0),
  ('66666666-6666-6666-6666-666666666666', 'a0000006-0000-0000-0000-000000000002', 'staff', 'Nika Bernik',  'https://i.pravatar.cc/200?u=nika',   'Pedikura, ličenje, kozmetika obraza.', 1);

-- ---------------------------------------------------------------------------
-- Services. duration_min + buffer_after_min + price_cents (EUR).
-- vat_rate 0.095 (reduced hairdressing rate) on hair/barber/styling/nails;
-- 0.22 (standard) on massage.
-- ---------------------------------------------------------------------------
insert into public.services (business_id, name, description, duration_min, buffer_after_min, price_cents, vat_rate, category, sort_order) values
  -- Atelier Mojca
  ('11111111-1111-1111-1111-111111111111', 'Striženje + brushing',  'Posvet, šampon, striženje in fenanje.',                            60, 10, 4200,  0.095, 'hair',    0),
  ('11111111-1111-1111-1111-111111111111', 'Barvanje (eno barvo)',  'Globinsko barvanje las z barvami brez amoniaka.',                  90, 15, 9800,  0.095, 'color',   1),
  ('11111111-1111-1111-1111-111111111111', 'Balayage',              'Ročno naneseni barvni prelivi za naraven učinek osvetlitve.',     150, 20, 16500, 0.095, 'color',   2),
  ('11111111-1111-1111-1111-111111111111', 'Editorial styling',     'Oblikovanje za fotografije, snemanja in posebne dogodke.',         90, 10, 9500,  0.095, 'styling', 3),

  -- Brivnica Tabor
  ('22222222-2222-2222-2222-222222222222', 'Klasično britje',       'Vroča brisača, britje s pravo britvico, masaža kože.',            45, 15, 2800,  0.095, 'shave',  0),
  ('22222222-2222-2222-2222-222222222222', 'Striženje + fade',      'Sodobno moško striženje z mehkim prehodom.',                       40, 10, 2400,  0.095, 'barber', 1),
  ('22222222-2222-2222-2222-222222222222', 'Brki + brada',          'Oblikovanje brkov in brade z olji.',                               30, 10, 1800,  0.095, 'barber', 2),
  ('22222222-2222-2222-2222-222222222222', 'Paket gentleman',       'Striženje, britje, masaža kože glave in nega brade.',              90, 15, 5500,  0.095, 'barber', 3),

  -- Studio Hana
  ('33333333-3333-3333-3333-333333333333', 'Striženje + fenanje',   'Pranje, striženje in oblikovanje.',                                50, 10, 3500,  0.095, 'hair',    0),
  ('33333333-3333-3333-3333-333333333333', 'Manikira + gel lak',    'Klasična manikira z dolgoobstojnim gel lakom.',                    60, 10, 3200,  0.095, 'nails',   1),
  ('33333333-3333-3333-3333-333333333333', 'Pedikura',              'Kopel, nega stopal in gel lak.',                                   75, 15, 4000,  0.095, 'nails',   2),
  ('33333333-3333-3333-3333-333333333333', 'Ličenje za dogodek',    'Profesionalno ličenje za poroko, slavje ali fotografiranje.',      60, 10, 4500,  0.095, 'makeup',  3),
  ('33333333-3333-3333-3333-333333333333', 'Poročna frizura',       'Posvet, pripravljalna proba in zaključna izvedba na dan dogodka.', 90, 30, 12000, 0.095, 'hair',    4),

  -- Salon Lila
  ('44444444-4444-4444-4444-444444444444', 'Otroško striženje',     'Striženje za otroke do 12. leta.',                                 30, 10, 1500,  0.095, 'hair',   0),
  ('44444444-4444-4444-4444-444444444444', 'Moško striženje',       'Klasično ali sodobno moško striženje.',                            35, 10, 2000,  0.095, 'barber', 1),
  ('44444444-4444-4444-4444-444444444444', 'Žensko striženje',      'Striženje, fenanje in svetovanje za vsakdanjo nego.',              50, 10, 3000,  0.095, 'hair',   2),
  ('44444444-4444-4444-4444-444444444444', 'Pranje + maska',        'Nega las z masko in zaključnim fenanjem.',                         40, 10, 2200,  0.095, 'hair',   3),
  ('44444444-4444-4444-4444-444444444444', 'Družinski paket',       'Eden odrasli + dva otroka.',                                       90, 15, 6500,  0.095, 'hair',   4),

  -- Refleks Bežigrad
  ('55555555-5555-5555-5555-555555555555', 'Balayage premium',      'Ročno naneseni svetli prelivi po individualni shemi.',            180, 30, 19500, 0.095, 'color',   0),
  ('55555555-5555-5555-5555-555555555555', 'Ombré',                 'Postopen prehod barv od korenin do konic.',                       150, 30, 17500, 0.095, 'color',   1),
  ('55555555-5555-5555-5555-555555555555', 'Korekcija barve',       'Posvet in popravek prejšnjih barvnih posegov.',                   120, 30, 13500, 0.095, 'color',   2),
  ('55555555-5555-5555-5555-555555555555', 'Globinska nega las',    'Olive Phild + Olaplex + maska + masaža.',                          60, 15, 5500,  0.095, 'care',    3),

  -- Vič Beauty Lounge
  ('66666666-6666-6666-6666-666666666666', 'Klasična masaža',       'Sproščujoča masaža celega telesa.',                                60, 15, 4800,  0.22,  'massage', 0),
  ('66666666-6666-6666-6666-666666666666', 'Sproščujoča masaža',    'Lahka relaksacijska masaža z eteričnimi olji.',                    90, 15, 6500,  0.22,  'massage', 1),
  ('66666666-6666-6666-6666-666666666666', 'Pedikura',              'Klasična pedikura z negovalnim zaključkom.',                       60, 10, 3800,  0.095, 'nails',   2),
  ('66666666-6666-6666-6666-666666666666', 'Ličenje',               'Dnevno ali večerno ličenje.',                                      45, 10, 3500,  0.095, 'makeup',  3),
  ('66666666-6666-6666-6666-666666666666', 'Nega obraza',           'Globinsko čiščenje, peeling in vlaženje.',                         75, 15, 5200,  0.095, 'spa',     4);

-- ---------------------------------------------------------------------------
-- Weekly hours (business-wide). 0 = Monday … 5 = Saturday. Sunday closed by
-- absence of any row; the booking engine treats missing weekdays as closed.
-- ---------------------------------------------------------------------------
insert into public.weekly_hours (business_id, user_id, weekday, starts_at, ends_at)
select b.id, null::uuid, wd.weekday, wd.starts_at::time, wd.ends_at::time
from public.businesses b
cross join (
  values
    (0, '09:00', '19:00'),
    (1, '09:00', '19:00'),
    (2, '09:00', '19:00'),
    (3, '09:00', '20:00'),
    (4, '09:00', '20:00'),
    (5, '09:00', '14:00')
) as wd(weekday, starts_at, ends_at)
where b.slug in (
  'atelier-mojca','brivnica-tabor','studio-hana','salon-lila','refleks-bezigrad','vic-beauty-lounge'
);

-- ---------------------------------------------------------------------------
-- Reviews — anonymous reviewer_name, 4–5 stars realistic distribution.
-- client_user_id intentionally null in Phase 1 (no client accounts seeded yet).
-- ---------------------------------------------------------------------------
insert into public.reviews (business_id, client_user_id, reviewer_name, rating, body, created_at) values
  ('11111111-1111-1111-1111-111111111111', null, 'Maša K.',  5, 'Mojca je čarovnica z barvami. Najboljši balayage v Ljubljani.',                              now() - interval '14 days'),
  ('11111111-1111-1111-1111-111111111111', null, 'Eva P.',   5, 'Vzdušje je mirno, kava odlična, frizura pa boljša od pričakovane. Vredno cene.',            now() - interval '28 days'),
  ('11111111-1111-1111-1111-111111111111', null, 'Tomaž R.', 4, 'Profesionalno in natančno. Edina pripomba — termini so težko dosegljivi.',                  now() - interval '40 days'),
  ('11111111-1111-1111-1111-111111111111', null, 'Lara M.',  5, 'Mojca je razumela, kaj sem želela, brez da bi morala razlagati. Talent.',                   now() - interval '65 days'),

  ('22222222-2222-2222-2222-222222222222', null, 'Jure D.',  5, 'Klemen je gospod. Britje s pravo britvico, mirna roka, popolna izkušnja.',                  now() - interval '7 days'),
  ('22222222-2222-2222-2222-222222222222', null, 'Boris G.', 5, 'Star šolski pristop v sodobni izvedbi. Najboljša brivnica v Ljubljani.',                    now() - interval '22 days'),
  ('22222222-2222-2222-2222-222222222222', null, 'Matej F.', 4, 'Odlična brivnica, samo malo več prostora bi prišlo prav.',                                  now() - interval '50 days'),

  ('33333333-3333-3333-3333-333333333333', null, 'Nina B.',  5, 'Pripravili so me za poroko — frizura, ličenje in nohti na enem mestu. Idealno.',            now() - interval '10 days'),
  ('33333333-3333-3333-3333-333333333333', null, 'Tjaša K.', 4, 'Hana je odlična stilistka. Ekipa je vedno prijazna.',                                       now() - interval '32 days'),
  ('33333333-3333-3333-3333-333333333333', null, 'Petra L.', 5, 'Najlepša poročna frizura, kar sem jih videla. Hvala Hana!',                                 now() - interval '60 days'),
  ('33333333-3333-3333-3333-333333333333', null, 'Anja S.',  5, 'Manikira, kakršne še nisem imela. Eva ima neverjetno čut za detajl.',                       now() - interval '80 days'),

  ('44444444-4444-4444-4444-444444444444', null, 'Andreja P.',5, 'Hodimo cela družina. Otroci se počutijo varno, jaz pa dobim svoj termin za sproščeno uro.',  now() - interval '12 days'),
  ('44444444-4444-4444-4444-444444444444', null, 'Igor T.',  4, 'Korektno, hitro in cenovno dostopno. Bom redno hodil.',                                     now() - interval '38 days'),
  ('44444444-4444-4444-4444-444444444444', null, 'Karmen Š.',5, 'Lila ima dar — moja mama je imela tu prvo frizuro in zdaj jo vodim še jaz.',                now() - interval '55 days'),

  ('55555555-5555-5555-5555-555555555555', null, 'Špela V.', 5, 'Marko mi je rešil lase po neuspelem barvanju drugje. Vrhunec strokovnosti.',                 now() - interval '5 days'),
  ('55555555-5555-5555-5555-555555555555', null, 'Tina N.',  5, 'Premišljen, miren, natančen. Edina barva, ki je zdržala šest mesecev.',                     now() - interval '18 days'),
  ('55555555-5555-5555-5555-555555555555', null, 'Mojca Č.', 5, 'Najboljša izkušnja barvanja v karieri. Refleks je investicija v lase.',                     now() - interval '45 days'),
  ('55555555-5555-5555-5555-555555555555', null, 'Sanja H.', 4, 'Vrhunska kakovost. Le terminov je premalo — težko priti hitro na vrsto.',                   now() - interval '70 days'),

  ('66666666-6666-6666-6666-666666666666', null, 'Klara M.', 5, 'Najboljša masaža ever. Tomaž ve, kje so problemi, še preden poveš.',                        now() - interval '8 days'),
  ('66666666-6666-6666-6666-666666666666', null, 'Žiga R.',  5, 'Po dolgem delu mehko in sproščujoče. Pridem zagotovo nazaj.',                               now() - interval '25 days'),
  ('66666666-6666-6666-6666-666666666666', null, 'Nika P.',  4, 'Lepo urejen prostor, prijazno osebje. Pedikura je odlična.',                                now() - interval '48 days');

commit;
