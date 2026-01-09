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

-- 5. Check contact_pref column type and constraints
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'leads' AND column_name = 'contact_pref';

-- Check for enum type values if it's an enum
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value,
    e.enumsortorder
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%contact%' OR t.typname LIKE '%pref%'
ORDER BY t.typname, e.enumsortorder;

-- Check for CHECK constraints on contact_pref
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'leads'::regclass
AND conname LIKE '%contact_pref%';

-- 6. Try a test insert (this will show the exact error if it fails)
-- Uncomment the line below to test AFTER running migration 008
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

