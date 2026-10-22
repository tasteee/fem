import { c, useEffect, useEvent, useHost, useRef, useState } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { createSortable } from './sortable-drag'
import type { ReorderDetailT } from './sortable-drag'
import sortableCss from './sortable.css?inline'

export type SortableGapT = '0' | '1' | '2' | '3' | '4' | '5' | '6'

const sortableSheet = createStyleSheet(sortableCss)

// A list people can put in order. Drag an item, or a
// [data-sortable-handle] inside it. Hold to drag on
// touch. Alt with an arrow moves the focused item.
//
// It sends reorder with { from, to } and leaves the
// DOM alone, so a framework can reorder its own data.
// Add move-nodes to have it move the elements itself.
export const Sortable = c(
	(props) => {
		const hostRef = useHost()
		const [announcement, setAnnouncement] = useState('')
		const dispatchReorder = useEvent<ReorderDetailT>('reorder', { bubbles: true, composed: true })

		// The controller lives across renders, so it reads
		// the latest props through this ref.
		const latestRef = useRef({ props, dispatchReorder })
		latestRef.current = { props, dispatchReorder }

		useEffect(() => {
			const host = hostRef.current

			const destroy = createSortable(host, {
				getShouldMoveNodes: () => Boolean(latestRef.current.props.moveNodes),
				getIsDisabled: () => Boolean(latestRef.current.props.disabled),
				announce: setAnnouncement,
				dispatchReorder: (detail) => latestRef.current.dispatchReorder(detail)
			})

			return destroy
		}, [])

		const gapStyle = `--sortable-gap: var(--space-${props.gap})`
		const zeroGapStyle = '--sortable-gap: 0px'
		const isZeroGap = props.gap === '0'
		const listStyle = isZeroGap ? zeroGapStyle : gapStyle

		return (
			<host shadowDom>
				<div class='sortable' role='list' aria-label={props.label} style={listStyle}>
					<slot></slot>
				</div>
				<span class='sortable-status' aria-live='assertive'>
					{announcement}
				</span>
			</host>
		)
	},
	{
		props: {
			label: { type: String, value: (): string => '' },
			gap: { type: String, reflect: true, value: (): SortableGapT => '1' },
			moveNodes: { type: Boolean, reflect: true },
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, sortableSheet]
	}
)
