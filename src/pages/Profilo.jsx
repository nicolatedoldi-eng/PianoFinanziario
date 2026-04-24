import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { PORTFOLIOS } from '../lib/portfolios'
import { formatEuroFull } from '../lib/finance'
import { generatePianoPDF } from '../lib/generatePdf'
import ProModal from '../components/ProModal'

export default function Profilo() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [showProModal, setShowProModal] = useState(false)

  const [editParams, setEditParams] = useState({
    initialCapital: 0,
    monthlyPayment: 0,
    horizon: 0,
    annualGrowth: 3,
  })

  useEffect(() => {
    if (!profile) return
    setEditParams({
      initialCapital: profile.initial_capital ?? 0,
      monthlyPayment: profile.monthly_payment ?? 0,
      horizon: profile.horizon_years ?? 15,
      annualGrowth: profile.annual_payment_growth ?? 3,
    })
  }, [profile])

  const handleSaveParams = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          initial_capital: editParams.initialCapital,
          monthly_payment: editParams.monthlyPayment,
          horizon_years: editParams.horizon,
          annual_payment_growth: editParams.annualGrowth,
        })
        .eq('user_id', user.id)

      if (error) throw error
      await refreshProfile()
      setSuccess('Parametri aggiornati!')
      setEditing(false)
    } catch {
      setError('Errore nel salvataggio. Riprova.')
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadPdf = () => {
    if (!profile?.is_pro) {
      setShowProModal(true)
      return
    }
    setGeneratingPdf(true)
    try {
      const params = {
        initialCapital: profile.initial_capital ?? 0,
        monthlyPayment: profile.monthly_payment ?? 0,
        horizon: profile.horizon_years ?? 15,
        annualGrowth: profile.annual_payment_growth ?? 3,
      }
      const portfolio = PORTFOLIOS[profile.profile]
      const doc = generatePianoPDF(portfolio, profile, params)
      const filename = `easivest-piano-${portfolio.name.toLowerCase()}.pdf`
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
      const isAndroid = /Android/i.test(navigator.userAgent)
      if (isIOS) {
        const blob = doc.output('blob')
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
        setTimeout(() => URL.revokeObjectURL(url), 10000)
      } else if (isAndroid) {
        const blob = doc.output('blob')
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        doc.output('dataurlnewwindow', { filename })
      }
    } finally {
      setGeneratingPdf(false)
    }
  }

  const handleRedoOnboarding = async () => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ onboarding_completed: false })
      .eq('user_id', user.id)

    if (!error) navigate('/onboarding')
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Nessun profilo trovato.</p>
          <button onClick={() => navigate('/onboarding')} className="px-6 py-3 rounded-xl text-white font-semibold" style={{ backgroundColor: '#534AB7' }}>
            Completa il percorso guidato
          </button>
        </div>
      </div>
    )
  }

  const portfolio = PORTFOLIOS[profile.profile]
  const createdAt = new Date(profile.created_at).toLocaleDateString('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showProModal && <ProModal onClose={() => setShowProModal(false)} />}

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Il mio profilo</h1>
        {profile.is_pro && (
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
            style={{ backgroundColor: '#534AB7' }}
          >
            PRO
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEF2F2', color: '#E24B4A' }}>{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#ECFDF5', color: '#1D9E75' }}>{success}</div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: portfolio.color }}>
            {portfolio.name[0]}
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{portfolio.name}</div>
            <div className="text-gray-500 text-sm">{portfolio.description}</div>
            <div className="text-sm mt-1" style={{ color: portfolio.color }}>Rendimento atteso: <strong>{portfolio.expectedReturn}%</strong> annuo</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {portfolio.etfs.map(etf => (
            <div key={etf.ticker} className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="font-bold text-gray-900">{etf.ticker}</div>
              <div className="text-xl font-bold" style={{ color: portfolio.color }}>{etf.percentage}%</div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-400 mb-0.5">Data iscrizione</div>
            <div className="font-medium text-gray-900">{createdAt}</div>
          </div>
          <div>
            <div className="text-gray-400 mb-0.5">Ribilanciamento</div>
            <div className="font-medium text-gray-900 capitalize">{portfolio.rebalanceFrequency}</div>
          </div>
          <div>
            <div className="text-gray-400 mb-0.5">Ultimo ribilanciamento</div>
            <div className="font-medium text-gray-900">
              {profile.last_rebalance_at ? new Date(profile.last_rebalance_at).toLocaleDateString('it-IT') : 'Non ancora fatto'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-900">Parametri del piano</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Modifica</button>
          )}
        </div>

        {editing ? (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-1.5"><span className="text-gray-600">Capitale iniziale</span><span className="font-semibold">€{editParams.initialCapital.toLocaleString('it-IT')}</span></div>
              <input type="range" min="0" max="100000" step="500" value={editParams.initialCapital} onChange={e => setEditParams(prev => ({ ...prev, initialCapital: Number(e.target.value) }))} className="w-full accent-[#534AB7]" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5"><span className="text-gray-600">PAC mensile</span><span className="font-semibold">€{editParams.monthlyPayment.toLocaleString('it-IT')}</span></div>
              <input type="range" min="50" max="2000" step="50" value={editParams.monthlyPayment} onChange={e => setEditParams(prev => ({ ...prev, monthlyPayment: Number(e.target.value) }))} className="w-full accent-[#534AB7]" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5"><span className="text-gray-600">Orizzonte</span><span className="font-semibold">{editParams.horizon} anni</span></div>
              <input type="range" min="1" max="35" step="1" value={editParams.horizon} onChange={e => setEditParams(prev => ({ ...prev, horizon: Number(e.target.value) }))} className="w-full accent-[#534AB7]" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5"><span className="text-gray-600">Crescita PAC annua</span><span className="font-semibold">{editParams.annualGrowth}%</span></div>
              <input type="range" min="0" max="10" step="0.5" value={editParams.annualGrowth} onChange={e => setEditParams(prev => ({ ...prev, annualGrowth: Number(e.target.value) }))} className="w-full accent-[#534AB7]" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSaveParams} disabled={saving} className="flex-1 py-3 rounded-xl text-white font-semibold transition-opacity hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: '#534AB7' }}>
                {saving ? 'Salvataggio...' : 'Salva'}
              </button>
              <button onClick={() => setEditing(false)} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Annulla</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Capitale iniziale', value: formatEuroFull(profile.initial_capital ?? 0) },
              { label: 'PAC mensile', value: formatEuroFull(profile.monthly_payment ?? 0) },
              { label: 'Orizzonte', value: `${profile.horizon_years ?? 15} anni` },
              { label: 'Crescita PAC', value: `${profile.annual_payment_growth ?? 3}% annuo` },
            ].map(item => (
              <div key={item.label}>
                <div className="text-sm text-gray-400 mb-0.5">{item.label}</div>
                <div className="font-semibold text-gray-900">{item.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Azioni</h2>
        <div className="flex flex-col gap-3">
          <div>
            <button
              onClick={handleDownloadPdf}
              disabled={generatingPdf}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#534AB7' }}
            >
              {!profile.is_pro && <span>🔒</span>}
              {generatingPdf ? 'Generazione...' : 'Scarica il tuo piano PDF →'}
            </button>
            <p className="text-xs text-gray-400 mt-1.5">
              Il PDF include il tuo profilo, la proiezione finanziaria e gli ETF consigliati.
            </p>
          </div>
          <button onClick={handleRedoOnboarding} className="w-full py-3 rounded-xl border-2 font-semibold text-sm transition-colors" style={{ borderColor: '#534AB7', color: '#534AB7' }}>
            Rifai il percorso guidato
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Rifacendo il percorso guidato potrai scegliere un profilo diverso. I parametri attuali verranno sovrascritti.
        </p>
      </div>
    </div>
  )
}
