-- Simple Callback Logging (No Email Setup Required)
-- Migration: 005_simple_callback_logging
-- Description: Simple version that only logs callback requests (no email setup needed)
-- Use this if you don't want to set up Edge Functions yet

-- This is the same as 004_callback_notification.sql but kept for reference
-- The function already logs callback requests, which you can view in Supabase logs

-- No changes needed - the existing function in 004_callback_notification.sql already logs notifications
-- To view callback requests, check:
-- 1. Supabase Dashboard > Logs > Postgres Logs (for NOTICE messages)
-- 2. Query the leads table: SELECT * FROM leads WHERE contact_pref = 'callback' ORDER BY created_at DESC;

-- If you want to enable email notifications later, use migration 005_enable_callback_email.sql instead




