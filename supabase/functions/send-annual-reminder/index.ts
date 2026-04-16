import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FROM_EMAIL = 'PianoFinanziario <noreply@pianofinanziario.app>'

function estimateCapital(initialCapital: number, monthlyPayment: number, annualReturn: number, years: number, annualGrowth = 3): number {
  const monthlyRate = annualReturn / 100 / 12
  let capital = initialCapital
  let currentMonthly = monthlyPayment
  for (let m = 1; m <= years * 12; m++) {
    capital = capital * (1 + monthlyRate) + currentMonthly
    if (m % 12 === 0) currentMonthly *= 1 + annualGrowth / 100
  }
  return Math.round(capital)
}

function estimateTotalDeposited(initialCapital: number, monthlyPayment: number, years: number, annualGrowth = 3): number {
  let total = initialCapital
  let currentMonthly = monthlyPayment
  for (let y = 0; y < years; y++) {
    total += currentMonthly * 12
    currentMonthly *= 1 + annualGrowth / 100
  }
  return Math.round(total)
}

function formatEuro(n: number): string {
  if (n >= 1000000) return `€${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `€${(n / 1000).toFixed(0)}K`
  return `€${n.toLocaleString('it-IT')}`
}

serve(async () => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const now = new Date()
    const { data: profiles } = await supabase.from('user_profiles').select('*').eq('onboarding_completed', true)
    if (!profiles) return new Response(JSON.stringify({ sent: 0 }))

    let sent = 0
    for (const profile of profiles) {
      const createdAt = new Date(profile.created_at)
      const monthsSince = Math.round((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365 / 12))
      if (monthsSince !== 12) continue

      const initial = profile.initial_capital ?? 0
      const monthly = profile.monthly_payment ?? 0
      const annualReturn = profile.annual_return ?? 6.5
      const annualGrowth = profile.annual_payment_growth ?? 3

      const capital = estimateCapital(initial, monthly, annualReturn, 1, annualGrowth)
      const deposited = estimateTotalDeposited(initial, monthly, 1, annualGrowth)
      const interests = Math.max(0, capital - deposited)

      const profileName = profile.profile.charAt(0).toUpperCase() + profile.profile.slice(1)

      const subject = 'Un anno fa hai fatto la cosa giusta \u2014 ecco dove sei adesso'

      const html = `<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,sans-serif;background:#F9FAFB;margin:0;padding:40px 20px;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden;">

  <div style="background:#1D9E75;padding:28px 32px;">
    <h1 style="color:white;margin:0;font-size:22px;font-weight:700;">PianoFinanziario</h1>
  </div>

  <div style="padding:32px;">
    <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">Ciao,</p>
    <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">un anno fa hai creato il tuo piano con profilo <strong>${profileName}</strong>.</p>
    <p style="color:#4B5563;font-size:14px;line-height:1.7;margin:0 0 32px;">Non è poco. La maggior parte delle persone che “ci pensa” non arriva mai al primo passo. Tu l’hai fatto.</p>

    <hr style="border:none;border-top:1px solid #E5E7EB;margin:0 0 28px;">

    <h2 style="color:#111827;font-size:17px;font-weight:700;margin:0 0 20px;">Il tuo percorso in numeri</h2>

    <div style="background:#ECFDF5;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
      <p style="color:#065F46;font-size:13px;margin:0 0 6px;">Capitale stimato oggi</p>
      <div style="color:#1D9E75;font-size:38px;font-weight:700;margin-bottom:16px;">${formatEuro(capital)}</div>
      <div style="font-size:13px;color:#065F46;text-align:left;display:inline-block;">
        <p style="margin:2px 0;">· Capitale iniziale: <strong>${formatEuro(initial)}</strong></p>
        <p style="margin:2px 0;">· PAC mensile: <strong>${formatEuro(monthly)}</strong></p>
        <p style="margin:2px 0;">· Rendimento atteso: <strong>${annualReturn}%</strong></p>
        <p style="margin:2px 0;">· Crescita PAC annua: <strong>3%</strong></p>
      </div>
    </div>

    <div style="display:flex;gap:12px;margin-bottom:32px;">
      <div style="flex:1;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:16px;text-align:center;">
        <p style="color:#6B7280;font-size:12px;margin:0 0 4px;">Versato in totale (stima)</p>
        <p style="color:#111827;font-size:20px;font-weight:700;margin:0;">${formatEuro(deposited)}</p>
      </div>
      <div style="flex:1;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:16px;text-align:center;">
        <p style="color:#6B7280;font-size:12px;margin:0 0 4px;">Di cui interessi stimati</p>
        <p style="color:#1D9E75;font-size:20px;font-weight:700;margin:0;">${formatEuro(interests)}</p>
      </div>
    </div>

    <p style="color:#6B7280;font-size:12px;line-height:1.6;margin:-20px 0 28px;">Gli interessi stimati sono soldi che il mercato ha generato per te, non soldi che hai versato tu.</p>

    <hr style="border:none;border-top:1px solid #E5E7EB;margin:0 0 28px;">

    <h2 style="color:#111827;font-size:17px;font-weight:700;margin:0 0 12px;">Una cosa da fare adesso</h2>
    <p style="color:#4B5563;font-size:14px;line-height:1.7;margin:0 0 12px;">Il tuo reddito è cambiato nell’ultimo anno? Anche aumentare il PAC di €50 al mese fa una differenza enorme nel lungo periodo.</p>
    <p style="color:#4B5563;font-size:14px;line-height:1.7;margin:0 0 24px;">€50/mese in più per 14 anni ancora significano circa €15.000 in più al traguardo — solo grazie all’interesse composto.</p>

    <div style="text-align:center;margin-bottom:32px;">
      <a href="${Deno.env.get('SITE_URL') || 'https://piano-finanziario.vercel.app'}/profilo" style="display:inline-block;background:#1D9E75;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;">Aggiorna il tuo PAC mensile →</a>
    </div>

    <hr style="border:none;border-top:1px solid #E5E7EB;margin:0 0 28px;">

    <h2 style="color:#111827;font-size:17px;font-weight:700;margin:0 0 12px;">Cosa aspettarti dal prossimo anno</h2>
    <p style="color:#4B5563;font-size:14px;line-height:1.7;margin:0 0 12px;">I mercati fanno quello che vogliono nel breve periodo. La tua strategia no — rimane quella giusta finché il tuo profilo di rischio e il tuo orizzonte non cambiano.</p>
    <p style="color:#4B5563;font-size:14px;line-height:1.7;margin:0 0 24px;">Continua a versare regolarmente. Non guardare il portafoglio ogni giorno. Controlla solo quando te lo diciamo noi.</p>

    <div style="text-align:center;margin-bottom:32px;">
      <a href="${Deno.env.get('SITE_URL') || 'https://piano-finanziario.vercel.app'}/dashboard" style="display:inline-block;background:#1D9E75;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;">Vai alla tua dashboard →</a>
    </div>

    <hr style="border:none;border-top:1px solid #E5E7EB;margin:0 0 20px;">

    <p style="color:#9CA3AF;font-size:12px;line-height:1.6;margin:0 0 16px;">PianoFinanziario è uno strumento educativo. I rendimenti mostrati sono stime basate sui dati storici e non garantiscono risultati futuri. Non gestiamo i tuoi soldi e non siamo consulenti finanziari.</p>
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
      sent++
    }
    return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})
