import { c, useEffect, useEvent, useInternals, useProp, useRef, useState } from 'atomico'
import { buildClassName, getFlagClass, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { formatFileSize } from '../../foundation/format-duration'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { IconSvg } from '../../foundation/icons'
import { focusableShadow } from '../../foundation/use-form-control'
import { fileIcon, imageIcon, uploadSimpleIcon, xIcon } from '../../icons/generated'
import fileUploadCss from './file-upload.css?inline'

export type FileUploadKindT = 'files' | 'image'
export type FileRejectReasonT = 'type' | 'size'

export type FileRejectDetailT = {
	file: File
	reason: FileRejectReasonT
}

const fileUploadSheet = createStyleSheet(fileUploadCss)

// ---------- checks ----------

const getAcceptTokens = (accept: string): string[] => {
	const tokens = accept.split(',').map((token) => token.trim().toLowerCase())
	return tokens.filter((token) => token !== '')
}

const checkMatchesToken = (file: File, token: string): boolean => {
	const fileName = file.name.toLowerCase()
	const fileType = file.type.toLowerCase()
	const isExtension = token.startsWith('.')
	if (isExtension) return fileName.endsWith(token)
	const isWildcard = token.endsWith('/*')
	if (isWildcard) return fileType.startsWith(token.slice(0, -1))
	return fileType === token
}

// Dropped files skip the picker's filter, so they are
// checked against accept by hand.
const checkIsAccepted = (file: File, accept: string): boolean => {
	const tokens = getAcceptTokens(accept)
	const acceptsAnything = tokens.length === 0
	if (acceptsAnything) return true
	return tokens.some((token) => checkMatchesToken(file, token))
}

const checkIsTooLarge = (file: File, maxSize: number): boolean => {
	const hasLimit = maxSize > 0
	if (!hasLimit) return false
	return file.size > maxSize
}

const buildFormData = (name: string, files: File[]): FormData => {
	const formData = new FormData()
	for (const file of files) formData.append(name, file)
	return formData
}

// ---------- pieces ----------

type FileRowPropsT = {
	file: File
	handleRemove: (file: File) => void
}

const FileRow = (props: FileRowPropsT) => {
	const sizeLabel = formatFileSize(props.file.size)
	const removeLabel = `Remove ${props.file.name}`
	const handleClick = () => props.handleRemove(props.file)

	return (
		<li class='file-upload-row'>
			<span class='file-upload-row-icon'>
				<IconSvg icon={fileIcon} kind='bold' />
			</span>
			<span class='file-upload-row-name'>{props.file.name}</span>
			<span class='file-upload-row-size'>{sizeLabel}</span>
			<button class='file-upload-remove' type='button' aria-label={removeLabel} onclick={handleClick}>
				<IconSvg icon={xIcon} kind='bold' />
			</button>
		</li>
	)
}

type ZonePromptPropsT = {
	isImage: boolean
	label: string
	description: string
}

const ZonePrompt = (props: ZonePromptPropsT) => {
	const promptIcon = props.isImage ? imageIcon : uploadSimpleIcon
	const hasDescription = props.description !== ''
	const description = <span class='file-upload-description'>{props.description}</span>
	const maybeDescription = hasDescription ? description : null

	return (
		<span class='file-upload-prompt'>
			<span class='file-upload-prompt-icon'>
				<IconSvg icon={promptIcon} kind='bold' />
			</span>
			<span class='file-upload-label'>{props.label}</span>
			{maybeDescription}
		</span>
	)
}

// Takes files by drop or by picker. kind="image" shows
// one picture, for artwork, avatars, and headers.
export const FileUpload = c(
	(props) => {
		const internals = useInternals()
		const inputRef = useRef<HTMLInputElement>()
		const [files, setFiles] = useProp<File[]>('files')
		const [isDragging, setDragging] = useState(false)
		const [previewUrl, setPreviewUrl] = useState('')
		const dispatchChange = useEvent<{ files: File[] }>('change', { bubbles: true, composed: true })
		const dispatchReject = useEvent<FileRejectDetailT>('reject', { bubbles: true, composed: true })

		const currentFiles = files ?? []
		const isImage = props.kind === 'image'
		const canPickMany = props.multiple && !isImage
		const firstFile = currentFiles[0]

		useEffect(() => {
			const hasName = props.name !== ''
			if (!hasName) return
			internals.setFormValue(buildFormData(props.name, currentFiles))
		}, [currentFiles, props.name])

		// A chosen picture previews from memory. The URL is
		// freed when the picture changes.
		useEffect(() => {
			const shouldPreview = isImage && firstFile
			if (!shouldPreview) return setPreviewUrl('')
			const objectUrl = URL.createObjectURL(firstFile)
			setPreviewUrl(objectUrl)
			return () => URL.revokeObjectURL(objectUrl)
		}, [firstFile, isImage])

		const shownImageUrl = previewUrl || props.src
		const hasImage = isImage && shownImageUrl !== ''

		const takeFiles = (incomingFiles: File[]) => {
			const acceptedFiles: File[] = []

			for (const file of incomingFiles) {
				const isAccepted = checkIsAccepted(file, props.accept)
				if (!isAccepted) dispatchReject({ file, reason: 'type' })
				const isTooLarge = checkIsTooLarge(file, props.maxSize)
				if (isTooLarge) dispatchReject({ file, reason: 'size' })
				const isUsable = isAccepted && !isTooLarge
				if (isUsable) acceptedFiles.push(file)
			}

			const hasAccepted = acceptedFiles.length > 0
			if (!hasAccepted) return
			const nextFiles = canPickMany ? [...currentFiles, ...acceptedFiles] : acceptedFiles.slice(0, 1)
			setFiles(nextFiles)
			dispatchChange({ files: nextFiles })
		}

		const handleInputChange = (event: Event) => {
			const inputElement = event.currentTarget as HTMLInputElement
			const pickedFiles = Array.from(inputElement.files ?? [])
			// Clearing lets the same file be picked again.
			inputElement.value = ''
			takeFiles(pickedFiles)
		}

		const handleDragOver = (event: DragEvent) => {
			event.preventDefault()
			if (props.disabled) return
			setDragging(true)
		}

		// Leaving for a child still counts as inside.
		const handleDragLeave = (event: DragEvent) => {
			const zoneElement = event.currentTarget as HTMLElement
			const nextTarget = event.relatedTarget as Node | null
			const isStillInside = nextTarget !== null && zoneElement.contains(nextTarget)
			if (isStillInside) return
			setDragging(false)
		}

		const handleDrop = (event: DragEvent) => {
			event.preventDefault()
			setDragging(false)
			if (props.disabled) return
			const droppedFiles = Array.from(event.dataTransfer?.files ?? [])
			takeFiles(droppedFiles)
		}

		const handleRemove = (removedFile: File) => {
			const nextFiles = currentFiles.filter((file) => file !== removedFile)
			setFiles(nextFiles)
			dispatchChange({ files: nextFiles })
		}

		const kindClass = getModifierClass(props.kind)
		const draggingClass = getFlagClass(isDragging, 'isDragging')
		const filledClass = getFlagClass(hasImage, 'isFilled')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const zoneClassName = buildClassName(['file-upload-zone', kindClass, draggingClass, filledClass, disabledClass])
		const ratioStyle = `--file-upload-ratio: ${props.ratio}`

		const image = <img class='file-upload-image' src={shownImageUrl} alt='' />
		const replaceHint = <span class='file-upload-replace'>{props.replaceLabel}</span>
		const prompt = <ZonePrompt isImage={isImage} label={props.label} description={props.description} />
		const zoneContent = hasImage ? [image, replaceHint] : prompt

		const rows = currentFiles.map((file) => <FileRow file={file} handleRemove={handleRemove} />)
		const hasRows = !isImage && rows.length > 0
		const list = <ul class='file-upload-list'>{rows}</ul>
		const maybeList = hasRows ? list : null

		return (
			<host shadowDom={focusableShadow}>
				<div class='file-upload'>
					<label
						class={zoneClassName}
						style={ratioStyle}
						ondragover={handleDragOver}
						ondragleave={handleDragLeave}
						ondrop={handleDrop}
					>
						<input
							ref={inputRef}
							class='file-upload-input'
							type='file'
							accept={props.accept}
							multiple={canPickMany}
							disabled={props.disabled}
							aria-label={props.label}
							onchange={handleInputChange}
						/>
						{zoneContent}
					</label>
					{maybeList}
				</div>
			</host>
		)
	},
	{
		form: true,
		props: {
			name: { type: String, reflect: true, value: (): string => '' },
			kind: { type: String, reflect: true, value: (): FileUploadKindT => 'files' },
			accept: { type: String, value: (): string => '' },
			multiple: { type: Boolean, reflect: true },
			maxSize: { type: Number, value: (): number => 0 },
			label: { type: String, value: (): string => 'Drop files or browse' },
			description: { type: String, value: (): string => '' },
			replaceLabel: { type: String, value: (): string => 'Replace' },
			src: { type: String, value: (): string => '' },
			ratio: { type: String, value: (): string => '1 / 1' },
			files: { type: Array, value: (): File[] => [] },
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, fileUploadSheet]
	}
)
