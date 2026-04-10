import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Debug: verify env vars are available at runtime
  console.log('STRIPE_SECRET_KEY set:', !!process.env.STRIPE_SECRET_KEY)
  console.log('APP_URL:', process.env.APP_URL || '(not set, using VERCEL_URL)')
  console.log('VERCEL_URL:', process.env.VERCEL_URL || '(not set)')

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not configured')
    return res.status(500).json({ error: 'Stripe not configured' })
  }

  // Parse body — Vercel non-Next.js functions may not auto-parse
  let body = req.body
  if (!body || typeof body === 'string') {
    try {
      const chunks = []
      for await (const chunk of req) {
        chunks.push(chunk)
      }
      body = JSON.parse(Buffer.concat(chunks).toString())
    } catch (parseErr) {
      console.error('Body parse error:', parseErr.message)
      return res.status(400).json({ error: 'Invalid JSON body' })
    }
  }

  const { userId, userEmail } = body
  console.log('userId:', userId, '| userEmail:', userEmail)

  if (!userId) {
    return res.status(400).json({ error: 'userId required' })
  }

  // Initialize Stripe inside handler so STRIPE_SECRET_KEY is guaranteed available
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  const appUrl = process.env.APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173')

  const priceId = process.env.STRIPE_PRICE_ID || 'price_1TKfFmJyUH2vL85IAslzZj8m'
  console.log('priceId:', priceId, '| appUrl:', appUrl)

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: userEmail,
      metadata: { userId },
      success_url: `${appUrl}/dashboard?upgrade=success`,
      cancel_url: `${appUrl}/prezzi`,
    })

    console.log('Stripe session created:', session.id)
    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Stripe error:', err.message)
    res.status(500).json({ error: err.message })
  }
}
