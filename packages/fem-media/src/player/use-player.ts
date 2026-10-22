import { useEffect, useRef, useState } from 'atomico'
import { player } from './player'
import type { PlayerStateT } from './player'

// Reads one slice of the player. The component only
// renders again when that slice changes, so a list of
// fifty track rows doesn't redraw on every frame of
// playback.
export const usePlayer = <T>(select: (state: PlayerStateT) => T): T => {
	const selectRef = useRef(select)
	selectRef.current = select
	// Boxed, because Atomico's ref type can't hold a
	// bare generic.
	const selectedRef = useRef<{ value: T }>()
	const isFirstRender = selectedRef.current === undefined
	if (isFirstRender) selectedRef.current = { value: select(player.getState()) }
	const [, setVersion] = useState(0)

	useEffect(() => {
		const handleChange = (state: PlayerStateT) => {
			const nextSelected = selectRef.current(state)
			const box = selectedRef.current as { value: T }
			const isSame = Object.is(nextSelected, box.value)
			if (isSame) return
			box.value = nextSelected
			setVersion((version: number) => version + 1)
		}

		return player.subscribe(handleChange)
	}, [])

	// Read fresh on every render too, so a change of
	// props, like a new track, shows at once.
	const box = selectedRef.current as { value: T }
	const freshValue = select(player.getState())
	box.value = freshValue
	return freshValue
}
