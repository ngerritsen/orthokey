import {
  COLS,
  ROWS,
  LAYER_LABELS,
  POSITION_LABELS,
  posKey,
  storeKey,
  isSkipped,
  isMirrorTarget,
  formatCode,
  type Layer,
} from '../config/keyboard'
import type { CurrentTarget } from '../hooks/useKeyboardStore'

interface Props {
  layer: Layer
  keys: Record<string, string>
  currentTarget: CurrentTarget | null
  active: boolean
  isActive: boolean
}

const CELL_SIZE = 52
const CELL_GAP = 4

function cellStyle(state: 'highlighted' | 'skipped' | 'mapped' | 'empty'): React.CSSProperties {
  const base: React.CSSProperties = {
    width: CELL_SIZE,
    height: CELL_SIZE,
    border: '2px solid',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 600,
    flexShrink: 0,
    boxSizing: 'border-box',
    transition: 'background 0.1s, border-color 0.1s',
    userSelect: 'none',
  }

  switch (state) {
    case 'highlighted':
      return { ...base, background: '#3b82f6', borderColor: '#1d4ed8', color: '#fff' }
    case 'skipped':
      return { ...base, background: '#e5e7eb', borderColor: '#9ca3af', color: '#6b7280', fontSize: 10 }
    case 'mapped':
      return { ...base, background: '#f0fdf4', borderColor: '#86efac', color: '#15803d' }
    case 'empty':
      return { ...base, background: '#f9fafb', borderColor: '#e5e7eb', color: '#d1d5db' }
  }
}

export function KeyboardGrid({ layer, keys, currentTarget, active, isActive }: Props) {
  const isCurrentLayer = currentTarget?.layer === layer
  const allDone = !currentTarget || currentTarget.layer !== layer

  let statusText = ''
  if (active && isCurrentLayer) {
    statusText = 'Mapping in progress…'
  } else if (isActive && allDone) {
    statusText = 'Complete'
  }

  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111' }}>
          {LAYER_LABELS[layer]}
        </h2>
        {statusText && (
          <span
            style={{
              fontSize: 12,
              color: isCurrentLayer ? '#2563eb' : '#16a34a',
              fontWeight: 500,
            }}
          >
            {statusText}
          </span>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: CELL_GAP,
          opacity: isActive ? 1 : 0.6,
        }}
      >
        {Array.from({ length: ROWS }, (_, y) => (
          <div key={y} style={{ display: 'flex', gap: CELL_GAP }}>
            {Array.from({ length: COLS }, (_, x) => {
              const isHighlighted =
                isCurrentLayer && currentTarget?.x === x && currentTarget?.y === y
              const skipped = isSkipped(x, y)
              const mirror = isMirrorTarget(x, y)
              const recorded = keys[storeKey(x, y, layer)]
              const label = POSITION_LABELS[posKey(x, y)]

              let state: 'highlighted' | 'skipped' | 'mapped' | 'empty'
              if (isHighlighted) state = 'highlighted'
              else if (skipped) state = 'skipped'
              else if (recorded) state = 'mapped'
              else state = 'empty'

              const displayText = skipped
                ? label
                : mirror && recorded
                  ? formatCode(recorded)
                  : recorded
                    ? formatCode(recorded)
                    : ''

              return (
                <div
                  key={x}
                  style={cellStyle(state)}
                  aria-label={`${layer} layer key at ${x},${y}${recorded ? `: ${recorded}` : ''}`}
                  data-testid={`key-${layer}-${x}-${y}`}
                >
                  {displayText}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}
