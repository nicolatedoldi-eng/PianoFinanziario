import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Spinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-gray-400 text-sm">Caricamento...</div>
  </div>
)

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
