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
import styles from './KeyboardGrid.module.css'

interface Props {
  layer: Layer
  keys: Record<string, string>
  currentTarget: CurrentTarget | null
  active: boolean
  isActive: boolean
  onKeyClick?: (x: number, y: number, layer: Layer, shiftKey: boolean) => void
}

export function KeyboardGrid({ layer, keys, currentTarget, active, isActive, onKeyClick }: Props) {
  const isCurrentLayer = currentTarget?.layer === layer
  const allDone = !currentTarget || currentTarget.layer !== layer

  let statusText = ''
  if (active && isCurrentLayer) {
    statusText = 'Mapping in progress…'
  } else if (isActive && allDone) {
    statusText = 'Complete'
  }

  return (
    <section className={styles.section}>
      <div className={styles.layerHeader}>
        <h2 className={styles.layerTitle}>{LAYER_LABELS[layer]}</h2>
        {statusText && (
          <span
            className={`${styles.statusText} ${isCurrentLayer ? styles.statusActive : styles.statusComplete}`}
          >
            {statusText}
          </span>
        )}
      </div>
      <div className={`${styles.grid} ${!isActive ? styles.gridInactive : ''}`}>
        {Array.from({ length: ROWS }, (_, y) => (
          <div key={y} className={styles.row}>
            {Array.from({ length: COLS }, (_, x) => {
              const isHighlighted =
                active && isCurrentLayer && currentTarget?.x === x && currentTarget?.y === y
              const skipped = isSkipped(x, y)
              const mirror = isMirrorTarget(x, y)
              const recorded = keys[storeKey(x, y, layer)]
              const label = POSITION_LABELS[posKey(x, y)]

              let stateClass: string
              if (isHighlighted) stateClass = styles.keyHighlighted
              else if (skipped) stateClass = styles.keySkipped
              else if (recorded) stateClass = styles.keyMapped
              else stateClass = styles.keyEmpty

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
                  className={`${styles.key} ${stateClass}`}
                  aria-label={`${layer} layer key at ${x},${y}${recorded ? `: ${recorded}` : ''}`}
                  data-testid={`key-${layer}-${x}-${y}`}
                  onClick={
                    active && !skipped && !mirror && onKeyClick
                      ? (e) => onKeyClick(x, y, layer, e.shiftKey)
                      : undefined
                  }
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
