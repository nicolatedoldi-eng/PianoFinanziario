import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FROM_EMAIL = 'PianoFinanziario <noreply@pianofinanziario.app>'

const REBALANCE_CONTENT: Record<string, { checks: string[]; label: string; nextDate: string }> = {
  essenziale: {
    label: 'annuale',
    checks: [
      'VWCE: deve essere tra il 75% e l\'85%',
      'AGGH: deve essere tra il 15% e il 25%',
    ],
    nextDate: 'tra 12 mesi',
  },
  prudente: {
    label: 'semestrale',
    checks: [
      'SWRD: deve essere tra il 35% e il 45%',
      'IBTM: deve essere tra il 30% e il 40%',
      'SGLE: deve essere tra il 10% e il 20%',
      'XEON: deve essere tra il 5% e il 15%',
    ],
    nextDate: 'tra 6 mesi',
  },
  bilanciato: {
    label: 'semestrale',
    checks: [
      'VWCE + EIMI insieme: devono essere tra il 60% e il 70%',
      'AGGH: deve essere tra il 20% e il 30%',
      'SGLE: deve essere tra il 5% e il 15%',
    ],
    nextDate: 'tra 6 mesi',
  },
  crescita: {
    label: 'annuale',
    checks: [
      'VWCE: deve essere tra il 53% e il 67%',
      'EIMI: deve essere tra il 10% e il 20%',
      'ZPRV: deve essere tra l\'8% e il 22%',
      'SGLE: deve essere tra il 5% e il 15%',
    ],
    nextDate: 'tra 12 mesi',
  },
}

serve(async () => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const now = new Date()
    const { data: profiles } = await supabase.from('user_profiles').select('*').eq('onboarding_completed', true)
    if (!profiles) return new Response(JSON.stringify({ sent: 0 }))

    let sent = 0
    for (const profile of profiles) {
      const isMonthly = ['essenziale', 'crescita'].includes(profile.profile)
      const lastCheck = profile.last_rebalance_at ? new Date(profile.last_rebalance_at) : new Date(profile.created_at)
      const daysSince = Math.floor((now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24))
      if (isMonthly ? daysSince < 30 : daysSince < 180) continue

      const content = REBALANCE_CONTENT[profile.profile]
      if (!content) continue

      const profileName = profile.profile.charAt(0).toUpperCase() + profile.profile.slice(1)

      const checksHtml = content.checks.map(c =>
        `<li style="margin-bottom:10px;color:#1F2937;">&#10003; ${c}</li>`
      ).join('')

      const subject = `Controllo ${content.label} del tuo portafoglio \u2014 ci vogliono 5 minuti`

      const html = `<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,sans-serif;background:#F9FAFB;margin:0;padding:40px 20px;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden;">

  <div style="background:#EF9F27;padding:28px 32px;">
    <h1 style="color:white;margin:0;font-size:22px;font-weight:700;">PianoFinanziario</h1>
  </div>

  <div style="padding:32px;">
    <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">Ciao,</p>
    <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">è il momento del controllo <strong>${content.label}</strong> del tuo portafoglio <strong>${profileName}</strong>.</p>
    <p style="color:#4B5563;font-size:14px;line-height:1.7;margin:0 0 32px;">Non devi fare nulla di complicato — apri il tuo conto broker, guarda le percentuali attuali e confrontale con i target qui sotto.</p>

    <hr style="border:none;border-top:1px solid #E5E7EB;margin:0 0 28px;">

    <h2 style="color:#111827;font-size:17px;font-weight:700;margin:0 0 16px;">Cosa controllare</h2>

    <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
      <ul style="margin:0;padding-left:4px;list-style:none;">${checksHtml}</ul>
    </div>

    <div style="margin-bottom:24px;">
      <p style="color:#111827;font-size:15px;font-weight:700;margin:0 0 10px;">Se tutto è nei range → non fare nulla.</p>
      <p style="color:#4B5563;font-size:14px;line-height:1.7;margin:0;">Chiudi il broker e torna ${content.nextDate}.</p>
    </div>

    <div style="margin-bottom:32px;">
      <p style="color:#111827;font-size:15px;font-weight:700;margin:0 0 10px;">Se qualcosa è fuori range →</p>
      <p style="color:#4B5563;font-size:14px;line-height:1.7;margin:0 0 10px;">Prima prova a usare il prossimo versamento mensile per comprare di più dell'asset sottopesato. Solo se non basta, vendi una piccola parte dell'asset sovrappesato e riacquista quello sottopesato.</p>
      <p style="color:#6B7280;font-size:13px;line-height:1.6;margin:0;">(Ogni vendita genera un evento fiscale al 26% — meglio usare i versamenti quando possibile.)</p>
    </div>

    <div style="text-align:center;margin-bottom:32px;">
      <a href="${Deno.env.get('SITE_URL') || 'https://piano-finanziario.vercel.app'}/dashboard" style="display:inline-block;background:#EF9F27;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;">Apri la dashboard per i dettagli →</a>
    </div>

    <hr style="border:none;border-top:1px solid #E5E7EB;margin:0 0 24px;">

    <p style="color:#4B5563;font-size:14px;margin:0 0 24px;">Prossimo controllo: <strong>${content.nextDate}</strong></p>

    <p style="color:#9CA3AF;font-size:12px;line-height:1.6;margin:0 0 16px;">PianoFinanziario è uno strumento educativo. Non gestiamo i tuoi soldi. Le decisioni sono sempre tue.</p>
    <p style="color:#374151;font-size:14px;margin:0;">Il team di PianoFinanziario</p>
  </div>

</div>
</body>
</html>`

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM_EMAIL, to: profile.email, subject, html }),
      })
      await supabase.from('user_profiles').update({ last_rebalance_at: now.toISOString() }).eq('id', profile.id)
      sent++
    }
    return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})
