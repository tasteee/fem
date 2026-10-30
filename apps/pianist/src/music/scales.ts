export type ScaleT = {
	id: string
	label: string
	// Semitones above the root, one octave.
	intervals: number[]
	// The letter step of each note (0 is the root letter).
	// Scales without letters are spelled by key instead.
	letterSteps: number[] | undefined
}

const heptatonic = [0, 1, 2, 3, 4, 5, 6]

export const scales: ScaleT[] = [
	{ id: 'major', label: 'Major', intervals: [0, 2, 4, 5, 7, 9, 11], letterSteps: heptatonic },
	{ id: 'minor', label: 'Natural minor', intervals: [0, 2, 3, 5, 7, 8, 10], letterSteps: heptatonic },
	{ id: 'harmonic-minor', label: 'Harmonic minor', intervals: [0, 2, 3, 5, 7, 8, 11], letterSteps: heptatonic },
	{ id: 'melodic-minor', label: 'Melodic minor', intervals: [0, 2, 3, 5, 7, 9, 11], letterSteps: heptatonic },
	{ id: 'dorian', label: 'Dorian', intervals: [0, 2, 3, 5, 7, 9, 10], letterSteps: heptatonic },
	{ id: 'phrygian', label: 'Phrygian', intervals: [0, 1, 3, 5, 7, 8, 10], letterSteps: heptatonic },
	{ id: 'lydian', label: 'Lydian', intervals: [0, 2, 4, 6, 7, 9, 11], letterSteps: heptatonic },
	{ id: 'mixolydian', label: 'Mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10], letterSteps: heptatonic },
	{ id: 'locrian', label: 'Locrian', intervals: [0, 1, 3, 5, 6, 8, 10], letterSteps: heptatonic },
	{ id: 'major-pentatonic', label: 'Major pentatonic', intervals: [0, 2, 4, 7, 9], letterSteps: [0, 1, 2, 4, 5] },
	{ id: 'minor-pentatonic', label: 'Minor pentatonic', intervals: [0, 3, 5, 7, 10], letterSteps: [0, 2, 3, 4, 6] },
	{ id: 'blues', label: 'Blues', intervals: [0, 3, 5, 6, 7, 10], letterSteps: [0, 2, 3, 4, 4, 6] },
	{ id: 'whole-tone', label: 'Whole tone', intervals: [0, 2, 4, 6, 8, 10], letterSteps: undefined },
	{ id: 'chromatic', label: 'Chromatic', intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], letterSteps: undefined }
]

export const findScale = (id: string): ScaleT => scales.find((scale) => scale.id === id) ?? scales[0]
