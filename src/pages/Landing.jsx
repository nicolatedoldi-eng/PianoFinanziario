import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: '🎯',
    title: 'Profilo su misura',
    description: '6 domande per capire il tuo profilo e assegnarti il portafoglio giusto',
  },
  {
    icon: '📈',
    title: 'Simulatore reale',
    description: 'Vedi crescere il tuo patrimonio anno per anno con grafici interattivi',
  },
  {
    icon: '🔔',
    title: 'Promemoria intelligenti',
    description: 'Email automatiche quando è il momento di ribilanciare il portafoglio',
  },
  {
    icon: '🛡️',
    title: 'Solo ETF',
    description: 'Nessun prodotto bancario costoso. Solo strumenti semplici, economici e trasparenti',
  },
]

const PROFILES = [
  { name: 'Dormiglione', return: '6.5%', color: '#534AB7', desc: '2 ETF, massima semplicità' },
  { name: 'Prudente', return: '5.5%', color: '#1D9E75', desc: '4 ETF, stabilità prima di tutto' },
  { name: 'Bilanciato', return: '7.5%', color: '#EF9F27', desc: '4 ETF, crescita + protezione' },
  { name: 'Crescita', return: '9.5%', color: '#E24B4A', desc: '4 ETF, massimizza il rendimento' },
]

export default function Landing() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center py-20 sm:py-28">
        <div
          className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-6"
          style={{ backgroundColor: '#EEF0FB', color: '#534AB7' }}
        >
          Gratis per sempre — no carta di credito
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Il tuo piano finanziario,<br />
          <span style={{ color: '#534AB7' }}>spiegato semplice</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Scopri quanto puoi accumulare, quale portafoglio ETF fa per te,
          e quando puoi smettere di preoccuparti del denaro.
          Senza formule complicate, senza gergo finanziario.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/registrazione"
            className="px-8 py-4 rounded-xl text-white font-semibold text-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#534AB7' }}
          >
            Inizia gratis →
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 rounded-xl text-gray-700 font-semibold text-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Ho già un account
          </Link>
        </div>
      </div>

      {/* Preview simulatore */}
      <div className="mb-20">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="ml-2 text-sm text-gray-400">Dashboard PianoFinanziario</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Capitale finale', value: '€387K', color: '#534AB7' },
              { label: 'Totale versato', value: '€150K', color: '#1D9E75' },
              { label: 'Interessi guadagnati', value: '€237K', color: '#1D9E75' },
              { label: 'Rendita mensile', value: '€1.290', color: '#EF9F27' },
            ].map((card) => (
              <div key={card.label} className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">{card.label}</div>
                <div className="text-xl font-bold" style={{ color: card.color }}>{card.value}</div>
              </div>
            ))}
          </div>
          <div className="h-40 bg-gray-50 rounded-xl flex items-end px-4 pb-4 gap-1 overflow-hidden">
            {Array.from({ length: 20 }, (_, i) => {
              const h = 20 + (i / 19) * 70 + Math.sin(i * 0.8) * 5
              return (
                <div key={i} className="flex-1 flex flex-col justify-end gap-0.5">
                  <div className="rounded-t-sm opacity-30" style={{ height: `${h * 0.55}%`, backgroundColor: '#534AB7' }}></div>
                  <div className="rounded-t-sm" style={{ height: `${h}%`, backgroundColor: '#534AB7', opacity: 0.7 }}></div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 text-center text-sm text-gray-400">
            Esempio: 500€/mese per 25 anni con profilo Bilanciato (7.5%)
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">
          Tutto quello che ti serve, niente di più
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500">{f.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Profili */}
      <div className="mb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">
          4 profili, uno per te
        </h2>
        <p className="text-gray-500 text-center mb-12">
          Rispondi a 6 domande e ti assegniamo il portafoglio più adatto ai tuoi obiettivi
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {PROFILES.map((p) => (
            <div key={p.name} className="bg-white border border-gray-200 rounded-xl p-5 text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: p.color }}>
                {p.name[0]}
              </div>
              <div className="font-semibold text-gray-900 mb-1">{p.name}</div>
              <div className="text-2xl font-bold mb-1" style={{ color: p.color }}>{p.return}</div>
              <div className="text-xs text-gray-400">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-16 rounded-2xl mb-20" style={{ backgroundColor: '#EEF0FB' }}>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Inizia in 3 minuti, gratis
        </h2>
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">
          Rispondi alle 6 domande, scopri il tuo profilo e vedi subito
          quanto puoi accumulare nel tempo.
        </p>
        <Link
          to="/registrazione"
          className="inline-block px-8 py-4 rounded-xl text-white font-semibold text-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#534AB7' }}
        >
          Crea il tuo piano →
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-400">
        <p>PianoFinanziario — Strumento educativo, non consulenza finanziaria.</p>
        <p className="mt-1">I rendimenti passati non garantiscono quelli futuri.</p>
      </footer>
    </div>
  )
}
