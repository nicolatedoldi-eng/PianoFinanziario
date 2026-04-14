import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute, OnboardingGuard } from './components/ProtectedRoute'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Profilo from './pages/Profilo'
import Pricing from './pages/Pricing'
import ImparaIndex from './pages/Impara/Index'
import ImparaArticle from './pages/Impara/Article'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Pagine pubbliche */}
          <Route path="/" element={<Layout><Landing /></Layout>} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/registrazione" element={<Auth mode="register" />} />
          <Route path="/prezzi" element={<Layout><Pricing /></Layout>} />
          <Route path="/impara" element={<Layout><ImparaIndex /></Layout>} />
          <Route path="/impara/:slug" element={<Layout><ImparaArticle /></Layout>} />

          {/* Onboarding (protetto: solo utenti loggati) */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          {/* Dashboard (protetta + onboarding completato) */}
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

          {/* Profilo (protetto + onboarding completato) */}
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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
