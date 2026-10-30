export type KeyCapT = { code: string; label: string }

// Rows run bottom to top, the way a player reads them:
// each row up is higher. Codes are physical keys, so
// other keyboard layouts play the same shape.
export const keyRows: KeyCapT[][] = [
	[
		{ code: 'KeyZ', label: 'Z' },
		{ code: 'KeyX', label: 'X' },
		{ code: 'KeyC', label: 'C' },
		{ code: 'KeyV', label: 'V' },
		{ code: 'KeyB', label: 'B' },
		{ code: 'KeyN', label: 'N' },
		{ code: 'KeyM', label: 'M' },
		{ code: 'Comma', label: ',' },
		{ code: 'Period', label: '.' },
		{ code: 'Slash', label: '/' }
	],
	[
		{ code: 'KeyA', label: 'A' },
		{ code: 'KeyS', label: 'S' },
		{ code: 'KeyD', label: 'D' },
		{ code: 'KeyF', label: 'F' },
		{ code: 'KeyG', label: 'G' },
		{ code: 'KeyH', label: 'H' },
		{ code: 'KeyJ', label: 'J' },
		{ code: 'KeyK', label: 'K' },
		{ code: 'KeyL', label: 'L' },
		{ code: 'Semicolon', label: ';' },
		{ code: 'Quote', label: "'" }
	],
	[
		{ code: 'KeyQ', label: 'Q' },
		{ code: 'KeyW', label: 'W' },
		{ code: 'KeyE', label: 'E' },
		{ code: 'KeyR', label: 'R' },
		{ code: 'KeyT', label: 'T' },
		{ code: 'KeyY', label: 'Y' },
		{ code: 'KeyU', label: 'U' },
		{ code: 'KeyI', label: 'I' },
		{ code: 'KeyO', label: 'O' },
		{ code: 'KeyP', label: 'P' },
		{ code: 'BracketLeft', label: '[' },
		{ code: 'BracketRight', label: ']' }
	],
	[
		{ code: 'Digit1', label: '1' },
		{ code: 'Digit2', label: '2' },
		{ code: 'Digit3', label: '3' },
		{ code: 'Digit4', label: '4' },
		{ code: 'Digit5', label: '5' },
		{ code: 'Digit6', label: '6' },
		{ code: 'Digit7', label: '7' },
		{ code: 'Digit8', label: '8' },
		{ code: 'Digit9', label: '9' },
		{ code: 'Digit0', label: '0' },
		{ code: 'Minus', label: '-' },
		{ code: 'Equal', label: '=' }
	]
]

export const pedalCode = 'Space'

export type BoardKeyT = { code: string; label: string; span: number }

const modifier = (code: string, label: string, span: number): BoardKeyT => ({ code, label, span })
const fromRow = (row: KeyCapT[]): BoardKeyT[] => row.map((keyCap) => ({ ...keyCap, span: 1 }))

// The whole board, top row first, in key widths. Every row
// is 15 wide, so the edges line up like a real keyboard.
// Only the letter, number, and punctuation keys play.
export const boardRows: BoardKeyT[][] = [
	[modifier('Backquote', '`', 1), ...fromRow(keyRows[3]), modifier('Backspace', 'backspace', 2)],
	[modifier('Tab', 'tab', 1.5), ...fromRow(keyRows[2]), modifier('Backslash', '\\', 1.5)],
	[modifier('CapsLock', 'caps', 1.75), ...fromRow(keyRows[1]), modifier('Enter', 'enter', 2.25)],
	[modifier('ShiftLeft', 'shift', 2.25), ...fromRow(keyRows[0]), modifier('ShiftRight', 'shift', 2.75)],
	[
		modifier('ControlLeft', 'ctrl', 1.5),
		modifier('AltLeft', 'alt', 1.5),
		modifier(pedalCode, 'space', 9),
		modifier('AltRight', 'alt', 1.5),
		modifier('ControlRight', 'ctrl', 1.5)
	]
]

// Keys that only light up when pressed.
export const decorCodes = new Set(
	boardRows
		.flat()
		.map((key) => key.code)
		.filter((code) => !keyRows.flat().some((keyCap) => keyCap.code === code) && code !== pedalCode)
)
