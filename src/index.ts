import { Badge } from './components/badge/badge'
import { Button } from './components/button/button'
import { Chip } from './components/chip/chip'
import { Input } from './components/input/input'
import { Tag } from './components/tag/tag'

const elements: [string, CustomElementConstructor][] = [
	['fem-badge', Badge],
	['fem-button', Button],
	['fem-chip', Chip],
	['fem-input', Input],
	['fem-tag', Tag]
]

for (const element of elements) {
	const tagName = element[0]
	const elementClass = element[1]
	const isDefined = customElements.get(tagName) !== undefined
	if (!isDefined) customElements.define(tagName, elementClass)
}

export { Badge, Button, Chip, Input, Tag }
