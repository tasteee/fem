import { Avatar } from './components/avatar/avatar'
import { Badge } from './components/badge/badge'
import { Banner } from './components/banner/banner'
import { Button } from './components/button/button'
import { Checkbox } from './components/checkbox/checkbox'
import { Chip } from './components/chip/chip'
import { Dialog } from './components/dialog/dialog'
import { Input } from './components/input/input'
import { MenuItem } from './components/menu-item/menu-item'
import { Menu } from './components/menu/menu'
import { Option } from './components/option/option'
import { Progress } from './components/progress/progress'
import { Radio } from './components/radio/radio'
import { Segment } from './components/segment/segment'
import { Segmented } from './components/segmented/segmented'
import { Select } from './components/select/select'
import { Sheet } from './components/sheet/sheet'
import { Slider } from './components/slider/slider'
import { Swap } from './components/swap/swap'
import { Switch } from './components/switch/switch'
import { Tab } from './components/tab/tab'
import { Tabs } from './components/tabs/tabs'
import { Tag } from './components/tag/tag'
import { Toast } from './components/toast/toast'
import { Tooltip } from './components/tooltip/tooltip'
import { showToast } from './show-toast'

const elements: [string, CustomElementConstructor][] = [
	['fem-avatar', Avatar],
	['fem-badge', Badge],
	['fem-banner', Banner],
	['fem-button', Button],
	['fem-checkbox', Checkbox],
	['fem-chip', Chip],
	['fem-dialog', Dialog],
	['fem-input', Input],
	['fem-menu', Menu],
	['fem-menu-item', MenuItem],
	['fem-option', Option],
	['fem-progress', Progress],
	['fem-radio', Radio],
	['fem-segment', Segment],
	['fem-segmented', Segmented],
	['fem-select', Select],
	['fem-sheet', Sheet],
	['fem-slider', Slider],
	['fem-swap', Swap],
	['fem-switch', Switch],
	['fem-tab', Tab],
	['fem-tabs', Tabs],
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
export { Avatar, Badge, Banner, Button, Checkbox, Chip, Dialog, Input, Menu, MenuItem, Option, Progress }
export { Radio, Segment, Segmented, Select, Sheet, Slider, Swap, Switch, Tab, Tabs, Tag, Toast }
export { Tooltip }
