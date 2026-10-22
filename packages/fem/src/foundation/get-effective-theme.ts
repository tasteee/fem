// The theme in effect at an element: the nearest
// theme attribute, or else the system setting.
// Floating panels open in the opposite one.
export const getEffectiveTheme = (element: HTMLElement): 'light' | 'dark' => {
	const themedAncestor = element.closest('[theme]')
	const themeValue = themedAncestor?.getAttribute('theme')
	const isExplicitDark = themeValue === 'dark'
	if (isExplicitDark) return 'dark'
	const isExplicitLight = themeValue === 'light'
	if (isExplicitLight) return 'light'
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
	return prefersDark ? 'dark' : 'light'
}
