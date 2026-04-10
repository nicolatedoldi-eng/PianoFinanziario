import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'

const PREVIEW_DATA = [
  { year: 0,  capitale: 0,       versati: 0 },
  { year: 1,  capitale: 5500,    versati: 6000 },
  { year: 2,  capitale: 11400,   versati: 12000 },
  { year: 3,  capitale: 17800,   versati: 18000 },
  { year: 4,  capitale: 24700,   versati: 24000 },
  { year: 5,  capitale: 32100,   versati: 30000 },
  { year: 6,  capitale: 40000,   versati: 36000 },
  { year: 7,  capitale: 48600,   versati: 42000 },
  { year: 8,  capitale: 57800,   versati: 48000 },
  { year: 9,  capitale: 67700,   versati: 54000 },
  { year: 10, capitale: 78400,   versati: 60000 },
  { year: 11, capitale: 89800,   versati: 66000 },
  { year: 12, capitale: 102000,  versati: 72000 },
  { year: 13, capitale: 115000,  versati: 78000 },
  { year: 14, capitale: 129000,  versati: 84000 },
  { year: 15, capitale: 144100,  versati: 90000 },
  { year: 16, capitale: 160400,  versati: 96000 },
  { year: 17, capitale: 178000,  versati: 102000 },
  { year: 18, capitale: 197000,  versati: 108000 },
  { year: 19, capitale: 217600,  versati: 114000 },
  { year: 20, capitale: 239700,  versati: 120000 },
  { year: 21, capitale: 263700,  versati: 126000 },
  { year: 22, capitale: 289400,  versati: 132000 },
  { year: 23, capitale: 317300,  versati: 138000 },
  { year: 24, capitale: 347400,  versati: 144000 },
  { year: 25, capitale: 387000,  versati: 150000 },
]

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

      {/* Preview simulatore (statica) */}
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

          {/* Grafico statico decorativo */}
          <div aria-hidden="true">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={PREVIEW_DATA} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={v => `${v}a`} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={v => v >= 1000 ? `€${v/1000}K` : `€${v}`} tickLine={false} axisLine={false} width={48} domain={[0, 500000]} />
                <Line type="monotone" dataKey="capitale" stroke="#1D9E75" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="versati" stroke="#B5D4F4" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-6 h-0.5 rounded" style={{ backgroundColor: '#1D9E75' }}></div>
                Capitale accumulato
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-6 h-0.5 rounded" style={{ backgroundColor: '#B5D4F4' }}></div>
                Versamenti
              </div>
            </div>
          </div>

          <div className="mt-3 text-center text-sm text-gray-400">
            Esempio: 500€/mese per 25 anni con profilo Bilanciato (7.5%)
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">
          Smetti di rimandare. Inizia con €50 al mese.
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

      {/* Trust section */}
      <div
        className="-mx-4 sm:-mx-6 lg:-mx-8 mb-20 border-t border-b border-gray-200 bg-white"
        style={{ paddingTop: '40px', paddingBottom: '40px' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-center font-bold text-gray-900 mb-10"
            style={{ fontSize: '22px' }}
          >
            Perché puoi fidarti
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center gap-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
              <h3 className="font-bold text-gray-900" style={{ fontSize: '15px' }}>Zero accesso bancario</h3>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>
                Non colleghiamo nessun conto. Non vediamo i tuoi movimenti. Mai.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <h3 className="font-bold text-gray-900" style={{ fontSize: '15px' }}>Solo calcoli matematici</h3>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>
                Inserisci solo quello che vuoi tu. Il resto lo calcoliamo noi.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="9" y1="13" x2="15" y2="19"/>
                <line x1="15" y1="13" x2="9" y2="19"/>
              </svg>
              <h3 className="font-bold text-gray-900" style={{ fontSize: '15px' }}>Nessuna consulenza</h3>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>
                Siamo uno strumento educativo, non un consulente finanziario.
              </p>
            </div>
          </div>
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
            <div
              key={p.name}
              className="bg-white border border-gray-200 rounded-xl p-5 text-center"
            >
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: p.color }}
              >
                {p.name[0]}
              </div>
              <div className="font-semibold text-gray-900 mb-1">{p.name}</div>
              <div className="text-2xl font-bold mb-1" style={{ color: p.color }}>
                {p.return}
              </div>
              <div className="text-xs text-gray-400">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div
        className="text-center py-16 rounded-2xl mb-20"
        style={{ backgroundColor: '#3730A3' }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Inizia in 3 minuti, gratis
        </h2>
        <p className="mb-8 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
          Rispondi alle 6 domande, scopri il tuo profilo e vedi subito
          quanto puoi accumulare nel tempo.
        </p>
        <Link
          to="/registrazione"
          className="inline-block px-8 py-4 rounded-xl font-semibold text-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#ffffff', color: '#3730A3' }}
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
