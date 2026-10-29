// "1 track", "6 tracks".
export const formatTrackCount = (count: number): string => {
	const isOne = count === 1
	const word = isOne ? 'track' : 'tracks'
	return `${count} ${word}`
}

// "1 playlist", "3 playlists".
export const formatPlaylistCount = (count: number): string => {
	const isOne = count === 1
	const word = isOne ? 'playlist' : 'playlists'
	return `${count} ${word}`
}
