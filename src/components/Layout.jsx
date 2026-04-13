import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'

export default function Layout({ children }) {
  const { user, signOut } = useAuth()
  const { profile } = useProfile()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#534AB7' }}>
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <span className="font-semibold text-gray-900 text-lg">PianoFinanziario</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                to="/impara"
                className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: '#534AB7' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                <span className="hidden sm:inline">Come investire?</span>
              </Link>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profilo"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Profilo
                  </Link>
                  {!profile?.is_pro && (
                    <Link
                      to="/prezzi"
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Prezzi
                    </Link>
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
                  <Link
                    to="/login"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Accedi
                  </Link>
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
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  )
}
