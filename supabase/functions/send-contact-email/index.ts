import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = 'EasiVest <noreply@easivest.com>'
const TO_EMAIL = 'info@easivest.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { name, email, subject, message } = await req.json()

    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const emailSubject = `[Contatto EasiVest] ${subject} — ${name}`

    const html = `<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;background:#F9FAFB;margin:0;padding:40px 20px;">
<div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;border:1px solid #E5E7EB;overflow:hidden;">
  <div style="background:#534AB7;padding:24px 28px;">
    <h1 style="color:white;margin:0;font-size:18px;font-weight:700;">Nuovo messaggio da EasiVest</h1>
  </div>
  <div style="padding:28px;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
      <tr>
        <td style="padding:8px 0;color:#6B7280;width:100px;">Nome</td>
        <td style="padding:8px 0;color:#111827;font-weight:600;">${name}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6B7280;border-top:1px solid #F3F4F6;">Email</td>
        <td style="padding:8px 0;color:#111827;border-top:1px solid #F3F4F6;">
          <a href="mailto:${email}" style="color:#534AB7;">${email}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6B7280;border-top:1px solid #F3F4F6;">Oggetto</td>
        <td style="padding:8px 0;color:#111827;border-top:1px solid #F3F4F6;">${subject}</td>
      </tr>
    </table>
    <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:16px;">
      <p style="color:#374151;font-size:14px;line-height:1.7;margin:0;white-space:pre-wrap;">${message}</p>
    </div>
  </div>
</div>
</body>
</html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, reply_to: email, to: TO_EMAIL, subject: emailSubject, html }),
    })

    const data = await res.json()
    console.log('Resend response:', res.status, JSON.stringify(data))
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Function error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
