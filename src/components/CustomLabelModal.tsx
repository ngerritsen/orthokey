import styles from './CustomLabelModal.module.css'
import { useState } from 'react'

interface Props {
  onSubmit: (label: string) => void
  onCancel: () => void
}

export function CustomLabelModal({ onSubmit, onCancel }: Props) {
  const [value, setValue] = useState('')

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      onSubmit(value)
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Enter custom label</h3>
        <p className={styles.description}>
          This key cannot be captured automatically. Enter a label manually.
        </p>
        <input
          autoFocus
          className={styles.input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Fn, BrtUp"
        />
        <div className={styles.actions}>
          <button className={`${styles.button} ${styles.buttonCancel}`} onClick={onCancel}>
            Cancel
          </button>
          <button className={`${styles.button} ${styles.buttonSubmit}`} onClick={() => onSubmit(value)}>
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}
