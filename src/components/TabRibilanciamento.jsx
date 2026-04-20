export default function TabRibilanciamento({ profile }) {
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
