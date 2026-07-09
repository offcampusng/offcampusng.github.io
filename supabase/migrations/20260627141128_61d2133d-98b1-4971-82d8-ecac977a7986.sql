-- Allow public (anon) read access to hostels_public view (excludes caretaker_phone)
ALTER VIEW public.hostels_public SET (security_invoker = off);
GRANT SELECT ON public.hostels_public TO anon, authenticated;