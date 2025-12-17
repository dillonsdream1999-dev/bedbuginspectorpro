-- HarborCheck Database Schema Update
-- Migration: 002_photo_scan_tables
-- Description: Add tables for photo-based scan workflow

-- ============================================
-- SCAN_STEPS TABLE
-- ============================================
-- Stores individual step data within a photo scan session

CREATE TABLE IF NOT EXISTS scan_steps (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES scan_sessions(id) ON DELETE CASCADE,
    step_key TEXT NOT NULL,
    step_title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'captured', 'reviewed')),
    photo_storage_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scan_steps_session_id ON scan_steps(session_id);
CREATE INDEX IF NOT EXISTS idx_scan_steps_status ON scan_steps(status);

-- Enable RLS
ALTER TABLE scan_steps ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view steps" ON scan_steps
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert steps" ON scan_steps
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update steps" ON scan_steps
    FOR UPDATE USING (true);


-- ============================================
-- UPDATE SCAN_PINS TABLE
-- ============================================
-- Add step_id column to existing scan_pins table if not exists

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scan_pins' AND column_name = 'step_id'
    ) THEN
        ALTER TABLE scan_pins ADD COLUMN step_id UUID REFERENCES scan_steps(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scan_pins' AND column_name = 'x'
    ) THEN
        ALTER TABLE scan_pins ADD COLUMN x FLOAT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scan_pins' AND column_name = 'y'
    ) THEN
        ALTER TABLE scan_pins ADD COLUMN y FLOAT;
    END IF;
END $$;

-- Create index on step_id if not exists
CREATE INDEX IF NOT EXISTS idx_scan_pins_step_id ON scan_pins(step_id);


-- ============================================
-- UPDATE PHOTOS TABLE
-- ============================================
-- Add step_id column to existing photos table if not exists

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'photos' AND column_name = 'step_id'
    ) THEN
        ALTER TABLE photos ADD COLUMN step_id UUID REFERENCES scan_steps(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create index on step_id if not exists
CREATE INDEX IF NOT EXISTS idx_photos_step_id ON photos(step_id);


-- ============================================
-- ENSURE STORAGE BUCKET EXISTS
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('scan-photos', 'scan-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Update storage policies for public access
DROP POLICY IF EXISTS "Anyone can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete photos" ON storage.objects;

CREATE POLICY "Public upload access" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'scan-photos');

CREATE POLICY "Public read access" ON storage.objects
    FOR SELECT USING (bucket_id = 'scan-photos');

CREATE POLICY "Public delete access" ON storage.objects
    FOR DELETE USING (bucket_id = 'scan-photos');


-- ============================================
-- TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_scan_steps_updated_at ON scan_steps;
CREATE TRIGGER update_scan_steps_updated_at
    BEFORE UPDATE ON scan_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

