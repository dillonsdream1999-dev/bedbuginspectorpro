-- Example: Update companies with description and services
-- Run this AFTER migration 003_add_company_description_services.sql

-- Step 1: View all companies to find their IDs
-- SELECT id, name, phone FROM companies;

-- Step 2: Update a specific company (replace the UUID with an actual one from Step 1)
-- UPDATE companies 
-- SET 
--   description = 'Professional bed bug inspection and treatment services with over 10 years of experience. We provide comprehensive solutions for residential and commercial properties.',
--   services = ARRAY['Bed Bug Inspection', 'Treatment', 'Prevention', 'Follow-up Services', 'Commercial Services']
-- WHERE id = '00000000-0000-0000-0000-000000000000'; -- Replace with actual UUID

-- Step 3: Or update all companies with default values (if they don't have description/services yet)
UPDATE companies 
SET 
  description = COALESCE(description, 'Professional bed bug inspection and treatment services. Licensed and insured pest control experts.'),
  services = COALESCE(services, ARRAY['Bed Bug Inspection', 'Treatment', 'Prevention'])
WHERE description IS NULL OR services IS NULL;








