import { useEffect } from 'react'

const MODIFIER_CODES = ['ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight']

export function useKeyListener(onKey: (code: string) => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const handler = (e: KeyboardEvent) => {
      e.preventDefault()
      if (MODIFIER_CODES.includes(e.code)) return
      onKey(e.code)
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onKey, enabled])
}
