-- Migration: 007_fix_leads_insert
-- Description: Fix RLS policies and ensure leads can be inserted
-- This addresses the issue where leads aren't being saved to the database

-- First, let's check and fix RLS policies
-- Disable RLS temporarily to check if that's the issue (we'll re-enable it)
-- ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- Actually, let's just ensure the policies are correct
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can insert leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can view leads" ON leads;
DROP POLICY IF EXISTS "Public can insert leads" ON leads;
DROP POLICY IF EXISTS "Admin can view all leads" ON leads;
DROP POLICY IF EXISTS "Allow authenticated users to read leads" ON leads;
DROP POLICY IF EXISTS "Allow individual to read their own leads" ON leads;

-- Create INSERT policy that allows ANYONE (including anonymous/anonymous users)
-- This is critical - the app uses anonymous access to create leads
CREATE POLICY "Anyone can insert leads" ON leads
  FOR INSERT
  WITH CHECK (true);

-- Create SELECT policy for authenticated users (admin dashboard)
CREATE POLICY "Authenticated users can view leads" ON leads
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Also allow anonymous users to read their own leads (optional, for future use)
-- CREATE POLICY "Anonymous can read their own leads" ON leads
--   FOR SELECT
--   USING (true); -- Allow all reads for now, can be restricted later

-- Verify the table structure matches what we're inserting
-- Add any missing columns
DO $$
BEGIN
  -- Ensure all required columns exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'id'
  ) THEN
    ALTER TABLE leads ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'zip'
  ) THEN
    ALTER TABLE leads ADD COLUMN zip TEXT NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'room_type'
  ) THEN
    ALTER TABLE leads ADD COLUMN room_type TEXT NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'contact_pref'
  ) THEN
    ALTER TABLE leads ADD COLUMN contact_pref TEXT NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'status'
  ) THEN
    ALTER TABLE leads ADD COLUMN status TEXT NOT NULL DEFAULT 'new';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE leads ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- Test insert (commented out - uncomment to test)
-- This will help verify the policy works
-- INSERT INTO leads (zip, room_type, contact_pref, status)
-- VALUES ('12345', 'bedroom', 'callback', 'new');

-- Grant necessary permissions (if using service role, this might help)
-- GRANT INSERT ON leads TO anon;
-- GRANT INSERT ON leads TO authenticated;
-- GRANT SELECT ON leads TO authenticated;

