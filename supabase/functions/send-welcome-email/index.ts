import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = 'PianoFinanziario <noreply@pianofinanziario.app>'

const PROFILE_NAMES: Record<string, string> = {
  essenziale: 'Essenziale',
  prudente: 'Prudente',
  bilanciato: 'Bilanciato',
  crescita: 'Crescita',
}

const PROFILE_FIRST_STEPS: Record<string, string[]> = {
  essenziale: [
    'Apri un conto su Directa, Fineco o DEGIRO (gratuito)',
    'Acquista VWCE (80%) e AGGH (20%) con il tuo capitale iniziale',
    'Imposta un ordine ricorrente mensile con le stesse proporzioni',
  ],
  prudente: [
    'Apri un conto su Directa, Fineco o DEGIRO (gratuito)',
    'Distribuisci il capitale: SWRD 40%, IBTM 35%, SGLE 15%, XEON 10%',
    'Metti in calendario il controllo semestrale (gennaio e luglio)',
  ],
  bilanciato: [
    'Apri un conto su Directa, Fineco o DEGIRO (gratuito)',
    'Distribuisci il capitale: VWCE 55%, EIMI 10%, AGGH 25%, SGLE 10%',
    'Configura il PAC mensile e il controllo semestrale',
  ],
  crescita: [
    'Apri un conto su Directa, Fineco o DEGIRO (gratuito)',
    'Distribuisci il capitale: VWCE 60%, EIMI 15%, ZPRV 15%, SGLE 10%',
    'Configura il PAC mensile e imposta un promemoria mensile per il controllo',
  ],
}

serve(async (req) => {
  try {
    const { email, profile, dashboardUrl } = await req.json()
    const profileName = PROFILE_NAMES[profile] || profile
    const steps = PROFILE_FIRST_STEPS[profile] || []
    const stepsHtml = steps.map((s, i) => `
      <div style="display:flex;gap:12px;margin-bottom:12px;">
        <div style="width:28px;height:28px;border-radius:50%;background:#534AB7;color:white;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex-shrink:0;">${i + 1}</div>
        <p style="margin:0;line-height:1.5;padding-top:4px;">${s}</p>
      </div>
    `).join('')

    const html = `<!DOCTYPE html><html lang="it"><head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;background:#F9FAFB;margin:0;padding:40px 20px;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden;">
<div style="background:#534AB7;padding:32px;text-align:center;">
<h1 style="color:white;margin:0;font-size:24px;font-weight:700;">Il tuo piano finanziario \u00e8 pronto \ud83c\udf89</h1></div>
<div style="padding:32px;">
<p style="color:#374151;margin-bottom:24px;">Ciao! Il tuo profilo <strong>${profileName}</strong> \u00e8 stato creato con successo.</p>
<div style="background:#EEF0FB;border-radius:12px;padding:20px;margin-bottom:28px;">
<h2 style="color:#534AB7;margin:0 0 16px;font-size:18px;">I tuoi primi 3 passi concreti</h2>${stepsHtml}</div>
<a href="${dashboardUrl}" style="display:block;background:#534AB7;color:white;text-decoration:none;text-align:center;padding:16px;border-radius:12px;font-weight:700;font-size:16px;">Vai alla tua dashboard \u2192</a></div>
<div style="padding:20px 32px;border-top:1px solid #E5E7EB;text-align:center;">
<p style="color:#9CA3AF;font-size:12px;margin:0;">Strumento educativo, non consulenza finanziaria.</p></div></div></body></html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, to: email, subject: 'Il tuo piano finanziario \u00e8 pronto \ud83c\udf89', html }),
    })
    if (!res.ok) throw new Error(JSON.stringify(await res.json()))
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})
