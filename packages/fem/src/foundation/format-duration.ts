const padTwo = (value: number): string => String(value).padStart(2, '0')

// Seconds as a clock: 3:07, or 1:02:09 past an hour.
// Bad input reads as 0:00 so a loading track never
// shows NaN.
export const formatDuration = (totalSeconds: number): string => {
	const isUsable = Number.isFinite(totalSeconds) && totalSeconds > 0
	if (!isUsable) return '0:00'
	const wholeSeconds = Math.floor(totalSeconds)
	const hours = Math.floor(wholeSeconds / 3600)
	const minutes = Math.floor((wholeSeconds % 3600) / 60)
	const seconds = wholeSeconds % 60
	const hasHours = hours > 0
	if (hasHours) return `${hours}:${padTwo(minutes)}:${padTwo(seconds)}`
	return `${minutes}:${padTwo(seconds)}`
}

// Bytes as a short size: 820 KB, 4.2 MB.
export const formatFileSize = (bytes: number): string => {
	const isSmall = bytes < 1024 * 1024
	if (isSmall) return `${Math.max(1, Math.round(bytes / 1024))} KB`
	const megabytes = bytes / (1024 * 1024)
	const isLarge = megabytes >= 100
	if (isLarge) return `${Math.round(megabytes)} MB`
	return `${megabytes.toFixed(1)} MB`
}
