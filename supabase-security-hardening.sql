-- Al Madina Restaurant: security hardening migration
-- Run in Supabase SQL Editor after reviewing the backup.
-- This migration intentionally removes public read/update/delete access to private customer data.
-- Admins must be authenticated Supabase users whose public.profiles.role is set to 'admin'
-- by a trusted project owner (never by a public signup form).

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer';
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('customer', 'admin'));

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- Remove the permissive policies from the original schema. Drop statements are repeat-safe.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert/update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view and place orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view and submit reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can view and update carts" ON public.carts;
DROP POLICY IF EXISTS "Anyone can view and update favorites" ON public.favorites;
DROP POLICY IF EXISTS "Anyone can view and send chat messages" ON public.customer_chats;
DROP POLICY IF EXISTS "Anyone can access chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can access reservations" ON public.reservations;

-- Profiles: a customer can see/update only their own row; role escalation is blocked.
CREATE POLICY "Profiles select own or admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "Profiles insert own customer profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() AND role = 'customer');
CREATE POLICY "Profiles update own customer profile or admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK ((id = auth.uid() AND role = 'customer') OR public.is_admin());
CREATE POLICY "Profiles delete admin only" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Orders: public/guests may submit, but only the owner can see their authenticated orders.
-- Only admins can change status, update, or delete existing orders.
CREATE POLICY "Orders insert valid customer submission" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Orders select own or admin" ON public.orders
  FOR SELECT TO authenticated
  USING ((user_id IS NOT NULL AND user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "Orders update admin only" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY "Orders delete admin only" ON public.orders
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Reviews: only approved reviews are public; submissions are pending and immutable to customers.
CREATE POLICY "Reviews read approved or admin" ON public.reviews
  FOR SELECT TO anon, authenticated
  USING (status = 'approved' OR public.is_admin());
CREATE POLICY "Reviews submit pending" ON public.reviews
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND rating BETWEEN 1 AND 5);
CREATE POLICY "Reviews update admin only" ON public.reviews
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY "Reviews delete admin only" ON public.reviews
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Carts and favorites are private to authenticated users; guests use local browser storage.
CREATE POLICY "Carts select own or admin" ON public.carts
  FOR SELECT TO authenticated
  USING ((user_id IS NOT NULL AND user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "Carts insert own or admin" ON public.carts
  FOR INSERT TO authenticated
  WITH CHECK ((user_id IS NOT NULL AND user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "Carts update own or admin" ON public.carts
  FOR UPDATE TO authenticated
  USING ((user_id IS NOT NULL AND user_id = auth.uid()) OR public.is_admin())
  WITH CHECK ((user_id IS NOT NULL AND user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "Carts delete own or admin" ON public.carts
  FOR DELETE TO authenticated
  USING ((user_id IS NOT NULL AND user_id = auth.uid()) OR public.is_admin());

CREATE POLICY "Favorites select own or admin" ON public.favorites
  FOR SELECT TO authenticated
  USING ((user_id IS NOT NULL AND user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "Favorites insert own or admin" ON public.favorites
  FOR INSERT TO authenticated
  WITH CHECK ((user_id IS NOT NULL AND user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "Favorites update own or admin" ON public.favorites
  FOR UPDATE TO authenticated
  USING ((user_id IS NOT NULL AND user_id = auth.uid()) OR public.is_admin())
  WITH CHECK ((user_id IS NOT NULL AND user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "Favorites delete own or admin" ON public.favorites
  FOR DELETE TO authenticated
  USING ((user_id IS NOT NULL AND user_id = auth.uid()) OR public.is_admin());

-- Chat logs can be submitted by visitors, but only admins can read/manage transcripts.
CREATE POLICY "Customer chats submit messages" ON public.customer_chats
  FOR INSERT TO anon, authenticated
  WITH CHECK (sender IN ('customer', 'ai_host') AND length(message) BETWEEN 1 AND 8000);
CREATE POLICY "Customer chats admin read" ON public.customer_chats
  FOR SELECT TO authenticated
  USING (public.is_admin());
CREATE POLICY "Customer chats admin update" ON public.customer_chats
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY "Customer chats admin delete" ON public.customer_chats
  FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE POLICY "Chat messages submit" ON public.chat_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (sender IN ('customer', 'ai_host') AND length(message) BETWEEN 1 AND 8000);
CREATE POLICY "Chat messages admin read" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (public.is_admin());
CREATE POLICY "Chat messages admin update" ON public.chat_messages
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY "Chat messages admin delete" ON public.chat_messages
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Reservations: customers may request a booking, but cannot browse or alter records.
-- Authenticated customers can read only records linked to their own auth user.
CREATE POLICY "Reservations submit request" ON public.reservations
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Reservations select own or admin" ON public.reservations
  FOR SELECT TO authenticated
  USING ((user_id IS NOT NULL AND user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "Reservations update admin only" ON public.reservations
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY "Reservations delete admin only" ON public.reservations
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Important: after running this migration, create/authorize the intended staff profile
-- via Supabase SQL Editor as project owner (replace the UUID with the Auth user's UUID):
-- INSERT INTO public.profiles (id, full_name, email, role)
-- SELECT id, COALESCE(raw_user_meta_data ->> 'full_name', ''), COALESCE(email, ''), 'admin'
-- FROM auth.users WHERE id = '<AUTH_USER_UUID>'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';
-- Do not use the demo admin password shown in the old frontend.
