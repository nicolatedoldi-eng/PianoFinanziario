export default function Termini() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Termini di Servizio</h1>
      <p className="text-sm text-gray-400 mb-10">Ultimo aggiornamento: 23 aprile 2026</p>

      <div className="space-y-8 text-sm text-gray-600 leading-relaxed">

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">1. Descrizione del servizio</h2>
          <p>
            EasiVest è uno strumento educativo che aiuta gli utenti a pianificare investimenti in ETF.
            Non siamo una società di gestione del risparmio e non gestiamo denaro per conto degli utenti.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">2. Utilizzo del servizio</h2>
          <p>
            EasiVest è riservato a utenti maggiorenni residenti in Italia. Le informazioni fornite hanno
            scopo esclusivamente educativo e non costituiscono consulenza finanziaria personalizzata.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">3. Piano gratuito e Pro</h2>
          <p>
            Il piano gratuito è disponibile senza limiti di tempo. Il piano Pro è un abbonamento mensile
            a €7.99 che può essere disdetto in qualsiasi momento dalla pagina Profilo.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">4. Limitazione di responsabilità</h2>
          <p>
            EasiVest non è responsabile delle decisioni di investimento prese dagli utenti sulla base
            delle informazioni fornite. I rendimenti mostrati sono stime basate su dati storici e non
            garantiscono risultati futuri.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">5. Contatti</h2>
          <p>
            Per qualsiasi domanda:{' '}
            <a href="mailto:info@easivest.com" className="text-[#534AB7] hover:underline">
              info@easivest.com
            </a>
          </p>
        </section>

      </div>
    </div>
  )
}
