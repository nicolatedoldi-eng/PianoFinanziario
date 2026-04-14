import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    // Reset to loading before each fetch so OnboardingGuard
    // shows the spinner instead of redirecting to /onboarding
    // while the profile is being fetched (e.g. on fresh page load
    // after Stripe redirect)
    setLoading(true)

    async function fetch() {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }

    fetch()
  }, [user])

  return { profile, loading }
}
