-- Migration: 003_add_company_description_services
-- Description: Add description and services fields to companies table

-- Add description column (TEXT, nullable)
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add services column (TEXT[], nullable) - array of service names
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS services TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN companies.description IS 'Company description/bio for display in provider cards';
COMMENT ON COLUMN companies.services IS 'Array of services offered by the company (e.g., ["Bed Bug Inspection", "Treatment", "Prevention"])';

-- Create index on services for faster queries (if needed for filtering)
CREATE INDEX IF NOT EXISTS idx_companies_services ON companies USING GIN(services);

-- Example: To update a company with description and services, first find the company ID:
-- SELECT id, name FROM companies;
--
-- Then update using the actual UUID:
-- UPDATE companies 
-- SET 
--   description = 'Professional bed bug inspection and treatment services with over 10 years of experience.',
--   services = ARRAY['Bed Bug Inspection', 'Treatment', 'Prevention', 'Follow-up Services']
-- WHERE id = 'actual-uuid-here';
--
-- Or update all companies at once:
-- UPDATE companies 
-- SET 
--   description = COALESCE(description, 'Professional bed bug inspection and treatment services.'),
--   services = COALESCE(services, ARRAY['Bed Bug Inspection', 'Treatment', 'Prevention'])
-- WHERE description IS NULL OR services IS NULL;

