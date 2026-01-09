# Edge Function Setup Guide

This guide explains how to set up and deploy the callback notification Edge Function.

## Prerequisites

1. Supabase CLI installed: `npm install -g supabase`
2. Supabase account and project
3. Resend account (for email sending) - Sign up at https://resend.com

## Step-by-Step Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

This will open your browser to authenticate.

### 3. Link Your Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

You can find your project reference in:
- Supabase Dashboard > Settings > API > Project URL
- It's the part after `https://` and before `.supabase.co`
- Example: If your URL is `https://abcdefgh.supabase.co`, your project ref is `abcdefgh`

### 4. Deploy the Edge Function

```bash
supabase functions deploy send-callback-notification
```

### 5. Set Environment Variables

In Supabase Dashboard:

1. Go to **Project Settings** > **Edge Functions** > **Environment Variables**
2. Add the following variables:

   - **RESEND_API_KEY**: Your Resend API key (get from https://resend.com/api-keys)
   - **FROM_EMAIL**: The email address to send from (must be verified in Resend)
     - Example: `noreply@yourdomain.com` or `notifications@yourdomain.com`

### 6. Verify Domain in Resend (Required)

Before sending emails, you must verify your domain in Resend:

1. Go to Resend Dashboard > Domains
2. Add your domain
3. Add the DNS records provided by Resend
4. Wait for verification (usually a few minutes)

**Note:** For testing, Resend provides a test domain, but it's limited. For production, use your own verified domain.

### 7. Update Database Function

Run the migration to enable Edge Function calls:

```sql
-- Run this in Supabase SQL Editor
-- File: supabase/migrations/005_enable_callback_email.sql
```

**Before running, update these values:**

1. Get your Supabase project reference (from Step 3)
2. Get your service role key:
   - Supabase Dashboard > Settings > API
   - Copy the `service_role` key (keep it secret!)

3. Set database settings (run once):

```sql
ALTER DATABASE postgres SET app.supabase_edge_function_url = 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-callback-notification';
ALTER DATABASE postgres SET app.supabase_service_role_key = 'YOUR_SERVICE_ROLE_KEY';
```

4. Then run the migration `005_enable_callback_email.sql`

### 8. Test the Setup

1. Request a callback through the app
2. Check Supabase Dashboard > Edge Functions > Logs
3. Check the owner's email inbox
4. Verify the lead was created in the `leads` table

## Troubleshooting

### Edge Function Not Being Called

1. Check that `pg_net` extension is enabled:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_net;
   ```

2. Verify the Edge Function URL is correct in database settings

3. Check Postgres logs for errors:
   - Supabase Dashboard > Logs > Postgres Logs

### Emails Not Sending

1. Verify `RESEND_API_KEY` is set correctly
2. Verify `FROM_EMAIL` is a verified domain in Resend
3. Check Edge Function logs for errors
4. Verify the owner's email address is correct in the `profiles` table

### Permission Errors

1. Ensure the service role key has the correct permissions
2. Check that the Edge Function has access to the required environment variables

## Alternative: Use Without Edge Functions

If you don't want to set up Edge Functions, the system will still work but only log notifications. You can:

1. Query callback requests directly from the database
2. Set up a cron job to check for new callbacks
3. Use Supabase Database Webhooks to send to an external service

See `docs/CALLBACK_NOTIFICATION_SETUP.md` for more options.



