# Callback Email Setup - Quick Start

## ⚠️ Common Error

If you see this error:
```
ERROR: 42601: syntax error at or near "{"
```

**This means you tried to run TypeScript code as SQL.** 

The TypeScript code in the documentation is for **Supabase Edge Functions**, not SQL queries. You cannot run it directly in the SQL Editor.

## Current Status

✅ **Callback requests are already being logged** - The system is working, but emails are not being sent yet.

You can view callback requests by:
1. Querying the database: `SELECT * FROM leads WHERE contact_pref = 'callback' ORDER BY created_at DESC;`
2. Checking Supabase logs (Dashboard > Logs > Postgres Logs)

## To Enable Email Notifications

You have two options:

### Option 1: Quick Setup (Recommended - ~10 minutes)

1. **Sign up for Resend** (free tier available): https://resend.com
2. **Deploy the Edge Function** (already created for you):
   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase functions deploy send-callback-notification
   ```
3. **Set environment variables** in Supabase Dashboard:
   - Go to Project Settings > Edge Functions > Environment Variables
   - Add `RESEND_API_KEY` (from Resend dashboard)
   - Add `FROM_EMAIL` (your verified email domain)
4. **Run the database migration**:
   - Open `supabase/migrations/005_enable_callback_email.sql`
   - Update `YOUR_PROJECT_REF` and `YOUR_SERVICE_ROLE_KEY`
   - Run in Supabase SQL Editor

**Full instructions:** See `docs/EDGE_FUNCTION_SETUP.md`

### Option 2: Keep Logging Only (No Setup Required)

The current setup already logs all callback requests. You can:
- Query the database to see callback requests
- Set up email notifications later when ready
- Use the logged data to manually contact customers

**No action needed** - the system is working, just without email notifications.

## Files Created

- ✅ `supabase/functions/send-callback-notification/index.ts` - Edge Function code
- ✅ `supabase/migrations/005_enable_callback_email.sql` - Database migration
- ✅ `docs/EDGE_FUNCTION_SETUP.md` - Detailed setup guide
- ✅ `docs/CALLBACK_NOTIFICATION_SETUP.md` - Updated with clear instructions

## Need Help?

1. Check `docs/EDGE_FUNCTION_SETUP.md` for step-by-step instructions
2. Check `docs/CALLBACK_NOTIFICATION_SETUP.md` for all options
3. Verify your callback requests are being created: `SELECT * FROM leads WHERE contact_pref = 'callback';`


