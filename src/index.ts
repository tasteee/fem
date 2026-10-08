import { Badge } from './components/badge/badge'
import { Button } from './components/button/button'
import { Checkbox } from './components/checkbox/checkbox'
import { Chip } from './components/chip/chip'
import { Dialog } from './components/dialog/dialog'
import { Input } from './components/input/input'
import { Menu } from './components/menu/menu'
import { MenuItem } from './components/menu-item/menu-item'
import { Option } from './components/option/option'
import { Radio } from './components/radio/radio'
import { Select } from './components/select/select'
import { Sheet } from './components/sheet/sheet'
import { Slider } from './components/slider/slider'
import { Switch } from './components/switch/switch'
import { Tag } from './components/tag/tag'
import { Toast } from './components/toast/toast'
import { Tooltip } from './components/tooltip/tooltip'
import { showToast } from './show-toast'

const elements: [string, CustomElementConstructor][] = [
	['fem-badge', Badge],
	['fem-button', Button],
	['fem-checkbox', Checkbox],
	['fem-chip', Chip],
	['fem-dialog', Dialog],
	['fem-input', Input],
	['fem-menu', Menu],
	['fem-menu-item', MenuItem],
	['fem-option', Option],
	['fem-radio', Radio],
	['fem-select', Select],
	['fem-sheet', Sheet],
	['fem-slider', Slider],
	['fem-switch', Switch],
	['fem-tag', Tag],
	['fem-toast', Toast],
	['fem-tooltip', Tooltip]
]

for (const element of elements) {
	const tagName = element[0]
	const elementClass = element[1]
	const isDefined = customElements.get(tagName) !== undefined
	if (!isDefined) customElements.define(tagName, elementClass)
}

export { showToast }
export { Badge, Button, Checkbox, Chip, Dialog, Input, Menu, MenuItem, Option, Radio, Select, Sheet, Slider, Switch }
export { Tag, Toast, Tooltip }
