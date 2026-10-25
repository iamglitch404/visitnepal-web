-- Mock Data for VisitNepal App Database
-- Ensure schema.sql has been run prior to running this script!

do $$
declare
  role_traveler uuid;
  role_guide uuid;
  role_butler uuid;
  acc_traveler uuid;
  acc_guide uuid;
  acc_butler uuid;
  dest_everest uuid;
  dest_annapurna uuid;
  dest_bardiya uuid;
  hotel_kathmandu uuid;
  hotel_pokhara uuid;
  room_ktm_deluxe uuid;
  room_pkr_suite uuid;
  act_safari uuid;
  sched_safari_morning uuid;
begin
  -- Retrieve roles
  select id into role_traveler from roles where name = 'traveler';
  select id into role_guide from roles where name = 'guide';
  select id into role_butler from roles where name = 'butler';

  -- 1. Insert Mock Accounts & Profiles
  -- Traveler Account
  insert into accounts (email, role_id)
  values ('traveler@example.com', role_traveler)
  returning id into acc_traveler;

  insert into profiles (id, full_name, bio, rating, is_verified, avatar_url)
  values (acc_traveler, 'Sarah Jenkins', 'I love traveling to new places!', 4.8, true, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop');

  -- Guide Account
  insert into accounts (email, role_id)
  values ('guide@example.com', role_guide)
  returning id into acc_guide;

  insert into profiles (id, full_name, bio, title, rating, is_verified, avatar_url)
  values (acc_guide, 'Nima Sherpa', 'Expert mountaineer and local guide.', 'Senior Guide', 5.0, true, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop');

  insert into guide_profiles (id, daily_rate, specialty, status)
  values (acc_guide, 25.00, 'Mountaineering', 'active');

  -- 2. Insert Mock Destinations
  insert into destinations (name, location, description, image_url, category, best_season, difficulty, duration, budget, highlights, rating)
  values (
    'Everest Base Camp Trek', 'Solukhumbu, Nepal', 'Experience the Himalayas.', 'url', 'Trekking', 'Mar - May', 'Hard', '14 Days', '$$$', array['Views'], 5.0
  ) returning id into dest_everest;

  -- 3. Insert Mock Hotels & Room Types
  insert into hotels (name, location, description, rating, amenities)
  values (
    'Kathmandu Marriott Hotel', 'Naxal, Kathmandu', 'Luxury hotel.', 4.8, array['Free WiFi', 'Pool']
  ) returning id into hotel_kathmandu;

  insert into room_types (hotel_id, name, description, total_quantity, price_per_night, currency)
  values (hotel_kathmandu, 'Deluxe Double', 'Spacious room with city view', 10, 150.00, 'USD')
  returning id into room_ktm_deluxe;

  insert into hotels (name, location, description, rating, amenities)
  values (
    'Temple Tree Resort', 'Lakeside, Pokhara', 'Boutique resort.', 4.7, array['Lake View']
  ) returning id into hotel_pokhara;

  insert into room_types (hotel_id, name, description, total_quantity, price_per_night, currency)
  values (hotel_pokhara, 'Suite', 'Suite with lake view', 5, 250.00, 'USD')
  returning id into room_pkr_suite;

  -- 4. Insert Mock Activities & Schedules
  insert into activities (destination_id, name, description, duration, price, currency, category)
  values (null, 'Jungle Safari', 'Jeep safari in the wild', '4 hours', 50.00, 'USD', 'Wildlife')
  returning id into act_safari;

  insert into activity_schedules (activity_id, start_time, end_time, max_capacity)
  values (act_safari, now() + interval '2 days', now() + interval '2 days 4 hours', 20)
  returning id into sched_safari_morning;

  -- 5. Insert Mock Bookings
  -- Since we are bypassing RPC for seed data, we insert directly.
  -- Hotel Booking (Confirmed)
  insert into bookings (
    profile_id, room_type_id, date_range, quantity, 
    base_amount, tax_rate, tax_amount, total_amount, currency, status, expires_at, idempotency_key
  ) values (
    acc_traveler, room_ktm_deluxe, tstzrange(now() + interval '5 days', now() + interval '8 days', '[)'), 1,
    450.00, 0.13, 58.50, 508.50, 'USD', 'confirmed', now() + interval '100 days', gen_random_uuid()::text
  );

  -- Guide Booking (Pending)
  insert into bookings (
    profile_id, guide_id, date_range, quantity, 
    base_amount, tax_rate, tax_amount, total_amount, currency, status, expires_at, idempotency_key
  ) values (
    acc_traveler, acc_guide, tstzrange(now() + interval '10 days', now() + interval '20 days', '[)'), 1,
    1500.00, 0.13, 195.00, 1695.00, 'USD', 'pending_payment', now() + interval '15 minutes', gen_random_uuid()::text
  );

  -- Activity Booking (Completed)
  insert into bookings (
    profile_id, schedule_id, date_range, quantity, 
    base_amount, tax_rate, tax_amount, total_amount, currency, status, expires_at, idempotency_key
  ) values (
    acc_traveler, sched_safari_morning, tstzrange(now() - interval '5 days', now() - interval '5 days', '[)'), 2,
    100.00, 0.13, 13.00, 113.00, 'USD', 'completed', now() + interval '100 days', gen_random_uuid()::text
  );

end $$;
