import { c, useEffect, useEvent, useRef, useState } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { IconSvg } from '../../foundation/icons'
import { usePressFeedback } from '../../foundation/use-press-feedback'
import { checkIcon, copyIcon, shareFatIcon } from '../../icons/generated'
import copyFieldCss from './copy-field.css?inline'

const copyFieldSheet = createStyleSheet(copyFieldCss)
const copiedMilliseconds = 1600

// Uses the clipboard API, and falls back to selecting
// the text so the person can copy it themselves.
const copyText = async (text: string): Promise<boolean> => {
	const hasClipboard = Boolean(navigator.clipboard)
	if (!hasClipboard) return false

	try {
		await navigator.clipboard.writeText(text)
		return true
	} catch (copyError) {
		console.warn('fem-copy-field: copy failed', copyError)
		return false
	}
}

const checkCanShare = (): boolean => typeof navigator.share === 'function'

// A value to hand out, like a share link, with a Copy
// button. Add shareable to offer the phone's share
// sheet where there is one.
export const CopyField = c(
	(props) => {
		const valueRef = useRef<HTMLInputElement>()
		const copyButtonRef = useRef<HTMLButtonElement>()
		const shareButtonRef = useRef<HTMLButtonElement>()
		const [wasCopied, setCopied] = useState(false)
		const [canShare, setCanShare] = useState(false)
		const dispatchCopy = useEvent<{ value: string }>('copy', { bubbles: true, composed: true })
		const dispatchShare = useEvent<{ value: string }>('share', { bubbles: true, composed: true })

		usePressFeedback(copyButtonRef)
		usePressFeedback(shareButtonRef)

		useEffect(() => setCanShare(checkCanShare()), [])

		useEffect(() => {
			if (!wasCopied) return
			const timer = setTimeout(() => setCopied(false), copiedMilliseconds)
			return () => clearTimeout(timer)
		}, [wasCopied])

		const selectValue = () => valueRef.current?.select()

		const handleCopy = async () => {
			const didCopy = await copyText(props.value)
			if (!didCopy) return selectValue()
			setCopied(true)
			dispatchCopy({ value: props.value })
		}

		const handleShare = async () => {
			const shareData = { title: props.shareTitle, url: props.value }

			try {
				await navigator.share(shareData)
				dispatchShare({ value: props.value })
			} catch (shareError) {
				// Closing the share sheet counts as an error.
				// Nothing to do then.
				const wasDismissed = shareError instanceof DOMException && shareError.name === 'AbortError'
				if (wasDismissed) return
				console.warn('fem-copy-field: share failed', shareError)
			}
		}

		const copyIconShape = wasCopied ? checkIcon : copyIcon
		const copyLabel = wasCopied ? props.copiedLabel : props.copyLabel
		const copyClass = buildClassName(['copy-field-button', 'isPressable', getFlagClass(wasCopied, 'isCopied')])

		const shouldShowShare = props.shareable && canShare

		return (
			<host shadowDom>
				<div class='copy-field'>
					<input
						ref={valueRef}
						class='copy-field-value'
						value={props.value}
						readOnly
						aria-label={props.label}
						onfocus={selectValue}
					/>
					<button ref={copyButtonRef} class={copyClass} type='button' onclick={handleCopy}>
						<IconSvg icon={copyIconShape} kind='bold' />
						<span aria-live='polite'>{copyLabel}</span>
					</button>
					<button
						ref={shareButtonRef}
						class='copy-field-button isPressable isIconOnly'
						type='button'
						aria-label='Share'
						hidden={!shouldShowShare}
						onclick={handleShare}
					>
						<IconSvg icon={shareFatIcon} kind='bold' />
					</button>
				</div>
			</host>
		)
	},
	{
		props: {
			value: { type: String, value: (): string => '' },
			label: { type: String, value: (): string => 'Link' },
			copyLabel: { type: String, value: (): string => 'Copy' },
			copiedLabel: { type: String, value: (): string => 'Copied' },
			shareTitle: { type: String, value: (): string => '' },
			shareable: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, copyFieldSheet]
	}
)
