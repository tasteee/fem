import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, inShadow, mount, settle } from './helpers'

afterEach(cleanup)

const hasFocus = (element: HTMLElement) => (element.getRootNode() as ShadowRoot).activeElement === element

type ItemT = HTMLElement & { expanded: boolean; selected: boolean }
type TreeT = HTMLElement & { value: string }

const setup = async () => {
	const tree = mount<TreeT>(`
		<fem-tree value="safeword" label="Library">
			<fem-tree-item value="drafts" label="Drafts" expanded>
				<fem-tree-item value="safeword" label="safeword"></fem-tree-item>
				<fem-tree-item value="hollow" label="hollow"></fem-tree-item>
			</fem-tree-item>
			<fem-tree-item value="archive" label="Archive">
				<fem-tree-item value="old" label="old"></fem-tree-item>
			</fem-tree-item>
		</fem-tree>`)
	await settle()
	const item = (value: string) => tree.querySelector<ItemT>(`fem-tree-item[value="${value}"]`)!
	const row = (value: string) => inShadow<HTMLElement>(item(value), '.tree-row')
	return { tree, item, row }
}

describe('fem-tree', () => {
	it('uses tree semantics and marks the selected item', async () => {
		const { tree, item } = await setup()
		expect(inShadow(tree, '[role="tree"]').getAttribute('aria-label')).toBe('Library')
		expect(item('safeword').getAttribute('aria-selected')).toBe('true')
		expect(item('hollow').getAttribute('aria-selected')).toBe('false')
	})

	it('reports expanded only on items with children', async () => {
		const { item } = await setup()
		expect(item('drafts').getAttribute('aria-expanded')).toBe('true')
		expect(item('archive').getAttribute('aria-expanded')).toBe('false')
		expect(item('hollow').hasAttribute('aria-expanded')).toBe(false)
	})

	it('selects on click and sends change', async () => {
		const { tree, row } = await setup()
		let changes = 0
		tree.addEventListener('change', () => changes++)
		await userEvent.click(row('hollow'))
		await settle()
		expect(tree.value).toBe('hollow')
		expect(changes).toBe(1)
	})

	it('the caret toggles without selecting', async () => {
		const { tree, item } = await setup()
		inShadow<HTMLElement>(item('archive'), '.tree-caret').click()
		await settle()
		expect(item('archive').expanded).toBe(true)
		expect(tree.value).toBe('safeword')
	})

	it('Down and Up move focus through visible rows only', async () => {
		const { row } = await setup()
		row('safeword').focus()
		await userEvent.keyboard('{ArrowDown}')
		expect(hasFocus(row('hollow'))).toBe(true)
		await userEvent.keyboard('{ArrowDown}')
		// "old" is hidden inside a closed Archive, so Down lands on Archive.
		expect(hasFocus(row('archive'))).toBe(true)
	})

	it('Right opens a closed item, Left closes it', async () => {
		const { item, row } = await setup()
		row('archive').focus()
		await userEvent.keyboard('{ArrowRight}')
		await settle()
		expect(item('archive').expanded).toBe(true)
		await userEvent.keyboard('{ArrowLeft}')
		await settle()
		expect(item('archive').expanded).toBe(false)
	})

	it('Left on a child moves focus to its parent', async () => {
		const { row } = await setup()
		row('hollow').focus()
		await userEvent.keyboard('{ArrowLeft}')
		expect(hasFocus(row('drafts'))).toBe(true)
	})

	it('Enter selects the focused item', async () => {
		const { tree, row } = await setup()
		row('hollow').focus()
		await userEvent.keyboard('{Enter}')
		await settle()
		expect(tree.value).toBe('hollow')
	})
})
