import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function TabTracker({ user }) {
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    const emailToSave = user?.email || email
    if (!emailToSave) return
    setLoading(true)
    await supabase.from('tracker_waitlist').upsert({ email: emailToSave }, { onConflict: 'email' })
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="rounded-2xl p-8" style={{ backgroundColor: '#F3F4F6', minHeight: '480px' }}>

      <div className="flex justify-center mb-8">
        <span style={{ backgroundColor: '#EEEDFE', color: '#534AB7', borderRadius: '20px', fontSize: '12px', fontWeight: 600, padding: '4px 14px' }}>
          In arrivo
        </span>
      </div>

      <div className="flex justify-center mb-5">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="14" width="4" height="8" rx="0.5" />
          <rect x="10" y="9" width="4" height="13" rx="0.5" />
          <rect x="18" y="4" width="4" height="18" rx="0.5" />
          <polyline points="4,13 12,8 20,3" />
        </svg>
      </div>

      <h2 className="text-center text-gray-900 mb-3" style={{ fontSize: '18px', fontWeight: 500 }}>
        Tracker PAC — presto disponibile
      </h2>

      <p className="text-center text-gray-500 mb-10 max-w-md mx-auto leading-relaxed" style={{ fontSize: '14px' }}>
        Registra i tuoi versamenti mensili reali e confrontali con il piano teorico.
        Scopri se sei in linea con i tuoi obiettivi — mese per mese.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10" style={{ opacity: 0.6, pointerEvents: 'none' }}>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
            </svg>
          </div>
          <div className="font-semibold text-gray-800 text-sm mb-1">Versamenti reali</div>
          <div className="text-gray-500 text-sm leading-relaxed">Inserisci quanto hai versato ogni mese</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div className="font-semibold text-gray-800 text-sm mb-1">Piano vs realtà</div>
          <div className="text-gray-500 text-sm leading-relaxed">Vedi se stai seguendo il piano o sei indietro</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div className="font-semibold text-gray-800 text-sm mb-1">Alert mensili</div>
          <div className="text-gray-500 text-sm leading-relaxed">Ricevi un promemoria quando è il momento di versare</div>
        </div>
      </div>

      <div className="max-w-sm mx-auto">
        {submitted ? (
          <div className="text-center py-4 px-6 rounded-xl" style={{ backgroundColor: '#EEEDFE' }}>
            <p className="text-sm font-medium" style={{ color: '#534AB7' }}>
              Perfetto! Ti avviseremo non appena il Tracker sarà online.
            </p>
          </div>
        ) : user ? (
          <div className="text-center">
            <p className="text-gray-400 text-xs mb-3">Ti avviseremo su <span className="font-medium">{user.email}</span></p>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#534AB7' }}
            >
              {loading ? 'Salvataggio...' : 'Avvisami quando è pronto →'}
            </button>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Avvisami quando è pronto</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="La tua email"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#534AB7' }}
              />
              <button
                onClick={handleSubmit}
                disabled={loading || !email}
                className="px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 shrink-0"
                style={{ backgroundColor: '#534AB7' }}
              >
                {loading ? '...' : 'Avvisami →'}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
