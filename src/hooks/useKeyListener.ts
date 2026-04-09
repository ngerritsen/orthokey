import { useCallback, useEffect, useRef } from 'react'

const MODIFIER_CODES = new Set([
  'AltLeft',
  'AltRight',
  'ControlLeft',
  'ControlRight',
  'MetaLeft',
  'MetaRight',
  'ShiftLeft',
  'ShiftRight',
])

export function useKeyListener(onKey: (code: string) => void, enabled: boolean) {
  const pendingModifier = useRef<string | null>(null)

  const cancelPending = useCallback(() => {
    pendingModifier.current = null
  }, [])

  useEffect(() => {
    if (!enabled) {
      pendingModifier.current = null
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      e.preventDefault()

      if (MODIFIER_CODES.has(e.code)) {
        pendingModifier.current = e.code
      } else {
        pendingModifier.current = null
        const key = /^[^\sa-zA-Z]$/.test(e.key) ? e.key : e.code
        onKey(key)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (pendingModifier.current === e.code) {
        onKey(pendingModifier.current)
        pendingModifier.current = null
      }
    }

    const handleBlur = () => {
      pendingModifier.current = null
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [onKey, enabled])

  return { cancelPending }
}
