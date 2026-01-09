-- Enable Callback Email Notifications
-- Migration: 005_enable_callback_email
-- Description: Updates the callback notification function to call Edge Function for email sending

-- Enable pg_net extension for HTTP requests (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Get Supabase project URL from environment or use placeholder
-- You'll need to replace YOUR_PROJECT_REF with your actual Supabase project reference
-- You can find this in your Supabase dashboard under Settings > API

-- Update the notification function to call Edge Function
CREATE OR REPLACE FUNCTION notify_territory_owner_callback()
RETURNS TRIGGER AS $$
DECLARE
  owner_email TEXT;
  company_name TEXT;
  company_phone TEXT;
  edge_function_url TEXT;
  service_role_key TEXT;
  notification_response JSONB;
BEGIN
  -- Only process callback requests
  IF NEW.contact_pref != 'callback' OR NEW.provider_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get company owner's email from the provider
  SELECT 
    p.email,
    c.name,
    c.phone
  INTO 
    owner_email,
    company_name,
    company_phone
  FROM companies c
  INNER JOIN profiles p ON c.owner_user_id = p.id
  WHERE c.id = NEW.provider_id;

  IF owner_email IS NOT NULL THEN
    -- Log the notification
    RAISE NOTICE 'Callback notification for company: %, Owner email: %, Lead ID: %, Customer: % (%)',
      company_name,
      owner_email,
      NEW.id,
      NEW.customer_name,
      NEW.customer_phone;
    
    -- Try to call Edge Function if configured
    -- Replace 'YOUR_PROJECT_REF' with your actual Supabase project reference
    -- Replace 'YOUR_SERVICE_ROLE_KEY' with your service role key (found in Supabase dashboard)
    -- You can also set these as database secrets using:
    -- ALTER DATABASE postgres SET supabase.project_ref = 'your-project-ref';
    -- ALTER DATABASE postgres SET supabase.service_role_key = 'your-service-role-key';
    
    BEGIN
      -- Get project URL and service role key from database settings or use defaults
      -- In production, you should store these as secrets
      edge_function_url := current_setting('app.supabase_edge_function_url', true);
      service_role_key := current_setting('app.supabase_service_role_key', true);
      
      -- If not set, use placeholder (you must configure these)
      IF edge_function_url IS NULL OR edge_function_url = '' THEN
        edge_function_url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-callback-notification';
      END IF;
      
      IF service_role_key IS NULL OR service_role_key = '' THEN
        -- Log warning but continue
        RAISE WARNING 'Service role key not configured. Edge Function call will fail.';
        service_role_key := 'YOUR_SERVICE_ROLE_KEY';
      END IF;
      
      -- Call Edge Function via HTTP
      SELECT net.http_post(
        url := edge_function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
          'leadId', NEW.id::text,
          'ownerEmail', owner_email,
          'customerName', NEW.customer_name,
          'customerPhone', NEW.customer_phone,
          'customerEmail', NEW.customer_email,
          'companyName', company_name,
          'zip', NEW.zip
        )
      ) INTO notification_response;
      
      RAISE NOTICE 'Edge Function called. Response: %', notification_response;
      
    EXCEPTION WHEN OTHERS THEN
      -- If Edge Function call fails, log error but don't fail the trigger
      RAISE WARNING 'Failed to call Edge Function: %', SQLERRM;
      -- Continue - the notification was still logged above
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update function comment
COMMENT ON FUNCTION notify_territory_owner_callback() IS 
  'Notifies territory owner when a callback request is created. Logs notification and attempts to call Edge Function for email sending. Configure Edge Function URL and service role key for email functionality.';




