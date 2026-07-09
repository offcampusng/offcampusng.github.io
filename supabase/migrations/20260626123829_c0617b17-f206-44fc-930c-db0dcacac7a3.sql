-- Default new users to 'free' instead of 'trial'
ALTER TABLE public.profiles ALTER COLUMN subscription SET DEFAULT 'free'::subscription_plan;

-- Backfill: any existing user still on 'trial' becomes 'free'
UPDATE public.profiles SET subscription = 'free', trial_ends_at = NULL WHERE subscription = 'trial';

-- Update signup trigger so new users start on FREE with no trial period
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, subscription, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'Student'),
    'free',
    NULL
  );
  RETURN NEW;
END;
$function$;