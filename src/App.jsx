import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute, OnboardingGuard } from './components/ProtectedRoute'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Profilo from './pages/Profilo'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout><Landing /></Layout>} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/registrazione" element={<Auth mode="register" />} />

          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <OnboardingGuard>
                <Layout>
                  <Dashboard />
                </Layout>
              </OnboardingGuard>
            }
          />

          <Route
            path="/profilo"
            element={
              <OnboardingGuard>
                <Layout>
                  <Profilo />
                </Layout>
              </OnboardingGuard>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
