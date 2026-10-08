import { useEffect } from 'atomico'
import { getEnabledItems, handleRovingKeyDown } from './roving-focus'

// The host of a component is always present, unlike
// a ref to an element it renders.
type HostRefT = { current: HTMLElement }

type GroupItemT = HTMLElement & { value: string; selected: boolean; disabled: boolean }

export type SelectionGroupT = {
	syncItems: () => void
	handleClick: (event: Event) => void
	handleKeyDown: (event: KeyboardEvent) => void
}

type SelectionGroupInputT = {
	hostRef: HostRefT
	itemTagName: string
	value: string | undefined
	setValue: (value: string) => void
	dispatchChange: () => void
}

// Shared by tabs and the segmented control: one item
// is selected at a time, and the arrow keys move
// between items.
export const useSelectionGroup = (input: SelectionGroupInputT): SelectionGroupT => {
	const getItems = () => [...input.hostRef.current.querySelectorAll<GroupItemT>(input.itemTagName)]

	const syncItems = () => {
		for (const item of getItems()) item.selected = item.value === input.value
	}

	useEffect(syncItems, [input.value])

	const handleClick = (event: Event) => {
		const clickPath = event.composedPath()
		const clickedItem = getItems().find((item) => clickPath.includes(item))
		if (!clickedItem) return
		if (clickedItem.disabled) return
		const isSameValue = clickedItem.value === input.value
		if (isSameValue) return
		input.setValue(clickedItem.value)
		input.dispatchChange()
	}

	const handleKeyDown = (event: KeyboardEvent) => {
		const enabledItems = getEnabledItems(input.hostRef.current, input.itemTagName)
		handleRovingKeyDown(event, enabledItems, 'horizontal')
	}

	return { syncItems, handleClick, handleKeyDown }
}
