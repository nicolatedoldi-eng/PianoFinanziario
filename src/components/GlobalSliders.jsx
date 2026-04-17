export default function GlobalSliders({ params, onChange, isPro }) {
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
