// Generated. Typed @tasteee/fem-media tags for React 19 JSX.
import './fem-jsx'
import type * as Fem from './fem-jsx'
import type { DetailedHTMLProps, HTMLAttributes as ReactHTMLAttributes } from 'react'

type ReactElementPropsT = DetailedHTMLProps<ReactHTMLAttributes<HTMLElement>, HTMLElement> & { class?: string; slot?: string }

declare module 'react' {
	namespace JSX {
		interface IntrinsicElements {
			'fem-now-playing': ReactElementPropsT & Fem.FemNowPlayingPropsT & Fem.FemNowPlayingAttributesT
			'fem-play-button': ReactElementPropsT & Fem.FemPlayButtonPropsT & Fem.FemPlayButtonAttributesT
			'fem-player-bar': ReactElementPropsT & Fem.FemPlayerBarPropsT & Fem.FemPlayerBarAttributesT
			'fem-track-row': ReactElementPropsT & Fem.FemTrackRowPropsT & Fem.FemTrackRowAttributesT
		}
	}
}
