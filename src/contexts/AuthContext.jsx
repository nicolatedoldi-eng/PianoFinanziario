import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (currentUser) {
          setLoading(true)
          const { data } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .single()
          if (mounted) {
            setProfile(data)
            setLoading(false)
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
      subscription.unsubscribe()
    }
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
