import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, it, expect } from 'vitest'
import { Mapper } from './pages/Mapper'
import { COLS, ROWS, LAYERS, storeKey, isPromptable, type Layer } from './config/keyboard'

// Build list of all promptable positions in order (layer > row > col)
function allPromptable(): Array<{ layer: Layer; x: number; y: number }> {
  const positions: Array<{ layer: Layer; x: number; y: number }> = []
  for (const layer of LAYERS) {
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (isPromptable(x, y)) {
          positions.push({ layer, x, y })
        }
      }
    }
  }
  return positions
}

function pressKey(code: string) {
  fireEvent.keyDown(window, { code })
}

function clickStart() {
  fireEvent.click(screen.getByRole('button', { name: /start|continue/i }))
}

function getCell(layer: Layer, x: number, y: number) {
  return screen.getByTestId(`key-${layer}-${x}-${y}`)
}

function seedLocalStorage(entries: Record<string, string>) {
  localStorage.setItem('orthokey-data', JSON.stringify(entries))
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('initial state', () => {
  it('highlights position (0,0) on the main layer first', () => {
    render(<Mapper />)
    expect(screen.getByText(/main layer \(0,0\)/i)).toBeInTheDocument()
  })

  it('renders all three layer grids', () => {
    render(<Mapper />)
    expect(screen.getByText('Main layer')).toBeInTheDocument()
    expect(screen.getByText('Lower layer')).toBeInTheDocument()
    expect(screen.getByText('Raised layer')).toBeInTheDocument()
  })
})

describe('key recording', () => {
  it('records a keypress at the current position and shows the formatted label', () => {
    render(<Mapper />)
    clickStart()
    pressKey('KeyA')
    expect(getCell('main', 0, 0)).toHaveTextContent('A')
  })

  it('advances the highlight to the next position after a keypress', () => {
    render(<Mapper />)
    clickStart()
    pressKey('KeyA')
    expect(screen.getByText(/main layer \(1,0\)/i)).toBeInTheDocument()
  })

  it('ignores modifier-only keypresses', () => {
    render(<Mapper />)
    clickStart()
    pressKey('ShiftLeft')
    // Still on (0,0)
    expect(screen.getByText(/main layer \(0,0\)/i)).toBeInTheDocument()
  })
})

describe('special positions', () => {
  it('skips the lower layer key (4,3) during mapping', () => {
    render(<Mapper />)
    // (4,3) should never appear as the prompted position
    const allPositions = allPromptable()
    expect(allPositions.some((p) => p.x === 4 && p.y === 3)).toBe(false)
  })

  it('skips the raise layer key (7,3) during mapping', () => {
    const allPositions = allPromptable()
    expect(allPositions.some((p) => p.x === 7 && p.y === 3)).toBe(false)
  })

  it('shows pre-labels for layer keys in the grid', () => {
    render(<Mapper />)
    // There are 3 layers, each with a "Lower" and "Raise" label cell
    const lowerCells = screen.getAllByText('Lower')
    const raiseCells = screen.getAllByText('Raise')
    expect(lowerCells).toHaveLength(3)
    expect(raiseCells).toHaveLength(3)
  })

  it('auto-fills (6,3) when (5,3) is recorded', () => {
    render(<Mapper />)
    clickStart()

    // Fill all positions before (5,3) in the main layer
    const before = allPromptable().filter(
      (p) => p.layer === 'main' && (p.y < 3 || (p.y === 3 && p.x < 5)),
    )
    before.forEach(() => pressKey('KeyX'))

    // Now at (5,3) — press Space
    expect(screen.getByText(/main layer \(5,3\)/i)).toBeInTheDocument()
    pressKey('Space')

    expect(getCell('main', 5, 3)).toHaveTextContent('Spc')
    expect(getCell('main', 6, 3)).toHaveTextContent('Spc')
  })

  it('does not prompt (6,3) separately', () => {
    const allPositions = allPromptable()
    expect(allPositions.some((p) => p.x === 6 && p.y === 3)).toBe(false)
  })
})

describe('layer progression', () => {
  it('moves to the lower layer after all main layer positions are mapped', () => {
    // Pre-fill all main layer positions in localStorage
    const mainKeys: Record<string, string> = {}
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (isPromptable(x, y)) {
          mainKeys[storeKey(x, y, 'main')] = 'KeyX'
        }
        // Also fill mirror target
        if (x === 5 && y === 3) {
          mainKeys[storeKey(6, 3, 'main')] = 'KeyX'
        }
      }
    }
    seedLocalStorage(mainKeys)

    render(<Mapper />)
    expect(screen.getByText(/lower layer \(0,0\)/i)).toBeInTheDocument()
  })

  it('shows all done message when all layers are mapped', () => {
    const allKeys: Record<string, string> = {}
    for (const layer of LAYERS) {
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          if (isPromptable(x, y)) {
            allKeys[storeKey(x, y, layer)] = 'KeyX'
          }
          if (x === 5 && y === 3) {
            allKeys[storeKey(6, 3, layer)] = 'KeyX'
          }
        }
      }
    }
    seedLocalStorage(allKeys)

    render(<Mapper />)
    expect(screen.getByText('All layers mapped.')).toBeInTheDocument()
  })
})

describe('localStorage persistence', () => {
  it('restores recorded keys after a remount (simulating reload)', () => {
    const { unmount } = render(<Mapper />)
    clickStart()
    pressKey('KeyQ')
    unmount()

    render(<Mapper />)
    expect(getCell('main', 0, 0)).toHaveTextContent('Q')
  })

  it('persists the current position across remounts', () => {
    const { unmount } = render(<Mapper />)
    clickStart()
    pressKey('KeyQ') // records (0,0), advances to (1,0)
    unmount()

    render(<Mapper />)
    expect(screen.getByText(/main layer \(1,0\)/i)).toBeInTheDocument()
  })
})

describe('reset', () => {
  it('clears all recorded keys', () => {
    render(<Mapper />)
    clickStart()
    pressKey('KeyA')
    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    expect(getCell('main', 0, 0)).toHaveTextContent('')
  })

  it('returns to the first position after reset', () => {
    render(<Mapper />)
    clickStart()
    pressKey('KeyA')
    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    expect(screen.getByText(/main layer \(0,0\)/i)).toBeInTheDocument()
  })

  it('clears localStorage on reset', () => {
    render(<Mapper />)
    clickStart()
    pressKey('KeyA')
    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    expect(localStorage.getItem('orthokey-data')).toBeNull()
  })

  it('shows Start button after reset', () => {
    render(<Mapper />)
    clickStart()
    pressKey('KeyA')
    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
  })
})

describe('start/pause/continue', () => {
  it('shows Start button on initial load with no progress', () => {
    render(<Mapper />)
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
  })

  it('shows Continue button on load when there is saved progress', () => {
    seedLocalStorage({ '0,0,main': 'KeyA' })
    render(<Mapper />)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('does not record keys before clicking Start', () => {
    render(<Mapper />)
    pressKey('KeyA')
    expect(getCell('main', 0, 0)).toHaveTextContent('')
  })

  it('shows Pause button after clicking Start', () => {
    render(<Mapper />)
    clickStart()
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
  })

  it('stops recording after clicking Pause', () => {
    render(<Mapper />)
    clickStart()
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    pressKey('KeyA')
    expect(getCell('main', 0, 0)).toHaveTextContent('')
  })

  it('shows Continue button after pausing with progress', () => {
    render(<Mapper />)
    clickStart()
    pressKey('KeyA') // record something so there is progress
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('Start button is disabled when all layers are mapped', () => {
    const allKeys: Record<string, string> = {}
    for (const layer of LAYERS) {
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          if (isPromptable(x, y)) {
            allKeys[storeKey(x, y, layer)] = 'KeyX'
          }
          if (x === 5 && y === 3) {
            allKeys[storeKey(6, 3, layer)] = 'KeyX'
          }
        }
      }
    }
    seedLocalStorage(allKeys)
    render(<Mapper />)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })
})

describe('custom label modal', () => {
  it('opens modal when shift-clicking a key while active', () => {
    render(<Mapper />)
    clickStart()
    fireEvent.click(getCell('main', 0, 0), { shiftKey: true })
    expect(screen.getByText('Enter custom label')).toBeInTheDocument()
  })

  it('does not open modal on a plain click', () => {
    render(<Mapper />)
    clickStart()
    fireEvent.click(getCell('main', 1, 0))
    expect(screen.queryByText('Enter custom label')).not.toBeInTheDocument()
  })

  it('does not open modal when not active', () => {
    render(<Mapper />)
    fireEvent.click(getCell('main', 0, 0), { shiftKey: true })
    expect(screen.queryByText('Enter custom label')).not.toBeInTheDocument()
  })

  it('records the custom label on submit and closes modal', () => {
    render(<Mapper />)
    clickStart()
    fireEvent.click(getCell('main', 0, 0), { shiftKey: true })
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Fn' } })
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    expect(getCell('main', 0, 0)).toHaveTextContent('Fn')
    expect(screen.queryByText('Enter custom label')).not.toBeInTheDocument()
  })

  it('records the label on Enter key', () => {
    render(<Mapper />)
    clickStart()
    fireEvent.click(getCell('main', 0, 0), { shiftKey: true })
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'BrtUp' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(getCell('main', 0, 0)).toHaveTextContent('BrtUp')
  })

  it('cancels on Escape key without recording', () => {
    render(<Mapper />)
    clickStart()
    fireEvent.click(getCell('main', 0, 0), { shiftKey: true })
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Fn' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByText('Enter custom label')).not.toBeInTheDocument()
    expect(getCell('main', 0, 0)).toHaveTextContent('')
  })

  it('cancels on Cancel button without recording', () => {
    render(<Mapper />)
    clickStart()
    fireEvent.click(getCell('main', 0, 0), { shiftKey: true })
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Fn' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByText('Enter custom label')).not.toBeInTheDocument()
    expect(getCell('main', 0, 0)).toHaveTextContent('')
  })

  it('records empty string when submitted with no input', () => {
    render(<Mapper />)
    clickStart()
    fireEvent.click(getCell('main', 0, 0), { shiftKey: true })
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    // Empty string is stored — key advances to next position
    expect(screen.getByText(/main layer \(1,0\)/i)).toBeInTheDocument()
  })

  it('does not capture key presses while modal is open', () => {
    render(<Mapper />)
    clickStart()
    fireEvent.click(getCell('main', 0, 0), { shiftKey: true })
    pressKey('KeyA')
    // Modal still open, key not recorded
    expect(screen.getByText('Enter custom label')).toBeInTheDocument()
    expect(getCell('main', 0, 0)).toHaveTextContent('')
  })
})

describe('key repeat and modifier handling', () => {
  it('ignores key repeat events', () => {
    render(<Mapper />)
    clickStart()
    fireEvent.keyDown(window, { code: 'KeyA', repeat: true })
    expect(getCell('main', 0, 0)).toHaveTextContent('')
    expect(screen.getByText(/main layer \(0,0\)/i)).toBeInTheDocument()
  })

  it('registers a modifier key on keyup and shows its short label', () => {
    render(<Mapper />)
    clickStart()
    fireEvent.keyDown(window, { code: 'AltLeft' })
    expect(getCell('main', 0, 0)).toHaveTextContent('')
    fireEvent.keyUp(window, { code: 'AltLeft' })
    expect(getCell('main', 0, 0)).toHaveTextContent('Alt')
  })

  it('does not register a modifier when window blurs before keyup (e.g. Alt+Tab)', () => {
    render(<Mapper />)
    clickStart()
    fireEvent.keyDown(window, { code: 'AltLeft' })
    fireEvent(window, new FocusEvent('blur'))
    expect(getCell('main', 0, 0)).toHaveTextContent('')
    expect(screen.getByText(/main layer \(0,0\)/i)).toBeInTheDocument()
  })

  it('does not register a modifier when a non-modifier key is pressed alongside it', () => {
    render(<Mapper />)
    clickStart()
    fireEvent.keyDown(window, { code: 'ShiftLeft' })
    fireEvent.keyDown(window, { code: 'KeyA' })
    // ShiftLeft not registered, KeyA registered
    expect(getCell('main', 0, 0)).toHaveTextContent('A')
    expect(screen.getByText(/main layer \(1,0\)/i)).toBeInTheDocument()
  })

  it('registers Shift when pressed and released alone', () => {
    render(<Mapper />)
    clickStart()
    fireEvent.keyDown(window, { code: 'ShiftLeft' })
    fireEvent.keyUp(window, { code: 'ShiftLeft' })
    expect(getCell('main', 0, 0)).toHaveTextContent('Shift')
  })
})
