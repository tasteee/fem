import { parseRoute } from './routes'
import type { RouteT } from './routes'

// One shared route. Links anywhere, even inside fem's
// shadow DOM, move between pages without a reload, so
// the music never stops.

export const router = $state<{ route: RouteT }>({ route: parseRoute(window.location.pathname) })

export const navigate = (path: string) => {
	const isSamePath = path === window.location.pathname
	if (isSamePath) return
	window.history.pushState(null, '', path)
	router.route = parseRoute(window.location.pathname)
	window.scrollTo(0, 0)
}

const findAnchor = (event: MouseEvent): HTMLAnchorElement | undefined => {
	const path = event.composedPath()
	const anchors = path.filter((entry) => entry instanceof HTMLAnchorElement) as HTMLAnchorElement[]
	return anchors[0]
}

const checkIsPlainClick = (event: MouseEvent): boolean => {
	const hasModifier = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
	const isMainButton = event.button === 0
	return isMainButton && !hasModifier && !event.defaultPrevented
}

const handleDocumentClick = (event: MouseEvent) => {
	const isPlainClick = checkIsPlainClick(event)
	if (!isPlainClick) return
	const anchor = findAnchor(event)
	if (!anchor) return
	const opensElsewhere = anchor.target !== '' || anchor.hasAttribute('download')
	if (opensElsewhere) return
	const url = new URL(anchor.href, window.location.href)
	const isOwnSite = url.origin === window.location.origin
	if (!isOwnSite) return
	event.preventDefault()
	navigate(url.pathname)
}

const handlePopState = () => {
	router.route = parseRoute(window.location.pathname)
}

export const startRouter = () => {
	document.addEventListener('click', handleDocumentClick)
	window.addEventListener('popstate', handlePopState)
}
