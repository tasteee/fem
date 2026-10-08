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
npm run dev        # docs page
npm run build
npm run typecheck
npm run format
```

## Layout

```
src/tokens.css       every token
src/foundation/      shared shadow styles and behavior
src/components/      one folder per component, with a sibling CSS file
src/docs/            the docs page
```
