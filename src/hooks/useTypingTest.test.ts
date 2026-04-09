import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useTypingTest } from './useTypingTest'

const TEXT = 'hello'

describe('useTypingTest', () => {
  it('starts with all characters pending and cursor at 0', () => {
    const { result } = renderHook(() => useTypingTest(TEXT))
    expect(result.current.cursor).toBe(0)
    expect(result.current.states).toEqual(['pending', 'pending', 'pending', 'pending', 'pending'])
  })

  it('marks a correct character as correct and advances the cursor', () => {
    const { result } = renderHook(() => useTypingTest(TEXT))
    act(() => result.current.type('h'))
    expect(result.current.states[0]).toBe('correct')
    expect(result.current.cursor).toBe(1)
  })

  it('marks a wrong character as wrong and still advances the cursor', () => {
    const { result } = renderHook(() => useTypingTest(TEXT))
    act(() => result.current.type('x'))
    expect(result.current.states[0]).toBe('wrong')
    expect(result.current.cursor).toBe(1)
  })

  it('resets a character to pending on backspace and decrements the cursor', () => {
    const { result } = renderHook(() => useTypingTest(TEXT))
    act(() => result.current.type('h'))
    act(() => result.current.backspace())
    expect(result.current.states[0]).toBe('pending')
    expect(result.current.cursor).toBe(0)
  })

  it('does nothing on backspace when cursor is at 0', () => {
    const { result } = renderHook(() => useTypingTest(TEXT))
    act(() => result.current.backspace())
    expect(result.current.cursor).toBe(0)
  })

  it('does nothing when typing past the end of the text', () => {
    const { result } = renderHook(() => useTypingTest(TEXT))
    TEXT.split('').forEach((char) => act(() => result.current.type(char)))
    expect(result.current.cursor).toBe(TEXT.length)
    act(() => result.current.type('x'))
    expect(result.current.cursor).toBe(TEXT.length)
  })

  it('resets all state on reset', () => {
    const { result } = renderHook(() => useTypingTest(TEXT))
    act(() => result.current.type('h'))
    act(() => result.current.type('x'))
    act(() => result.current.reset())
    expect(result.current.cursor).toBe(0)
    expect(result.current.states).toEqual(['pending', 'pending', 'pending', 'pending', 'pending'])
  })
})
