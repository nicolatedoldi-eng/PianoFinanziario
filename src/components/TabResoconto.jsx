import { useState, useMemo } from 'react'
import { calculateProjection, calculateMilestones, formatEuro, formatEuroFull, generateInsight } from '../lib/finance'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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

export default function TabResoconto({ params, profile }) {
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
