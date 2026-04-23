import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Contatti() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | success | error

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      await supabase.functions.invoke('send-contact-email', { body: form })
      setStatus('success')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent transition-all"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1"

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Contattaci</h1>
        <p className="text-base text-gray-500">Siamo qui per aiutarti. Rispondiamo entro 24 ore.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Form */}
        <div>
          {status === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p className="text-gray-900 font-semibold mb-1">Messaggio inviato!</p>
              <p className="text-sm text-gray-500">Ti risponderemo entro 24 ore.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Nome</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Il tuo nome"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="tua@email.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Oggetto</label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Seleziona un oggetto</option>
                  <option value="Problema tecnico">Problema tecnico</option>
                  <option value="Domanda sul piano">Domanda sul piano</option>
                  <option value="Domanda sugli ETF">Domanda sugli ETF</option>
                  <option value="Altro">Altro</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Messaggio</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Scrivi qui il tuo messaggio..."
                  className={inputClass + ' resize-none'}
                />
              </div>
              {status === 'error' && (
                <p className="text-xs text-red-500">Errore nell'invio. Riprova o scrivi direttamente a info@easivest.com.</p>
              )}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                style={{ backgroundColor: '#534AB7' }}
              >
                {status === 'sending' ? 'Invio in corso...' : 'Invia messaggio →'}
              </button>
            </form>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-0.5">Email</p>
              <p className="text-sm text-gray-700">info@easivest.com</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-0.5">Tempi di risposta</p>
              <p className="text-sm text-gray-700">Risposta entro 24 ore</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-0.5">Sito</p>
              <p className="text-sm text-gray-700">easivest.com</p>
            </div>
          </div>

          <div className="p-5 bg-[#534AB7]/5 border border-[#534AB7]/15 rounded-xl">
            <p className="text-sm text-gray-700 leading-relaxed">
              Hai una domanda sugli ETF o sul tuo piano di investimento? Scrivici — il nostro team di consulenti finanziari indipendenti è a tua disposizione.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
