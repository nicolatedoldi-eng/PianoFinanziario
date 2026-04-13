import { useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { getArticle } from './articles'

const BOX_STYLES = {
  info:    { bg: '#EEEDFE', border: '#C4C0F5', titleColor: '#534AB7', icon: 'ℹ️' },
  warning: { bg: '#FFFBEB', border: '#FCD34D', titleColor: '#B45309', icon: '⚠️' },
  example: { bg: '#E1F5EE', border: '#6EE7B7', titleColor: '#1D9E75', icon: '📌' },
}

function renderBlock(block, idx) {
  switch (block.type) {
    case 'p':
      return (
        <p key={idx} className="text-gray-700 leading-relaxed mb-5">
          {block.text}
        </p>
      )

    case 'h2':
      return (
        <h2 key={idx} className="text-xl font-bold text-gray-900 mt-10 mb-4">
          {block.text}
        </h2>
      )

    case 'h3':
      return (
        <h3 key={idx} className="text-lg font-semibold text-gray-900 mt-6 mb-3">
          {block.text}
        </h3>
      )

    case 'list':
      return (
        <ul key={idx} className="space-y-3 mb-5">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-gray-700 leading-relaxed">
              <span
                className="shrink-0 font-bold mt-0.5"
                style={{ color: '#534AB7' }}
                aria-hidden
              >
                •
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )

    case 'box': {
      const s = BOX_STYLES[block.variant] || BOX_STYLES.info
      return (
        <div
          key={idx}
          className="rounded-xl p-5 mb-6 border"
          style={{ backgroundColor: s.bg, borderColor: s.border }}
        >
          {block.title && (
            <div
              className="font-semibold mb-2 flex items-center gap-1.5 text-sm"
              style={{ color: s.titleColor }}
            >
              <span aria-hidden>{s.icon}</span>
              {block.title}
            </div>
          )}
          <p className="text-sm leading-relaxed text-gray-700">{block.text}</p>
        </div>
      )
    }

    case 'table':
      return (
        <div key={idx} className="overflow-x-auto mb-6 rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB' }}>
                {block.headers.map((h, i) => (
                  <th
                    key={i}
                    className="py-3 px-4 text-left font-semibold text-gray-700 border-b border-gray-200"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`py-3 px-4 ${j === 0 ? 'font-medium text-gray-900' : 'text-gray-700'}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    default:
      return null
  }
}

export default function ImparaArticle() {
  const { slug } = useParams()
  const article = getArticle(slug)

  useEffect(() => {
    if (article) {
      document.title = `${article.title} — PianoFinanziario`
      return () => { document.title = 'PianoFinanziario' }
    }
  }, [article])

  if (!article || !article.available) return <Navigate to="/impara" replace />

  const nextArticle = article.next ? getArticle(article.next) : null
  const showNext = nextArticle?.available === true

  return (
    <div className="py-10 px-4">
      <div className="max-w-[680px] mx-auto mb-8">
        <Link
          to="/impara"
          className="text-sm font-medium hover:opacity-75 transition-opacity"
          style={{ color: '#534AB7' }}
        >
          ← Come investire?
        </Link>
      </div>

      <div className="max-w-[680px] mx-auto mb-10">
        <div className="flex items-center gap-3 mb-5">
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ backgroundColor: '#EEF0FB', color: '#534AB7' }}
          >
            {article.category}
          </span>
          <span className="text-xs text-gray-400">⏱ {article.readTime} di lettura</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
          {article.title}
        </h1>
      </div>

      <div className="max-w-[680px] mx-auto">
        {article.content.map((block, idx) => renderBlock(block, idx))}
      </div>

      <div className="max-w-[680px] mx-auto mt-16 pt-8 border-t border-gray-200">
        {showNext && (
          <div className="mb-8 p-5 rounded-xl bg-gray-50 border border-gray-200">
            <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">
              Prossimo argomento consigliato
            </div>
            <Link
              to={`/impara/${nextArticle.slug}`}
              className="font-semibold text-lg hover:opacity-75 transition-opacity"
              style={{ color: '#534AB7' }}
            >
              {nextArticle.title} →
            </Link>
            <p className="text-sm text-gray-500 mt-1">{nextArticle.description}</p>
          </div>
        )}

        <div className="text-center py-10 rounded-2xl" style={{ backgroundColor: '#534AB7' }}>
          <h3 className="text-xl font-bold text-white mb-2">
            Metti in pratica quello che hai imparato
          </h3>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Crea il tuo piano finanziario personalizzato in 3 minuti, gratis.
          </p>
          <Link
            to="/registrazione"
            className="inline-block px-6 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#ffffff', color: '#534AB7' }}
          >
            Crea il tuo piano gratuito →
          </Link>
        </div>
      </div>
    </div>
  )
}
