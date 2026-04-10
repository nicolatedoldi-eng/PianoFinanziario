import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  // Read raw body for Stripe signature verification
  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  const rawBody = Buffer.concat(chunks)

  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata?.userId

    if (userId && session.status === 'complete') {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_pro: true })
        .eq('user_id', userId)

      if (error) {
        console.error('Supabase update error:', error)
        return res.status(500).json({ error: 'DB update failed' })
      }
    }
  }

  res.status(200).json({ received: true })
}
