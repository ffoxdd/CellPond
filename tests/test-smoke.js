// Smoke test: loads all scripts in browser order (pre-on.load) and verifies
// no reference errors. Catches issues like missing globals that would crash
// the app on startup.

const { test } = require("node:test")
const assert = require("node:assert/strict")
const { loadCellPond } = require("./setup")
const fs = require("node:fs")
const path = require("node:path")

test("all scripts load without errors", () => {
	const { context } = loadCellPond()

	const required = [
		"Cell", "CellGrid",
		"DragonNumber", "DragonArray", "DiagramCell", "Diagram", "Rule",
		"RuleRegistry", "ruleRegistry",
		"DRAGON_TRANSFORMATIONS", "CHANNEL_VARIABLES",
		"state", "world",
		"getRGB", "clamp", "wrap",
		"sortByPosition",
	]

	const missing = required.filter(name => context[name] === undefined)
	assert.equal(missing.length, 0, `Missing globals: ${missing.join(", ")}`)
})

test("key types are constructable", () => {
	const { context } = loadCellPond()

	const checks = [
		() => new context.Cell(),
		() => new context.CellGrid(4),
		() => new context.DragonNumber(),
		() => new context.DragonArray(),
		() => new context.DiagramCell(),
		() => new context.Diagram(),
		() => new context.Rule(),
		() => new context.RuleRegistry(),
	]

	for (const check of checks) {
		check()
	}
})

test("draw functions have correct signatures", () => {
	const mainSource = fs.readFileSync(path.resolve(__dirname, "..", "the-one-true-todey-file-of-cellpond.js"), "utf-8")

	// Check all element draw functions accept (atom, ctx)
	const drawDefs = [...mainSource.matchAll(/draw:\s*\((\w+)\s*(?:,\s*(\w+))?\)\s*=>/g)]
	const badDefs = drawDefs.filter(m => !m[2])
	assert.equal(badDefs.length, 0, `draw functions missing ctx parameter: ${badDefs.map(m => m[0]).join(", ")}`)

	// Check delegate .draw() calls pass 2 arguments
	const onLoadIndex = mainSource.indexOf("\non.load(() => {")
	const delegateDraws = [...mainSource.matchAll(/\.draw\((\w+)\s*\)/g)]
	const badDelegates = delegateDraws.filter(m => {
		if (m.index < onLoadIndex) return false
		const lineStart = mainSource.lastIndexOf("\n", m.index) + 1
		const linePrefix = mainSource.substring(lineStart, m.index).trim()
		if (linePrefix.startsWith("//")) return false
		const before = mainSource.substring(Math.max(0, m.index - 100), m.index)
		return /(?:TRIANGLE_|COLOURTODE_|CIRCLE|DIAMOND_|atom\.element)/.test(before)
	})
	assert.equal(badDelegates.length, 0, `delegate draw calls missing ctx`)
})
