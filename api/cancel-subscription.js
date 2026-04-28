import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let body = req.body
  if (!body || typeof body === 'string') {
    try {
      const chunks = []
      for await (const chunk of req) { chunks.push(chunk) }
      body = JSON.parse(Buffer.concat(chunks).toString())
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' })
    }
  }

  const { userId, userEmail } = body
  if (!userId) return res.status(400).json({ error: 'userId required' })

  try {
    // Find Stripe customer by email
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 })
    if (!customers.data.length) {
      return res.status(404).json({ error: 'Cliente Stripe non trovato' })
    }

    // Find active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: 'active',
      limit: 1,
    })
    if (!subscriptions.data.length) {
      return res.status(404).json({ error: 'Nessun abbonamento attivo trovato' })
    }

    // Cancel at period end so no future renewal
    await stripe.subscriptions.update(subscriptions.data[0].id, {
      cancel_at_period_end: true,
    })

    // Remove Pro access in Supabase
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_pro: false })
      .eq('user_id', userId)

    if (error) throw error

    res.status(200).json({ success: true })
  } catch (err) {
    console.error('Cancel subscription error:', err)
    res.status(500).json({ error: err.message })
  }
}
