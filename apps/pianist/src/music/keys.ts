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

// How far each row sits to the right, in key widths,
// like a real keyboard.
export const rowOffsets = [1.25, 0.75, 0.5, 0]

export const pedalCode = 'Space'
