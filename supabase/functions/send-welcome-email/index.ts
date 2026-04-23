import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = 'EasiVest <noreply@easivest.com>'
const REPLY_TO = 'info@easivest.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PORTFOLIO_DATA: Record<string, { expectedReturn: number; etfs: { ticker: string; percentage: number }[] }> = {
  essenziale: {
    expectedReturn: 6.5,
    etfs: [
      { ticker: 'VWCE', percentage: 80 },
      { ticker: 'AGGH', percentage: 20 },
    ],
  },
  prudente: {
    expectedReturn: 5.5,
    etfs: [
      { ticker: 'SWRD', percentage: 40 },
      { ticker: 'IBTM', percentage: 35 },
      { ticker: 'SGLE', percentage: 15 },
      { ticker: 'XEON', percentage: 10 },
    ],
  },
  bilanciato: {
    expectedReturn: 7.5,
    etfs: [
      { ticker: 'VWCE', percentage: 55 },
      { ticker: 'EIMI', percentage: 10 },
      { ticker: 'AGGH', percentage: 25 },
      { ticker: 'SGLE', percentage: 10 },
    ],
  },
  crescita: {
    expectedReturn: 9.5,
    etfs: [
      { ticker: 'VWCE', percentage: 60 },
      { ticker: 'EIMI', percentage: 15 },
      { ticker: 'ZPRV', percentage: 15 },
      { ticker: 'SGLE', percentage: 10 },
    ],
  },
}

function formatEuro(n: number): string {
  if (n >= 1000000) return `€${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `€${(n / 1000).toFixed(0)}K`
  return `€${n.toLocaleString('it-IT')}`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, profile, dashboardUrl, initialCapital, monthlyPayment } = await req.json()
    const portfolioKey = (profile || '').toLowerCase()
    const portfolioInfo = PORTFOLIO_DATA[portfolioKey]
    if (!portfolioInfo) {
      return new Response(JSON.stringify({ error: 'Invalid profile' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const profileName = portfolioKey.charAt(0).toUpperCase() + portfolioKey.slice(1)
    const capital = initialCapital ?? 0
    const monthly = monthlyPayment ?? 0

    const etfRowsHtml = portfolioInfo.etfs.map(etf => {
      const amount = Math.round(capital * etf.percentage / 100)
      return `<tr>
        <td style="padding:8px 12px;font-weight:600;color:#1F2937;border-bottom:1px solid #F3F4F6;">${etf.ticker}</td>
        <td style="padding:8px 12px;color:#4B5563;border-bottom:1px solid #F3F4F6;">${etf.percentage}%</td>
        <td style="padding:8px 12px;color:#1D9E75;font-weight:600;border-bottom:1px solid #F3F4F6;">${formatEuro(amount)}</td>
      </tr>`
    }).join('')

    const subject = `Il tuo piano ${profileName} è pronto`

    const html = `<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,sans-serif;background:#F9FAFB;margin:0;padding:40px 20px;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden;">

  <div style="background:#534AB7;padding:28px 32px;">
    <h1 style="color:white;margin:0;font-size:22px;font-weight:700;">EasiVest</h1>
  </div>

  <div style="padding:32px;">
    <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">Ciao,</p>
    <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">hai appena fatto una cosa che la maggior parte delle persone rimanda per anni.</p>
    <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 32px;">Il tuo profilo è <strong>${profileName}</strong> — rendimento atteso <strong>${portfolioInfo.expectedReturn}%</strong> annuo.</p>

    <hr style="border:none;border-top:1px solid #E5E7EB;margin:0 0 28px;">

    <h2 style="color:#111827;font-size:17px;font-weight:700;margin:0 0 24px;">I tuoi primi 3 passi concreti</h2>

    <div style="margin-bottom:24px;">
      <p style="color:#111827;font-size:15px;font-weight:700;margin:0 0 8px;">1. Apri un conto su un broker</p>
      <p style="color:#4B5563;font-size:14px;line-height:1.7;margin:0;">Fineco, Scalable Capital o Trade Republic sono i più usati in Italia. Gratuiti da aprire, regolamentati, affidabili.</p>
    </div>

    <div style="margin-bottom:24px;">
      <p style="color:#111827;font-size:15px;font-weight:700;margin:0 0 12px;">2. Fai il primo acquisto</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#F9FAFB;">
            <th style="padding:8px 12px;text-align:left;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;">ETF</th>
            <th style="padding:8px 12px;text-align:left;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;">%</th>
            <th style="padding:8px 12px;text-align:left;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;">Importo</th>
          </tr>
        </thead>
        <tbody>${etfRowsHtml}</tbody>
      </table>
      <p style="color:#9CA3AF;font-size:12px;margin:8px 0 0;">(usa gli importi esatti che trovi nella tua dashboard)</p>
    </div>

    <div style="margin-bottom:32px;">
      <p style="color:#111827;font-size:15px;font-weight:700;margin:0 0 8px;">3. Imposta il PAC automatico</p>
      <p style="color:#4B5563;font-size:14px;line-height:1.7;margin:0;"><strong>${formatEuro(monthly)}</strong> al mese, nelle stesse proporzioni. La maggior parte dei broker permette di automatizzarlo — impostalo una volta e non ci pensare più.</p>
    </div>

    <div style="text-align:center;margin-bottom:32px;">
      <a href="${dashboardUrl}" style="display:inline-block;background:#534AB7;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;">Vai alla tua dashboard →</a>
    </div>

    <hr style="border:none;border-top:1px solid #E5E7EB;margin:0 0 24px;">

    <p style="color:#111827;font-size:14px;font-weight:600;margin:0 0 8px;">Una cosa importante prima di iniziare:</p>
    <p style="color:#4B5563;font-size:14px;line-height:1.7;margin:0 0 12px;">I mercati salgono e scendono. Vedrai mesi in rosso — è normale e fa parte del gioco. La strategia funziona solo se la mantieni anche nei momenti difficili.</p>
    <p style="color:#4B5563;font-size:14px;line-height:1.7;margin:0 0 24px;">EasiVest è uno strumento educativo. Non gestiamo i tuoi soldi e non siamo consulenti finanziari. Le decisioni sono sempre tue.</p>

    <p style="color:#374151;font-size:14px;margin:0;">Il team di EasiVest<br><span style="color:#9CA3AF;">info@easivest.com | easivest.com</span></p>
  </div>

</div>
</body>
</html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, reply_to: REPLY_TO, to: email, subject, html }),
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
