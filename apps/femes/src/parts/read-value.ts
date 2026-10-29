type ValueElementT = HTMLElement & { value: string }

// The current value of a fem input, select, or textarea
// from one of its events.
export const readValue = (event: Event): string => {
	const element = event.currentTarget as ValueElementT
	return element.value
}
