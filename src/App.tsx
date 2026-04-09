import { useState } from 'react'
import { LAYERS } from './config/keyboard'
import { useKeyboardStore } from './hooks/useKeyboardStore'
import { useKeyListener } from './hooks/useKeyListener'
import { KeyboardGrid } from './components/KeyboardGrid'

export default function App() {
  const { keys, currentTarget, recordKey, reset } = useKeyboardStore()
  const [active, setActive] = useState(false)

  useKeyListener(recordKey, active && currentTarget !== null)

  const isDone = currentTarget === null
  const hasProgress = Object.keys(keys).length > 0
  const startLabel = active ? 'Pause' : hasProgress ? 'Continue' : 'Start'

  function handleReset() {
    setActive(false)
    reset()
  }

  const buttonStyle = {
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 600,
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    background: '#fff',
    cursor: 'pointer',
    color: '#374151',
  }

  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        maxWidth: 900,
        margin: '0 auto',
        padding: '24px 16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 28,
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>OrthoKey</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
            {isDone
              ? 'All layers mapped.'
              : `Press the highlighted key — ${currentTarget.layer} layer (${currentTarget.x},${currentTarget.y})`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setActive((a) => !a)}
            disabled={isDone}
            style={buttonStyle}
          >
            {startLabel}
          </button>
          <button onClick={handleReset} style={buttonStyle}>
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
