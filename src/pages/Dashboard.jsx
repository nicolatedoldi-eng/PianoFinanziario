import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import ProModal from '../components/ProModal'
import TabTracker from '../components/TabTracker'
import TabResoconto from '../components/TabResoconto'
import TabInvestimento from '../components/TabInvestimento'
import TabRibilanciamento from '../components/TabRibilanciamento'
import { PORTFOLIOS } from '../lib/portfolios'
import { generatePianoPDF } from '../lib/generatePdf'

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

export default function Dashboard() {
  const { user, profile: authProfile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('investimento')
  const [userProfile, setUserProfile] = useState(null)
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
    if (!authProfile) return
    setUserProfile(authProfile)
    setSelectedProfileId(authProfile.profile)
    setParams({
      initialCapital: authProfile.initial_capital ?? 5000,
      monthlyPayment: authProfile.monthly_payment ?? 300,
      horizon: authProfile.horizon_years ?? 15,
      annualGrowth: authProfile.annual_payment_growth ?? 3,
    })
  }, [authProfile])

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
    { id: 'investimento', label: 'Investimento' },
    { id: 'resoconto', label: 'Resoconto' },
    { id: 'ribilanciamento', label: 'Ribilanciamento' },
    { id: 'tracker', label: 'Tracker' },
  ]

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

      {activeTab === 'resoconto' && <TabResoconto params={effectiveParams} profile={currentProfile} />}
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
