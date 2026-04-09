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

      const capital = estimateCapital(profile.initial_capital ?? 0, profile.monthly_payment ?? 0, profile.annual_return ?? 6.5, 1, profile.annual_payment_growth ?? 3)
      const profileName = profile.profile.charAt(0).toUpperCase() + profile.profile.slice(1)

      const html = `<!DOCTYPE html><html lang="it"><head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;background:#F9FAFB;margin:0;padding:40px 20px;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden;">
<div style="background:#1D9E75;padding:28px;text-align:center;"><div style="font-size:40px;">🎂</div>
<h1 style="color:white;margin:0;font-size:22px;">Un anno di piano finanziario</h1></div>
<div style="padding:32px;">
<p style="color:#374151;margin-bottom:24px;">È passato un anno dalla creazione del tuo piano con profilo <strong>${profileName}</strong>. Complimenti per la costanza!</p>
<div style="background:#ECFDF5;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
<p style="color:#065F46;margin:0 0 8px;font-size:14px;">Stima del tuo capitale dopo 1 anno</p>
<div style="color:#1D9E75;font-size:40px;font-weight:700;">${formatEuro(capital)}</div></div></div>
<div style="padding:20px 32px;border-top:1px solid #E5E7EB;text-align:center;"><p style="color:#9CA3AF;font-size:12px;margin:0;">Strumento educativo. Non è consulenza finanziaria.</p></div></div></body></html>`

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM_EMAIL, to: profile.email, subject: 'Un anno di piano finanziario 🎂', html }),
      })
      sent++
    }
    return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})
