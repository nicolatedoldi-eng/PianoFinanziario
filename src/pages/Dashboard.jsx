import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ProModal from '../components/ProModal'
import TabTracker from '../components/TabTracker'
import { PORTFOLIOS } from '../lib/portfolios'
import { calculateProjection, calculateScenarios, calculateMilestones, formatEuro, formatEuroFull, generateInsight } from '../lib/finance'
import { generatePianoPDF } from '../lib/generatePdf'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

function GlobalSliders({ params, onChange, isPro }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-4">Parametri del simulatore</h3>
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${isPro ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-600">Capitale iniziale</span>
            <span className="font-semibold" style={{ color: '#534AB7' }}>€{params.initialCapital.toLocaleString('it-IT')}</span>
          </div>
          <input type="range" min="0" max="100000" step="500" value={params.initialCapital}
            onChange={e => onChange('initialCapital', Number(e.target.value))}
            className="w-full accent-[#534AB7]" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-600">PAC mensile</span>
            <span className="font-semibold" style={{ color: '#534AB7' }}>€{params.monthlyPayment.toLocaleString('it-IT')}</span>
          </div>
          <input type="range" min="50" max="2000" step="50" value={params.monthlyPayment}
            onChange={e => onChange('monthlyPayment', Number(e.target.value))}
            className="w-full accent-[#534AB7]" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-600">Orizzonte</span>
            <span className="font-semibold" style={{ color: '#534AB7' }}>{params.horizon} anni</span>
          </div>
          <input type="range" min="1" max="35" step="1" value={params.horizon}
            onChange={e => onChange('horizon', Number(e.target.value))}
            className="w-full accent-[#534AB7]" />
        </div>
        {isPro && (
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-600">Crescita PAC annua</span>
              <span className="font-semibold" style={{ color: '#534AB7' }}>{params.annualGrowth}%</span>
            </div>
            <input type="range" min="0" max="10" step="0.5" value={params.annualGrowth}
              onChange={e => onChange('annualGrowth', Number(e.target.value))}
              className="w-full accent-[#534AB7]" />
          </div>
        )}
      </div>
    </div>
  )
}

function MetricTooltip({ text }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-flex items-center">
      <button
        className="w-4 h-4 rounded-full flex items-center justify-center border border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
        style={{ fontSize: '10px', flexShrink: 0, lineHeight: 1 }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={e => e.preventDefault()}
      >?</button>
      {show && (
        <span
          className="absolute bottom-full left-1/2 mb-2 w-64 rounded-lg p-2.5 shadow-lg z-10 leading-relaxed pointer-events-none"
          style={{ fontSize: '11px', backgroundColor: '#1F2937', color: '#F9FAFB', transform: 'translateX(-50%)', whiteSpace: 'normal' }}
        >
          {text}
        </span>
      )}
    </span>
  )
}

function TabRisparmio({ params, profile }) {
  const result = useMemo(() =>
    calculateProjection(params.initialCapital, params.monthlyPayment, profile.expectedReturn, params.horizon, params.annualGrowth),
    [params, profile]
  )
  const milestones = useMemo(() =>
    calculateMilestones(params.initialCapital, params.monthlyPayment, profile.expectedReturn, params.horizon, params.annualGrowth),
    [params, profile]
  )

  const cards = [
    { label: 'Capitale finale', value: formatEuro(result.finalCapital), color: '#534AB7' },
    { label: 'Totale versato', value: formatEuro(result.totalDeposited), color: '#1D9E75' },
    { label: 'Interessi guadagnati', value: formatEuro(result.totalInterest), color: '#1D9E75' },
    { label: 'Rendita mensile (4%)', value: formatEuro(result.monthlyIncome), color: '#EF9F27' },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
        {cards.map(c => (
          <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
              <span>{c.label}</span>
              {c.label === 'Capitale finale' && (
                <MetricTooltip text={`Calcolato con rendimento annuo del ${profile.expectedReturn}% (scenario base del tuo profilo), capitalizzazione mensile, crescita PAC del ${params.annualGrowth}% annuo.`} />
              )}
            </div>
            <div className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>
      <p className="text-center text-gray-400 mb-6" style={{ fontSize: '11px' }}>
        Rendimento basato sulla performance storica media degli indici azionari globali. I mercati possono salire e scendere nel breve periodo — su orizzonti lunghi la tendenza storica è sempre stata positiva.
      </p>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <p className="text-gray-700 text-sm leading-relaxed">
            {generateInsight(Number(result.multiplier), params.horizon)}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Crescita nel tempo</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={result.dataPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#9CA3AF' }} tickFormatter={v => `${v}a`} />
            <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} tickFormatter={v => formatEuro(v)} width={60} />
            <Tooltip
              formatter={(value, name) => [formatEuroFull(value), name === 'capital' ? 'Capitale totale' : 'Versato']}
              labelFormatter={l => `Anno ${l}`}
              contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
            />
            <Legend formatter={v => v === 'capital' ? 'Capitale totale' : 'Versato'} />
            <Line type="monotone" dataKey="capital" stroke="#534AB7" strokeWidth={2.5} dot={false} name="capital" />
            <Line type="monotone" dataKey="deposited" stroke="#1D9E75" strokeWidth={2} dot={false} strokeDasharray="5 5" name="deposited" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Quando raggiungi le milestone</h3>
        <div className="space-y-3">
          {milestones.map(m => (
            <div key={m.amount} className="flex items-center gap-4">
              <div className="w-20 text-sm font-semibold text-right shrink-0" style={{ color: m.year !== null ? '#534AB7' : '#D1D5DB' }}>
                {formatEuro(m.amount)}
              </div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                {m.year !== null && (
                  <div className="h-full rounded-full" style={{ width: `${Math.min((m.year / params.horizon) * 100, 100)}%`, backgroundColor: '#534AB7' }} />
                )}
              </div>
              <div className="w-28 text-sm text-gray-500 shrink-0">
                {m.year !== null
                  ? `Anno ${m.year}${m.monthInYear > 0 ? ` (mese ${m.monthInYear})` : ''}`
                  : <span className="text-gray-300">Non raggiunto</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TabInvestimento({ params, profile, onProfileChange, allProfiles, isPro, onProClick, userAssignedProfileId }) {
  const scenarios = useMemo(() =>
    calculateScenarios(params.initialCapital, params.monthlyPayment, profile.expectedReturn, params.horizon, params.annualGrowth),
    [params, profile]
  )

  const scenarioData = useMemo(() => {
    const maxLen = Math.max(
      scenarios.optimistic.dataPoints.length,
      scenarios.base.dataPoints.length,
      scenarios.pessimistic.dataPoints.length
    )
    return Array.from({ length: maxLen }, (_, i) => ({
      year: scenarios.base.dataPoints[i]?.year ?? i,
      ottimista: scenarios.optimistic.dataPoints[i]?.capital,
      base: scenarios.base.dataPoints[i]?.capital,
      ribassista: scenarios.pessimistic.dataPoints[i]?.capital,
    }))
  }, [scenarios])

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {Object.values(allProfiles).map(p => {
          const isSelected = profile.id === p.id
          const isLocked = !isPro && p.id !== userAssignedProfileId
          return (
            <button
              key={p.id}
              onClick={() => isLocked ? onProClick() : onProfileChange(p.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                isSelected ? 'shadow-md' : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
              style={
                isSelected
                  ? { borderColor: p.color, backgroundColor: `${p.color}10` }
                  : isLocked ? { borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' } : {}
              }
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold mb-2"
                style={{ backgroundColor: isLocked ? '#D1D5DB' : p.color }}
              >
                {isLocked ? '🔒' : p.name[0]}
              </div>
              <div className={`font-semibold text-sm ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>{p.name}</div>
              <div className="text-xs" style={{ color: isLocked ? '#9CA3AF' : p.color }}>
                {isLocked ? 'Piano Pro' : `${p.expectedReturn}% annuo`}
              </div>
            </button>
          )
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm overflow-x-auto">
        <h3 className="font-semibold text-gray-900 mb-4">Composizione portafoglio</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-4 text-gray-500 font-medium">Ticker</th>
              <th className="text-left py-2 pr-4 text-gray-500 font-medium">Nome</th>
              <th className="text-left py-2 pr-4 text-gray-500 font-medium hidden md:table-cell">ISIN</th>
              <th className="text-right py-2 pr-4 text-gray-500 font-medium">%</th>
              <th className="text-right py-2 pr-4 text-gray-500 font-medium">Importo</th>
              <th className="text-right py-2 text-gray-500 font-medium">PAC/mese</th>
            </tr>
          </thead>
          <tbody>
            {profile.etfs.map(etf => (
              <tr key={etf.ticker} className="border-b border-gray-100">
                <td className="py-3 pr-4 font-bold" style={{ color: profile.color }}>{etf.ticker}</td>
                <td className="py-3 pr-4 text-gray-700">
                  <div>{etf.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{etf.description}</div>
                </td>
                <td className="py-3 pr-4 text-gray-400 font-mono text-xs hidden md:table-cell">{etf.isin}</td>
                <td className="py-3 pr-4 text-right font-semibold">{etf.percentage}%</td>
                <td className="py-3 pr-4 text-right">{formatEuroFull(params.initialCapital * etf.percentage / 100)}</td>
                <td className="py-3 text-right">{formatEuroFull(params.monthlyPayment * etf.percentage / 100)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { key: 'optimistic', label: 'Ottimista', suffix: `+2% (${profile.expectedReturn + 2}%)`, color: '#1D9E75', value: scenarios.optimistic.finalCapital },
          { key: 'base', label: 'Base', suffix: `${profile.expectedReturn}%`, color: '#534AB7', value: scenarios.base.finalCapital },
          { key: 'pessimistic', label: 'Ribassista', suffix: `-2% (${profile.expectedReturn - 2}%)`, color: '#EF9F27', value: scenarios.pessimistic.finalCapital },
        ].map(s => {
          const isLocked = !isPro && s.key !== 'base'
          return (
            <div key={s.key} className="relative">
              <div
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
                style={isLocked ? { opacity: 0.3, userSelect: 'none', pointerEvents: 'none' } : {}}
              >
                <div className="text-sm text-gray-500 mb-1">{s.label} ({s.suffix})</div>
                <div className="text-2xl font-bold" style={{ color: s.color }}>{formatEuro(s.value)}</div>
              </div>
              {isLocked && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl cursor-pointer"
                  onClick={onProClick}
                >
                  <span className="text-lg">🔒</span>
                  <span className="text-xs font-medium text-gray-500 text-center px-2">Disponibile nel piano Pro</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="relative mb-6">
        <div
          className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm${!isPro ? ' select-none pointer-events-none' : ''}`}
          style={!isPro ? { filter: 'blur(4px)' } : {}}
        >
          <h3 className="font-semibold text-gray-900 mb-4">I 3 scenari nel tempo</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={scenarioData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#9CA3AF' }} tickFormatter={v => `${v}a`} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} tickFormatter={v => formatEuro(v)} width={60} />
              <Tooltip formatter={(value, name) => [formatEuroFull(value), name]} labelFormatter={l => `Anno ${l}`} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
              <Legend />
              <Line type="monotone" dataKey="ottimista" stroke="#1D9E75" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="base" stroke="#534AB7" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="ribassista" stroke="#EF9F27" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {!isPro && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl cursor-pointer"
            style={{ backgroundColor: 'rgba(255,255,255,0.65)' }}
            onClick={onProClick}
          >
            <span className="text-3xl">🔒</span>
            <span className="text-sm font-semibold text-gray-700">Disponibile nel piano Pro</span>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Come iniziare con il profilo {profile.name}</h3>
        <div className="space-y-4">
          {profile.steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: profile.color }}>{i + 1}</div>
              <p className="text-gray-700 text-sm pt-1">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TabRibilanciamento({ profile }) {
  const phases = [
    { year: '0', label: 'Inizio', desc: 'Apri il conto, acquista gli ETF con le proporzioni del tuo profilo' },
    { year: '1', label: 'Primo controllo', desc: `Verifica le % a ${profile.rebalanceFrequency === 'mensile' ? '1 mese' : '6 mesi'} dall'inizio` },
    { year: '1-5', label: 'Accumulo', desc: 'Continua il PAC mensile, controlla periodicamente. Ignora la volatilità.' },
    { year: '5-10', label: 'Crescita', desc: 'Il compounding inizia a farsi sentire. Aumenta il PAC se puoi.' },
    { year: '10+', label: 'Maturità', desc: 'Valuta di ridurre il rischio man mano che si avvicina il tuo orizzonte' },
  ]

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">La regola per il profilo {profile.name}</h3>
        <p className="text-gray-700 text-sm leading-relaxed">{profile.rebalanceRule}</p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: '#EEF0FB', color: '#534AB7' }}>
          🔔 Frequenza: {profile.rebalanceFrequency}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Quando agire</h3>
        <div className="space-y-3">
          {profile.alerts.map((alert, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl" style={{ backgroundColor: '#FFFBEB' }}>
              <div className="text-xl shrink-0">⚠️</div>
              <div>
                <div className="font-semibold text-gray-900 text-sm mb-1">Se: {alert.when}</div>
                <div className="text-sm text-gray-600">→ {alert.action}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-6">Timeline dell'investimento</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          <div className="space-y-6">
            {phases.map((phase, i) => (
              <div key={i} className="flex gap-4 pl-10 relative">
                <div className="absolute left-2.5 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#534AB7', top: '4px' }}></div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400">Anno {phase.year}</span>
                    <span className="font-semibold text-gray-900 text-sm">{phase.label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{phase.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
        <div className="flex gap-3">
          <div className="text-2xl shrink-0">🚫</div>
          <div>
            <h3 className="font-semibold mb-2" style={{ color: '#E24B4A' }}>L'errore da non fare mai</h3>
            <p className="text-sm leading-relaxed" style={{ color: '#7F1D1D' }}>
              <strong>Non vendere durante i crolli.</strong> Il mercato scende in media del 20-40% ogni 7-10 anni.
              Chi vende trasforma una perdita temporanea in una perdita definitiva. Stoicamente, continua il tuo PAC.
              Chi ha continuato ad investire durante il 2008, il 2020 e il 2022 ha poi visto il patrimonio crescere ai massimi storici.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('risparmio')
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedProfileId, setSelectedProfileId] = useState(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [showProModal, setShowProModal] = useState(false)
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false)

  const [params, setParams] = useState({
    initialCapital: 5000,
    monthlyPayment: 300,
    horizon: 15,
    annualGrowth: 3,
  })

  useEffect(() => {
    async function fetchProfile() {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data && !error) {
        setUserProfile(data)
        setSelectedProfileId(data.profile)
        setParams({
          initialCapital: data.initial_capital ?? 5000,
          monthlyPayment: data.monthly_payment ?? 300,
          horizon: data.horizon_years ?? 15,
          annualGrowth: data.annual_payment_growth ?? 3,
        })
      }
      setLoading(false)
    }
    fetchProfile()
  }, [user.id])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('upgrade') === 'success') {
      setShowUpgradeBanner(true)
      navigate('/dashboard', { replace: true })
    }
  }, [location.search, navigate])

  const currentProfile = PORTFOLIOS[selectedProfileId] || Object.values(PORTFOLIOS)[2]
  const isPro = !!userProfile?.is_pro

  const handleParamChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  // Free users always use annualGrowth=0 in calculations
  const effectiveParams = isPro ? params : { ...params, annualGrowth: 0 }

  const handleDownloadPdf = () => {
    if (!userProfile?.is_pro) {
      setShowProModal(true)
      return
    }
    setGeneratingPdf(true)
    try {
const doc = generatePianoPDF(currentProfile, userProfile, params)
const filename = `easivest-piano-${currentProfile.name.toLowerCase()}.pdf`
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

  const TABS = [
    { id: 'risparmio', label: 'Risparmio' },
    { id: 'investimento', label: 'Investimento' },
    { id: 'ribilanciamento', label: 'Ribilanciamento' },
    { id: 'tracker', label: 'Tracker' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Caricamento...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showUpgradeBanner && (
        <div
          className="mb-6 flex items-center justify-between p-4 rounded-xl"
          style={{ backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🎉</span>
            <div>
              <div className="font-semibold text-sm" style={{ color: '#065F46' }}>Benvenuto nel piano Pro!</div>
              <div className="text-xs mt-0.5" style={{ color: '#047857' }}>Puoi ora scaricare il tuo piano PDF personalizzato.</div>
            </div>
          </div>
          <button onClick={() => setShowUpgradeBanner(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
        </div>
      )}

      {showProModal && <ProModal onClose={() => setShowProModal(false)} />}

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Il tuo piano finanziario</h1>
          {userProfile && (
            <p className="text-gray-500 text-sm mt-1">
              Profilo: <strong style={{ color: currentProfile.color }}>{currentProfile.name}</strong>
              {' '}· Rendimento atteso: <strong>{currentProfile.expectedReturn}%</strong> annuo
            </p>
          )}
        </div>
        {userProfile && (
          <button
            onClick={handleDownloadPdf}
            disabled={generatingPdf}
            className="shrink-0 px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
            style={{ backgroundColor: '#534AB7' }}
          >
            {!userProfile.is_pro && <span>🔒</span>}
            {generatingPdf ? 'Generazione...' : 'Scarica il tuo piano →'}
          </button>
        )}
      </div>

      <GlobalSliders params={params} onChange={handleParamChange} isPro={isPro} />

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'risparmio' && <TabRisparmio params={effectiveParams} profile={currentProfile} />}
      {activeTab === 'investimento' && (
        <TabInvestimento
          params={effectiveParams}
          profile={currentProfile}
          onProfileChange={setSelectedProfileId}
          allProfiles={PORTFOLIOS}
          isPro={isPro}
          onProClick={() => setShowProModal(true)}
          userAssignedProfileId={userProfile?.profile}
        />
      )}
      {activeTab === 'ribilanciamento' && <TabRibilanciamento profile={currentProfile} />}
      {activeTab === 'tracker' && <TabTracker user={user} />}
    </div>
  )
}
