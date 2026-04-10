import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const FREE_FEATURES = [
  'Simulatore finanziario completo',
  'Tutti e 4 i profili ETF',
  'Calcolo scenari e milestone',
  'Guide al ribilanciamento',
]

const PRO_FEATURES = [
  'Tutto il piano Free',
  'Download PDF del piano personalizzato',
  'Aggiornamenti futuri inclusi',
]

export default function Pricing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/registrazione')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, userEmail: user.email }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Errore nel pagamento. Riprova.')
      }
    } catch {
      setError('Errore nel pagamento. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Semplice e trasparente
        </h1>
        <p className="text-gray-500 text-lg">Tutto gratis. Il PDF in Pro.</p>
      </div>

      {error && (
        <div
          className="mb-6 p-3 rounded-lg text-sm text-center"
          style={{ backgroundColor: '#FEF2F2', color: '#E24B4A' }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Free */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="mb-6">
            <div className="text-sm font-medium text-gray-500 mb-2">Free</div>
            <div className="text-4xl font-bold text-gray-900">€0</div>
            <div className="text-gray-400 text-sm mt-1">per sempre</div>
          </div>
          <ul className="space-y-3 mb-8">
            {FREE_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-0.5 shrink-0" style={{ color: '#1D9E75' }}>✓</span>
                {f}
              </li>
            ))}
          </ul>
          <div className="py-3 rounded-xl border-2 border-gray-200 text-center text-sm font-semibold text-gray-400">
            Piano attuale
          </div>
        </div>

        {/* Pro */}
        <div className="rounded-2xl p-8 border-2" style={{ backgroundColor: '#534AB7', borderColor: '#534AB7' }}>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-white/80">Pro</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                Mensile
              </span>
            </div>
            <div className="text-4xl font-bold text-white">€9</div>
            <div className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>/mese</div>
          </div>
          <ul className="space-y-3 mb-8">
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>
                <span className="mt-0.5 shrink-0 text-white">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#ffffff', color: '#534AB7' }}
          >
            {loading ? 'Reindirizzamento...' : 'Ottieni Pro →'}
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">
        Pagamento sicuro via Stripe. Puoi annullare in qualsiasi momento.
      </p>
    </div>
  )
}
