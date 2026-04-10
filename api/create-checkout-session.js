import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, userEmail } = req.body

  if (!userId) {
    return res.status(400).json({ error: 'userId required' })
  }

  const appUrl = process.env.APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173')

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID || 'price_1TKfFmJyUH2vL85IAslzZj8m',
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      metadata: { userId },
      success_url: `${appUrl}/dashboard?upgrade=success`,
      cancel_url: `${appUrl}/prezzi`,
    })

    res.status(200).json({ url: session.url })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
