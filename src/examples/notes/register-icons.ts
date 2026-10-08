import * as icons from '../../icons'
import { registerIcons } from '../../icons/registry'

// Called from main.ts. A bare side-effect import of
// this file is dropped by the bundler.
export const registerNoteIcons = () => {
	registerIcons([
		icons.caretLeftIcon,
		icons.checkIcon,
		icons.circleHalfIcon,
		icons.copyIcon,
		icons.dotsThreeIcon,
		icons.imageIcon,
		icons.linkIcon,
		icons.listBulletsIcon,
		icons.megaphoneIcon,
		icons.minusIcon,
		icons.musicNotesIcon,
		icons.paletteIcon,
		icons.playIcon,
		icons.plusIcon,
		icons.pushPinIcon,
		icons.quotesIcon,
		icons.shareFatIcon,
		icons.textAaIcon,
		icons.textBIcon,
		icons.textItalicIcon,
		icons.textStrikethroughIcon,
		icons.textUnderlineIcon,
		icons.trashIcon,
		icons.videoIcon,
		icons.xIcon
	])
}
