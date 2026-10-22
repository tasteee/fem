import { useEffect, useFormReset, useInternals } from 'atomico'
import type { Ref } from 'atomico'

export type FormControlInputT = {
	// The value sent with the form. Null sends nothing,
	// like an unchecked checkbox.
	formValue: string | null
	isMissing: boolean
	missingMessage: string
	// The element the browser points its message at.
	anchorRef: Ref<HTMLElement>
	handleReset: () => void
}

// Makes a component take part in a form like a native
// control: it submits a value under its name, resets
// with the form, and can block submit when required.
export const useFormControl = (input: FormControlInputT): ElementInternals => {
	const internals = useInternals()
	useFormReset(input.handleReset)

	useEffect(() => {
		internals.setFormValue(input.formValue)
	}, [input.formValue])

	useEffect(() => {
		if (!input.isMissing) return internals.setValidity({})
		internals.setValidity({ valueMissing: true }, input.missingMessage, input.anchorRef.current)
	}, [input.isMissing])

	return internals
}

// Lets the host take focus on behalf of the control
// inside it, so a label's "for" and host.focus() work.
export const focusableShadow = { delegatesFocus: true }
