-- Seed data mirroring src/lib/mock-data.ts — run after schema.sql.

insert into public.airlines (code, name, color) values
  ('AF', 'AirFly Prime', '#f97316'),
  ('BA', 'British Skyways', '#2563eb'),
  ('NA', 'Nippon Air', '#e11d48'),
  ('TP', 'TransPacific', '#0891b2'),
  ('EJ', 'EmiratesJet', '#7c3aed'),
  ('ES', 'EuroSwift Rail', '#059669'),
  ('CX', 'Continental Express', '#0d9488'),
  ('LW', 'LinkWay Coach', '#d97706'),
  ('CL', 'ContinentalLink', '#ca8a04')
on conflict (code) do nothing;

insert into public.airports (code, city, name, country, region, lat, lng) values
  ('JFK', 'New York', 'John F. Kennedy Intl', 'USA', 'USA', 40.6413, -73.7781),
  ('LAX', 'Los Angeles', 'Los Angeles Intl', 'USA', 'USA', 33.9416, -118.4085),
  ('SFO', 'San Francisco', 'San Francisco Intl', 'USA', 'USA', 37.6213, -122.3790),
  ('ORD', 'Chicago', 'O''Hare Intl', 'USA', 'USA', 41.9742, -87.9073),
  ('MIA', 'Miami', 'Miami Intl', 'USA', 'USA', 25.7959, -80.2870),
  ('LHR', 'London', 'Heathrow', 'UK', 'UK', 51.4700, -0.4543),
  ('LGW', 'London', 'Gatwick', 'UK', 'UK', 51.1537, -0.1821),
  ('EDI', 'Edinburgh', 'Edinburgh Airport', 'UK', 'UK', 55.9500, -3.3725),
  ('MAN', 'Manchester', 'Manchester Airport', 'UK', 'UK', 53.3537, -2.2750),
  ('HND', 'Tokyo', 'Haneda', 'Japan', 'Asia', 35.5494, 139.7798),
  ('NRT', 'Tokyo', 'Narita Intl', 'Japan', 'Asia', 35.7647, 140.3864),
  ('SIN', 'Singapore', 'Changi Airport', 'Singapore', 'Asia', 1.3644, 103.9915),
  ('DPS', 'Bali', 'Ngurah Rai Intl', 'Indonesia', 'Asia', -8.7482, 115.1672),
  ('DXB', 'Dubai', 'Dubai Intl', 'UAE', 'Asia', 25.2532, 55.3657),
  ('HKG', 'Hong Kong', 'Hong Kong Intl', 'China', 'Asia', 22.3080, 113.9185),
  ('ICN', 'Seoul', 'Incheon Intl', 'South Korea', 'Asia', 37.4602, 126.4407),
  ('BER', 'Berlin', 'Berlin Hauptbahnhof', 'Germany', 'Other', 52.5251, 13.3694),
  ('MUC', 'Munich', 'München Hauptbahnhof', 'Germany', 'Other', 48.1402, 11.5586),
  ('PAR', 'Paris', 'Gare du Nord', 'France', 'Other', 48.8809, 2.3553),
  ('LDN', 'London', 'St Pancras International', 'UK', 'UK', 51.5308, -0.1238),
  ('FRA', 'Frankfurt', 'Frankfurt Hauptbahnhof', 'Germany', 'Other', 50.1070, 8.6632),
  ('BRU', 'Brussels', 'Bruxelles-Midi', 'Belgium', 'Other', 50.8357, 4.3326),
  ('VIE', 'Vienna', 'Wien Hauptbahnhof', 'Austria', 'Other', 48.1858, 16.3764),
  ('HAM', 'Hamburg', 'Hamburg Hauptbahnhof', 'Germany', 'Other', 53.5528, 10.0067),
  ('CGN', 'Cologne', 'Köln Hauptbahnhof', 'Germany', 'Other', 50.9432, 6.9583),
  ('AMS', 'Amsterdam', 'Amsterdam Centraal', 'Netherlands', 'Other', 52.3791, 4.9003)
on conflict (code) do nothing;

insert into public.flights
  (flight_number, airline_code, from_code, to_code, depart_at, arrive_at, cabin, price, seats_total, seats_left, stops, status)
values
  ('AF 712', 'AF', 'JFK', 'LHR', now() + interval '2 days' + time '21:35', now() + interval '3 days' + time '09:20', 'Economy', 412, 220, 6, 0, 'scheduled'),
  ('BA 118', 'BA', 'JFK', 'LHR', now() + interval '2 days' + time '18:05', now() + interval '3 days' + time '06:10', 'Economy', 389, 240, 12, 0, 'scheduled'),
  ('NA 905', 'NA', 'LAX', 'HND', now() + interval '4 days' + time '01:15', now() + interval '4 days' + time '05:40', 'Economy', 741, 180, 4, 0, 'scheduled'),
  ('TP 221', 'TP', 'SFO', 'SIN', now() + interval '5 days' + time '23:50', now() + interval '6 days' + time '08:30', 'Premium Economy', 812, 200, 9, 1, 'scheduled'),
  ('EJ 340', 'EJ', 'ORD', 'DXB', now() + interval '6 days' + time '16:20', now() + interval '7 days' + time '14:05', 'Business', 655, 160, 3, 1, 'scheduled'),
  ('AF 208', 'AF', 'LAX', 'LHR', now() + interval '2 days' + time '19:10', now() + interval '3 days' + time '13:40', 'Economy', 468, 220, 15, 0, 'scheduled'),
  ('BA 552', 'BA', 'MIA', 'LGW', now() + interval '3 days' + time '22:15', now() + interval '4 days' + time '11:50', 'Premium Economy', 431, 200, 7, 0, 'scheduled'),
  ('NA 118', 'NA', 'SFO', 'NRT', now() + interval '3 days' + time '12:40', now() + interval '3 days' + time '16:10', 'Economy', 698, 180, 21, 0, 'scheduled'),
  ('TP 804', 'TP', 'ORD', 'HKG', now() + interval '4 days' + time '17:05', now() + interval '4 days' + time '21:55', 'Economy', 889, 180, 5, 1, 'scheduled'),
  ('EJ 671', 'EJ', 'JFK', 'DXB', now() + interval '5 days' + time '23:05', now() + interval '5 days' + time '20:40', 'Business', 712, 160, 2, 0, 'scheduled'),
  ('AF 319', 'AF', 'ORD', 'MAN', now() + interval '2 days' + time '20:30', now() + interval '3 days' + time '09:55', 'Economy', 402, 220, 18, 0, 'scheduled'),
  ('BA 773', 'BA', 'LAX', 'EDI', now() + interval '4 days' + time '16:45', now() + interval '5 days' + time '08:50', 'Economy', 519, 200, 10, 1, 'scheduled'),
  ('NA 452', 'NA', 'JFK', 'ICN', now() + interval '6 days' + time '01:50', now() + interval '6 days' + time '06:20', 'Economy', 761, 180, 13, 1, 'scheduled'),
  ('TP 390', 'TP', 'MIA', 'DPS', now() + interval '7 days' + time '09:15', now() + interval '7 days' + time '19:05', 'Premium Economy', 1042, 200, 6, 2, 'scheduled'),
  ('EJ 205', 'EJ', 'SFO', 'DXB', now() + interval '5 days' + time '14:20', now() + interval '5 days' + time '17:55', 'Business', 733, 160, 4, 1, 'scheduled'),
  ('AF 126', 'AF', 'ORD', 'LHR', now() + interval '2 days' + time '17:50', now() + interval '3 days' + time '07:05', 'Economy', 445, 220, 24, 0, 'scheduled'),
  ('BA 340', 'BA', 'JFK', 'MAN', now() + interval '3 days' + time '20:55', now() + interval '4 days' + time '09:15', 'Economy', 398, 200, 16, 0, 'scheduled'),
  ('NA 630', 'NA', 'SFO', 'HKG', now() + interval '4 days' + time '23:40', now() + interval '5 days' + time '06:15', 'Economy', 771, 180, 8, 0, 'scheduled'),
  ('TP 512', 'TP', 'LAX', 'ICN', now() + interval '6 days' + time '11:30', now() + interval '6 days' + time '16:50', 'Economy', 705, 200, 19, 0, 'scheduled'),
  ('EJ 118', 'EJ', 'MIA', 'DXB', now() + interval '7 days' + time '21:10', now() + interval '8 days' + time '20:35', 'First', 799, 160, 2, 1, 'scheduled');

insert into public.flights
  (flight_number, airline_code, from_code, to_code, depart_at, arrive_at, cabin, price, seats_total, seats_left, stops, status, mode)
values
  ('TR 104', 'ES', 'BER', 'MUC', now() + interval '1 day' + time '07:20', now() + interval '1 day' + time '11:20', 'Economy', 89, 300, 42, 0, 'scheduled', 'train'),
  ('TR 228', 'ES', 'BER', 'AMS', now() + interval '1 day' + time '09:45', now() + interval '1 day' + time '16:10', 'Economy', 112, 300, 30, 0, 'scheduled', 'train'),
  ('TR 351', 'CX', 'PAR', 'LDN', now() + interval '2 days' + time '13:10', now() + interval '2 days' + time '15:25', 'Business', 145, 300, 55, 0, 'scheduled', 'train'),
  ('TR 467', 'CX', 'FRA', 'BRU', now() + interval '2 days' + time '16:35', now() + interval '2 days' + time '19:45', 'Economy', 98, 300, 27, 0, 'scheduled', 'train'),
  ('TR 582', 'ES', 'MUC', 'VIE', now() + interval '3 days' + time '18:50', now() + interval '3 days' + time '23:00', 'Economy', 76, 300, 33, 0, 'scheduled', 'train'),
  ('BU 210', 'LW', 'MAN', 'LDN', now() + interval '1 day' + time '06:15', now() + interval '1 day' + time '11:00', 'Economy', 32, 60, 12, 0, 'scheduled', 'bus'),
  ('BU 344', 'LW', 'EDI', 'MAN', now() + interval '1 day' + time '10:40', now() + interval '1 day' + time '16:00', 'Economy', 38, 60, 20, 0, 'scheduled', 'bus'),
  ('BU 459', 'CL', 'HAM', 'BER', now() + interval '2 days' + time '12:25', now() + interval '2 days' + time '15:10', 'Economy', 24, 60, 40, 0, 'scheduled', 'bus'),
  ('BU 573', 'CL', 'CGN', 'FRA', now() + interval '2 days' + time '15:05', now() + interval '2 days' + time '17:30', 'Economy', 21, 60, 45, 0, 'scheduled', 'bus');

insert into public.gift_cards (code, amount, status, issued_by, recipient_email) values
  ('AIRFLY-DEMO-0100', 100, 'active', 'admin:seed', 'demo@airfly.test'),
  ('AIRFLY-DEMO-0250', 250, 'active', 'admin:seed', null),
  ('AIRFLY-DEMO-0500', 500, 'void', 'admin:seed', null)
on conflict (code) do nothing;

insert into public.admin_logs (admin_name, action, details) values
  ('System', 'platform_settings.update', '{"payment_mode": "simulate_success"}'),
  ('System', 'flights.seed', '{"count": 5}'),
  ('System', 'reviews.seed', '{"count": 4}');

insert into public.reviews (name, role, avatar_url, quote, rating, is_featured) values
  ('Sarah Ahmed', 'Frequent Flyer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop', 'Booking was quick and hassle-free. The seat map matched reality perfectly and check-in was seamless.', 5, true),
  ('James Whitfield', 'Business Traveler', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop', 'The split-payment feature saved our whole team a headache when we booked London to Singapore together.', 5, true),
  ('Aiko Tanaka', 'Digital Nomad', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop', 'Cleanest flight search I''ve used. Price alerts on the Tokyo route got me a fare I couldn''t find anywhere else.', 4, true),
  ('Daniel Okoro', 'Family Traveler', 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?q=80&w=200&auto=format&fit=crop', 'Refunds within 24 hours, real support, and a UI that didn''t confuse my parents. Genuinely impressed.', 5, true);
