-- Diagnostic script to check leads table and RLS policies
-- Run this in Supabase SQL Editor to diagnose issues

-- 1. Check if table exists and show structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'leads'
ORDER BY ordinal_position;

-- 2. Check RLS status
SELECT 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'leads';

-- 3. Check existing RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'leads';

-- 4. Check current auth role (run this as the anon user to see what role is used)
SELECT auth.role();

-- 5. Try a test insert (this will show the exact error if it fails)
-- Uncomment the line below to test
-- INSERT INTO leads (zip, room_type, contact_pref, status) 
-- VALUES ('12345', 'bedroom', 'callback', 'new') 
-- RETURNING id, zip, created_at;

-- 6. Count existing leads
SELECT COUNT(*) as total_leads FROM leads;

-- 7. Show recent leads (if any)
SELECT id, zip, room_type, contact_pref, status, created_at 
FROM leads 
ORDER BY created_at DESC 
LIMIT 10;

