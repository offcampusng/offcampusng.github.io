-- Create a security definer function to get caretaker contact only for confirmed bookings
CREATE OR REPLACE FUNCTION public.get_caretaker_contact(hostel_uuid uuid)
RETURNS TABLE(caretaker_name text, caretaker_phone text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the user has a confirmed booking for this hostel
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.hostel_id = hostel_uuid
      AND bookings.user_id = auth.uid()
      AND bookings.status = 'confirmed'
  ) THEN
    RETURN QUERY
    SELECT h.caretaker_name, h.caretaker_phone
    FROM public.hostels h
    WHERE h.id = hostel_uuid;
  ELSE
    -- Return empty result if no confirmed booking
    RETURN;
  END IF;
END;
$$;

-- Create a view that hides caretaker_phone from public access
CREATE OR REPLACE VIEW public.hostels_public AS
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