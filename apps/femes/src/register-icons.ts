import * as icons from '@tasteee/fem/icons'
import { registerIcons } from '@tasteee/fem'

// Called from main.ts. A bare side-effect import of
// this file is dropped by the bundler.
export const registerFemesIcons = () => {
	registerIcons([
		icons.caretLeftIcon,
		icons.caretRightIcon,
		icons.dotsThreeIcon,
		icons.linkIcon,
		icons.musicNotesIcon,
		icons.shareFatIcon,
		icons.shuffleIcon
	])
}
