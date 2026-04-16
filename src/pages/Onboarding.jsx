import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { recommendPortfolio, PORTFOLIOS } from '../lib/portfolios'

const STEPS = [
  {
    id: 'goal',
    question: 'Qual è il tuo obiettivo principale?',
    subtitle: 'Scegli quello più vicino a ciò che vuoi ottenere',
    options: [
      { value: 'casa', label: 'Comprare casa', icon: '🏠', desc: 'Voglio accumulare per l\'acconto o per un acquisto' },
      { value: 'pensione', label: 'Pensione integrativa', icon: '🧓', desc: 'Voglio avere di più quando smetto di lavorare' },
      { value: 'liberta', label: 'Libertà finanziaria', icon: '🌅', desc: 'Voglio vivere di rendita il prima possibile' },
      { value: 'emergenze', label: 'Fondo emergenze', icon: '🛡️', desc: 'Voglio una rete di sicurezza per l\'imprevisto' },
    ],
  },
  {
    id: 'experience',
    question: 'Che esperienza hai con gli investimenti?',
    subtitle: 'Sii onesto, non ci sono risposte sbagliate',
    options: [
      { value: 'zero', label: 'Zero esperienza', icon: '🌱', desc: 'Non ho mai investito, parto da zero' },
      { value: 'letto', label: 'Ho letto qualcosa', icon: '📚', desc: 'Conosco i concetti base ma non ho investito' },
      { value: 'qualcosa', label: 'Ho già qualcosa', icon: '💼', desc: 'Ho un fondo pensione, un ETF o azioni' },
      { value: 'esperto', label: 'Sono esperto', icon: '🎓', desc: 'Gestisco già un portafoglio in modo consapevole' },
    ],
  },
  {
    id: 'risk',
    question: 'Il mercato crolla del 30%. Cosa fai?',
    subtitle: 'Immagina di avere già 10.000€ investiti',
    options: [
      { value: 'vendo', label: 'Vendo tutto', icon: '😰', desc: 'Non riesco a sopportare le perdite, preferisco uscire' },
      { value: 'aspetto', label: 'Aspetto e non tocco', icon: '😐', desc: 'Lascio stare, tanto prima o poi risale' },
      { value: 'continuo', label: 'Continuo il PAC', icon: '💪', desc: 'Continuo a versare come da piano' },
      { value: 'compro', label: 'Compro di più', icon: '🚀', desc: 'Opportunità! Aumento i versamenti approfittando del calo' },
    ],
  },
]

function getProfileReasons(profileId, answers) {
  const reasons = []
  const h = answers.horizon

  if (profileId === 'bilanciato') {
    if (h > 10) reasons.push(`Hai un orizzonte di ${h} anni — abbastanza lungo per assorbire le oscillazioni del mercato.`)
    if (answers.risk === 'continuo' || answers.risk === 'compro') {
      reasons.push('Hai detto che continueresti a investire durante un calo — questo ti permette di puntare su rendimenti più alti.')
    }
    reasons.push('Il profilo Bilanciato è il più scelto da chi vuole crescita senza rinunciare alla stabilità.')
  } else if (profileId === 'prudente') {
    reasons.push('Preferisci la stabilità alla crescita massima — scelta saggia se il tuo orizzonte è sotto i 10 anni.')
    if (h) reasons.push(`Con ${h} anni davanti, la componente bond ti protegge dalle oscillazioni più forti.`)
  } else if (profileId === 'crescita') {
    if (h) reasons.push(`Con ${h} anni di orizzonte e alta tolleranza al rischio, puoi permetterti di puntare al massimo rendimento.`)
    if (answers.risk === 'compro') {
      reasons.push("Hai detto che compreresti di più durante un crollo — è esattamente la mentalità giusta per questo portafoglio.")
    }
  } else if (profileId === 'essenziale') {
    reasons.push('Hai scelto la semplicità — due ETF coprono già il 95% del mercato globale.')
    reasons.push('Meno decisioni da prendere significa meno errori. È una strategia, non una scorciatoia.')
  }

  return reasons
}

export default function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({
    goal: null,
    experience: null,
    risk: null,
    initialCapital: 5000,
    monthlyPayment: 300,
    horizon: 15,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const totalSteps = 6
  const progress = Math.min(((step) / totalSteps) * 100, 100)

  const handleOptionSelect = (stepId, value) => {
    setAnswers(prev => ({ ...prev, [stepId]: value }))
    setTimeout(() => setStep(prev => prev + 1), 300)
  }

  const handleSliderNext = () => {
    setStep(prev => prev + 1)
  }

  const recommendedProfileId = recommendPortfolio(answers)
  const recommendedProfile = PORTFOLIOS[recommendedProfileId]

  const handleSave = async (profileId) => {
    setSaving(true)
    setError('')
    try {
      const profile = PORTFOLIOS[profileId]
      const { error } = await supabase.from('user_profiles').upsert({
        user_id: user.id,
        email: user.email,
        profile: profileId,
        initial_capital: answers.initialCapital,
        monthly_payment: answers.monthlyPayment,
        horizon_years: answers.horizon,
        annual_return: profile.expectedReturn,
        annual_payment_growth: 3,
        goal: answers.goal,
        experience: answers.experience,
        risk_tolerance: answers.risk,
        onboarding_completed: true,
      }, { onConflict: 'user_id' })
      if (error) throw error

      supabase.functions.invoke('send-welcome-email', {
        body: {
          email: user.email,
          profile: profileId,
          dashboardUrl: `${window.location.origin}/dashboard`,
          initialCapital: answers.initialCapital,
          monthlyPayment: answers.monthlyPayment,
        },
      }).catch(console.error)

      navigate('/dashboard')
    } catch (err) {
      setError('Errore nel salvataggio. Riprova.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (step < 3) {
    const currentStep = STEPS[step]
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Domanda {step + 1} di {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: '#534AB7' }}></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentStep.question}</h2>
            <p className="text-gray-500 mb-8">{currentStep.subtitle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentStep.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleOptionSelect(currentStep.id, opt.value)}
                  className={`text-left p-5 rounded-xl border-2 transition-all ${
                    answers[currentStep.id] === opt.value
                      ? 'border-[#534AB7] bg-[#EEF0FB]'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-2xl mb-2">{opt.icon}</div>
                  <div className="font-semibold text-gray-900 mb-1">{opt.label}</div>
                  <div className="text-sm text-gray-500">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Domanda 4 di {totalSteps}</span>
              <span>{Math.round(4 / totalSteps * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${4 / totalSteps * 100}%`, backgroundColor: '#534AB7' }}></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quanto hai da investire subito?</h2>
            <p className="text-gray-500 mb-8">Il capitale iniziale che puoi mettere da parte oggi. Puoi sempre aggiornarlo dopo.</p>
            <div className="text-center mb-8">
              <div className="text-5xl font-bold mb-1" style={{ color: '#534AB7' }}>€{answers.initialCapital.toLocaleString('it-IT')}</div>
              <div className="text-sm text-gray-400">capitale iniziale</div>
            </div>
            <input type="range" min="0" max="100000" step="500" value={answers.initialCapital}
              onChange={(e) => setAnswers(prev => ({ ...prev, initialCapital: Number(e.target.value) }))}
              className="w-full mb-4 accent-[#534AB7]" />
            <div className="relative mb-8" style={{ height: '16px' }}>
              <span className="absolute text-xs text-gray-400" style={{ left: '0%' }}>€0</span>
              <span className="absolute text-xs text-gray-400" style={{ left: '10%', transform: 'translateX(-50%)' }}>€10K</span>
              <span className="absolute text-xs text-gray-400" style={{ left: '25%', transform: 'translateX(-50%)' }}>€25K</span>
              <span className="absolute text-xs text-gray-400" style={{ left: '50%', transform: 'translateX(-50%)' }}>€50K</span>
              <span className="absolute text-xs text-gray-400" style={{ left: '100%', transform: 'translateX(-100%)' }}>€100K</span>
            </div>
            <button onClick={handleSliderNext} className="w-full py-3 rounded-xl text-white font-semibold transition-opacity hover:opacity-90" style={{ backgroundColor: '#534AB7' }}>Continua →</button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Domanda 5 di {totalSteps}</span>
              <span>{Math.round(5 / totalSteps * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${5 / totalSteps * 100}%`, backgroundColor: '#534AB7' }}></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quanto puoi versare ogni mese?</h2>
            <p className="text-gray-500 mb-8">Il Piano di Accumulo (PAC) mensile. Anche piccole cifre, nel lungo periodo, fanno differenza.</p>
            <div className="text-center mb-8">
              <div className="text-5xl font-bold mb-1" style={{ color: '#534AB7' }}>€{answers.monthlyPayment.toLocaleString('it-IT')}</div>
              <div className="text-sm text-gray-400">al mese</div>
            </div>
            <input type="range" min="50" max="2000" step="50" value={answers.monthlyPayment}
              onChange={(e) => setAnswers(prev => ({ ...prev, monthlyPayment: Number(e.target.value) }))}
              className="w-full mb-4 accent-[#534AB7]" />
            <div className="relative mb-8" style={{ height: '16px' }}>
              <span className="absolute text-xs text-gray-400" style={{ left: '0%' }}>€50</span>
              <span className="absolute text-xs text-gray-400" style={{ left: '23.1%', transform: 'translateX(-50%)' }}>€500</span>
              <span className="absolute text-xs text-gray-400" style={{ left: '48.7%', transform: 'translateX(-50%)' }}>€1.000</span>
              <span className="absolute text-xs text-gray-400" style={{ left: '74.4%', transform: 'translateX(-50%)' }}>€1.500</span>
              <span className="absolute text-xs text-gray-400" style={{ left: '100%', transform: 'translateX(-100%)' }}>€2.000</span>
            </div>
            <button onClick={handleSliderNext} className="w-full py-3 rounded-xl text-white font-semibold transition-opacity hover:opacity-90" style={{ backgroundColor: '#534AB7' }}>Continua →</button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 5) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Domanda 6 di {totalSteps}</span>
              <span>90%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: '90%', backgroundColor: '#534AB7' }}></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Per quanti anni vuoi investire?</h2>
            <p className="text-gray-500 mb-8">L'orizzonte temporale è uno dei fattori più importanti. Più è lungo, più può crescere il tuo capitale.</p>
            <div className="text-center mb-8">
              <div className="text-5xl font-bold mb-1" style={{ color: '#534AB7' }}>{answers.horizon} anni</div>
              <div className="text-sm text-gray-400">
                {answers.horizon <= 5 ? 'Orizzonte breve' : answers.horizon <= 15 ? 'Orizzonte medio' : 'Orizzonte lungo'}
              </div>
            </div>
            <input type="range" min="1" max="35" step="1" value={answers.horizon}
              onChange={(e) => setAnswers(prev => ({ ...prev, horizon: Number(e.target.value) }))}
              className="w-full mb-4 accent-[#534AB7]" />
            <div className="relative mb-8" style={{ height: '16px' }}>
              <span className="absolute text-xs text-gray-400" style={{ left: '0%' }}>1 anno</span>
              <span className="absolute text-xs text-gray-400" style={{ left: '26.5%', transform: 'translateX(-50%)' }}>10</span>
              <span className="absolute text-xs text-gray-400" style={{ left: '55.9%', transform: 'translateX(-50%)' }}>20</span>
              <span className="absolute text-xs text-gray-400" style={{ left: '85.3%', transform: 'translateX(-50%)' }}>30</span>
              <span className="absolute text-xs text-gray-400" style={{ left: '100%', transform: 'translateX(-100%)' }}>35</span>
            </div>
            <button onClick={handleSliderNext} className="w-full py-3 rounded-xl text-white font-semibold transition-opacity hover:opacity-90" style={{ backgroundColor: '#534AB7' }}>Scopri il tuo profilo →</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: '#ECFDF5', color: '#1D9E75' }}>Profilo trovato!</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Il tuo profilo è: <span style={{ color: recommendedProfile.color }}>{recommendedProfile.name}</span></h2>
          <p className="text-gray-500">{recommendedProfile.description}</p>
        </div>

        {(() => {
          const reasons = getProfileReasons(recommendedProfileId, answers)
          if (!reasons.length) return null
          return (
            <div className="mb-6 px-4 py-3.5" style={{ backgroundColor: '#E1F5EE', border: '0.5px solid #9FE1CB', borderRadius: '12px' }}>
              <p className="uppercase tracking-wider mb-2" style={{ fontSize: '12px', color: '#085041', fontWeight: 700, letterSpacing: '0.08em' }}>Perché questo profilo?</p>
              {reasons.map((r, i) => (
                <p key={i} className="leading-relaxed" style={{ fontSize: '13px', color: '#085041', marginBottom: i < reasons.length - 1 ? '6px' : 0 }}>
                  · {r}
                </p>
              ))}
            </div>
          )
        })()}

        <div className="bg-white border-2 rounded-2xl p-8 shadow-sm mb-6" style={{ borderColor: recommendedProfile.color }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: recommendedProfile.color }}>{recommendedProfile.name[0]}</div>
            <div>
              <div className="text-xl font-bold text-gray-900">{recommendedProfile.name}</div>
              <div className="text-gray-500">Rendimento atteso: <strong>{recommendedProfile.expectedReturn}%</strong> annuo</div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {recommendedProfile.etfs.map((etf) => (
              <div key={etf.ticker} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="font-bold text-gray-900 text-lg">{etf.ticker}</div>
                <div className="text-2xl font-bold" style={{ color: recommendedProfile.color }}>{etf.percentage}%</div>
                <div className="text-xs text-gray-400 mt-1">{etf.isin}</div>
              </div>
            ))}
          </div>
          {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEF2F2', color: '#E24B4A' }}>{error}</div>}
          <button onClick={() => handleSave(recommendedProfileId)} disabled={saving}
            className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: recommendedProfile.color }}>
            {saving ? 'Salvataggio...' : `Inizia con il profilo ${recommendedProfile.name} →`}
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-4">Preferisci un altro profilo? Scegli tu:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.values(PORTFOLIOS).filter(p => p.id !== recommendedProfileId).map((p) => (
              <button key={p.id} onClick={() => handleSave(p.id)} disabled={saving}
                className="p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 text-left transition-colors disabled:opacity-50">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold mb-2" style={{ backgroundColor: p.color }}>{p.name[0]}</div>
                <div className="font-semibold text-gray-900 text-sm">{p.name}</div>
                <div className="text-xs text-gray-400">{p.expectedReturn}% annuo</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
