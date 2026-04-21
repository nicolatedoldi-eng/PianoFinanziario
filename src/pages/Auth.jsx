import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Auth({ mode = 'login' }) {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isLogin = mode === 'login'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/dashboard')
      } else {
        if (password.length < 8) {
          throw new Error('La password deve essere di almeno 8 caratteri')
        }
        const { error } = await signUp(email, password)
        if (error) throw error
        setSuccess('Account creato! Controlla la tua email per confermare l\'iscrizione, poi accedi.')
      }
    } catch (err) {
      const messages = {
        'Invalid login credentials': 'Email o password non corretti',
        'Email not confirmed': 'Devi confermare la tua email prima di accedere',
        'User already registered': 'Esiste già un account con questa email',
      }
      setError(messages[err.message] || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#534AB7' }}>
    <span className="text-white font-bold text-lg">P</span>
  </div>
  <span className="font-semibold text-gray-900 text-xl">EasiVest</span>
</Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Bentornato' : 'Crea il tuo account'}
          </h1>
          <p className="text-gray-500">
            {isLogin
              ? 'Accedi per vedere il tuo piano finanziario'
              : 'Inizia gratis, nessuna carta di credito'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEF2F2', color: '#E24B4A' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@esempio.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                style={{ '--tw-ring-color': '#534AB7' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? '••••••••' : 'Almeno 8 caratteri'}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#534AB7' }}
            >
              {loading
                ? (isLogin ? 'Accesso in corso...' : 'Creazione account...')
                : (isLogin ? 'Accedi' : 'Crea account gratuito')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {isLogin ? (
              <>Non hai un account?{' '}
                <Link to="/registrazione" className="font-medium" style={{ color: '#534AB7' }}>
                  Registrati gratis
                </Link>
              </>
            ) : (
              <>Hai già un account?{' '}
                <Link to="/login" className="font-medium" style={{ color: '#534AB7' }}>
                  Accedi
                </Link>
              </>
            )}
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Strumento educativo. Non è consulenza finanziaria.
        </p>
      </div>
    </div>
  )
}
