-- Database Check Script
-- Run this in your Supabase SQL Editor to verify the database schema

-- 1. Check if companies table has description and services columns
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
    AND column_name IN ('description', 'services')
ORDER BY column_name;

-- 2. Check all columns in companies table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'companies'
ORDER BY ordinal_position;

-- 3. Check if the services index exists
SELECT 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE tablename = 'companies' 
    AND indexname = 'idx_companies_services';

-- 4. View current companies data (showing id, name, and new fields)
SELECT 
    id,
    name,
    company_name,
    description,
    services,
    phone,
    email
FROM companies
LIMIT 10;

-- 5. Count companies with and without description/services
SELECT 
    COUNT(*) as total_companies,
    COUNT(description) as companies_with_description,
    COUNT(services) as companies_with_services,
    COUNT(*) FILTER (WHERE description IS NULL AND services IS NULL) as companies_needing_update
FROM companies;




