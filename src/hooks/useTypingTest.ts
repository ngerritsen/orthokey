import { useState, useCallback } from 'react'

export type CharState = 'pending' | 'correct' | 'wrong'

export function useTypingTest(text: string) {
  const [states, setStates] = useState<CharState[]>(() => Array(text.length).fill('pending'))
  const [cursor, setCursor] = useState(0)

  const type = useCallback(
    (char: string) => {
      if (cursor >= text.length) return
      const state: CharState = char === text[cursor] ? 'correct' : 'wrong'
      setStates((prev) => {
        const next = [...prev]
        next[cursor] = state
        return next
      })
      setCursor((c) => c + 1)
    },
    [cursor, text],
  )

  const backspace = useCallback(() => {
    if (cursor === 0) return
    setStates((prev) => {
      const next = [...prev]
      next[cursor - 1] = 'pending'
      return next
    })
    setCursor((c) => c - 1)
  }, [cursor])

  const reset = useCallback(() => {
    setStates(Array(text.length).fill('pending'))
    setCursor(0)
  }, [text])

  return { states, cursor, type, backspace, reset }
}
