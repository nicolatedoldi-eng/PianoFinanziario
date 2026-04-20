import { useMemo } from 'react'
import { calculateScenarios, formatEuro, formatEuroFull } from '../lib/finance'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function TabInvestimento({ params, profile, onProfileChange, allProfiles, isPro, onProClick, userAssignedProfileId }) {
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
