import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FROM_EMAIL = 'PianoFinanziario <noreply@pianofinanziario.app>'

function estimateCapital(
  initialCapital: number,
  monthlyPayment: number,
  annualReturn: number,
  years: number,
  annualGrowth: number = 3
): number {
  const monthlyRate = annualReturn / 100 / 12
  let capital = initialCapital
  let currentMonthly = monthlyPayment

  for (let m = 1; m <= years * 12; m++) {
    capital = capital * (1 + monthlyRate) + currentMonthly
    if (m % 12 === 0) currentMonthly *= 1 + annualGrowth / 100
  }

  return Math.round(capital)
}

function formatEuro(n: number): string {
  if (n >= 1000000) return `\u20ac${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `\u20ac${(n / 1000).toFixed(0)}K`
  return `\u20ac${n.toLocaleString('it-IT')}`
}

serve(async (_req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const now = new Date()
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('onboarding_completed', true)

    if (!profiles) return new Response(JSON.stringify({ sent: 0 }))

    let sent = 0
    for (const profile of profiles) {
      const createdAt = new Date(profile.created_at)
      const yearsSince = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365)

      const monthsSince = Math.round(yearsSince * 12)
      if (monthsSince !== 12) continue

      const years = Math.round(yearsSince)
      const capital = estimateCapital(
        profile.initial_capital ?? 0,
        profile.monthly_payment ?? 0,
        profile.annual_return ?? 6.5,
        years,
        profile.annual_payment_growth ?? 3
      )

      const profileName = profile.profile.charAt(0).toUpperCase() + profile.profile.slice(1)

      const html = `
<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"><title>Un anno di piano finanziario</title></head>
<body style="font-family:system-ui,sans-serif;background:#F9FAFB;margin:0;padding:40px 20px;">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden;">
    <div style="background:#1D9E75;padding:28px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">\ud83c\udf82</div>
      <h1 style="color:white;margin:0;font-size:22px;font-weight:700;">Un anno di piano finanziario</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Ecco come sta andando il tuo percorso</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#374151;margin-bottom:24px;">
        \u00c8 passato un anno dalla creazione del tuo piano con profilo <strong>${profileName}</strong>.
        Complimenti per la costanza!
      </p>
      <div style="background:#ECFDF5;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
        <p style="color:#065F46;margin:0 0 8px;font-size:14px;">Stima del tuo capitale dopo 1 anno</p>
        <div style="color:#1D9E75;font-size:40px;font-weight:700;margin:0;">${formatEuro(capital)}</div>
        <p style="color:#6B7280;margin:8px 0 0;font-size:12px;">
          Basato su: capitale iniziale ${formatEuro(profile.initial_capital ?? 0)},
          PAC mensile ${formatEuro(profile.monthly_payment ?? 0)},
          rendimento atteso ${profile.annual_return ?? 6.5}%
        </p>
      </div>
      <div style="background:#F9FAFB;border-radius:12px;padding:20px;margin-bottom:24px;">
        <h2 style="color:#374151;margin:0 0 12px;font-size:16px;">Il tuo piano attuale</h2>
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;color:#6B7280;">Profilo</td>
            <td style="padding:6px 0;color:#111827;font-weight:600;text-align:right;">${profileName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6B7280;">PAC mensile</td>
            <td style="padding:6px 0;color:#111827;font-weight:600;text-align:right;">${formatEuro(profile.monthly_payment ?? 0)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6B7280;">Orizzonte</td>
            <td style="padding:6px 0;color:#111827;font-weight:600;text-align:right;">${profile.horizon_years ?? 15} anni</td>
          </tr>
        </table>
      </div>
      <div style="border-left:4px solid #534AB7;padding-left:16px;margin-bottom:24px;">
        <p style="color:#374151;margin:0;font-size:14px;line-height:1.6;">
          <strong>Se il tuo reddito \u00e8 cambiato</strong>, aggiorna il PAC mensile nella tua dashboard.
          Anche +50\u20ac al mese fanno una grande differenza nel lungo periodo.
        </p>
      </div>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #E5E7EB;text-align:center;">
      <p style="color:#9CA3AF;font-size:12px;margin:0;">
        Strumento educativo. Non \u00e8 consulenza finanziaria.<br />
        Le stime sono basate sui rendimenti storici e non garantiscono risultati futuri.
      </p>
    </div>
  </div>
</body>
</html>`

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: profile.email,
          subject: "Un anno di piano finanziario \u2014 ecco com'\u00e8 andata \ud83c\udf82",
          html,
        }),
      })

      sent++
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
