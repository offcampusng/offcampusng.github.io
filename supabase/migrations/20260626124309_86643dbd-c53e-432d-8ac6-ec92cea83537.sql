-- Reusable security-definer role checker
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Allow users to self-assign the LANDLORD role only (never admin)
CREATE POLICY "Users can self-assign landlord role"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'landlord');

-- Landlords can manage any hostel
CREATE POLICY "Landlords can insert hostels"
  ON public.hostels FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'landlord'));

CREATE POLICY "Landlords can update hostels"
  ON public.hostels FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'landlord'));

CREATE POLICY "Landlords can delete hostels"
  ON public.hostels FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'landlord'));

-- Landlords can read all bookings + payments for analytics
CREATE POLICY "Landlords can view all bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'landlord'));

CREATE POLICY "Landlords can view all payments"
  ON public.payments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'landlord'));

-- Hostel views tracking
CREATE TABLE public.hostel_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  viewer_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX hostel_views_hostel_id_idx ON public.hostel_views(hostel_id);
CREATE INDEX hostel_views_created_at_idx ON public.hostel_views(created_at DESC);

GRANT SELECT, INSERT ON public.hostel_views TO authenticated;
GRANT SELECT, INSERT ON public.hostel_views TO anon;
GRANT ALL ON public.hostel_views TO service_role;

ALTER TABLE public.hostel_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log a hostel view"
  ON public.hostel_views FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Landlords and admins can read hostel views"
  ON public.hostel_views FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'landlord') OR public.is_admin(auth.uid()));