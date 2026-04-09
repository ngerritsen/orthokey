import { useEffect } from 'react'
import { useTypingTest } from '../hooks/useTypingTest'
import { TEXTS } from '../config/texts'
import { PageHeader } from '../components/PageHeader'
import styles from './TypingTest.module.css'

const TEXT = TEXTS[0]

export function TypingTest() {
  const { states, cursor, type, backspace, reset } = useTypingTest(TEXT)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Tab') {
        e.preventDefault()
        reset()
        return
      }
      if (e.key === 'Backspace') {
        backspace()
        return
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        type(e.key)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [type, backspace, reset])

  return (
    <div className={styles.container}>
      <PageHeader title="OrthoKey" />
      <p className={styles.hint}>Tab to restart · Backspace to go back</p>
      <div className={styles.text} aria-label="typing test text">
        {TEXT.split('').map((char, i) => (
          <span
            key={i}
            className={[
              styles.char,
              styles[states[i]],
              i === cursor ? styles.current : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {char}
          </span>
        ))}
        {cursor === TEXT.length && <span className={styles.cursorEnd} />}
      </div>
      <button className={styles.restartButton} onClick={reset}>
        Restart
      </button>
    </div>
  )
}
