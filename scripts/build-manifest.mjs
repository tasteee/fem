// Reads every component's source and writes the files
// editors and frameworks use to know fem:
// - custom-elements.json, the standard manifest
// - vscode.html-custom-data.json, HTML autocomplete
// - types/fem-jsx.d.ts, typed tags for TS, React, and Svelte
// The component source is the only source of truth.

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { existsSync } from 'node:fs'
import ts from 'typescript'

const componentsDirectory = 'src/components'
const indexPath = 'src/index.ts'

const toKebabCase = (name) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)

const toPascalCase = (tagName) => {
	const words = tagName.split('-')
	return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('')
}

// Maps each class name to its tag, from the define list
// in src/index.ts, like ['fem-button', Button].
const readTagNames = () => {
	const indexText = readFileSync(indexPath, 'utf8')
	const tagByClassName = new Map()
	const entryPattern = /\['(fem-[\w-]+)',\s*(\w+)\]/g
	for (const match of indexText.matchAll(entryPattern)) tagByClassName.set(match[2], match[1])
	return tagByClassName
}

const readLeadingComment = (sourceText, node) => {
	const ranges = ts.getLeadingCommentRanges(sourceText, node.getFullStart()) ?? []
	const lines = ranges.map((range) => sourceText.slice(range.pos, range.end).replace(/^\/\/\s?/, ''))
	return lines.join(' ').trim()
}

const resolveSourcePath = (fromPath, importPath) => {
	const basePath = join(dirname(fromPath), importPath)
	const candidates = [`${basePath}.ts`, `${basePath}.tsx`, join(basePath, 'index.ts')]
	return candidates.find((candidate) => existsSync(candidate))
}

const parseSourceFile = (filePath) => {
	const sourceText = readFileSync(filePath, 'utf8')
	return ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
}

// Union types imported from other fem files, like
// BoxSpaceT from the box component.
const readImportedUnionTypes = (sourceFile) => {
	const unionByName = new Map()
	for (const statement of sourceFile.statements) {
		const isImport = ts.isImportDeclaration(statement)
		if (!isImport) continue
		const importPath = statement.moduleSpecifier.text
		const isRelative = importPath.startsWith('.')
		if (!isRelative) continue
		const resolvedPath = resolveSourcePath(sourceFile.fileName, importPath)
		if (!resolvedPath) continue
		const importedUnions = readLocalUnionTypes(parseSourceFile(resolvedPath))
		for (const [typeName, values] of importedUnions) unionByName.set(typeName, values)
	}
	return unionByName
}

const readUnionTypes = (sourceFile) => {
	const importedUnions = readImportedUnionTypes(sourceFile)
	const localUnions = readLocalUnionTypes(sourceFile)
	return new Map([...importedUnions, ...localUnions])
}

// Every `export type XT = 'a' | 'b'` in a file, as
// lists of allowed strings.
const readLocalUnionTypes = (sourceFile) => {
	const unionByName = new Map()
	for (const statement of sourceFile.statements) {
		const isTypeAlias = ts.isTypeAliasDeclaration(statement)
		if (!isTypeAlias) continue
		const isUnion = ts.isUnionTypeNode(statement.type)
		if (!isUnion) continue
		const literalValues = statement.type.types
			.filter((member) => ts.isLiteralTypeNode(member) && ts.isStringLiteral(member.literal))
			.map((member) => member.literal.text)
		unionByName.set(statement.name.text, literalValues)
	}
	return unionByName
}

const readPropertyName = (property) => {
	const hasName = property.name && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name))
	if (!hasName) return undefined
	return property.name.text
}

const findObjectProperty = (objectLiteral, propertyName) => {
	return objectLiteral.properties.find((property) => readPropertyName(property) === propertyName)
}

// A default like `(): SizeT => 'medium'` gives both the
// union type name and the default value.
const readDefault = (valueProperty, unionByName) => {
	const result = { unionValues: undefined, defaultValue: undefined, hasDefault: false }
	if (!valueProperty) return result
	const initializer = valueProperty.initializer
	const isArrow = initializer && ts.isArrowFunction(initializer)
	if (!isArrow) return result

	// `(): AlignT | undefined => undefined` names the
	// union without a default.
	const returnType = initializer.type
	const isUnionReturn = returnType && ts.isUnionTypeNode(returnType)
	const referenceType = isUnionReturn ? returnType.types.find(ts.isTypeReferenceNode) : returnType
	const isReference = referenceType && ts.isTypeReferenceNode(referenceType)
	if (isReference) result.unionValues = unionByName.get(referenceType.typeName.getText())

	const body = initializer.body
	const isText = ts.isStringLiteral(body)
	const isNumber = ts.isNumericLiteral(body)
	// `(): AlignT | '' => ''` means the prop starts unset.
	const isUnsetMarker = isUnionReturn && isText && body.text === ''
	result.hasDefault = (isText || isNumber) && !isUnsetMarker
	const isShownDefault = isText && body.text !== ''
	if (isShownDefault) result.defaultValue = body.text
	if (isNumber) result.defaultValue = Number(body.text)
	return result
}

const readPropDefinition = (property, sourceText, unionByName) => {
	const propName = readPropertyName(property)
	const description = readLeadingComment(sourceText, property)
	const initializer = property.initializer
	const isShorthandType = ts.isIdentifier(initializer)

	if (isShorthandType) {
		return { name: propName, description, kind: initializer.text, reflects: false }
	}

	const typeProperty = findObjectProperty(initializer, 'type')
	const reflectProperty = findObjectProperty(initializer, 'reflect')
	const valueProperty = findObjectProperty(initializer, 'value')
	const kind = typeProperty ? typeProperty.initializer.getText() : 'String'
	const reflects = reflectProperty ? reflectProperty.initializer.getText() === 'true' : false
	const defaultInfo = readDefault(valueProperty, unionByName)

	return {
		name: propName,
		description,
		kind,
		reflects,
		unionValues: defaultInfo.unionValues,
		defaultValue: defaultInfo.defaultValue,
		hasDefault: defaultInfo.hasDefault
	}
}

// Variables like `const sharedProps = {...}` that a
// props object can point to or spread in.
const readObjectVariables = (sourceFile) => {
	const objectByName = new Map()
	for (const statement of sourceFile.statements) {
		const isVariable = ts.isVariableStatement(statement)
		if (!isVariable) continue
		for (const declaration of statement.declarationList.declarations) {
			const isObject = declaration.initializer && ts.isObjectLiteralExpression(declaration.initializer)
			if (isObject) objectByName.set(declaration.name.getText(), declaration.initializer)
		}
	}
	return objectByName
}

// The prop assignments in a props object, following a
// named variable or a spread of one.
const collectPropAssignments = (node, objectByName) => {
	const isIdentifier = node && ts.isIdentifier(node)
	if (isIdentifier) return collectPropAssignments(objectByName.get(node.text), objectByName)
	const isObject = node && ts.isObjectLiteralExpression(node)
	if (!isObject) return []
	const assignments = []
	for (const property of node.properties) {
		const isSpread = ts.isSpreadAssignment(property)
		if (isSpread) assignments.push(...collectPropAssignments(property.expression, objectByName))
		const isAssignment = ts.isPropertyAssignment(property)
		if (isAssignment) assignments.push(property)
	}
	return assignments
}

// Finds `export const X = c(render, { props: {...} })`.
const readComponentDeclarations = (sourceFile, sourceText) => {
	const unionByName = readUnionTypes(sourceFile)
	const objectByName = readObjectVariables(sourceFile)
	const declarations = []

	for (const statement of sourceFile.statements) {
		const isVariable = ts.isVariableStatement(statement)
		if (!isVariable) continue
		const declaration = statement.declarationList.declarations[0]
		const call = declaration.initializer
		const isComponentCall = call && ts.isCallExpression(call) && call.expression.getText() === 'c'
		if (!isComponentCall) continue

		const options = call.arguments[1]
		const propsProperty = options && ts.isObjectLiteralExpression(options) ? findObjectProperty(options, 'props') : undefined
		const propertyList = collectPropAssignments(propsProperty?.initializer, objectByName)
		const props = propertyList.map((property) => readPropDefinition(property, sourceText, unionByName))
		const isFormControl = options && ts.isObjectLiteralExpression(options) && Boolean(findObjectProperty(options, 'form'))

		declarations.push({
			className: declaration.name.getText(),
			description: readLeadingComment(sourceText, statement),
			props,
			isFormControl
		})
	}

	return declarations
}

const readEvents = (sourceText) => {
	const eventPattern = /useEvent\('([\w-]+)'/g
	const eventNames = [...sourceText.matchAll(eventPattern)].map((match) => match[1])
	return [...new Set(eventNames)]
}

const readSlots = (sourceText) => {
	const slotPattern = /<slot(?:\s+name='([\w-]+)')?/g
	const slotNames = [...sourceText.matchAll(slotPattern)].map((match) => match[1] ?? '')
	return [...new Set(slotNames)]
}

const listComponentFiles = () => {
	const folderNames = readdirSync(componentsDirectory)
	const filePaths = folderNames.map((folderName) => join(componentsDirectory, folderName, `${folderName}.tsx`))
	return filePaths.filter((filePath) => existsSync(filePath))
}

const buildElements = () => {
	const tagByClassName = readTagNames()
	const elements = []

	for (const filePath of listComponentFiles()) {
		const sourceText = readFileSync(filePath, 'utf8')
		const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
		const declarations = readComponentDeclarations(sourceFile, sourceText)
		const events = readEvents(sourceText)
		const slots = readSlots(sourceText)

		for (const declaration of declarations) {
			const tagName = tagByClassName.get(declaration.className)
			if (!tagName) continue
			elements.push({ ...declaration, tagName, filePath, events, slots })
		}
	}

	elements.sort((first, second) => first.tagName.localeCompare(second.tagName))
	return elements
}

// ---------- type text ----------

const getTypeScriptType = (prop) => {
	const hasUnion = prop.unionValues && prop.unionValues.length > 0
	if (hasUnion) return prop.unionValues.map((value) => `'${value}'`).join(' | ')
	const typeByKind = { String: 'string', Number: 'number', Boolean: 'boolean', Array: 'unknown[]', Object: 'object' }
	return typeByKind[prop.kind] ?? 'unknown'
}

// ---------- custom-elements.json ----------

const buildManifest = (elements) => {
	const modules = elements.map((element) => {
		const attributes = element.props
			.filter((prop) => prop.kind !== 'Array' && prop.kind !== 'Object')
			.map((prop) => ({
				name: toKebabCase(prop.name),
				fieldName: prop.name,
				type: { text: getTypeScriptType(prop) },
				...(prop.description ? { description: prop.description } : {}),
				...(prop.defaultValue !== undefined ? { default: JSON.stringify(prop.defaultValue) } : {})
			}))

		const members = element.props.map((prop) => ({
			kind: 'field',
			name: prop.name,
			type: { text: getTypeScriptType(prop) },
			...(prop.reflects ? { reflects: true } : {}),
			...(prop.description ? { description: prop.description } : {})
		}))

		const events = element.events.map((eventName) => ({ name: eventName, type: { text: 'CustomEvent' } }))
		const slots = element.slots.map((slotName) => ({ name: slotName, description: slotName === '' ? 'Default slot' : '' }))

		const declaration = {
			kind: 'class',
			name: element.className,
			tagName: element.tagName,
			customElement: true,
			description: element.description,
			attributes,
			members,
			events,
			slots
		}

		return {
			kind: 'javascript-module',
			path: element.filePath,
			declarations: [declaration],
			exports: [{ kind: 'custom-element-definition', name: element.tagName, declaration: { name: element.className, module: element.filePath } }]
		}
	})

	return { schemaVersion: '1.0.0', readme: 'README.md', modules }
}

// ---------- VS Code HTML data ----------

const buildHtmlData = (elements) => {
	const tags = elements.map((element) => {
		const attributes = element.props
			.filter((prop) => prop.kind !== 'Array' && prop.kind !== 'Object')
			.map((prop) => {
				const isFlag = prop.kind === 'Boolean'
				const hasUnion = prop.unionValues && prop.unionValues.length > 0
				const values = hasUnion ? prop.unionValues.map((value) => ({ name: value })) : undefined
				return {
					name: toKebabCase(prop.name),
					...(prop.description ? { description: prop.description } : {}),
					...(isFlag ? { valueSet: 'v' } : {}),
					...(values ? { values } : {})
				}
			})
		return { name: element.tagName, description: element.description, attributes }
	})
	return { version: 1.1, tags }
}

// ---------- typed tags ----------

const buildPropsTypeText = (element) => {
	const typeName = `${toPascalCase(element.tagName)}PropsT`
	const propLines = element.props.map((prop) => {
		const comment = prop.description ? `\t/** ${prop.description} */\n` : ''
		return `${comment}\t${prop.name}?: ${getTypeScriptType(prop)}`
	})
	const eventLines = element.events.map((eventName) => `\ton${eventName}?: (event: CustomEvent) => void`)
	const bodyLines = [...propLines, ...eventLines].join('\n')
	return `export type ${typeName} = {\n${bodyLines}\n}`
}

// The element itself, as code sees it after it's
// defined: every prop is present. Props with no default
// can still be undefined.
const buildElementTypeText = (element) => {
	const typeName = `${toPascalCase(element.tagName)}ElementT`
	const propLines = element.props.map((prop) => {
		const isFlag = prop.kind === 'Boolean'
		const hasDefault = prop.hasDefault || prop.kind === 'Array'
		const canBeMissing = !isFlag && !hasDefault
		const missingText = canBeMissing ? ' | undefined' : ''
		return `	${prop.name}: ${getTypeScriptType(prop)}${missingText}`
	})
	return `export type ${typeName} = HTMLElement & {
${propLines.join('\n')}
}`
}

const buildAttributesTypeText = (element) => {
	const typeName = `${toPascalCase(element.tagName)}AttributesT`
	const attributeLines = element.props
		.filter((prop) => prop.kind !== 'Array' && prop.kind !== 'Object')
		.map((prop) => `\t'${toKebabCase(prop.name)}'?: ${getTypeScriptType(prop)}${prop.kind === 'Boolean' ? ' | \'\'' : ''}`)
	return `export type ${typeName} = {\n${attributeLines.join('\n')}\n}`
}

const buildTypeDefinitions = (elements) => {
	const header = [
		'// Generated by scripts/build-manifest.mjs. Do not edit.',
		'// Import once to get typed fem tags:',
		"// import '@tasteee/fem/jsx'",
		''
	].join('\n')

	const propsTypes = elements.map(buildPropsTypeText).join('\n\n')
	const attributeTypes = elements.map(buildAttributesTypeText).join('\n\n')
	const elementTypes = elements.map(buildElementTypeText).join('\n\n')

	const tagMapLines = elements.map((element) => `\t\t'${element.tagName}': ${toPascalCase(element.tagName)}ElementT`)
	const reactLines = elements.map(
		(element) =>
			`\t\t\t'${element.tagName}': ReactElementPropsT & ${toPascalCase(element.tagName)}PropsT & ${toPascalCase(element.tagName)}AttributesT`
	)
	const svelteLines = elements.map(
		(element) => `\t\t'${element.tagName}': HTMLAttributes<HTMLElement> & ${toPascalCase(element.tagName)}PropsT & ${toPascalCase(element.tagName)}AttributesT`
	)

	const globalBlock = ['declare global {', '\tinterface HTMLElementTagNameMap {', ...tagMapLines, '\t}', '}'].join('\n')

	const reactBlock = [
		"import type { DetailedHTMLProps, HTMLAttributes as ReactHTMLAttributes } from 'react'",
		'',
		'type ReactElementPropsT = DetailedHTMLProps<ReactHTMLAttributes<HTMLElement>, HTMLElement> & { class?: string; slot?: string }',
		'',
		"declare module 'react' {",
		'\tnamespace JSX {',
		'\t\tinterface IntrinsicElements {',
		...reactLines,
		'\t\t}',
		'\t}',
		'}'
	].join('\n')

	const svelteBlock = [
		"import type { HTMLAttributes } from 'svelte/elements'",
		'',
		"declare module 'svelte/elements' {",
		'\tinterface SvelteHTMLElements {',
		...svelteLines,
		'\t}',
		'}'
	].join('\n')

	return {
		core: `${header}\n${propsTypes}\n\n${attributeTypes}\n\n${elementTypes}\n\n${globalBlock}\n`,
		react: `// Generated. Typed fem tags for React 19 JSX.\nimport './fem-jsx'\nimport type * as Fem from './fem-jsx'\n${reactBlock.replace(/(\w+PropsT|\w+AttributesT)/g, (name) => (name.startsWith('React') ? name : `Fem.${name}`))}\n`,
		svelte: `// Generated. Typed fem tags for Svelte 5.\nimport './fem-jsx'\nimport type * as Fem from './fem-jsx'\n${svelteBlock.replace(/(Fem\w+PropsT|Fem\w+AttributesT)/g, (name) => `Fem.${name}`)}\n`
	}
}

// ---------- write ----------

const elements = buildElements()
const typeDefinitions = buildTypeDefinitions(elements)

writeFileSync('custom-elements.json', `${JSON.stringify(buildManifest(elements), null, '\t')}\n`)
writeFileSync('vscode.html-custom-data.json', `${JSON.stringify(buildHtmlData(elements), null, '\t')}\n`)
mkdirSync('types', { recursive: true })
writeFileSync('types/fem-jsx.d.ts', typeDefinitions.core)
writeFileSync('types/fem-react.d.ts', typeDefinitions.react)
writeFileSync('types/fem-svelte.d.ts', typeDefinitions.svelte)

console.log(`Wrote the manifest, HTML data, and types for ${elements.length} elements.`)
