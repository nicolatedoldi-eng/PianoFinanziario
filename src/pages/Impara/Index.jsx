import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ARTICLES } from './articles'
import { ICONS } from './icons'
import { useAuth } from '../../contexts/AuthContext'

export default function ImparaIndex() {
  const { user } = useAuth()

  useEffect(() => {
    document.title = 'Come investire? Guida pratica agli ETF | PianoFinanziario'
    const meta = document.querySelector('meta[name="description"]')
    const prevMeta = meta?.getAttribute('content') ?? ''
    if (meta) meta.setAttribute('content', 'Scopri come investire in ETF partendo da zero. Guide pratiche su ETF, PAC, obbligazioni e ribilanciamento. Senza gergo finanziario.')
    return () => {
      document.title = 'PianoFinanziario'
      if (meta) meta.setAttribute('content', prevMeta)
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Come investire?
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Le risposte alle domande che tutti si fanno, spiegate senza gergo finanziario
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {ARTICLES.map((article) =>
          article.available ? (
            <Link
              key={article.slug}
              to={`/impara/${article.slug}`}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <ArticleCard article={article} />
            </Link>
          ) : (
            <div
              key={article.slug}
              className="bg-white border border-gray-100 rounded-xl p-6 opacity-50 cursor-default"
            >
              <ArticleCard article={article} comingSoon />
            </div>
          )
        )}
      </div>

      {/* CTA */}
      <div
        className="text-center mt-16 py-16 rounded-2xl"
        style={{ backgroundColor: '#3730A3' }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Pronto a mettere in pratica?
        </h2>
        <p className="mb-8 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
          Rispondi a 6 domande e scopri quale portafoglio ETF fa per te.
          Gratis, senza carta di credito.
        </p>
        <Link
          to={user ? '/dashboard' : '/onboarding'}
          className="inline-block px-8 py-4 rounded-xl font-semibold text-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#ffffff', color: '#3730A3' }}
        >
          {user ? 'Vai alla tua dashboard →' : 'Crea il tuo piano gratuito →'}
        </Link>
      </div>
    </div>
  )
}

function ArticleCard({ article, comingSoon }) {
  return (
    <>
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 flex items-center justify-center rounded-xl shrink-0"
          style={{ backgroundColor: '#EEEDFE' }}
        >
          {ICONS[article.slug]}
        </div>
        <div className="flex items-center gap-2 ml-3">
          {article.badge && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full text-white whitespace-nowrap"
              style={{ backgroundColor: '#534AB7' }}
            >
              {article.badge}
            </span>
          )}
          {comingSoon && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 whitespace-nowrap">
              Prossimamente
            </span>
          )}
        </div>
      </div>
      <div className="text-xs font-medium mb-1" style={{ color: '#534AB7' }}>
        {article.category}
      </div>
      <h2 className="font-semibold text-gray-900 text-base mb-2">
        {article.title}
      </h2>
      <p className="text-sm text-gray-500 leading-relaxed mb-4">
        {article.description}
      </p>
      <div className="text-xs text-gray-400">⏱ {article.readTime} di lettura</div>
    </>
  )
}
