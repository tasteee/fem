// Turns an attribute value like 'small' into the
// modifier class 'isSmall'.
export const getModifierClass = (value: string): string => {
	const firstLetter = value.charAt(0).toUpperCase()
	const remainingLetters = value.slice(1)
	return `is${firstLetter}${remainingLetters}`
}

export const getFlagClass = (isOn: boolean | undefined, className: string): string => {
	if (isOn) return className
	return ''
}

export const buildClassName = (classNames: string[]): string => {
	const usedClassNames = classNames.filter((className) => className !== '')
	return usedClassNames.join(' ')
}
