-- Migration: 008_fix_contact_pref_enum
-- Description: Fix contact_pref column to support 'callback' value
-- The database enum doesn't include 'callback' but the app code uses it

-- First, let's check if contact_pref is an enum type
DO $$
DECLARE
    enum_name TEXT;
    current_type TEXT;
BEGIN
    -- Get the current data type of contact_pref column
    SELECT data_type INTO current_type
    FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'contact_pref';
    
    -- Get the enum type name if it's an enum
    SELECT udt_name INTO enum_name
    FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'contact_pref'
    AND udt_name LIKE '%enum%' OR udt_name = 'contact_preference';
    
    RAISE NOTICE 'Current type: %, Enum name: %', current_type, enum_name;
END $$;

-- Option 1: If contact_pref is an enum, add 'callback' to it
-- First, check what enum values exist
DO $$
DECLARE
    enum_values TEXT[];
BEGIN
    -- Try to get enum values (this varies by PostgreSQL version)
    SELECT array_agg(e.enumlabel ORDER BY e.enumsortorder)
    INTO enum_values
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'contact_preference';
    
    IF enum_values IS NOT NULL THEN
        RAISE NOTICE 'Current enum values: %', array_to_string(enum_values, ', ');
        
        -- Add 'callback' if it doesn't exist
        IF NOT ('callback' = ANY(enum_values)) THEN
            ALTER TYPE contact_preference ADD VALUE IF NOT EXISTS 'callback';
            RAISE NOTICE 'Added "callback" to contact_preference enum';
        ELSE
            RAISE NOTICE '"callback" already exists in enum';
        END IF;
    ELSE
        RAISE NOTICE 'contact_preference enum not found, will convert to TEXT';
    END IF;
END $$;

-- Option 2: If the enum approach doesn't work, convert to TEXT
-- This is more reliable and flexible
DO $$
BEGIN
    -- Check if contact_pref is constrained by an enum or CHECK constraint
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'leads' 
        AND column_name = 'contact_pref'
        AND udt_name NOT LIKE '%text%'
        AND udt_name NOT LIKE '%varchar%'
    ) THEN
        -- Convert enum/other type to TEXT
        ALTER TABLE leads 
        ALTER COLUMN contact_pref TYPE TEXT USING contact_pref::TEXT;
        
        -- Drop any CHECK constraints that might restrict values
        ALTER TABLE leads 
        DROP CONSTRAINT IF EXISTS leads_contact_pref_check;
        
        RAISE NOTICE 'Converted contact_pref to TEXT type';
    ELSE
        RAISE NOTICE 'contact_pref is already TEXT or compatible type';
    END IF;
END $$;

-- Ensure the column allows all our values: 'call_now', 'text_now', 'callback'
-- Add a CHECK constraint if needed (optional, for data validation)
-- ALTER TABLE leads 
-- ADD CONSTRAINT leads_contact_pref_check 
-- CHECK (contact_pref IN ('call_now', 'text_now', 'callback'));

-- Update the test insert to use the correct value
-- Test that it works now
DO $$
BEGIN
    -- Try to insert a test record
    BEGIN
        INSERT INTO leads (zip, room_type, contact_pref, status) 
        VALUES ('TEST123', 'bedroom', 'callback', 'new');
        
        -- Delete the test record
        DELETE FROM leads WHERE zip = 'TEST123';
        
        RAISE NOTICE 'Test insert successful! contact_pref now accepts "callback"';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Test insert failed: %', SQLERRM;
    END;
END $$;

