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

**IMPORTANT:** The TypeScript code shown below is for Supabase Edge Functions, NOT SQL. Do not try to run it as SQL. Follow the setup steps below.

To actually send email notifications to territory owners, you have several options:

### Option 1: Supabase Edge Functions with Resend (Recommended)

**Step 1: Deploy the Edge Function**

The Edge Function code is already created at `supabase/functions/send-callback-notification/index.ts`. To deploy it:

1. Install Supabase CLI (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. Deploy the function:
   ```bash
   supabase functions deploy send-callback-notification
   ```

5. Set environment variables in Supabase Dashboard:
   - Go to Project Settings > Edge Functions > Environment Variables
   - Add `RESEND_API_KEY` (get from https://resend.com/api-keys)
   - Add `FROM_EMAIL` (e.g., `noreply@yourdomain.com`)

**Step 2: Update the Database Function**

Run the SQL migration to enable Edge Function calls:

```sql
-- Run this in Supabase SQL Editor
-- This is in: supabase/migrations/005_enable_callback_email.sql
```

**The migration file `005_enable_callback_email.sql` contains the updated function.** 

Before running it, you need to:

1. Get your Supabase project reference (found in Dashboard > Settings > API)
2. Get your service role key (found in Dashboard > Settings > API > service_role key)
3. Update the migration file with these values, OR set them as database settings:

```sql
-- Set these as database settings (run once):
ALTER DATABASE postgres SET app.supabase_edge_function_url = 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-callback-notification';
ALTER DATABASE postgres SET app.supabase_service_role_key = 'YOUR_SERVICE_ROLE_KEY';
```

Then run the migration `005_enable_callback_email.sql` in the Supabase SQL Editor.

### Option 2: Use Resend API Directly (Simpler)

If you don't want to use Edge Functions, you can modify the Edge Function to use Resend directly:

1. Sign up for Resend at https://resend.com
2. Get your API key
3. The Edge Function already supports Resend - just set the `RESEND_API_KEY` environment variable

### Option 3: External Email API (SendGrid, Mailgun)

1. Modify the Edge Function (`supabase/functions/send-callback-notification/index.ts`)
2. Replace the Resend API call with your email service's API
3. Deploy the updated function

### Option 4: Supabase Database Webhooks

1. Set up a Database Webhook in Supabase Dashboard
2. Configure it to trigger on `leads` table INSERT
3. Filter for `contact_pref = 'callback'`
4. Send webhook to your backend service
5. Backend service sends email notifications

## Quick Start (No Email Setup Required)

**If you just want to log callback requests (no email setup needed):**

The current setup (migration `004_callback_notification.sql`) already logs all callback requests. You can:

1. View callback requests in Supabase Dashboard > Logs > Postgres Logs
2. Query the `leads` table directly (see query below)
3. Set up email notifications later when ready

## Testing

To test the notification system:

1. Request a callback through the app
2. Check Supabase logs for the NOTICE message:
   ```
   Callback notification for company: [Company Name], Owner email: [email], Lead ID: [id], Customer: [name] ([phone])
   ```
3. Verify the lead was created in the `leads` table
4. If Edge Function is set up, check Edge Function logs in Supabase Dashboard
5. Verify the owner email was retrieved correctly

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


                                                                                                      