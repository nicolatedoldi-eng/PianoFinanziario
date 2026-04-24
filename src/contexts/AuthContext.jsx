import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

const cacheKey = (uid) => `_ep_${uid}`

function loadCache(uid) {
  try {
    const raw = localStorage.getItem(cacheKey(uid))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveCache(uid, data) {
  try { localStorage.setItem(cacheKey(uid), JSON.stringify(data)) } catch {}
}

function clearCache(uid) {
  try { localStorage.removeItem(cacheKey(uid)) } catch {}
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async (userId) => {
    const uid = userId || user?.id
    if (!uid) return
    const { data } = await supabase.from('user_profiles').select('*').eq('user_id', uid).single()
    if (data) {
      saveCache(uid, data)
      setProfile(data)
    }
  }, [user])

  useEffect(() => {
    let mounted = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (currentUser) {
          const cached = loadCache(currentUser.id)
          if (cached) {
            // Instant load from cache — no spinner on return visits
            if (mounted) { setProfile(cached); setLoading(false) }
            // Background refresh
            supabase.from('user_profiles').select('*').eq('user_id', currentUser.id).single()
              .then(({ data }) => {
                if (mounted && data) { saveCache(currentUser.id, data); setProfile(data) }
              })
              .catch(() => {})
          } else {
            // First visit after login — fetch with 10s hard timeout
            setLoading(true)
            const fetch = supabase.from('user_profiles').select('*').eq('user_id', currentUser.id).single()
            const timeout = new Promise(resolve => setTimeout(() => resolve({ data: null }), 10000))
            try {
              const { data } = await Promise.race([fetch, timeout])
              if (mounted) {
                if (data) { saveCache(currentUser.id, data); setProfile(data) }
                setLoading(false)
              }
            } catch {
              if (mounted) setLoading(false)
            }
          }
        } else {
          setProfile(null)
          setLoading(false)
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  // On tab focus: verify session is still valid
  useEffect(() => {
    const handle = async () => {
      if (document.visibilityState !== 'visible') return
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setUser(null); setProfile(null); setLoading(false) }
    }
    document.addEventListener('visibilitychange', handle)
    return () => document.removeEventListener('visibilitychange', handle)
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
    if (user?.id) clearCache(user.id)
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
