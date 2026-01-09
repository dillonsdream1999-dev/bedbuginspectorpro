-- Migration: 001_create_leads_table
-- Description: Create the leads table if it doesn't exist
-- This table stores lead submissions from users

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zip TEXT NOT NULL,
    room_type TEXT NOT NULL,
    session_id UUID,
    contact_pref TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    provider_id UUID,
    provider_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_zip ON leads(zip);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_provider_id ON leads(provider_id) WHERE provider_id IS NOT NULL;

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can view leads" ON leads;
DROP POLICY IF EXISTS "Public can insert leads" ON leads;

-- Policy to allow anyone (including anonymous users) to insert leads
CREATE POLICY "Anyone can insert leads" ON leads
  FOR INSERT
  WITH CHECK (true);

-- Policy to allow authenticated users to read leads (for admin dashboard)
CREATE POLICY "Authenticated users can view leads" ON leads
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_leads_updated_at();

