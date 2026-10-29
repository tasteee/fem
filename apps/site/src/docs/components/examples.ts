// One live example per component, grouped like the
// roster. Child tags point at their parent's example,
// so fem-tab shows the tabs it lives in.

export type ExampleT = {
	group: string
	html: string
}

export type ChildLinkT = {
	parentTag: string
}

const layoutExamples: Record<string, ExampleT> = {
	'fem-row': {
		group: 'Layout',
		html: `<fem-row gap="2" align-x="between">
	<fem-column>
		<fem-text weight="semibold">safeword</fem-text>
		<fem-text size="small" color="muted">Dark pop in D minor</fem-text>
	</fem-column>
	<fem-button size="small" kind="soft">Open</fem-button>
</fem-row>`
	},
	'fem-column': {
		group: 'Layout',
		html: `<fem-column gap="2" align-x="center" padding="4">
	<fem-heading level="4">Centered column</fem-heading>
	<fem-badge color="accent">align-x="center"</fem-badge>
</fem-column>`
	},
	'fem-box': {
		group: 'Layout',
		html: `<fem-box direction="column" gap="3">
	<fem-text>fem-box takes a direction when it can change.</fem-text>
	<fem-box direction="row" gap="2">
		<fem-tag>row</fem-tag>
		<fem-tag>inside</fem-tag>
		<fem-tag>a column</fem-tag>
	</fem-box>
</fem-box>`
	},
	'fem-grid': {
		group: 'Layout',
		html: `<fem-grid min="120px" gap="2">
	<fem-card surface="inset" padding="4">Pop</fem-card>
	<fem-card surface="inset" padding="4">Dark pop</fem-card>
	<fem-card surface="inset" padding="4">Electronic</fem-card>
	<fem-card surface="inset" padding="4">Acoustic</fem-card>
</fem-grid>`
	},
	'fem-card': {
		group: 'Layout',
		html: `<fem-card surface="inset" padding="4" gap="3">
	<fem-row align-x="between">
		<fem-heading level="4">safeword</fem-heading>
		<fem-badge color="accent">Draft</fem-badge>
	</fem-row>
	<fem-text size="small" color="muted">Last edited today.</fem-text>
</fem-card>`
	},
	'fem-divider': {
		group: 'Layout',
		html: `<fem-column gap="3">
	<fem-text>Above</fem-text>
	<fem-divider></fem-divider>
	<fem-row gap="3">
		<fem-text numeric>2:48</fem-text>
		<fem-divider orientation="vertical"></fem-divider>
		<fem-text numeric>92 BPM</fem-text>
	</fem-row>
</fem-column>`
	}
}

const typeExamples: Record<string, ExampleT> = {
	'fem-heading': {
		group: 'Type',
		html: `<fem-column gap="2">
	<fem-heading level="1">Display</fem-heading>
	<fem-heading level="2">Title</fem-heading>
	<fem-heading level="3">Heading</fem-heading>
	<fem-heading level="4">Large</fem-heading>
</fem-column>`
	},
	'fem-text': {
		group: 'Type',
		html: `<fem-column gap="2">
	<fem-text>Body text reads at the regular weight.</fem-text>
	<fem-text size="small" color="muted">Small, muted text for help and meta.</fem-text>
	<fem-row gap="3">
		<fem-text numeric size="large" weight="medium">1:11</fem-text>
		<fem-text numeric color="muted">128 BPM</fem-text>
	</fem-row>
</fem-column>`
	},
	'fem-icon': {
		group: 'Type',
		html: `<fem-row gap="4">
	<fem-icon name="heart"></fem-icon>
	<fem-icon name="heart" kind="fill"></fem-icon>
	<fem-icon name="music-notes"></fem-icon>
	<fem-icon name="gear-six"></fem-icon>
	<fem-icon name="trash"></fem-icon>
</fem-row>`
	}
}

const actionExamples: Record<string, ExampleT> = {
	'fem-button': {
		group: 'Actions',
		html: `<fem-row gap="2" wrap>
	<fem-button color="accent">Save</fem-button>
	<fem-button>Neutral</fem-button>
	<fem-button kind="soft">Soft</fem-button>
	<fem-button kind="ghost">Ghost</fem-button>
	<fem-button color="danger">Delete</fem-button>
	<fem-button shape="circle" label="Add"><fem-icon name="plus"></fem-icon></fem-button>
	<fem-button color="accent" loading>Saving</fem-button>
</fem-row>`
	},
	'fem-swap': {
		group: 'Actions',
		html: `<fem-row gap="2">
	<fem-swap label="Play" color="accent">
		<fem-icon slot="off" name="play" kind="fill"></fem-icon>
		<fem-icon slot="on" name="pause" kind="fill"></fem-icon>
	</fem-swap>
	<fem-swap label="Like" kind="ghost">
		<fem-icon slot="off" name="heart"></fem-icon>
		<fem-icon slot="on" name="heart" kind="fill"></fem-icon>
	</fem-swap>
</fem-row>`
	},
	'fem-segmented': {
		group: 'Actions',
		html: `<fem-segmented value="list">
	<fem-segment value="list">List</fem-segment>
	<fem-segment value="grid">Grid</fem-segment>
	<fem-segment value="board">Board</fem-segment>
</fem-segmented>`
	},
	'fem-chip': {
		group: 'Actions',
		html: `<fem-row gap="2" wrap>
	<fem-chip selected>Dark pop</fem-chip>
	<fem-chip>Pop</fem-chip>
	<fem-chip>Electronic</fem-chip>
</fem-row>`
	}
}

const formExamples: Record<string, ExampleT> = {
	'fem-field': {
		group: 'Forms',
		html: `<fem-column gap="4">
	<fem-field label="Track name" help="Shown on your profile and in search.">
		<fem-input placeholder="Untitled"></fem-input>
	</fem-field>
	<fem-field label="Email" error="Add the part after the @.">
		<fem-input value="shane@"></fem-input>
	</fem-field>
	<fem-field label="Public track" layout="inline">
		<fem-switch checked></fem-switch>
	</fem-field>
</fem-column>`
	},
	'fem-input': {
		group: 'Forms',
		html: `<fem-field label="Track name">
	<fem-input placeholder="Untitled" name="title"></fem-input>
</fem-field>`
	},
	'fem-select': {
		group: 'Forms',
		html: `<fem-field label="Genre">
	<fem-select placeholder="Pick a genre" value="electronic">
		<fem-option value="pop">Pop</fem-option>
		<fem-option value="electronic">Electronic</fem-option>
		<fem-option value="lo-fi">Lo-fi</fem-option>
	</fem-select>
</fem-field>`
	},
	'fem-combobox': {
		group: 'Forms',
		html: `<fem-field label="Key">
	<fem-combobox placeholder="Type a key" value="d-minor">
		<fem-option value="c-minor">C minor</fem-option>
		<fem-option value="d-minor">D minor</fem-option>
		<fem-option value="f-minor">F minor</fem-option>
		<fem-option value="a-minor">A minor</fem-option>
	</fem-combobox>
</fem-field>`
	},
	'fem-checkbox': {
		group: 'Forms',
		html: `<fem-checkbox-group name="notify" label="Notify me about">
	<fem-checkbox value="comments" checked>Comments</fem-checkbox>
	<fem-checkbox value="follows">New followers</fem-checkbox>
</fem-checkbox-group>`
	},
	'fem-radio-group': {
		group: 'Forms',
		html: `<fem-radio-group name="key" value="d-minor" label="Key" kind="list">
	<fem-radio value="c-minor">C minor<span slot="end">3♭</span></fem-radio>
	<fem-radio value="d-minor">D minor<span slot="end">1♭</span></fem-radio>
	<fem-radio value="f-minor">F minor<span slot="end">4♭</span></fem-radio>
</fem-radio-group>`
	},
	'fem-switch': {
		group: 'Forms',
		html: `<fem-column gap="2">
	<fem-switch checked>Public profile</fem-switch>
	<fem-switch>Email me about comments</fem-switch>
</fem-column>`
	},
	'fem-slider': {
		group: 'Forms',
		html: `<fem-field label="Volume">
	<fem-slider value="60" show-value></fem-slider>
</fem-field>`
	},
	'fem-range-slider': {
		group: 'Forms',
		html: `<fem-field label="Tempo">
	<fem-range-slider start="90" end="140" min="60" max="180" show-value></fem-range-slider>
</fem-field>`
	}
}

const pickerExamples: Record<string, ExampleT> = {
	'fem-date-picker': {
		group: 'Pickers',
		html: `<fem-field label="Release date">
	<fem-date-picker value="2026-11-13"></fem-date-picker>
</fem-field>`
	},
	'fem-date-range-picker': {
		group: 'Pickers',
		html: `<fem-field label="Tour dates">
	<fem-date-range-picker start="2026-11-13" end="2026-11-20"></fem-date-range-picker>
</fem-field>`
	},
	'fem-calendar': {
		group: 'Pickers',
		html: `<fem-calendar value="2026-11-13"></fem-calendar>`
	}
}

const feedbackExamples: Record<string, ExampleT> = {
	'fem-banner': {
		group: 'Feedback',
		html: `<fem-column gap="2">
	<fem-banner color="success">Your track is live.</fem-banner>
	<fem-banner color="warning">You have changes that aren't saved yet.</fem-banner>
</fem-column>`
	},
	'fem-toast': {
		group: 'Feedback',
		html: `<fem-button data-toast="Link copied">Show toast</fem-button>`
	},
	'fem-progress': {
		group: 'Feedback',
		html: `<fem-progress label="Uploading" value="68"></fem-progress>`
	},
	'fem-spinner': {
		group: 'Feedback',
		html: `<fem-row gap="4">
	<fem-spinner size="small"></fem-spinner>
	<fem-spinner></fem-spinner>
	<fem-spinner size="large"></fem-spinner>
</fem-row>`
	},
	'fem-skeleton': {
		group: 'Feedback',
		html: `<fem-row gap="3" align-y="start">
	<fem-skeleton shape="circle"></fem-skeleton>
	<fem-column gap="2" grow>
		<fem-skeleton width="40%"></fem-skeleton>
		<fem-skeleton lines="3"></fem-skeleton>
	</fem-column>
</fem-row>`
	},
	'fem-empty-state': {
		group: 'Feedback',
		html: `<fem-empty-state heading="No drafts yet">
	<fem-icon slot="icon" name="music-notes"></fem-icon>
	Start a draft to sketch an idea.
	<fem-button slot="actions" color="accent">New draft</fem-button>
</fem-empty-state>`
	}
}

const overlayExamples: Record<string, ExampleT> = {
	'fem-dialog': {
		group: 'Overlays',
		html: `<fem-button data-opens="example-dialog">Open dialog</fem-button>
<fem-dialog id="example-dialog" heading="Delete this track?">
	You can't undo this.
	<fem-button slot="actions" data-closes="example-dialog">Cancel</fem-button>
	<fem-button slot="actions" color="danger" data-closes="example-dialog">Delete</fem-button>
</fem-dialog>`
	},
	'fem-sheet': {
		group: 'Overlays',
		html: `<fem-button data-opens="example-sheet">Open sheet</fem-button>
<fem-sheet id="example-sheet" heading="Share track">
	<fem-button wide data-closes="example-sheet">Copy link</fem-button>
</fem-sheet>`
	},
	'fem-popover': {
		group: 'Overlays',
		html: `<fem-popover label="Rename track">
	<fem-button slot="trigger">Rename</fem-button>
	<fem-field label="Track name">
		<fem-input value="safeword"></fem-input>
	</fem-field>
	<fem-button size="small" color="accent">Save</fem-button>
</fem-popover>`
	},
	'fem-menu': {
		group: 'Overlays',
		html: `<fem-menu>
	<fem-button slot="trigger">Options</fem-button>
	<fem-menu-item>Rename</fem-menu-item>
	<fem-menu-item>Duplicate</fem-menu-item>
	<fem-menu-item color="danger">Delete</fem-menu-item>
</fem-menu>`
	},
	'fem-tooltip': {
		group: 'Overlays',
		html: `<fem-tooltip text="Counts plays over 30 seconds">
	<fem-button>Hover or focus me</fem-button>
</fem-tooltip>`
	}
}

const navigationExamples: Record<string, ExampleT> = {
	'fem-tabs': {
		group: 'Navigation',
		html: `<fem-tabs value="tracks">
	<fem-tab value="tracks">Tracks</fem-tab>
	<fem-tab value="stems">Stems</fem-tab>
	<fem-tab value="lyrics">Lyrics</fem-tab>
</fem-tabs>`
	},
	'fem-nav': {
		group: 'Navigation',
		html: `<fem-nav value="all" label="Notes">
	<fem-nav-item value="all"><fem-icon slot="icon" name="note"></fem-icon>All notes<span slot="end">128</span></fem-nav-item>
	<fem-nav-item value="ideas"><fem-icon slot="icon" name="lightbulb"></fem-icon>Ideas<span slot="end">17</span></fem-nav-item>
	<fem-nav-item value="trash"><fem-icon slot="icon" name="trash"></fem-icon>Trash<span slot="end">3</span></fem-nav-item>
</fem-nav>`
	},
	'fem-tab-bar': {
		group: 'Navigation',
		html: `<fem-tab-bar value="home" label="App">
	<fem-tab-bar-item value="home"><fem-icon slot="icon" name="house"></fem-icon>Home</fem-tab-bar-item>
	<fem-tab-bar-item value="search"><fem-icon slot="icon" name="magnifying-glass"></fem-icon>Search</fem-tab-bar-item>
	<fem-tab-bar-item value="you"><fem-icon slot="icon" name="user"></fem-icon>You</fem-tab-bar-item>
</fem-tab-bar>`
	},
	'fem-breadcrumbs': {
		group: 'Navigation',
		html: `<fem-breadcrumbs>
	<fem-breadcrumb href="#">Library</fem-breadcrumb>
	<fem-breadcrumb href="#">Drafts</fem-breadcrumb>
	<fem-breadcrumb>safeword</fem-breadcrumb>
</fem-breadcrumbs>`
	},
	'fem-pagination': {
		group: 'Navigation',
		html: `<fem-pagination page="4" total="12"></fem-pagination>`
	},
	'fem-accordion': {
		group: 'Navigation',
		html: `<fem-accordion single>
	<fem-accordion-item open>
		<span slot="summary">Who can hear my drafts?</span>
		Only you, until you share a link.
	</fem-accordion-item>
	<fem-accordion-item>
		<span slot="summary">Can I export stems?</span>
		Yes. Open a track, then pick Export.
	</fem-accordion-item>
</fem-accordion>`
	}
}

const commandExamples: Record<string, ExampleT> = {
	'fem-command-palette': {
		group: 'Overlays',
		html: `<fem-button data-opens="example-palette">Open palette, or press ⌘K</fem-button>
<fem-command-palette id="example-palette">
	<fem-command-group heading="Tracks">
		<fem-command-item value="new-track"><fem-icon slot="icon" name="plus"></fem-icon>New track<span slot="shortcut">⌘N</span></fem-command-item>
		<fem-command-item value="open-safeword" keywords="dark pop d minor"><fem-icon slot="icon" name="music-notes"></fem-icon>Open safeword</fem-command-item>
		<fem-command-item value="share"><fem-icon slot="icon" name="share-fat"></fem-icon>Share track</fem-command-item>
	</fem-command-group>
	<fem-command-group heading="Settings">
		<fem-command-item value="theme" keywords="dark light"><fem-icon slot="icon" name="gear-six"></fem-icon>Change theme</fem-command-item>
		<fem-command-item value="delete"><fem-icon slot="icon" name="trash"></fem-icon>Delete track</fem-command-item>
	</fem-command-group>
</fem-command-palette>`
	},
	'fem-tree': {
		group: 'Data display',
		html: `<fem-tree value="safeword" label="Library">
	<fem-tree-item value="drafts" label="Drafts" expanded>
		<fem-icon slot="icon" name="music-notes"></fem-icon>
		<fem-tree-item value="safeword" label="safeword"></fem-tree-item>
		<fem-tree-item value="fangirl" label="fangirl"></fem-tree-item>
		<fem-tree-item value="stems" label="Stems">
			<fem-tree-item value="vocals" label="vocals.wav"></fem-tree-item>
			<fem-tree-item value="drums" label="drums.wav"></fem-tree-item>
		</fem-tree-item>
	</fem-tree-item>
	<fem-tree-item value="released" label="Released">
		<fem-icon slot="icon" name="music-notes"></fem-icon>
		<fem-tree-item value="dead-people" label="dead people"></fem-tree-item>
	</fem-tree-item>
</fem-tree>`
	}
}

const tableColumns = JSON.stringify([
	{ key: 'title', label: 'Track', sortable: true },
	{ key: 'bpm', label: 'BPM', numeric: true, align: 'end', sortable: true },
	{ key: 'length', label: 'Length', numeric: true, align: 'end' }
])

const tableRows = JSON.stringify([
	{ title: 'safeword', bpm: 92, length: '2:48' },
	{ title: 'fangirl', bpm: 124, length: '3:05' },
	{ title: 'dead people', bpm: 140, length: '2:31' }
])

const displayExamples: Record<string, ExampleT> = {
	'fem-badge': {
		group: 'Data display',
		html: `<fem-row gap="2" wrap>
	<fem-badge color="success">Published</fem-badge>
	<fem-badge color="warning">Draft</fem-badge>
	<fem-badge color="danger">Failed</fem-badge>
	<fem-badge>Neutral</fem-badge>
</fem-row>`
	},
	'fem-tag': {
		group: 'Data display',
		html: `<fem-row gap="2" wrap>
	<fem-tag>D minor</fem-tag>
	<fem-tag removable>dark pop</fem-tag>
	<fem-tag removable>92 BPM</fem-tag>
</fem-row>`
	},
	'fem-avatar': {
		group: 'Data display',
		html: `<fem-row gap="2">
	<fem-avatar size="small" name="tasteink"></fem-avatar>
	<fem-avatar name="tasteink" color="accent"></fem-avatar>
	<fem-avatar size="large" name="Robin"></fem-avatar>
</fem-row>`
	},
	'fem-avatar-group': {
		group: 'Data display',
		html: `<fem-avatar-group max="3">
	<fem-avatar name="tasteink" color="accent"></fem-avatar>
	<fem-avatar name="Robin"></fem-avatar>
	<fem-avatar name="Mia"></fem-avatar>
	<fem-avatar name="Jo"></fem-avatar>
</fem-avatar-group>`
	},
	'fem-table': {
		group: 'Data display',
		html: `<fem-table label="Tracks" columns='${tableColumns}' rows='${tableRows}'></fem-table>`
	}
}

const artwork = (seed: string): string => `https://picsum.photos/seed/${seed}/600/600`

const listAndMediaExamples: Record<string, ExampleT> = {
	'fem-list-item': {
		group: 'Data display',
		html: `<fem-column gap="0">
	<fem-list-item interactive label="safeword" description="tasteink · Dark pop">
		<fem-image slot="leading" src="${artwork('safeword')}" alt="" style="width: 40px"></fem-image>
		<span slot="meta">3:12</span>
		<fem-button slot="trailing" kind="ghost" shape="circle" size="small" label="More"><fem-icon name="dots-three"></fem-icon></fem-button>
	</fem-list-item>
	<fem-list-item interactive selected label="glass hours" description="tasteink · Ambient">
		<fem-image slot="leading" src="${artwork('glass')}" alt="" style="width: 40px"></fem-image>
		<span slot="meta">4:05</span>
	</fem-list-item>
	<fem-list-item label="Robin" description="Following">
		<fem-avatar slot="leading" size="small" name="Robin"></fem-avatar>
	</fem-list-item>
</fem-column>`
	},
	'fem-image': {
		group: 'Data display',
		html: `<fem-grid min="120px" gap="3">
	<fem-image src="${artwork('cover')}" alt="Cover art"></fem-image>
	<fem-image src="${artwork('wide')}" ratio="16 / 9" radius="container" alt="Header"></fem-image>
	<fem-image src="" alt="No artwork yet"></fem-image>
</fem-grid>`
	},
	'fem-sortable': {
		group: 'Data display',
		html: `<fem-sortable move-nodes label="Playlist order" gap="0">
	<fem-list-item label="safeword" description="Drag me, or Alt + arrow">
		<fem-icon slot="leading" name="dots-six-vertical" data-sortable-handle tabindex="0"></fem-icon>
		<span slot="meta">3:12</span>
	</fem-list-item>
	<fem-list-item label="glass hours" description="tasteink">
		<fem-icon slot="leading" name="dots-six-vertical" data-sortable-handle tabindex="0"></fem-icon>
		<span slot="meta">4:05</span>
	</fem-list-item>
	<fem-list-item label="low tide" description="tasteink">
		<fem-icon slot="leading" name="dots-six-vertical" data-sortable-handle tabindex="0"></fem-icon>
		<span slot="meta">2:48</span>
	</fem-list-item>
	<fem-list-item label="northbound" description="tasteink">
		<fem-icon slot="leading" name="dots-six-vertical" data-sortable-handle tabindex="0"></fem-icon>
		<span slot="meta">3:30</span>
	</fem-list-item>
</fem-sortable>`
	},
	'fem-textarea': {
		group: 'Forms',
		html: `<fem-field label="Bio" help="A line or two about your music.">
	<fem-textarea autosize maxlength="160" placeholder="Making quiet songs in a loud city."></fem-textarea>
</fem-field>`
	},
	'fem-file-upload': {
		group: 'Forms',
		html: `<fem-column gap="4">
	<fem-file-upload multiple accept="audio/*,.mp3,.wav,.flac" description="MP3, WAV, or FLAC"></fem-file-upload>
	<fem-file-upload kind="image" accept="image/*" label="Artwork" description="Square" style="width: 180px"></fem-file-upload>
</fem-column>`
	},
	'fem-image-crop': {
		group: 'Forms',
		html: `<fem-row gap="6" wrap>
	<fem-image-crop src="https://picsum.photos/seed/fem-crop/1200/800" aspect="1" label="Artwork" style="width: 280px"></fem-image-crop>
	<fem-image-crop src="https://picsum.photos/seed/fem-crop/1200/800" aspect="1" shape="round" label="Avatar" style="width: 240px"></fem-image-crop>
</fem-row>`
	},
	'fem-copy-field': {
		group: 'Forms',
		html: `<fem-copy-field shareable share-title="safeword" value="https://artisst.app/tasteink/safeword"></fem-copy-field>`
	},
	'fem-scrubber': {
		group: 'Media',
		html: `<fem-column gap="5">
	<fem-scrubber time="sides" value="42" max="192" buffered="120"></fem-scrubber>
	<fem-scrubber time="below" show-remaining value="95" max="245" buffered="245"></fem-scrubber>
</fem-column>`
	}
}

// Short demo tracks that ship with the site.
const demoTracks = [
	{ id: 'safeword', src: '../audio/safeword.mp3', title: 'safeword', artist: 'tasteink', artwork: artwork('safeword'), duration: 24 },
	{ id: 'glass-hours', src: '../audio/glass-hours.mp3', title: 'glass hours', artist: 'tasteink', artwork: artwork('glass'), duration: 28 },
	{ id: 'low-tide', src: '../audio/low-tide.mp3', title: 'low tide', artist: 'tasteink', duration: 20 }
]

const queueJson = JSON.stringify(demoTracks)
const trackJson = (index: number): string => JSON.stringify(demoTracks[index])

const playerExamples: Record<string, ExampleT> = {
	'fem-track-row': {
		group: 'Media',
		html: `<fem-column gap="0">
	<fem-track-row track='${trackJson(0)}' queue='${queueJson}'>
		<fem-button slot="trailing" kind="ghost" shape="circle" size="small" label="More"><fem-icon name="dots-three"></fem-icon></fem-button>
	</fem-track-row>
	<fem-track-row track='${trackJson(1)}' queue='${queueJson}'></fem-track-row>
	<fem-track-row track='${trackJson(2)}' queue='${queueJson}'></fem-track-row>
</fem-column>`
	},
	'fem-play-button': {
		group: 'Media',
		html: `<fem-row gap="3" align-y="center">
	<fem-play-button queue='${queueJson}'></fem-play-button>
	<fem-play-button track='${trackJson(1)}' size="medium" kind="ghost"></fem-play-button>
</fem-row>`
	},
	'fem-player-bar': {
		group: 'Media',
		html: `<fem-column gap="4">
	<fem-row gap="3" align-y="center">
		<fem-play-button queue='${queueJson}' size="medium"></fem-play-button>
		<fem-text color="muted">Play something. The bar appears once a track is loaded.</fem-text>
	</fem-row>
	<fem-player-bar expandable></fem-player-bar>
</fem-column>`
	},
	'fem-now-playing': {
		group: 'Media',
		html: `<fem-now-playing track='${trackJson(1)}' queue='${queueJson}' artist-href="#">
	<fem-button slot="actions" kind="ghost" shape="circle" label="Like"><fem-icon name="heart"></fem-icon></fem-button>
	<fem-button slot="end" kind="ghost" shape="circle" size="small" label="Share"><fem-icon name="share-fat"></fem-icon></fem-button>
</fem-now-playing>`
	}
}

export const examplesByTag: Record<string, ExampleT> = {
	...layoutExamples,
	...typeExamples,
	...actionExamples,
	...formExamples,
	...pickerExamples,
	...feedbackExamples,
	...overlayExamples,
	...navigationExamples,
	...displayExamples,
	...commandExamples,
	...listAndMediaExamples,
	...playerExamples
}

// Tags that only make sense inside a parent show the
// parent's example and link back to it.
export const parentByChildTag: Record<string, string> = {
	'fem-segment': 'fem-segmented',
	'fem-option': 'fem-select',
	'fem-radio': 'fem-radio-group',
	'fem-checkbox-group': 'fem-checkbox',
	'fem-menu-item': 'fem-menu',
	'fem-tab': 'fem-tabs',
	'fem-nav-item': 'fem-nav',
	'fem-tab-bar-item': 'fem-tab-bar',
	'fem-breadcrumb': 'fem-breadcrumbs',
	'fem-accordion-item': 'fem-accordion',
	'fem-command-item': 'fem-command-palette',
	'fem-command-group': 'fem-command-palette',
	'fem-tree-item': 'fem-tree'
}

export const groupOrder = [
	'Layout',
	'Type',
	'Actions',
	'Forms',
	'Pickers',
	'Feedback',
	'Overlays',
	'Navigation',
	'Data display',
	'Media'
]
