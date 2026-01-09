-- Migration: 006_admin_leads_access
-- Description: Ensure admin users can read leads table

-- Check if RLS is enabled on leads table
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'leads' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can view all leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can view leads" ON leads;
DROP POLICY IF EXISTS "Anyone can view leads" ON leads;
DROP POLICY IF EXISTS "Anyone can insert leads" ON leads;
DROP POLICY IF EXISTS "Public can insert leads" ON leads;

-- Create policy to allow authenticated users to read leads
-- This allows admin users (who are authenticated) to view all leads
CREATE POLICY "Authenticated users can view leads" ON leads
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create policy to allow anyone (including anonymous users) to insert leads
-- This allows the app to create leads without requiring authentication
CREATE POLICY "Anyone can insert leads" ON leads
  FOR INSERT
  WITH CHECK (true);

-- Also allow service role to read (for admin operations)
-- Note: Service role bypasses RLS, but this is here for completeness
-- CREATE POLICY "Service role can view leads" ON leads
--   FOR SELECT
--   USING (auth.role() = 'service_role');

-- Ensure the leads table has all expected columns
DO $$
BEGIN
  -- Add customer_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'customer_name'
  ) THEN
    ALTER TABLE leads ADD COLUMN customer_name TEXT;
  END IF;

  -- Add customer_phone if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'customer_phone'
  ) THEN
    ALTER TABLE leads ADD COLUMN customer_phone TEXT;
  END IF;

  -- Add customer_email if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'customer_email'
  ) THEN
    ALTER TABLE leads ADD COLUMN customer_email TEXT;
  END IF;

  -- Add provider_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'provider_id'
  ) THEN
    ALTER TABLE leads ADD COLUMN provider_id UUID;
  END IF;

  -- Add provider_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'provider_name'
  ) THEN
    ALTER TABLE leads ADD COLUMN provider_name TEXT;
  END IF;

  -- Add notes if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'notes'
  ) THEN
    ALTER TABLE leads ADD COLUMN notes TEXT;
  END IF;
END $$;


