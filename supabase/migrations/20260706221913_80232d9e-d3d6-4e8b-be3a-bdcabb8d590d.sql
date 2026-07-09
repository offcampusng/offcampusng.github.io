
-- 1. Add 'agent' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'agent';

-- 2. Agents table
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  photo_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.agents TO authenticated;
GRANT ALL ON public.agents TO service_role;

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view agents"
  ON public.agents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage agents"
  ON public.agents FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Hostel inspection availability
ALTER TABLE public.hostels
  ADD COLUMN IF NOT EXISTS inspection_days TEXT[] DEFAULT ARRAY['mon','tue','wed','thu','fri','sat']::TEXT[],
  ADD COLUMN IF NOT EXISTS inspection_time_from TEXT DEFAULT '09:00',
  ADD COLUMN IF NOT EXISTS inspection_time_to TEXT DEFAULT '17:00';

-- 4. Booking inspection + agent assignment
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS inspection_day TEXT,
  ADD COLUMN IF NOT EXISTS inspection_time TEXT;

-- 5. Auto-assign agent trigger
CREATE OR REPLACE FUNCTION public.assign_agent_to_booking()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  existing_agent UUID;
  chosen_agent UUID;
BEGIN
  IF NEW.agent_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Reuse this student's existing agent if any
  SELECT agent_id INTO existing_agent
  FROM public.bookings
  WHERE user_id = NEW.user_id AND agent_id IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 1;

  IF existing_agent IS NOT NULL THEN
    NEW.agent_id := existing_agent;
    RETURN NEW;
  END IF;

  -- Otherwise pick an active agent with the fewest active bookings
  SELECT a.id INTO chosen_agent
  FROM public.agents a
  LEFT JOIN public.bookings b ON b.agent_id = a.id AND b.status = 'confirmed'
  WHERE a.active = true
  GROUP BY a.id
  ORDER BY COUNT(b.id) ASC, random()
  LIMIT 1;

  NEW.agent_id := chosen_agent;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS assign_agent_before_insert ON public.bookings;
CREATE TRIGGER assign_agent_before_insert
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.assign_agent_to_booking();

-- 6. RPC: get assigned agent contact for a student's booking
CREATE OR REPLACE FUNCTION public.get_assigned_agent(hostel_uuid UUID)
RETURNS TABLE(agent_name TEXT, agent_phone TEXT, agent_email TEXT, agent_photo TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT a.name, a.phone, a.email, a.photo_url
  FROM public.bookings b
  JOIN public.agents a ON a.id = b.agent_id
  WHERE b.hostel_id = hostel_uuid
    AND b.user_id = auth.uid()
    AND b.status = 'confirmed'
  LIMIT 1;
END;
$$;

-- 7. RPC: agent-only caretaker contact
CREATE OR REPLACE FUNCTION public.get_caretaker_for_agent(hostel_uuid UUID)
RETURNS TABLE(caretaker_name TEXT, caretaker_phone TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.agents a ON a.id = b.agent_id
    WHERE b.hostel_id = hostel_uuid
      AND a.user_id = auth.uid()
      AND b.status = 'confirmed'
  ) THEN
    RETURN QUERY
    SELECT h.caretaker_name, h.caretaker_phone
    FROM public.hostels h
    WHERE h.id = hostel_uuid;
  END IF;
END;
$$;

-- 8. RPC: list bookings assigned to the current agent
CREATE OR REPLACE FUNCTION public.get_agent_bookings()
RETURNS TABLE(
  booking_id UUID,
  hostel_id UUID,
  hostel_name TEXT,
  student_name TEXT,
  student_email TEXT,
  inspection_day TEXT,
  inspection_time TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT b.id, b.hostel_id, b.hostel_name, p.name, p.email,
         b.inspection_day, b.inspection_time, b.status::TEXT, b.created_at
  FROM public.bookings b
  JOIN public.agents a ON a.id = b.agent_id
  LEFT JOIN public.profiles p ON p.id = b.user_id
  WHERE a.user_id = auth.uid()
  ORDER BY b.created_at DESC;
END;
$$;

-- 9. Un-verify hostels outside the ₦150k–₦500k range
UPDATE public.hostels
  SET is_verified = false
  WHERE price < 150000 OR price > 500000;
