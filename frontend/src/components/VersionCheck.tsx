import { useState, useEffect } from 'react'

// Get current JS filename from the loaded script
function getCurrentScriptHash(): string {
  const scripts = document.querySelectorAll('script[src*="/assets/index-"]')
  for (const script of scripts) {
    const src = script.getAttribute('src') || ''
    const match = src.match(/index-([a-zA-Z0-9]+)\.js/)
    if (match) return match[1]
  }
  return ''
}

const CHECK_INTERVAL = 5 * 60 * 1000 // Check every 5 minutes

export function useVersionCheck() {
  const [hasNewVersion, setHasNewVersion] = useState(false)

  useEffect(() => {
    const currentHash = getCurrentScriptHash()
    if (!currentHash) return

    const checkVersion = async () => {
      try {
        const res = await fetch('/?_=' + Date.now(), { cache: 'no-store' })
        const html = await res.text()
        const match = html.match(/index-([a-zA-Z0-9]+)\.js/)
        if (match && match[1] !== currentHash) {
          setHasNewVersion(true)
        }
      } catch {
        // Silently fail
      }
    }

    // Check after initial delay
    const timer = setTimeout(checkVersion, 15000)
    const interval = setInterval(checkVersion, CHECK_INTERVAL)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [])

  const refresh = () => {
    if ('caches' in window) {
      caches.keys().then(names => names.forEach(name => caches.delete(name)))
    }
    window.location.reload()
  }

  return { hasNewVersion, refresh }
}

export function VersionPrompt() {
  const { hasNewVersion, refresh } = useVersionCheck()

  if (!hasNewVersion) return null

  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[200] bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-3 border border-purple-200"
      style={{ animation: 'bounce 2s infinite' }}
    >
      <span className="text-sm text-gray-600">🎉 有新版本可用</span>
      <button
        className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-medium hover:bg-purple-600 active:bg-purple-700"
        onClick={refresh}
      >
        立即更新
      </button>
    </div>
  )
}
