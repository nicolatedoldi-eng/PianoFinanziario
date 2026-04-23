import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Spinner = () => {
  const [showReload, setShowReload] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShowReload(true), 5000)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-2">
      <div className="text-gray-400 text-sm">Caricamento...</div>
      {showReload && (
        <button
          onClick={() => window.location.reload()}
          className="text-xs"
          style={{ color: '#534AB7' }}
        >
          Ricarica pagina
        </button>
      )}
    </div>
  )
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  return children
}

export function OnboardingGuard({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (!profile || !profile.onboarding_completed) return <Navigate to="/onboarding" replace />

  return children
}
