import axe from 'axe-core'
import { afterEach, describe, expect, it } from 'vitest'
import { examplesByTag } from '../../../apps/site/src/docs/components/examples'
import { cleanup, mount, settle } from './helpers'

afterEach(cleanup)

// Every live docs example is audited in both themes, so
// a docs page can't ship an inaccessible component.
const themes = ['light', 'dark'] as const

// No motion, so axe reads final colors, not a mid-slide frame.
const motionTokens = ['press-in', 'press-out', 'fast', 'medium', 'slow', 'slide']

// Inactive controls are exempt from contrast (WCAG 1.4.3).
// A disabled scrubber dims its time labels with it, but
// axe only sees the labels, so skip anything inside a
// disabled component.
const checkContrastExempt = (ruleId: string, element: Element | undefined): boolean => {
	if (ruleId !== 'color-contrast') return false
	let current: Node | null = element ?? null
	while (current) {
		if (current instanceof Element && current.hasAttribute('disabled')) return true
		current = current.parentNode ?? (current as ShadowRoot).host ?? null
	}
	return false
}

const audit = async (html: string, theme: string) => {
	document.documentElement.setAttribute('theme', theme)
	for (const token of motionTokens) document.documentElement.style.setProperty(`--duration-${token}`, '0ms')
	document.body.style.background = 'var(--surface-page)'
	document.body.style.color = 'var(--text-strong)'
	document.body.style.fontFamily = 'var(--font-family)'
	const host = mount<HTMLElement>(`<main>${html}</main>`)
	await settle()
	const results = await axe.run(host, {
		elementRef: true,
		// Rules that need a full page, not a fragment.
		rules: { region: { enabled: false }, 'page-has-heading-one': { enabled: false } }
	})
	const violations = results.violations
		.map((violation) => ({
			...violation,
			nodes: violation.nodes.filter((node) => !checkContrastExempt(violation.id, node.element))
		}))
		.filter((violation) => violation.nodes.length > 0)
	return violations.map((violation) => {
		const firstNode = violation.nodes[0]
		const target = firstNode.target.join(' >> ')
		const reason = (firstNode.any[0] ?? firstNode.all[0] ?? firstNode.none[0])?.message ?? violation.help
		return `${violation.id} [${violation.nodes.length}] ${target} :: ${reason}`
	})
}

describe('accessibility (axe)', () => {
	for (const [tagName, example] of Object.entries(examplesByTag)) {
		for (const theme of themes) {
			it(`${tagName} (${theme})`, async () => {
				const violations = await audit(example.html, theme)
				expect(violations).toEqual([])
			})
		}
	}
})
