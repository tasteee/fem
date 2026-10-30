import { findScale } from './scales'

export const lowestMidi = 21
export const highestMidi = 108

const letters = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const letterPitchClass = [0, 2, 4, 5, 7, 9, 11]
const accidentalSymbols: Record<number, string> = { [-2]: '𝄫', [-1]: '♭', 0: '', 1: '♯', 2: '𝄪' }
const sharpNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
const flatNames = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']

export type RootT = { id: string; label: string; letterIndex: number; accidental: number; pitchClass: number }

const makeRoot = (letter: string, accidental: number): RootT => {
	const letterIndex = letters.indexOf(letter)
	const pitchClass = (letterPitchClass[letterIndex] + accidental + 12) % 12
	const symbol = accidentalSymbols[accidental]
	const asciiSymbol = accidental === 0 ? '' : accidental > 0 ? '#' : 'b'
	return { id: `${letter}${asciiSymbol}`, label: `${letter}${symbol}`, letterIndex, accidental, pitchClass }
}

export const roots: RootT[] = [
	makeRoot('C', 0),
	makeRoot('C', 1),
	makeRoot('D', -1),
	makeRoot('D', 0),
	makeRoot('D', 1),
	makeRoot('E', -1),
	makeRoot('E', 0),
	makeRoot('F', 0),
	makeRoot('F', 1),
	makeRoot('G', -1),
	makeRoot('G', 0),
	makeRoot('G', 1),
	makeRoot('A', -1),
	makeRoot('A', 0),
	makeRoot('A', 1),
	makeRoot('B', -1),
	makeRoot('B', 0)
]

export const findRoot = (id: string): RootT => roots.find((root) => root.id === id) ?? roots[0]

export type SpelledNoteT = { name: string; octave: number }

// Spells a note by letter, so E♭ minor has C♭ and G♭ and
// F♯ major has E♯. The octave follows the letter: C♭4
// sounds a semitone under C4, as B3.
const spellByLetter = (midi: number, letterIndex: number): SpelledNoteT => {
	const naturalPitchClass = letterPitchClass[letterIndex]
	const difference = (((midi % 12) - naturalPitchClass + 18) % 12) - 6
	const naturalMidi = midi - difference
	const octave = Math.floor(naturalMidi / 12) - 1
	const symbol = accidentalSymbols[difference] ?? ''
	return { name: `${letters[letterIndex]}${symbol}`, octave }
}

// Scales without letter steps use flats in flat keys.
const prefersFlats = (root: RootT): boolean => root.accidental < 0 || (root.letterIndex === 3 && root.accidental === 0)

const spellBySpelling = (midi: number, root: RootT): SpelledNoteT => {
	const names = prefersFlats(root) ? flatNames : sharpNames
	return { name: names[midi % 12], octave: Math.floor(midi / 12) - 1 }
}

// Where a scale degree lands. Degrees count up from the
// root of the bottom octave and may go negative.
export const noteForDegree = (degree: number, root: RootT, scaleId: string, octave: number) => {
	const scale = findScale(scaleId)
	const size = scale.intervals.length
	const scaleOctave = Math.floor(degree / size)
	const index = degree - scaleOctave * size
	const midi = 12 * (octave + 1) + root.pitchClass + 12 * scaleOctave + scale.intervals[index]
	const letterStep = scale.letterSteps?.[index]
	const hasLetter = letterStep !== undefined
	const letterIndex = hasLetter ? (root.letterIndex + letterStep + 70) % 7 : 0
	const spelled = hasLetter ? spellByLetter(midi, letterIndex) : spellBySpelling(midi, root)
	const isRoot = index === 0
	return { midi, ...spelled, isRoot }
}

// Chromatic layouts count semitones from the root.
export const noteForSemitone = (semitone: number, root: RootT, octave: number) => {
	return noteForDegree(semitone, root, 'chromatic', octave)
}

export const isPlayable = (midi: number): boolean => midi >= lowestMidi && midi <= highestMidi
