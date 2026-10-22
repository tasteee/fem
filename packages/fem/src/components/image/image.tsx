import { c, useEffect, useState } from 'atomico'
import { buildClassName, getFlagClass, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { IconSvg } from '../../foundation/icons'
import { imageIcon } from '../../icons/generated'
import imageCss from './image.css?inline'

export type ImageFitT = 'cover' | 'contain'
export type ImageRadiusT = 'container' | 'inset' | 'small' | 'pill' | 'none'
type LoadStateT = 'loading' | 'loaded' | 'failed'

const imageSheet = createStyleSheet(imageCss)

// A picture that holds its shape while it loads, fades
// in when ready, and shows a quiet icon if it fails.
// Artwork, covers, headers.
export const Image = c(
	(props) => {
		const [loadState, setLoadState] = useState<LoadStateT>('loading')
		const hasSource = props.src !== ''

		// A new source starts a new load.
		useEffect(() => setLoadState('loading'), [props.src])

		const isLoaded = loadState === 'loaded'
		const isFailed = loadState === 'failed'
		const shouldShowFallback = !hasSource || isFailed

		const radiusClass = getModifierClass(props.radius)
		const fitClass = getModifierClass(props.fit)
		const loadedClass = getFlagClass(isLoaded, 'isLoaded')
		const className = buildClassName(['image', radiusClass])
		const pictureClassName = buildClassName(['image-picture', fitClass, loadedClass])
		const ratioStyle = `--image-ratio: ${props.ratio}`

		const loadingMode = props.eager ? 'eager' : 'lazy'

		const handleLoad = () => setLoadState('loaded')
		const handleError = () => setLoadState('failed')

		const picture = (
			<img
				class={pictureClassName}
				src={props.src}
				alt={props.alt}
				loading={loadingMode}
				decoding='async'
				onload={handleLoad}
				onerror={handleError}
			/>
		)

		const fallback = (
			<span class='image-fallback'>
				<IconSvg icon={imageIcon} kind='bold' />
			</span>
		)

		const content = shouldShowFallback ? fallback : picture
		const fallbackLabel = shouldShowFallback ? props.alt : null
		const fallbackRole = shouldShowFallback ? 'img' : null

		return (
			<host shadowDom>
				<span class={className} style={ratioStyle} role={fallbackRole} aria-label={fallbackLabel}>
					{content}
				</span>
			</host>
		)
	},
	{
		props: {
			src: { type: String, value: (): string => '' },
			alt: { type: String, value: (): string => '' },
			ratio: { type: String, reflect: true, value: (): string => '1 / 1' },
			fit: { type: String, reflect: true, value: (): ImageFitT => 'cover' },
			radius: { type: String, reflect: true, value: (): ImageRadiusT => 'inset' },
			eager: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, imageSheet]
	}
)
