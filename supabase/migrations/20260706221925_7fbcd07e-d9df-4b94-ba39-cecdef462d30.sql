
REVOKE EXECUTE ON FUNCTION public.get_assigned_agent(UUID) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_caretaker_for_agent(UUID) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_agent_bookings() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.assign_agent_to_booking() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_assigned_agent(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_caretaker_for_agent(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_agent_bookings() TO authenticated;
