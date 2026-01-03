# Callback Notification Setup

This document explains how the callback notification system works and how to set up email notifications for territory owners.

## Current Implementation

When a customer requests a callback through the app:

1. The callback form collects:
   - Customer name (required)
   - Customer phone (required)
   - Customer email (optional)

2. A lead record is created in the `leads` table with:
   - `contact_pref = 'callback'`
   - `provider_id` (the territory owner's company ID)
   - Customer contact information

3. A database trigger automatically fires and calls `notify_territory_owner_callback()`

4. The function retrieves the company owner's email from the `profiles` table

5. Currently, the function logs the notification (see Supabase logs)

## Setting Up Email Notifications

To actually send email notifications to territory owners, you have several options:

### Option 1: Supabase Edge Functions (Recommended)

1. Create an Edge Function that sends emails:

```typescript
// supabase/functions/send-callback-notification/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { leadId, ownerEmail, customerName, customerPhone, customerEmail, companyName, zip } = await req.json()
  
  // Use an email service (SendGrid, Resend, etc.)
  const emailBody = `
    New Callback Request
    
    Company: ${companyName}
    Customer: ${customerName}
    Phone: ${customerPhone}
    Email: ${customerEmail || 'Not provided'}
    ZIP Code: ${zip}
    Lead ID: ${leadId}
    
    Please contact the customer to schedule a callback.
  `
  
  // Send email via your email service
  // ...
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  })
})
```

2. Update the database function to call the Edge Function:

```sql
-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Update the notification function to call Edge Function
CREATE OR REPLACE FUNCTION notify_territory_owner_callback()
RETURNS TRIGGER AS $$
DECLARE
  owner_email TEXT;
  company_name TEXT;
  notification_response JSONB;
BEGIN
  IF NEW.contact_pref != 'callback' OR NEW.provider_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT p.email, c.name
  INTO owner_email, company_name
  FROM companies c
  INNER JOIN profiles p ON c.owner_user_id = p.id
  WHERE c.id = NEW.provider_id;

  IF owner_email IS NOT NULL THEN
    -- Call Edge Function
    SELECT net.http_post(
      url := 'https://YOUR_PROJECT.supabase.co/functions/v1/send-callback-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
      ),
      body := jsonb_build_object(
        'leadId', NEW.id,
        'ownerEmail', owner_email,
        'customerName', NEW.customer_name,
        'customerPhone', NEW.customer_phone,
        'customerEmail', NEW.customer_email,
        'companyName', company_name,
        'zip', NEW.zip
      )
    ) INTO notification_response;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Option 2: External Email API (SendGrid, Mailgun, Resend)

1. Create a webhook endpoint that receives callback notifications
2. Update the database function to call the webhook via `pg_net`
3. The webhook sends emails using your email service

### Option 3: Supabase Database Webhooks

1. Set up a Database Webhook in Supabase Dashboard
2. Configure it to trigger on `leads` table INSERT
3. Filter for `contact_pref = 'callback'`
4. Send webhook to your backend service
5. Backend service sends email notifications

## Testing

To test the notification system:

1. Request a callback through the app
2. Check Supabase logs for the NOTICE message:
   ```
   Callback notification for company: [Company Name], Owner email: [email], Lead ID: [id], Customer: [name] ([phone])
   ```
3. Verify the lead was created in the `leads` table
4. Verify the owner email was retrieved correctly

## Querying Callback Leads

To view all callback requests for a specific company:

```sql
SELECT 
  l.id,
  l.created_at,
  l.customer_name,
  l.customer_phone,
  l.customer_email,
  l.zip,
  l.room_type,
  l.notes,
  c.name AS company_name
FROM leads l
INNER JOIN companies c ON l.provider_id = c.id
WHERE l.contact_pref = 'callback'
  AND l.provider_id = 'YOUR_COMPANY_ID'
ORDER BY l.created_at DESC;
```

## Next Steps

1. Choose an email notification method (Edge Functions recommended)
2. Set up your email service (SendGrid, Resend, etc.)
3. Update the notification function to actually send emails
4. Test the full flow end-to-end
5. Consider adding email templates for better formatting

