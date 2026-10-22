import { c, useEvent, useProp, useRef } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { IconSvg } from '../../foundation/icons'
import { useSlidingIndicator } from '../../foundation/use-sliding-indicator'
import { caretLeftIcon, caretRightIcon } from '../../icons/generated'
import paginationCss from './pagination.css?inline'

const paginationSheet = createStyleSheet(paginationCss)

type PageEntryT = { kind: 'page'; page: number } | { kind: 'gap'; key: string }

const buildPageRange = (firstPage: number, lastPage: number): PageEntryT[] => {
	const entries: PageEntryT[] = []
	for (const page of Array.from({ length: lastPage - firstPage + 1 }, (_, offset) => firstPage + offset)) {
		entries.push({ kind: 'page', page })
	}
	return entries
}

// Always shows the first and last page, the current
// page with its neighbors, and a gap where pages are
// skipped.
const buildPageEntries = (currentPage: number, totalPages: number, siblingCount: number): PageEntryT[] => {
	const visibleSlots = siblingCount * 2 + 5
	const fitsWithoutGaps = totalPages <= visibleSlots
	if (fitsWithoutGaps) return buildPageRange(1, totalPages)

	const windowStart = Math.max(2, currentPage - siblingCount)
	const windowEnd = Math.min(totalPages - 1, currentPage + siblingCount)
	const hasStartGap = windowStart > 2
	const hasEndGap = windowEnd < totalPages - 1

	const entries: PageEntryT[] = [{ kind: 'page', page: 1 }]
	if (hasStartGap) entries.push({ kind: 'gap', key: 'start' })
	entries.push(...buildPageRange(windowStart, windowEnd))
	if (hasEndGap) entries.push({ kind: 'gap', key: 'end' })
	entries.push({ kind: 'page', page: totalPages })
	return entries
}

const clampPage = (page: number, totalPages: number): number => {
	const lastPage = Math.max(1, totalPages)
	return Math.min(lastPage, Math.max(1, page))
}

// Page numbers for long lists. The current page's
// fill slides, like every other selection in fem.
export const Pagination = c(
	(props) => {
		const trackRef = useRef<HTMLDivElement>()
		const indicatorRef = useRef<HTMLSpanElement>()
		const hostRef = useRef<HTMLElement>()
		const [page, setPage] = useProp<number>('page')
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })

		const totalPages = Math.max(1, props.total)
		const currentPage = clampPage(page ?? 1, totalPages)
		const entries = buildPageEntries(currentPage, totalPages, props.siblings)
		const isFirstPage = currentPage === 1
		const isLastPage = currentPage === totalPages

		const findCurrentButton = () => {
			const track = trackRef.current
			if (!track) return undefined
			return track.querySelector<HTMLElement>('[aria-current="page"]') ?? undefined
		}

		useSlidingIndicator({
			hostRef: hostRef as { current: HTMLElement },
			trackRef,
			indicatorRef,
			itemTagName: '',
			value: String(currentPage),
			findSelectedItem: findCurrentButton
		})

		const goToPage = (nextPage: number) => {
			const clampedPage = clampPage(nextPage, totalPages)
			const isSamePage = clampedPage === currentPage
			if (isSamePage) return
			setPage(clampedPage)
			dispatchChange()
		}

		const handlePreviousClick = () => goToPage(currentPage - 1)
		const handleNextClick = () => goToPage(currentPage + 1)

		const renderEntry = (entry: PageEntryT) => {
			const isGap = entry.kind === 'gap'
			if (isGap) {
				return (
					<span key={entry.key} class='pagination-gap' aria-hidden='true'>
						…
					</span>
				)
			}

			const isCurrent = entry.page === currentPage
			const currentClass = getFlagClass(isCurrent, 'isCurrent')
			const className = buildClassName(['pagination-page', currentClass])
			const currentLabel = isCurrent ? 'page' : undefined
			const pageLabel = `Page ${entry.page}`
			const handlePageClick = () => goToPage(entry.page)

			return (
				<button key={entry.page} class={className} aria-current={currentLabel} aria-label={pageLabel} onclick={handlePageClick}>
					{entry.page}
				</button>
			)
		}

		return (
			<host shadowDom>
				<nav class='pagination' aria-label='Pagination'>
					<button class='pagination-step' aria-label='Previous page' disabled={isFirstPage} onclick={handlePreviousClick}>
						<IconSvg icon={caretLeftIcon} kind='bold' />
					</button>
					<div ref={trackRef} class='pagination-pages'>
						<span ref={indicatorRef} class='slide-indicator pagination-indicator' aria-hidden='true'></span>
						{entries.map(renderEntry)}
					</div>
					<button class='pagination-step' aria-label='Next page' disabled={isLastPage} onclick={handleNextClick}>
						<IconSvg icon={caretRightIcon} kind='bold' />
					</button>
				</nav>
			</host>
		)
	},
	{
		props: {
			page: { type: Number, reflect: true, value: (): number => 1 },
			total: { type: Number, reflect: true, value: (): number => 1 },
			siblings: { type: Number, value: (): number => 1 }
		},
		styles: [foundationSheet, paginationSheet]
	}
)
