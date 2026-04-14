import { useState, useEffect } from 'react'

export default function InstallBanner() {
  const [prompt, setPrompt] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('pwa-banner-dismissed')) return

    const handler = e => {
      e.preventDefault()
      setPrompt(e)
      // Show banner after 30 seconds
      setTimeout(() => setVisible(true), 30000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
    }
  }

  const handleDismiss = () => {
    setVisible(false)
    localStorage.setItem('pwa-banner-dismissed', '1')
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 flex items-center gap-3 shadow-lg"
      style={{
        backgroundColor: '#ffffff',
        borderTop: '2px solid #534AB7',
        borderRadius: '16px 16px 0 0',
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm"
        style={{ backgroundColor: '#534AB7' }}
      >
        P
      </div>
      <p className="flex-1 text-sm text-gray-700 leading-snug">
        Aggiungi <strong>PianoFinanziario</strong> alla schermata home
      </p>
      <button
        onClick={handleInstall}
        className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#534AB7' }}
      >
        Installa
      </button>
      <button
        onClick={handleDismiss}
        className="shrink-0 text-gray-400 hover:text-gray-600 text-xl leading-none"
        aria-label="Chiudi"
      >
        ×
      </button>
    </div>
  )
}
