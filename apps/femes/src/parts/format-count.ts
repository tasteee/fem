// "1 track", "6 tracks".
export const formatTrackCount = (count: number): string => {
	const isOne = count === 1
	const word = isOne ? 'track' : 'tracks'
	return `${count} ${word}`
}
