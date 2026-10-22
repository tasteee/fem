import { useState } from 'atomico'

const checkHasContent = (node: Node): boolean => {
	const isElement = node.nodeType === Node.ELEMENT_NODE
	if (isElement) return true
	const text = node.textContent ?? ''
	return text.trim() !== ''
}

// Tracks whether a named slot holds anything, so empty
// slots can collapse and leave no gap behind.
export const useSlotFilled = (): [boolean, (event: Event) => void] => {
	const [isFilled, setFilled] = useState(false)

	const handleSlotChange = (event: Event) => {
		const slotElement = event.currentTarget as HTMLSlotElement
		const assignedNodes = slotElement.assignedNodes({ flatten: true })
		const hasContent = assignedNodes.some(checkHasContent)
		setFilled(hasContent)
	}

	return [isFilled, handleSlotChange]
}
