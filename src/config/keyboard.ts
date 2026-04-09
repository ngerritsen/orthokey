export const COLS = 12
export const ROWS = 4
export const LAYERS = ['main', 'lower', 'raised'] as const
export type Layer = (typeof LAYERS)[number]

// These positions are pre-labeled and skipped during mapping
export const SKIP_POSITIONS: [number, number][] = [
  [4, 3], // Lower layer key
  [7, 3], // Raise layer key
]

// Mirror targets: key = position to auto-fill, value = position to copy from
// (6,3) mirrors (5,3) — the spacebar spans two coordinates
export const MIRROR_TARGETS: Record<string, string> = {
  '6,3': '5,3',
}

export const POSITION_LABELS: Record<string, string> = {
  '4,3': 'Lower',
  '7,3': 'Raise',
}

export const LAYER_LABELS: Record<Layer, string> = {
  main: 'Main layer',
  lower: 'Lower layer',
  raised: 'Raised layer',
}

export function posKey(x: number, y: number): string {
  return `${x},${y}`
}

export function storeKey(x: number, y: number, layer: Layer): string {
  return `${x},${y},${layer}`
}

export function isSkipped(x: number, y: number): boolean {
  return SKIP_POSITIONS.some(([sx, sy]) => sx === x && sy === y)
}

export function isMirrorTarget(x: number, y: number): boolean {
  return posKey(x, y) in MIRROR_TARGETS
}

export function isPromptable(x: number, y: number): boolean {
  return !isSkipped(x, y) && !isMirrorTarget(x, y)
}

const CODE_SYMBOLS: Record<string, string> = {
  Comma: ',',
  Period: '.',
  Semicolon: ';',
  Quote: "'",
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Slash: '/',
  Minus: '-',
  Equal: '=',
  Backquote: '`',
  ShiftLeft: 'Shift',
  ShiftRight: 'Shift',
  AltLeft: 'Alt',
  AltRight: 'Alt',
  ControlLeft: 'Ctrl',
  ControlRight: 'Ctrl',
  MetaLeft: 'Meta',
  MetaRight: 'Meta',
  Backspace: '⌫',
  Enter: '↵',
  Tab: '⇥',
  Escape: 'Esc',
  Delete: 'Del',
  CapsLock: 'Caps',
  Space: 'Spc',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  PageUp: 'PgUp',
  PageDown: 'PgDn',
  Home: 'Home',
  End: 'End',
  Insert: 'Ins',
  PrintScreen: 'PrtSc',
  ScrollLock: 'ScrlLk',
  Pause: 'Pause',
  NumLock: 'NumLk',
  ContextMenu: 'Menu',
}

export function formatCode(code: string): string {
  if (code in CODE_SYMBOLS) return CODE_SYMBOLS[code]
  if (code.startsWith('Key')) return code.slice(3)
  if (code.startsWith('Digit')) return code.slice(5)
  return code
}
