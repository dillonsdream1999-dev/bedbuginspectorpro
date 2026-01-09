-- Migration: 009_make_territory_id_nullable_or_lookup
-- Description: Handle territory_id requirement for leads table
-- Option 1: Make territory_id nullable (if leads can be created without territory)
-- Option 2: Keep it NOT NULL but ensure it's always provided

-- First, check if territory_id column exists and its current constraints
DO $$
DECLARE
    col_exists BOOLEAN;
    is_nullable BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'territory_id'
    ) INTO col_exists;
    
    IF col_exists THEN
        SELECT is_nullable = 'YES'
        INTO is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'territory_id';
        
        RAISE NOTICE 'territory_id exists, is_nullable: %', is_nullable;
        
        -- If it's NOT NULL and we want to make it nullable (if business logic allows)
        -- Uncomment the line below if leads can exist without a territory
        -- ALTER TABLE leads ALTER COLUMN territory_id DROP NOT NULL;
    ELSE
        RAISE NOTICE 'territory_id column does not exist, will create it';
        -- Create the column as nullable first (safer)
        ALTER TABLE leads ADD COLUMN territory_id UUID;
        
        -- Add foreign key constraint if territories table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'territories') THEN
            ALTER TABLE leads 
            ADD CONSTRAINT fk_leads_territory 
            FOREIGN KEY (territory_id) 
            REFERENCES territories(id) 
            ON DELETE SET NULL;
        END IF;
        
        -- Create index for better query performance
        CREATE INDEX IF NOT EXISTS idx_leads_territory_id ON leads(territory_id) WHERE territory_id IS NOT NULL;
    END IF;
END $$;

-- Note: If you want territory_id to be required, keep it NOT NULL
-- But ensure the application code always provides it when creating leads
-- The code has been updated to pass territoryId from provider lookup

