# fem

A flat, premium web component design system. No shadows, no gradients. Depth comes from surfaces, type, and color used with intent.

Built with [Atomico](https://atomico.gitbook.io/doc) and shadow DOM.

## Principles

- **Shape signals function.** Pills act. Rounded boxes hold.
- **Depth from surface.** No shadows, no gradients, no structural borders.
- **Color is earned.** Neutral first. Color means something.
- **Weight signals role.** Regular to read, semibold to act, bold for titles.
- **Roomy first.** Compact is opt-in, on any container.

## Use

```html
<link rel="stylesheet" href="@tasteee/fem/tokens.css" />
<script type="module" src="@tasteee/fem"></script>

<fem-button color="accent">Save changes</fem-button>
<fem-input label="Track name" placeholder="Untitled"></fem-input>
<fem-chip selected>Pop</fem-chip>
<fem-badge color="success">Published</fem-badge>
```

Load the fonts yourself: Onest (400, 500, 600, 700) and Google Sans Code (400, 500).

## Attributes

Options take named values. States are bare flags.

| Attribute | Values                                                      |
| --------- | ----------------------------------------------------------- |
| `size`    | `small`, `medium`, `large`                                  |
| `kind`    | `solid`, `soft`, `ghost`                                    |
| `color`   | `neutral`, `accent`, `danger`, `success`, `warning`, `info` |
| `shape`   | `pill`, `circle`                                            |
| flags     | `disabled`, `selected`, `checked`, `loading`, `invalid`     |

## Layout

Rows and columns build every screen. No stacks, no clusters.

```html
<fem-row gap="2" align-x="between">
	<fem-column>
		<span>safeword</span>
		<fem-tag>D minor</fem-tag>
	</fem-column>
	<fem-button size="small">Open</fem-button>
</fem-row>

<fem-grid min="200px" gap="4">...</fem-grid>
```

- `fem-row` and `fem-column` are `fem-box` with the direction fixed. `fem-box direction="row|column"` when it changes.
- `align-x` is always left to right, `align-y` always top to bottom: `start`, `center`, `end`, `stretch`, `between`. The box maps them to `justify-content` or `align-items` for its direction.
- Defaults: a row centers items vertically. A column stretches them to its width.
- `gap` and `padding` take space steps: `1`, `2`, `3`, `4`, `5`, `6`, `8`, `10`.
- `wrap` lets a row wrap. `grow` makes a box fill the space left in its parent.
- `fem-grid` takes `columns` (a count) or `min` (a minimum column width that fits as many as it can).

## Type, surfaces, loading

```html
<fem-heading level="2">Library</fem-heading>
<fem-text size="small" color="muted">Last edited today</fem-text>
<fem-text numeric>1:11</fem-text>

<fem-card padding="5" gap="4">...</fem-card>
<fem-divider></fem-divider>

<fem-spinner></fem-spinner>
<fem-skeleton lines="3"></fem-skeleton>
```

- `fem-heading`: `level` 1 to 6 sets the semantics and a natural size. `size` (`display`, `title`, `heading`, `large`) overrides the look.
- `fem-text`: `size`, `weight`, `color`, plus `numeric` for the mono face and `truncate`.
- `fem-card`: `surface` (`card` or `inset`), `padding`, `gap`. It stacks children like a column.
- `fem-divider`: a filled bar, not a border. `orientation` `horizontal` or `vertical`.
- `fem-skeleton`: `shape` (`text`, `box`, `circle`), `lines`, `width`, `height`. It pulses. No shimmer gradient.

## Popover

```html
<fem-popover label="Rename track">
	<fem-button slot="trigger">Rename</fem-button>
	<fem-input value="safeword"></fem-input>
</fem-popover>
```

- Opens in the inverse theme, like menus, so it stands off the page with no shadow. Every fem component inside flips with it.
- `placement`: `below` or `above`. `alignment`: `start` or `center`. `open` opens it from code.

## Radio group

```html
<fem-radio-group name="key" value="d-minor" label="Key" kind="list">
	<fem-radio value="c-minor">C minor<span slot="end">3♭</span></fem-radio>
	<fem-radio value="d-minor">D minor</fem-radio>
</fem-radio-group>
```

- Owns the shared `name`, the checked radio, and arrow keys.
- `kind="plain"` is a column of radios. `kind="list"` makes each radio a row with the sliding fill.

## Navigation

```html
<fem-nav value="all" label="Notes">
	<fem-nav-item value="all"><fem-icon slot="icon" name="note"></fem-icon>All notes<span slot="end">128</span></fem-nav-item>
	<fem-nav-item value="ideas"><fem-icon slot="icon" name="lightbulb"></fem-icon>Ideas</fem-nav-item>
</fem-nav>

<fem-tab-bar value="home" label="App">
	<fem-tab-bar-item value="home"><fem-icon slot="icon" name="house"></fem-icon>Home</fem-tab-bar-item>
	<fem-tab-bar-item value="you"><fem-icon slot="icon" name="user"></fem-icon>You</fem-tab-bar-item>
</fem-tab-bar>
```

- `fem-nav` is a vertical sidebar list. `fem-tab-bar` is the mobile bottom bar.
- Both send `change` with the new `value`. Route from there.
- The selected item gets `aria-current="page"`. Arrow keys move between items.

## Fields

`fem-field` owns every label, help line, and error. Controls never draw their own.

```html
<fem-field label="Track name" help="Shown on your profile.">
	<fem-input placeholder="Untitled"></fem-input>
</fem-field>

<fem-field label="Public track" layout="inline">
	<fem-switch checked></fem-switch>
</fem-field>
```

- `layout`: `stacked` (default) puts the label above. `inline` puts it left, control right.
- `error` replaces the help line and marks the control `invalid`.
- Controls never draw a visible label. Their `label` attribute is only the accessible name, and `fem-field` fills it in.
- The label becomes the control's accessible name. Tapping it focuses the control, or toggles a switch or checkbox.

## Press

- Only buttons shrink and darken on a tap: `fem-button` and `fem-swap`. It's near instant: 20ms in, 50ms out.
- Everything else answers by changing state. Chips select, tabs and segments slide, selects open, menu rows highlight.
- Tune it with `--press-scale` and `--press-overlay` on any container.

## The slide

Selection is a thing that moves. In tabs, segmented controls, list radio groups, nav, and the tab bar, one indicator slides from the old choice to the new one in 180ms on the standard curve. Tune it with `--duration-slide`.

## Icons

Icons are [Phosphor](https://phosphoricons.com), bold by default, with a filled version of each.

```ts
import { registerIcons } from '@tasteee/fem'
import { heartIcon, playIcon } from '@tasteee/fem/icons'

registerIcons([heartIcon, playIcon])
```

```html
<fem-icon name="heart"></fem-icon>
<fem-icon name="heart" kind="fill"></fem-icon>
<fem-button color="accent"><fem-icon name="play" kind="fill"></fem-icon>Play</fem-button>
```

- Register only the icons you use. The rest of the set never reaches the browser.
- An icon takes its color from the text around it and its size from `--icon-size`.
- Names match Phosphor's, like `arrow-left`. The import is the same name in camel case with `Icon` on the end: `arrowLeftIcon`.
- Add `label` when the icon carries meaning by itself. Without one it is hidden from screen readers.

## Forms

Controls work inside a plain `<form>`, like native ones. Give each a `name`.

```html
<form>
	<fem-input name="title" required></fem-input>
	<fem-checkbox name="terms" required>I agree</fem-checkbox>
	<fem-button type="submit" color="accent">Save</fem-button>
</form>
```

- Values show up in `FormData` and are sent on submit.
- `required` blocks submit on `fem-input`, `fem-select`, `fem-checkbox`, and `fem-switch`.
- `fem-button` takes `type="submit"` or `type="reset"`. The default is `button`.

## Theme, density, accent

All three work on the root or on any container.

```html
<html theme="dark">
	<section density="compact" style="--accent: var(--purple)">...</section>
</html>
```

- `theme`: `light` or `dark`. With no attribute, the system setting wins.
- `density`: `compact`. Roomy is the default.
- `--accent`: any color. Text on top of it picks dark or light by itself.
- `temperature`: `pure` or `cool` grays. Root only. The default is cool in light and pure in dark.

## Develop

```sh
npm install
npm run dev        # docs page, and the notes example at /notes/
npm run build
npm run typecheck
npm run build:demos   # static site in demos/, for GitHub Pages
npm run format
npm run icons      # rebuild the icon module from Phosphor
```

## Layout

```
src/tokens.css       every token
src/foundation/      shared shadow styles and behavior
src/components/      one folder per component, with a sibling CSS file
src/icons/           the icon set and its registry
src/docs/            the docs page
src/examples/notes/  a Svelte 5 notes app built only from fem components
```
