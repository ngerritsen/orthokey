import { useState } from 'react'
import { LAYERS } from './config/keyboard'
import { useKeyboardStore } from './hooks/useKeyboardStore'
import { useKeyListener } from './hooks/useKeyListener'
import { KeyboardGrid } from './components/KeyboardGrid'
import styles from './App.module.css'

export default function App() {
  const { keys, currentTarget, recordKey, undo, reset } = useKeyboardStore()
  const [active, setActive] = useState(false)

  useKeyListener(recordKey, active && currentTarget !== null)

  const isDone = currentTarget === null
  const hasProgress = Object.keys(keys).length > 0
  const startLabel = active ? 'Pause' : hasProgress ? 'Continue' : 'Start'
  const canUndo = active && hasProgress

  function handleReset() {
    setActive(false)
    reset()
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>OrthoKey</h1>
          <p className={styles.subtitle}>
            {isDone
              ? 'All layers mapped.'
              : `Press the highlighted key — ${currentTarget.layer} layer (${currentTarget.x},${currentTarget.y})`}
          </p>
        </div>
        <div className={styles.actions}>
          <button
            className={`${styles.button} ${active ? styles.buttonPause : styles.buttonStart}`}
            onClick={() => setActive((a) => !a)}
            disabled={isDone}
          >
            {startLabel}
          </button>
          <button className={styles.button} onClick={undo} disabled={!canUndo}>
            Back
          </button>
          <button className={`${styles.button} ${styles.buttonReset}`} onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      {LAYERS.map((layer) => (
        <KeyboardGrid
          key={layer}
          layer={layer}
          keys={keys}
          currentTarget={currentTarget}
          active={active}
          isActive={!currentTarget || currentTarget.layer === layer}
        />
      ))}
    </div>
  )
}
