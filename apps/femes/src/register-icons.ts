import * as icons from '@tasteee/fem/icons'
import { registerIcons } from '@tasteee/fem'

// Called from main.ts. A bare side-effect import of
// this file is dropped by the bundler.
export const registerFemesIcons = () => {
	registerIcons([
		icons.arrowSquareOutIcon,
		icons.bookmarkSimpleIcon,
		icons.booksIcon,
		icons.caretLeftIcon,
		icons.caretRightIcon,
		icons.chatCircleIcon,
		icons.checkIcon,
		icons.dotsSixVerticalIcon,
		icons.dotsThreeIcon,
		icons.linkIcon,
		icons.listIcon,
		icons.musicNotesIcon,
		icons.pencilSimpleIcon,
		icons.plusIcon,
		icons.shareFatIcon,
		icons.shuffleIcon,
		icons.uploadSimpleIcon,
		icons.userCheckIcon,
		icons.userIcon,
		icons.userPlusIcon,
		icons.usersIcon,
		icons.xIcon
	])
}
