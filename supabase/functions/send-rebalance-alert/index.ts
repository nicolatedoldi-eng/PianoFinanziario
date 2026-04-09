import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FROM_EMAIL = 'PianoFinanziario <noreply@pianofinanziario.app>'

const REBALANCE_CONTENT: Record<string, { checks: string[]; nextDate: string }> = {
  dormiglione: { checks: ['VWCE è ancora intorno all\'80%? (range: 75-85%)', 'AGGH è ancora intorno al 20%? (range: 15-25%)', 'Se uno si è allontanato di oltre 5 punti, ribilancia'], nextDate: 'tra 1 mese' },
  prudente: { checks: ['SWRD tra 35-45%?', 'IBTM tra 30-40%?', 'SGLE tra 10-20%?', 'XEON tra 5-15%?'], nextDate: 'tra 6 mesi' },
  bilanciato: { checks: ['Azionario totale (VWCE+EIMI) tra 60-70%?', 'AGGH tra 20-30%?', 'SGLE tra 5-15%?'], nextDate: 'tra 6 mesi' },
  crescita: { checks: ['VWCE tra 53-67%?', 'EIMI tra 10-20%?', 'ZPRV tra 8-22%?', 'SGLE tra 5-15%?'], nextDate: 'tra 1 mese' },
}

serve(async () => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const now = new Date()
    const { data: profiles } = await supabase.from('user_profiles').select('*').eq('onboarding_completed', true)
    if (!profiles) return new Response(JSON.stringify({ sent: 0 }))

    let sent = 0
    for (const profile of profiles) {
      const isMonthly = ['dormiglione', 'crescita'].includes(profile.profile)
      const lastCheck = profile.last_rebalance_at ? new Date(profile.last_rebalance_at) : new Date(profile.created_at)
      const daysSince = Math.floor((now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24))
      if (isMonthly ? daysSince < 30 : daysSince < 180) continue

      const content = REBALANCE_CONTENT[profile.profile]
      if (!content) continue

      const checksHtml = content.checks.map(c => `<li style="margin-bottom:8px;">${c}</li>`).join('')
      const html = `<!DOCTYPE html><html lang="it"><head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;background:#F9FAFB;margin:0;padding:40px 20px;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden;">
<div style="background:#EF9F27;padding:28px;text-align:center;"><h1 style="color:white;margin:0;font-size:22px;">È il momento di controllare il tuo portafoglio</h1></div>
<div style="padding:32px;"><div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:20px;margin-bottom:24px;">
<ul style="margin:0;padding-left:20px;">${checksHtml}</ul></div>
<p style="color:#6B7280;font-size:14px;">Prossimo controllo: ${content.nextDate}</p></div>
<div style="padding:20px 32px;border-top:1px solid #E5E7EB;text-align:center;"><p style="color:#9CA3AF;font-size:12px;margin:0;">Strumento educativo.</p></div></div></body></html>`

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM_EMAIL, to: profile.email, subject: 'È il momento di controllare il tuo portafoglio ⚖️', html }),
      })
      await supabase.from('user_profiles').update({ last_rebalance_at: now.toISOString() }).eq('id', profile.id)
      sent++
    }
    return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})
