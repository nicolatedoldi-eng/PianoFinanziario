import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'

export default function Layout({ children }) {
  const { user, signOut } = useAuth()
  const { profile } = useProfile()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef(null)

  const handleSignOut = async () => {
    setMenuOpen(false)
    await signOut()
    navigate('/')
  }

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 relative" ref={navRef}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to={user ? '/dashboard' : '/'} className="flex items-center">
              <img
                src="/easivest-logo.svg"
                alt="EasiVest"
                className="h-8 sm:h-10 w-auto block"
              />
            </Link>

            {/* Desktop nav (sm+) */}
            <div className="hidden sm:flex items-center gap-4">
              <Link
                to="/impara"
                className="flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition-opacity"
                style={{ color: '#534AB7' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                <span>Come investire?</span>
              </Link>
              {user ? (
                <>
                  <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Dashboard</Link>
                  <Link to="/profilo" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Profilo</Link>
                  {!profile?.is_pro && (
                    <Link to="/prezzi" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Prezzi</Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Esci
                  </button>
                </>
              ) : (
                <>
                  <div className="w-px h-4 bg-gray-200" />
                  <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Accedi</Link>
                  <Link
                    to="/registrazione"
                    className="text-sm px-4 py-2 rounded-lg text-white transition-colors"
                    style={{ backgroundColor: '#534AB7' }}
                  >
                    Inizia gratis
                  </Link>
                </>
              )}
            </div>

            {/* Mobile nav (< sm) */}
            <div className="flex sm:hidden items-center gap-2">
              {!user && (
                <Link
                  to="/registrazione"
                  className="text-sm px-3 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: '#534AB7' }}
                >
                  Inizia gratis
                </Link>
              )}
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}
              >
                {menuOpen ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="sm:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-md z-50">
            <div className="px-4 py-1">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 text-sm font-medium text-gray-700 border-b border-gray-100"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profilo"
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 text-sm font-medium text-gray-700 border-b border-gray-100"
                  >
                    Profilo
                  </Link>
                  {!profile?.is_pro && (
                    <Link
                      to="/prezzi"
                      onClick={() => setMenuOpen(false)}
                      className="block py-3 text-sm font-medium text-gray-700 border-b border-gray-100"
                    >
                      Prezzi
                    </Link>
                  )}
                  <Link
                    to="/impara"
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 text-sm font-medium border-b border-gray-100"
                    style={{ color: '#534AB7' }}
                  >
                    Come investire?
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left py-3 text-sm font-medium text-gray-700"
                  >
                    Esci
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/impara"
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 text-sm font-medium border-b border-gray-100"
                    style={{ color: '#534AB7' }}
                  >
                    Come investire?
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 text-sm font-medium text-gray-700"
                  >
                    Accedi
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">{children}</main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

            {/* Brand */}
            <div>
              <img src="/easivest-logo.svg" alt="EasiVest" className="h-6 w-auto mb-3" />
              <p className="text-xs text-gray-500 mb-1">Investi in modo semplice</p>
              <p className="text-xs text-gray-400">© 2026 EasiVest</p>
            </div>

            {/* Link utili */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Link utili</p>
              <ul className="space-y-2">
                <li>
                  <Link to="/impara" className="text-xs text-gray-500 transition-colors hover:text-[#534AB7]">
                    Come investire?
                  </Link>
                </li>
                <li>
                  <Link to="/prezzi" className="text-xs text-gray-500 transition-colors hover:text-[#534AB7]">
                    Prezzi
                  </Link>
                </li>
                {user && (
                  <li>
                    <Link to="/dashboard" className="text-xs text-gray-500 transition-colors hover:text-[#534AB7]">
                      Dashboard
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Legale e contatti */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Legale e contatti</p>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://www.iubenda.com/privacy-policy/86629006"
                    className="iubenda-white iubenda-noiframe iubenda-embed text-xs text-gray-500 transition-colors hover:text-[#534AB7]"
                    title="Privacy Policy"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.iubenda.com/privacy-policy/86629006/cookie-policy"
                    className="iubenda-white iubenda-noiframe iubenda-embed text-xs text-gray-500 transition-colors hover:text-[#534AB7]"
                    title="Cookie Policy"
                  >
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <Link to="/termini" className="text-xs text-gray-500 transition-colors hover:text-[#534AB7]">
                    Termini di Servizio
                  </Link>
                </li>
                <li>
                  <Link to="/contatti" className="text-xs text-gray-500 transition-colors hover:text-[#534AB7]">
                    Contatti
                  </Link>
                </li>
                <li>
                  <a href="mailto:info@easivest.com" className="text-xs text-gray-500 transition-colors hover:text-[#534AB7]">
                    info@easivest.com
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </footer>
    </div>
  )
}
