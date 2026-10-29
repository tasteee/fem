<script lang="ts">
	import { formatFileSize } from '@tasteee/fem/foundation'
	import { addTrack } from '../data/studio.svelte'
	import { buildTitleFromFileName, getErrorReason, readAudioDuration, uploadFile } from '../data/studio-api'

	type UploadDialogPropsT = {
		open: boolean
		onClose: () => void
	}

	type UploadStateT = 'uploading' | 'done' | 'failed'

	type UploadRowT = {
		id: string
		fileName: string
		sizeLabel: string
		state: UploadStateT
		percent: number
		failure: string
	}

	const props: UploadDialogPropsT = $props()
	const maxAudioBytes = 200 * 1024 * 1024
	let uploads = $state<UploadRowT[]>([])

	const failureMessages: Record<string, string> = {
		'too-large': 'Over 200 MB. Export a shorter file or an MP3.',
		'unsupported-type': 'Use MP3, WAV, FLAC, M4A, AAC, or OGG.',
		type: 'Use MP3, WAV, FLAC, M4A, AAC, or OGG.',
		size: 'Over 200 MB. Export a shorter file or an MP3.'
	}

	const describeFailure = (reason: string) => failureMessages[reason] ?? 'Upload failed. Try again.'

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

	// Each file becomes a track as soon as its upload ends.
	const uploadOne = async (file: File) => {
		const rowId = addRow(file, 'uploading', '')
		const handleProgress = (ratio: number) => updateRow(rowId, { percent: Math.round(ratio * 100) })

		try {
			const duration = await readAudioDuration(file)
			const audioKey = await uploadFile(file, 'audio', handleProgress)
			const title = buildTitleFromFileName(file.name)
			await addTrack(title, audioKey, duration)
			updateRow(rowId, { state: 'done', percent: 100 })
		} catch (uploadError) {
			updateRow(rowId, { state: 'failed', failure: describeFailure(getErrorReason(uploadError)) })
		}
	}

	const handleFilesChange = (event: Event) => {
		const detail = (event as CustomEvent<{ files: File[] }>).detail
		const picker = event.currentTarget as HTMLElement & { files: File[] }
		picker.files = []
		for (const file of detail.files) uploadOne(file)
	}

	const handleReject = (event: Event) => {
		const detail = (event as CustomEvent<{ file: File; reason: string }>).detail
		addRow(detail.file, 'failed', describeFailure(detail.reason))
	}

	const handleClose = () => {
		const isAllSettled = uploads.every((row) => row.state !== 'uploading')
		if (isAllSettled) uploads = []
		props.onClose()
	}
</script>

<fem-dialog class="studio-dialog isWide" open={props.open} heading="Upload tracks" onclose={handleClose}>
	<fem-column gap="3">
		<fem-text size="small" color="muted">Each file becomes a track. Edit its details after.</fem-text>
		<fem-file-upload
			multiple
			accept="audio/*,.mp3,.wav,.flac,.m4a,.aac,.ogg"
			max-size={maxAudioBytes}
			description="MP3, WAV, FLAC, or M4A · up to 200 MB"
			onchange={handleFilesChange}
			onreject={handleReject}
		></fem-file-upload>
		{#each uploads as row (row.id)}
			{@const isUploading = row.state === 'uploading'}
			{@const isDone = row.state === 'done'}
			<div class="upload-row">
				<fem-row align-y="center" gap="2">
					<fem-text truncate weight="medium">{row.fileName}</fem-text>
					<span class="numeric muted">{row.sizeLabel}</span>
				</fem-row>
				{#if isUploading}
					<fem-progress value={row.percent} max={100} label={`Uploading ${row.fileName}`}></fem-progress>
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
