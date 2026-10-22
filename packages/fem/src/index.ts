import { Avatar } from './components/avatar/avatar'
import { Badge } from './components/badge/badge'
import { Banner } from './components/banner/banner'
import { Box, Column, Row } from './components/box/box'
import { Button } from './components/button/button'
import { Checkbox } from './components/checkbox/checkbox'
import { Chip } from './components/chip/chip'
import { Dialog } from './components/dialog/dialog'
import { Field } from './components/field/field'
import { Grid } from './components/grid/grid'
import { Icon } from './components/icon/icon'
import { Input } from './components/input/input'
import { MenuItem } from './components/menu-item/menu-item'
import { NavItem } from './components/nav-item/nav-item'
import { Nav } from './components/nav/nav'
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
import { TabBarItem } from './components/tab-bar-item/tab-bar-item'
import { TabBar } from './components/tab-bar/tab-bar'
import { Tab } from './components/tab/tab'
import { Tabs } from './components/tabs/tabs'
import { Tag } from './components/tag/tag'
import { Toast } from './components/toast/toast'
import { Tooltip } from './components/tooltip/tooltip'
import { Card } from './components/card/card'
import { Divider } from './components/divider/divider'
import { Heading } from './components/heading/heading'
import { Popover } from './components/popover/popover'
import { RadioGroup } from './components/radio-group/radio-group'
import { Skeleton } from './components/skeleton/skeleton'
import { Spinner } from './components/spinner/spinner'
import { Text } from './components/text/text'
import { Accordion } from './components/accordion/accordion'
import { AccordionItem } from './components/accordion-item/accordion-item'
import { AvatarGroup } from './components/avatar-group/avatar-group'
import { Breadcrumb } from './components/breadcrumb/breadcrumb'
import { Breadcrumbs } from './components/breadcrumbs/breadcrumbs'
import { CheckboxGroup } from './components/checkbox-group/checkbox-group'
import { EmptyState } from './components/empty-state/empty-state'
import { Pagination } from './components/pagination/pagination'
import { Table } from './components/table/table'
import { Calendar } from './components/calendar/calendar'
import { Combobox } from './components/combobox/combobox'
import { DatePicker } from './components/date-picker/date-picker'
import { DateRangePicker } from './components/date-range-picker/date-range-picker'
import { RangeSlider } from './components/range-slider/range-slider'
import { CommandGroup } from './components/command-group/command-group'
import { CommandItem } from './components/command-item/command-item'
import { CommandPalette } from './components/command-palette/command-palette'
import { Tree } from './components/tree/tree'
import { TreeItem } from './components/tree-item/tree-item'
import { CopyField } from './components/copy-field/copy-field'
import { FileUpload } from './components/file-upload/file-upload'
import { Image } from './components/image/image'
import { ListItem } from './components/list-item/list-item'
import { Scrubber } from './components/scrubber/scrubber'
import { Sortable } from './components/sortable/sortable'
import { Textarea } from './components/textarea/textarea'
import { registerIcons } from './icons/registry'
import { showToast } from './show-toast'

const elements: [string, CustomElementConstructor][] = [
	['fem-avatar', Avatar],
	['fem-badge', Badge],
	['fem-banner', Banner],
	['fem-box', Box],
	['fem-button', Button],
	['fem-checkbox', Checkbox],
	['fem-chip', Chip],
	['fem-column', Column],
	['fem-dialog', Dialog],
	['fem-field', Field],
	['fem-grid', Grid],
	['fem-icon', Icon],
	['fem-input', Input],
	['fem-menu', Menu],
	['fem-menu-item', MenuItem],
	['fem-nav', Nav],
	['fem-nav-item', NavItem],
	['fem-option', Option],
	['fem-progress', Progress],
	['fem-radio', Radio],
	['fem-row', Row],
	['fem-segment', Segment],
	['fem-segmented', Segmented],
	['fem-select', Select],
	['fem-sheet', Sheet],
	['fem-slider', Slider],
	['fem-swap', Swap],
	['fem-switch', Switch],
	['fem-tab', Tab],
	['fem-tab-bar', TabBar],
	['fem-tab-bar-item', TabBarItem],
	['fem-tabs', Tabs],
	['fem-tag', Tag],
	['fem-toast', Toast],
	['fem-tooltip', Tooltip],
	['fem-card', Card],
	['fem-divider', Divider],
	['fem-heading', Heading],
	['fem-popover', Popover],
	['fem-radio-group', RadioGroup],
	['fem-skeleton', Skeleton],
	['fem-spinner', Spinner],
	['fem-text', Text],
	['fem-accordion', Accordion],
	['fem-accordion-item', AccordionItem],
	['fem-avatar-group', AvatarGroup],
	['fem-breadcrumb', Breadcrumb],
	['fem-breadcrumbs', Breadcrumbs],
	['fem-checkbox-group', CheckboxGroup],
	['fem-empty-state', EmptyState],
	['fem-pagination', Pagination],
	['fem-table', Table],
	['fem-calendar', Calendar],
	['fem-combobox', Combobox],
	['fem-date-picker', DatePicker],
	['fem-date-range-picker', DateRangePicker],
	['fem-range-slider', RangeSlider],
	['fem-command-group', CommandGroup],
	['fem-command-item', CommandItem],
	['fem-command-palette', CommandPalette],
	['fem-tree', Tree],
	['fem-tree-item', TreeItem],
	['fem-copy-field', CopyField],
	['fem-file-upload', FileUpload],
	['fem-image', Image],
	['fem-list-item', ListItem],
	['fem-scrubber', Scrubber],
	['fem-sortable', Sortable],
	['fem-textarea', Textarea]
]

for (const element of elements) {
	const tagName = element[0]
	const elementClass = element[1]
	const isDefined = customElements.get(tagName) !== undefined
	if (!isDefined) customElements.define(tagName, elementClass)
}

export { registerIcons, showToast }
export { Icon }
export type { IconKindT, IconT } from './icons/icon-type'
export { Avatar, Badge, Banner, Button, Checkbox, Chip, Dialog, Field, Input, Menu, MenuItem, Option, Progress }
export { Radio, Segment, Segmented, Select, Sheet, Slider, Swap, Switch, Tab, Tabs, Tag, Toast }
export { Tooltip, Box, Row, Column, Grid, Nav, NavItem, TabBar, TabBarItem }
export { Card, Divider, Heading, Popover, RadioGroup, Skeleton, Spinner, Text }
export { Accordion, AccordionItem, AvatarGroup, Breadcrumb, Breadcrumbs, CheckboxGroup, EmptyState, Pagination, Table }
export { Calendar, Combobox, DatePicker, DateRangePicker, RangeSlider }
export { CommandGroup, CommandItem, CommandPalette, Tree, TreeItem }
export type { TableColumnT, TableRowT } from './components/table/table'
export type { BoxAlignT, BoxDirectionT, BoxSpaceT } from './components/box/box'
export { CopyField, FileUpload, Image, ListItem, Scrubber, Sortable, Textarea }
export type { ReorderDetailT } from './components/sortable/sortable-drag'
export type { FileRejectDetailT } from './components/file-upload/file-upload'
