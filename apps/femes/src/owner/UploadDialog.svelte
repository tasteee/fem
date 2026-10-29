<script lang="ts">
	import { formatFileSize } from '@tasteee/fem/foundation'
	import { prepareAudioUpload } from '../data/convert-audio'
	import { addTrack } from '../data/studio.svelte'
	import { buildTitleFromFileName, getErrorReason, uploadFile } from '../data/studio-api'

	type UploadDialogPropsT = {
		open: boolean
		onClose: () => void
	}

	type UploadStateT = 'waiting' | 'converting' | 'uploading' | 'done' | 'failed'

	type UploadRowT = {
		id: string
		fileName: string
		sizeLabel: string
		state: UploadStateT
		percent: number
		failure: string
	}

	// Any audio or video file works. Each is turned into an
	// MP3 here in the browser, then uploaded. One file is
	// worked on at a time, so a big batch can't run a phone
	// out of memory.
	const props: UploadDialogPropsT = $props()
	const maxInputBytes = 500 * 1024 * 1024
	let uploads = $state<UploadRowT[]>([])
	let queue: Promise<void> = Promise.resolve()

	const failureMessages: Record<string, string> = {
		'too-large': 'The MP3 came out over 200 MB. Try a shorter file.',
		size: 'Over 500 MB. Try a shorter file or export the audio first.',
		type: "That isn't an audio or video file.",
		'unreadable-audio': "Couldn't read audio from this file. Try exporting it as WAV or MP3.",
		'conversion-failed': "Couldn't convert this file to MP3. Try again, or export it as MP3."
	}

	const describeFailure = (reason: string) => failureMessages[reason] ?? 'Upload failed. Try again.'

	const describeError = (problem: unknown): string => {
		const isPlainError = problem instanceof Error && problem.message in failureMessages
		if (isPlainError) return describeFailure(problem.message)
		return describeFailure(getErrorReason(problem))
	}

	const updateRow = (rowId: string, changes: Partial<UploadRowT>) => {
		const row = uploads.find((entry) => entry.id === rowId)
		if (!row) return
		Object.assign(row, changes)
	}

	const addRow = (file: File, state: UploadStateT, failure: string): string => {
		const rowId = crypto.randomUUID()
		const row = { id: rowId, fileName: file.name, sizeLabel: formatFileSize(file.size), state, percent: 0, failure }
		uploads = [row, ...uploads]
		return rowId
	}

	// Convert, upload, and save. The file becomes a track
	// the moment its upload ends.
	const processOne = async (file: File, rowId: string) => {
		const handleConvertProgress = (ratio: number) => updateRow(rowId, { percent: Math.round(ratio * 100) })
		const handleUploadProgress = (ratio: number) => updateRow(rowId, { percent: Math.round(ratio * 100) })

		try {
			updateRow(rowId, { state: 'converting', percent: 0 })
			const prepared = await prepareAudioUpload(file, handleConvertProgress)
			updateRow(rowId, { state: 'uploading', percent: 0, sizeLabel: formatFileSize(prepared.file.size) })
			const audioKey = await uploadFile(prepared.file, 'audio', handleUploadProgress)
			const title = buildTitleFromFileName(file.name)
			await addTrack(title, audioKey, prepared.duration)
			updateRow(rowId, { state: 'done', percent: 100 })
		} catch (uploadError) {
			updateRow(rowId, { state: 'failed', failure: describeError(uploadError) })
		}
	}

	const enqueue = (file: File) => {
		const rowId = addRow(file, 'waiting', '')
		const runNext = () => processOne(file, rowId)
		queue = queue.then(runNext)
	}

	const getStatusLabel = (row: UploadRowT): string => {
		const isConverting = row.state === 'converting'
		if (isConverting) return `Converting ${row.fileName} to MP3`
		const isWaiting = row.state === 'waiting'
		if (isWaiting) return `${row.fileName} is waiting`
		return `Uploading ${row.fileName}`
	}

	const getStatusText = (row: UploadRowT): string => {
		const isConverting = row.state === 'converting'
		if (isConverting) return 'Converting to MP3'
		const isWaiting = row.state === 'waiting'
		if (isWaiting) return 'Waiting'
		return 'Uploading'
	}

	const handleFilesChange = (event: Event) => {
		const detail = (event as CustomEvent<{ files: File[] }>).detail
		const picker = event.currentTarget as HTMLElement & { files: File[] }
		picker.files = []
		for (const file of detail.files) enqueue(file)
	}

	const handleReject = (event: Event) => {
		const detail = (event as CustomEvent<{ file: File; reason: string }>).detail
		addRow(detail.file, 'failed', describeFailure(detail.reason))
	}

	const handleClose = () => {
		const checkIsSettled = (row: UploadRowT) => row.state === 'done' || row.state === 'failed'
		const isAllSettled = uploads.every(checkIsSettled)
		if (isAllSettled) uploads = []
		props.onClose()
	}
</script>

<fem-dialog class="studio-dialog isWide" open={props.open} heading="Upload tracks" onclose={handleClose}>
	<fem-column gap="3">
		<fem-text size="small" color="muted">Each file becomes a track. Edit its details after.</fem-text>
		<fem-file-upload
			multiple
			accept="audio/*,video/*,.mp3,.wav,.aif,.aiff,.flac,.m4a,.aac,.mp4,.mov,.webm"
			max-size={maxInputBytes}
			description="Any audio or video file · we make it an MP3"
			onchange={handleFilesChange}
			onreject={handleReject}
		></fem-file-upload>
		{#each uploads as row (row.id)}
			{@const isWorking = row.state === 'waiting' || row.state === 'converting' || row.state === 'uploading'}
			{@const isDone = row.state === 'done'}
			<div class="upload-row">
				<fem-row align-y="center" gap="2">
					<fem-text truncate weight="medium">{row.fileName}</fem-text>
					<span class="numeric muted">{row.sizeLabel}</span>
				</fem-row>
				{#if isWorking}
					<fem-text size="small" color="muted">{getStatusText(row)}</fem-text>
					<fem-progress value={row.percent} max={100} label={getStatusLabel(row)}></fem-progress>
				{:else if isDone}
					<fem-text size="small" color="success">Added to your tracks</fem-text>
				{:else}
					<fem-text size="small" color="danger">{row.failure}</fem-text>
				{/if}
			</div>
		{/each}
	</fem-column>
	<fem-text slot="actions" size="small" color="muted">Uploads keep going if you close this.</fem-text>
	<fem-button slot="actions" onclick={handleClose}>Done</fem-button>
</fem-dialog>
