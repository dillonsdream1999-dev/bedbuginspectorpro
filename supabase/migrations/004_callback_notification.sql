-- Callback Notification System
-- Migration: 004_callback_notification
-- Description: Notify territory owners when customers request callbacks

-- ============================================
-- NOTIFICATION FUNCTION
-- ============================================
-- Function to notify the territory owner when a callback is requested
-- This function gets the company owner's email and can send notifications

CREATE OR REPLACE FUNCTION notify_territory_owner_callback()
RETURNS TRIGGER AS $$
DECLARE
  owner_email TEXT;
  company_name TEXT;
  company_phone TEXT;
  notification_sent BOOLEAN := FALSE;
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

  -- If we found the owner's email, we can send notification
  -- For now, we'll log it. You can extend this to send emails via:
  -- 1. Supabase Edge Functions (recommended)
  -- 2. External email API (SendGrid, Mailgun, etc.)
  -- 3. Webhook to your backend service

  IF owner_email IS NOT NULL THEN
    -- Log the notification (you can extend this to actually send email)
    RAISE NOTICE 'Callback notification for company: %, Owner email: %, Lead ID: %, Customer: % (%)',
      company_name,
      owner_email,
      NEW.id,
      NEW.customer_name,
      NEW.customer_phone;
    
    notification_sent := TRUE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER
-- ============================================
-- Trigger that fires when a callback lead is created

DROP TRIGGER IF EXISTS trigger_notify_callback ON leads;
CREATE TRIGGER trigger_notify_callback
  AFTER INSERT ON leads
  FOR EACH ROW
  WHEN (NEW.contact_pref = 'callback' AND NEW.provider_id IS NOT NULL)
  EXECUTE FUNCTION notify_territory_owner_callback();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION notify_territory_owner_callback() IS 
  'Notifies territory owner when a callback request is created. Currently logs the notification. Can be extended to send emails via Edge Functions or external API.';

COMMENT ON TRIGGER trigger_notify_callback ON leads IS 
  'Automatically notifies territory owner when a callback lead is created.';



