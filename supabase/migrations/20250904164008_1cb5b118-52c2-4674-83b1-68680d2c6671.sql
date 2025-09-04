-- Enable leaked password protection for better security
-- This addresses the security linter warning about password protection

-- Note: This setting is configured in Supabase dashboard, but we can document it
-- The actual setting needs to be enabled in Auth > Settings > Security in Supabase dashboard

-- For now, we'll create a reminder comment
-- SECURITY NOTE: Enable "Leaked password protection" in Supabase Auth settings
-- Go to: Dashboard > Authentication > Settings > Security > Enable "Check passwords against known breaches"

SELECT 1 as security_reminder_created;