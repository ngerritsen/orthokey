import { useEffect } from 'react'

export function useKeyListener(onKey: (code: string) => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const handler = (e: KeyboardEvent) => {
      e.preventDefault()
      onKey(e.code)
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onKey, enabled])
}
