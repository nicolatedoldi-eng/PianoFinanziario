import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function ProModal({ onClose }) {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
            style={{ backgroundColor: '#EEF0FB' }}
          >
            📄
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Funzione Pro</h2>
          <p className="text-gray-500 text-sm">
            Questa funzione è riservata al piano Pro. Sblocca scenari avanzati, confronto portafogli, crescita PAC personalizzabile e download PDF.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEF2F2', color: '#E24B4A' }}>
            {error}
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-gray-900">€7,99</span>
            <span className="text-gray-400 text-sm">/mese</span>
          </div>
          <ul className="space-y-2">
            {[
              'Scenari ottimista e ribassista',
              'Confronto tra i 4 profili di investimento',
              'Crescita PAC personalizzabile',
              'Download PDF del piano personalizzato',
              'Puoi annullare in qualsiasi momento',
            ].map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <span style={{ color: '#1D9E75' }}>✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 mb-3"
          style={{ backgroundColor: '#534AB7' }}
        >
          {loading ? 'Reindirizzamento...' : 'Passa a Pro → €7,99/mese'}
        </button>
        <button
          onClick={onClose}
          className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 transition-colors"
        >
          Annulla
        </button>
      </div>
    </div>
  )
}
