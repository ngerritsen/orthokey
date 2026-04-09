import { useState } from 'react'
import { LAYERS, type Layer } from '../config/keyboard'
import { useKeyboardStore } from '../hooks/useKeyboardStore'
import { useKeyListener } from '../hooks/useKeyListener'
import { KeyboardGrid } from '../components/KeyboardGrid'
import { CustomLabelModal } from '../components/CustomLabelModal'
import { PageHeader } from '../components/PageHeader'
import styles from '../App.module.css'

export function Mapper() {
  const { keys, currentTarget, recordKey, jumpTo, undo, reset } = useKeyboardStore()
  const [active, setActive] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const { cancelPending } = useKeyListener(recordKey, active && currentTarget !== null && !modalOpen)

  function handleCustomLabel(label: string) {
    setModalOpen(false)
    recordKey(label)
  }

  function handleKeyClick(x: number, y: number, layer: Layer, shiftKey: boolean) {
    jumpTo(x, y, layer)
    if (shiftKey) {
      cancelPending()
      setModalOpen(true)
    }
  }

  const isDone = currentTarget === null
  const hasProgress = Object.keys(keys).length > 0
  const startLabel = active ? 'Pause' : hasProgress ? 'Continue' : 'Start'
  const canUndo = active && hasProgress

  function handleReset() {
    setActive(false)
    reset()
  }

  const subtitle = isDone
    ? 'All layers mapped.'
    : `Press the highlighted key — ${currentTarget.layer} layer (${currentTarget.x},${currentTarget.y})`

  return (
    <div className={styles.container}>
      <PageHeader
        title="OrthoKey"
        subtitle={subtitle}
        actions={
          <>
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
          </>
        }
      />

      {LAYERS.map((layer) => (
        <KeyboardGrid
          key={layer}
          layer={layer}
          keys={keys}
          currentTarget={currentTarget}
          active={active}
          isActive={!currentTarget || currentTarget.layer === layer}
          onKeyClick={handleKeyClick}
        />
      ))}

      {modalOpen && (
        <CustomLabelModal onSubmit={handleCustomLabel} onCancel={() => setModalOpen(false)} />
      )}
    </div>
  )
}
