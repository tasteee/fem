import { Badge } from './components/badge/badge'
import { Button } from './components/button/button'
import { Checkbox } from './components/checkbox/checkbox'
import { Chip } from './components/chip/chip'
import { Input } from './components/input/input'
import { Option } from './components/option/option'
import { Radio } from './components/radio/radio'
import { Select } from './components/select/select'
import { Slider } from './components/slider/slider'
import { Switch } from './components/switch/switch'
import { Tag } from './components/tag/tag'

const elements: [string, CustomElementConstructor][] = [
	['fem-badge', Badge],
	['fem-button', Button],
	['fem-checkbox', Checkbox],
	['fem-chip', Chip],
	['fem-input', Input],
	['fem-option', Option],
	['fem-radio', Radio],
	['fem-select', Select],
	['fem-slider', Slider],
	['fem-switch', Switch],
	['fem-tag', Tag]
]

for (const element of elements) {
	const tagName = element[0]
	const elementClass = element[1]
	const isDefined = customElements.get(tagName) !== undefined
	if (!isDefined) customElements.define(tagName, elementClass)
}

export { Badge, Button, Checkbox, Chip, Input, Option, Radio, Select, Slider, Switch, Tag }
