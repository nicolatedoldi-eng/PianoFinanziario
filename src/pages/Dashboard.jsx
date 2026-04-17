import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ProModal from '../components/ProModal'
import { PORTFOLIOS } from '../lib/portfolios'
import { generatePianoPDF } from '../lib/generatePdf'
import GlobalSliders from '../components/GlobalSliders'
import TabRisparmio from '../components/TabRisparmio'
import TabInvestimento from '../components/TabInvestimento'
import TabRibilanciamento from '../components/TabRibilanciamento'
import TabTracker from '../components/TabTracker'

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

  const effectiveParams = isPro ? params : { ...params, annualGrowth: 0 }

  const handleDownloadPdf = () => {
    if (!userProfile?.is_pro) {
      setShowProModal(true)
      return
    }
    setGeneratingPdf(true)
    try {
      const doc = generatePianoPDF(currentProfile, userProfile, params)
      const filename = `piano-finanziario-${currentProfile.name.toLowerCase()}.pdf`
      doc.output('dataurlnewwindow', { filename })
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
