import { useState, useCallback } from 'react'
import {
  LAYERS,
  COLS,
  ROWS,
  MIRROR_TARGETS,
  posKey,
  storeKey,
  isPromptable,
  type Layer,
} from '../config/keyboard'

const STORAGE_KEY = 'orthokey-data'

type KeyMap = Record<string, string>

export interface CurrentTarget {
  layer: Layer
  x: number
  y: number
}

function loadFromStorage(): KeyMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as KeyMap) : {}
  } catch {
    return {}
  }
}

function saveToStorage(keys: KeyMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
}

function findNextTarget(keys: KeyMap): CurrentTarget | null {
  for (const layer of LAYERS) {
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (isPromptable(x, y) && !keys[storeKey(x, y, layer)]) {
          return { layer, x, y }
        }
      }
    }
  }
  return null
}

export function useKeyboardStore() {
  const [keys, setKeys] = useState<KeyMap>(loadFromStorage)

  const currentTarget = findNextTarget(keys)

  const recordKey = useCallback(
    (code: string) => {
      if (!currentTarget) return
      const { layer, x, y } = currentTarget

      setKeys((prev) => {
        const next = { ...prev, [storeKey(x, y, layer)]: code }

        // Auto-fill any mirror targets that reference this position
        const sourcePk = posKey(x, y)
        for (const [mirrorPk, refPk] of Object.entries(MIRROR_TARGETS)) {
          if (refPk === sourcePk) {
            const [mx, my] = mirrorPk.split(',').map(Number)
            next[storeKey(mx, my, layer)] = code
          }
        }

        saveToStorage(next)
        return next
      })
    },
    [currentTarget],
  )

  const undo = useCallback(() => {
    setKeys((prev) => {
      // Find the last recorded promptable key in scan order
      let lastLayer: Layer | null = null
      let lastX = -1
      let lastY = -1

      for (const layer of LAYERS) {
        for (let y = 0; y < ROWS; y++) {
          for (let x = 0; x < COLS; x++) {
            if (isPromptable(x, y) && prev[storeKey(x, y, layer)]) {
              lastLayer = layer
              lastX = x
              lastY = y
            }
          }
        }
      }

      if (lastLayer === null) return prev

      const next = { ...prev }
      delete next[storeKey(lastX, lastY, lastLayer)]

      // Remove any mirrors that were auto-filled from this position
      const sourcePk = posKey(lastX, lastY)
      for (const [mirrorPk, refPk] of Object.entries(MIRROR_TARGETS)) {
        if (refPk === sourcePk) {
          const [mx, my] = mirrorPk.split(',').map(Number)
          delete next[storeKey(mx, my, lastLayer)]
        }
      }

      saveToStorage(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setKeys({})
  }, [])

  return { keys, currentTarget, recordKey, undo, reset }
}
