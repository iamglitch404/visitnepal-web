-- VisitNepal Canonical Production Schema
-- Rebuilt from Flutter/NestJS domain requirements

-- 1. EXTENSIONS & FUNCTIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE OR REPLACE FUNCTION app_user_id()
RETURNS uuid
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  v_user_id text;
BEGIN
  v_user_id := current_setting('app.current_user_id', true);
  IF v_user_id IS NULL OR v_user_id = '' THEN RETURN NULL; END IF;
  RETURN v_user_id::uuid;
EXCEPTION
  WHEN invalid_text_representation THEN RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------------------------------------
-- 2. IDENTITY & ROLES
--------------------------------------------------------------------------------
CREATE TABLE roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  description text
);

CREATE TABLE accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text,
  password_hash text,
  provider text NOT NULL DEFAULT 'email',
  provider_id text,
  role_id uuid REFERENCES roles(id) ON DELETE SET NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  ban_reason text,
  is_permanent_ban boolean DEFAULT false,
  ban_expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(provider, provider_id)
);
CREATE UNIQUE INDEX accounts_email_unique ON accounts (email) WHERE provider = 'email';
CREATE TRIGGER set_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TABLE otps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  code text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('registration', 'password_reset', 'login')),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  device_id text NOT NULL,
  device_name text,
  ip_address text,
  refresh_token text,
  is_active boolean DEFAULT true,
  last_active_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX idx_sessions_account_id ON sessions(account_id);
CREATE INDEX idx_sessions_device_id ON sessions(device_id);

CREATE TABLE profiles (
  id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name text,
  avatar_url text,
  bio text,
  phone text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


--------------------------------------------------------------------------------
-- 3. BUSINESSES & OPERATIONS
--------------------------------------------------------------------------------
CREATE TABLE businesses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  business_type text NOT NULL CHECK (business_type IN ('hotel', 'homestay', 'transport', 'trekking', 'tour', 'activity')),
  description text,
  address text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'suspended')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TABLE business_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'manager', 'staff')),
  UNIQUE(business_id, user_id)
);

CREATE TABLE business_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL,
  file_url text NOT NULL,
  status text DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

--------------------------------------------------------------------------------
-- 4. MEDIA (Unified)
--------------------------------------------------------------------------------
CREATE TABLE media (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  url text NOT NULL,
  media_type text DEFAULT 'image',
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX idx_media_entity ON media(entity_type, entity_id);

--------------------------------------------------------------------------------
-- 5. DESTINATIONS & ATTRACTIONS
--------------------------------------------------------------------------------
CREATE TABLE destinations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  location text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'published',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON destinations FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TABLE attractions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id uuid REFERENCES destinations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  ticket_price numeric(12,2) DEFAULT 0,
  currency text DEFAULT 'NPR',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

--------------------------------------------------------------------------------
-- 6. ACCOMMODATION (Unified)
--------------------------------------------------------------------------------
CREATE TABLE room_types (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  capacity integer DEFAULT 2,
  base_price numeric(12,2) NOT NULL,
  currency text DEFAULT 'USD',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE room_availability (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_type_id uuid REFERENCES room_types(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  available_count integer NOT NULL,
  price_override numeric(12,2),
  UNIQUE(room_type_id, date)
);

--------------------------------------------------------------------------------
-- 7. ACTIVITIES & PACKAGES (Unified)
--------------------------------------------------------------------------------
CREATE TABLE activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('paragliding', 'rafting', 'bungee', 'general')),
  title text NOT NULL,
  duration_minutes integer,
  base_price numeric(12,2) NOT NULL,
  currency text DEFAULT 'USD',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE activity_schedules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  start_time timestamp with time zone NOT NULL,
  capacity integer NOT NULL,
  booked_count integer DEFAULT 0
);

CREATE TABLE packages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('trekking', 'tour')),
  title text NOT NULL,
  duration_days integer NOT NULL,
  base_price numeric(12,2) NOT NULL,
  currency text DEFAULT 'USD',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE itinerary_days (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id uuid REFERENCES packages(id) ON DELETE CASCADE NOT NULL,
  day_number integer NOT NULL,
  description text NOT NULL
);

--------------------------------------------------------------------------------
-- 8. TRANSPORTATION
--------------------------------------------------------------------------------
CREATE TABLE transport_fleet (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  vehicle_type text NOT NULL,
  capacity integer NOT NULL,
  plate_number text
);

CREATE TABLE transport_routes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  from_location text NOT NULL,
  to_location text NOT NULL,
  base_price numeric(12,2) NOT NULL,
  currency text DEFAULT 'NPR'
);

--------------------------------------------------------------------------------
-- 9. GUIDES
--------------------------------------------------------------------------------
CREATE TABLE guide_profiles (
  id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  languages text[],
  expertise text[],
  daily_rate numeric(12,2),
  currency text DEFAULT 'USD',
  status text DEFAULT 'active'
);

CREATE TABLE guide_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  guide_id uuid REFERENCES guide_profiles(id) ON DELETE RESTRICT NOT NULL,
  user_id uuid REFERENCES accounts(id) ON DELETE RESTRICT NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'completed')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON guide_requests FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

--------------------------------------------------------------------------------
-- 10. PERMITS
--------------------------------------------------------------------------------
CREATE TABLE permit_authorities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  code text UNIQUE NOT NULL
);

CREATE TABLE permit_types (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  authority_id uuid REFERENCES permit_authorities(id) ON DELETE RESTRICT NOT NULL,
  name text NOT NULL,
  base_price numeric(12,2) NOT NULL,
  currency text DEFAULT 'USD'
);

CREATE TABLE permit_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES accounts(id) ON DELETE RESTRICT NOT NULL,
  permit_type_id uuid REFERENCES permit_types(id) ON DELETE RESTRICT NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

--------------------------------------------------------------------------------
-- 11. BOOKINGS & FINANCIALS (Flexible Model)
--------------------------------------------------------------------------------
CREATE TABLE bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES accounts(id) ON DELETE RESTRICT NOT NULL,
  total_amount numeric(12,2) NOT NULL,
  currency text NOT NULL,
  status text DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'confirmed', 'cancelled', 'completed')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TABLE booking_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('room', 'activity', 'package', 'transport', 'guide')),
  item_id uuid NOT NULL, -- Logical FK, enforced by app logic
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(12,2) NOT NULL,
  subtotal numeric(12,2) NOT NULL,
  start_date timestamp with time zone,
  end_date timestamp with time zone
);

CREATE TABLE payment_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid REFERENCES bookings(id) ON DELETE RESTRICT NOT NULL,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL,
  provider text NOT NULL,
  external_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE payouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE RESTRICT NOT NULL,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

--------------------------------------------------------------------------------
-- 12. COMMUNITY, SOCIAL & REVIEWS
--------------------------------------------------------------------------------
CREATE TABLE reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('destination', 'hotel', 'activity', 'package', 'guide')),
  target_id uuid NOT NULL,
  rating numeric(3,2) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  UNIQUE(user_id, target_type, target_id)
);

CREATE TABLE posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

--------------------------------------------------------------------------------
-- 13. CHAT & NOTIFICATIONS
--------------------------------------------------------------------------------
CREATE TABLE conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE conversation_participants (
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE realtime_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  payload jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

--------------------------------------------------------------------------------
-- 14. AUDIT
--------------------------------------------------------------------------------
CREATE TABLE audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id uuid REFERENCES accounts(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) & INDEXES
--------------------------------------------------------------------------------
-- (Simplified for schema definition; application handles authorization)
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own account" ON accounts FOR SELECT USING (app_user_id() = id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read businesses" ON businesses FOR SELECT USING (status = 'verified');

CREATE INDEX idx_booking_items_booking ON booking_items(booking_id);
CREATE INDEX idx_payment_transactions_booking ON payment_transactions(booking_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_reviews_target ON reviews(target_type, target_id);
