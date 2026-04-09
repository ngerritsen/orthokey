import { useEffect, useState } from 'react'
import { useTypingTest } from '../hooks/useTypingTest'
import { TEXTS } from '../config/texts'
import { PageHeader } from '../components/PageHeader'
import styles from './TypingTest.module.css'
import appStyles from '../App.module.css'

function randomIndex(exclude: number): number {
  let next = Math.floor(Math.random() * TEXTS.length)
  while (TEXTS.length > 1 && next === exclude) {
    next = Math.floor(Math.random() * TEXTS.length)
  }
  return next
}

export function TypingTest() {
  const [textIndex, setTextIndex] = useState(() => Math.floor(Math.random() * TEXTS.length))
  const text = TEXTS[textIndex]
  const { states, cursor, type, backspace, reset } = useTypingTest(text)

  function nextSnippet() {
    setTextIndex(prev => randomIndex(prev))
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Tab') {
        e.preventDefault()
        nextSnippet()
        return
      }
      if (e.key === 'Backspace') {
        backspace()
        return
      }
      if (e.key === 'Enter') {
        type('\n')
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
      <PageHeader title="Orthokey" />
      <p className={styles.hint}>Tab or Restart for a new snippet · Backspace to go back</p>
      <div className={styles.text} aria-label="typing test text">
        {text.split('').map((char, i) => (
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
        {cursor === text.length && <span className={styles.cursorEnd} />}
      </div>
      <button className={`${appStyles.button} ${styles.restartButton}`} onClick={nextSnippet}>
        Restart
      </button>
    </div>
  )
}
