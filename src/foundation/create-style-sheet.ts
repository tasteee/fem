export const createStyleSheet = (cssText: string): CSSStyleSheet => {
	const styleSheet = new CSSStyleSheet()
	styleSheet.replaceSync(cssText)
	return styleSheet
}
