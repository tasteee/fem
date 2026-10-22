import { c, useEvent, useState } from 'atomico'
import { buildClassName, getFlagClass, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { IconSvg } from '../../foundation/icons'
import { caretDownIcon } from '../../icons/generated'
import tableCss from './table.css?inline'

export type TableAlignT = 'start' | 'center' | 'end'
export type TableSortDirectionT = 'ascending' | 'descending'

export type TableColumnT = {
	key: string
	label: string
	align?: TableAlignT
	numeric?: boolean
	sortable?: boolean
}

export type TableRowT = Record<string, string | number>

type SortStateT = { key: string; direction: TableSortDirectionT } | null

const tableSheet = createStyleSheet(tableCss)

const compareValues = (firstValue: string | number, secondValue: string | number): number => {
	const areNumbers = typeof firstValue === 'number' && typeof secondValue === 'number'
	if (areNumbers) return firstValue - secondValue
	return String(firstValue).localeCompare(String(secondValue), undefined, { numeric: true })
}

const sortRows = (rows: TableRowT[], sortState: SortStateT): TableRowT[] => {
	if (!sortState) return rows
	const directionFactor = sortState.direction === 'ascending' ? 1 : -1
	const sortedRows = [...rows]
	sortedRows.sort((firstRow, secondRow) => {
		const comparison = compareValues(firstRow[sortState.key], secondRow[sortState.key])
		return comparison * directionFactor
	})
	return sortedRows
}

// Ascending, then descending, then back to the
// original order.
const getNextSortState = (currentState: SortStateT, columnKey: string): SortStateT => {
	const isSameColumn = currentState?.key === columnKey
	if (!isSameColumn) return { key: columnKey, direction: 'ascending' }
	const isAscending = currentState?.direction === 'ascending'
	if (isAscending) return { key: columnKey, direction: 'descending' }
	return null
}

const getCellClassName = (column: TableColumnT): string => {
	const alignClass = getModifierClass(column.align ?? 'start')
	const numericClass = getFlagClass(column.numeric, 'isNumeric')
	return buildClassName(['table-cell', alignClass, numericClass])
}

// A data table drawn from columns and rows. Rows
// alternate fills instead of drawing lines, so it
// stays flat. Sortable columns sort on click.
export const Table = c(
	(props) => {
		const [sortState, setSortState] = useState<SortStateT>(null)
		const dispatchSort = useEvent('sort', { bubbles: true, composed: true })

		const columns = props.columns as TableColumnT[]
		const rows = props.rows as TableRowT[]
		const visibleRows = sortRows(rows, sortState)

		const renderHeaderCell = (column: TableColumnT) => {
			const cellClassName = getCellClassName(column)
			const isSorted = sortState?.key === column.key
			const ariaSort = isSorted ? sortState?.direction : undefined
			const isDescending = isSorted && sortState?.direction === 'descending'

			if (!column.sortable) {
				return (
					<th key={column.key} class={cellClassName} scope='col'>
						{column.label}
					</th>
				)
			}

			const sortedClass = getFlagClass(isSorted, 'isSorted')
			const descendingClass = getFlagClass(isDescending, 'isDescending')
			const buttonClassName = buildClassName(['table-sort', sortedClass, descendingClass])

			const handleSortClick = () => {
				const nextSortState = getNextSortState(sortState, column.key)
				setSortState(nextSortState)
				dispatchSort()
			}

			return (
				<th key={column.key} class={cellClassName} scope='col' aria-sort={ariaSort}>
					<button class={buttonClassName} onclick={handleSortClick}>
						{column.label}
						<IconSvg icon={caretDownIcon} kind='bold' />
					</button>
				</th>
			)
		}

		const renderCell = (row: TableRowT, column: TableColumnT) => {
			const cellClassName = getCellClassName(column)
			return (
				<td key={column.key} class={cellClassName}>
					{row[column.key]}
				</td>
			)
		}

		const renderRow = (row: TableRowT, rowIndex: number) => {
			const cells = columns.map((column) => renderCell(row, column))
			return (
				<tr key={rowIndex} class='table-row'>
					{cells}
				</tr>
			)
		}

		const hasRows = visibleRows.length > 0
		const emptyRow = (
			<tr>
				<td class='table-empty' colSpan={columns.length}>
					{props.emptyText}
				</td>
			</tr>
		)
		const bodyRows = hasRows ? visibleRows.map(renderRow) : emptyRow
		const headerCells = columns.map(renderHeaderCell)

		return (
			<host shadowDom>
				<div class='table-scroll'>
					<table class='table' aria-label={props.label}>
						<thead>
							<tr>{headerCells}</tr>
						</thead>
						<tbody>{bodyRows}</tbody>
					</table>
				</div>
			</host>
		)
	},
	{
		props: {
			columns: { type: Array, value: (): TableColumnT[] => [] },
			rows: { type: Array, value: (): TableRowT[] => [] },
			label: String,
			emptyText: { type: String, value: (): string => 'Nothing here yet.' }
		},
		styles: [foundationSheet, tableSheet]
	}
)
