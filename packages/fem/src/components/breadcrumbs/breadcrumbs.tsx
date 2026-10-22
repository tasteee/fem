import { c, useHost } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import breadcrumbsCss from './breadcrumbs.css?inline'

type BreadcrumbElementT = HTMLElement & { current: boolean }

const breadcrumbsSheet = createStyleSheet(breadcrumbsCss)

// A trail of breadcrumbs. The last one is always the
// current page.
export const Breadcrumbs = c(
	(props) => {
		const hostRef = useHost<HTMLElement>()

		const markCurrentItem = () => {
			const items = [...hostRef.current.querySelectorAll<BreadcrumbElementT>('fem-breadcrumb')]
			const lastItem = items[items.length - 1]
			for (const item of items) item.current = item === lastItem
		}

		const navigationLabel = props.label ?? 'Breadcrumb'

		return (
			<host shadowDom>
				<nav class='breadcrumbs' aria-label={navigationLabel}>
					<div class='breadcrumbs-list' role='list'>
						<slot onslotchange={markCurrentItem}></slot>
					</div>
				</nav>
			</host>
		)
	},
	{
		props: {
			label: String
		},
		styles: [foundationSheet, breadcrumbsSheet]
	}
)
