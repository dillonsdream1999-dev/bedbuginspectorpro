// Supabase Edge Function: Send Callback Notification
// This function sends email notifications when customers request callbacks

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@bedbuginspectionpro.com'

serve(async (req) => {
  try {
    const { leadId, ownerEmail, customerName, customerPhone, customerEmail, companyName, zip } = await req.json()
    
    if (!ownerEmail) {
      return new Response(
        JSON.stringify({ error: 'Owner email is required' }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Email subject and body
    const subject = `New Callback Request - ${companyName || 'Bed Bug Inspection Pro'}`
    const emailBody = `
      <h2>New Callback Request</h2>
      <p>A customer has requested a callback through Bed Bug Inspection Pro.</p>
      
      <h3>Customer Information:</h3>
      <ul>
        <li><strong>Name:</strong> ${customerName || 'Not provided'}</li>
        <li><strong>Phone:</strong> ${customerPhone || 'Not provided'}</li>
        <li><strong>Email:</strong> ${customerEmail || 'Not provided'}</li>
        <li><strong>ZIP Code:</strong> ${zip || 'Not provided'}</li>
      </ul>
      
      <h3>Company Details:</h3>
      <ul>
        <li><strong>Company:</strong> ${companyName || 'Unknown'}</li>
        <li><strong>Lead ID:</strong> ${leadId || 'N/A'}</li>
      </ul>
      
      <p><strong>Please contact the customer to schedule a callback.</strong></p>
      
      <hr>
      <p style="color: #666; font-size: 12px;">
        This is an automated notification from Bed Bug Inspection Pro.
      </p>
    `

    // Option 1: Use Resend API (recommended)
    if (RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: ownerEmail,
          subject: subject,
          html: emailBody,
        }),
      })

      if (!resendResponse.ok) {
        const error = await resendResponse.text()
        console.error('Resend API error:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to send email via Resend', details: error }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        )
      }

      const result = await resendResponse.json()
      console.log('Email sent via Resend:', result)
      return new Response(
        JSON.stringify({ success: true, method: 'resend', result }),
        { headers: { "Content-Type": "application/json" } }
      )
    }

    // Option 2: Use Supabase's built-in email (if configured)
    // Note: This requires Supabase to have email configured
    // You can use Supabase's auth.users table or a custom email service
    
    // Option 3: Log and return (fallback)
    console.log('Email notification (no service configured):', {
      to: ownerEmail,
      subject,
      customerName,
      customerPhone,
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        method: 'log',
        message: 'Email service not configured. Notification logged only.',
        note: 'Set RESEND_API_KEY environment variable to enable email sending.'
      }),
      { headers: { "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error('Error in send-callback-notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})



