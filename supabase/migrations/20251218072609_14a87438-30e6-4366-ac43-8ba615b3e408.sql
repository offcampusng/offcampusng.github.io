-- Drop the view and recreate it with SECURITY INVOKER (default, safer)
DROP VIEW IF EXISTS public.hostels_public;

CREATE VIEW public.hostels_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  location,
  address,
  price,
  hostel_type,
  description,
  facilities,
  images,
  rules,
  caretaker_name,
  available_rooms,
  is_verified,
  created_at,
  updated_at
FROM public.hostels;

-- Grant access to the view
GRANT SELECT ON public.hostels_public TO anon, authenticated;