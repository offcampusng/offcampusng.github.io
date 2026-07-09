
DROP VIEW IF EXISTS public.hostels_public;

CREATE VIEW public.hostels_public
WITH (security_invoker = off) AS
SELECT
  id, name, location, address, description, price, hostel_type,
  images, facilities, rules, caretaker_name, is_verified,
  available_rooms, inspection_days, inspection_time_from, inspection_time_to,
  created_at, updated_at
FROM public.hostels;

GRANT SELECT ON public.hostels_public TO anon, authenticated;
