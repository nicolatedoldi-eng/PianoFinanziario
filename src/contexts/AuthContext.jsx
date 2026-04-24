import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const loadingRef = useRef(true)
  const loadingSinceRef = useRef(Date.now())

  useEffect(() => {
    loadingRef.current = loading
    if (loading) loadingSinceRef.current = Date.now()
  }, [loading])

  const refreshProfile = useCallback(async (userId) => {
    const uid = userId || user?.id
    if (!uid) return
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', uid)
      .single()
    setProfile(data)
  }, [user])

  useEffect(() => {
    let mounted = true
    let reloadTimer = null

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (currentUser) {
          setLoading(true)
          // Se il fetch si blocca (promise che non settla mai), ricarica la pagina
          // Limita a 2 reload consecutivi per evitare loop su connessioni rotte
          reloadTimer = setTimeout(() => {
            if (!mounted) return
            const count = parseInt(sessionStorage.getItem('_authReload') || '0')
            if (count < 2) {
              sessionStorage.setItem('_authReload', String(count + 1))
              window.location.reload()
            } else {
              sessionStorage.removeItem('_authReload')
              setLoading(false)
            }
          }, 8000)
          try {
            const { data } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', currentUser.id)
              .single()
            if (mounted) setProfile(data)
          } catch {
            // error handled by finally
          } finally {
            clearTimeout(reloadTimer)
            sessionStorage.removeItem('_authReload')
            if (mounted) setLoading(false)
          }
        } else {
          setProfile(null)
          setLoading(false)
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null)
        setLoading(false)
      }
      // TOKEN_REFRESHED: aggiorna solo user, non toccare profile né loading
    })

    return () => {
      mounted = false
      clearTimeout(reloadTimer)
      subscription.unsubscribe()
    }
  }, [])

  // Quando la tab torna in foreground: se loading è bloccato da > 3s, ricarica
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') return
      if (loadingRef.current && Date.now() - loadingSinceRef.current > 3000) {
        window.location.reload()
        return
      }
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
