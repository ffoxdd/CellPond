// Smoke test: loads all scripts in browser order (pre-on.load) and verifies
// no reference errors. Catches issues like missing globals that would crash
// the app on startup.
//
// Note: on.load() callbacks can't run in jsdom/vm because const/let from
// earlier scripts aren't shared across vm contexts the way browser <script>
// tags share the global lexical scope. This test covers the load-time
// evaluation of all scripts up to (but not including) on.load firing.

const { loadCellPond } = require("./setup")

try {
	const { context } = loadCellPond()

	// Verify key globals exist after loading
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

	if (missing.length > 0) {
		console.error(`\n  \x1b[31m✗ Smoke test FAILED: missing globals: ${missing.join(", ")}\x1b[0m\n`)
		process.exit(1)
	}

	// Verify types are constructable
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

	console.log(`  \x1b[32m✓ Smoke test passed: all scripts loaded, ${required.length} globals verified, ${checks.length} constructors OK\x1b[0m`)

	// Static analysis: verify UI element draw signatures and delegate calls
	// This catches bugs like .draw(atom) missing the ctx parameter
	const fs = require("fs")
	const path = require("path")
	const mainSource = fs.readFileSync(path.resolve(__dirname, "..", "the-one-true-todey-file-of-cellpond.js"), "utf-8")

	// Check all element draw functions accept (atom, ctx)
	const drawDefs = [...mainSource.matchAll(/draw:\s*\((\w+)\s*(?:,\s*(\w+))?\)\s*=>/g)]
	const badDefs = drawDefs.filter(m => !m[2])
	if (badDefs.length > 0) {
		const locations = badDefs.map(m => {
			const line = mainSource.substring(0, m.index).split("\n").length
			return `line ${line}: draw: (${m[1]}) =>`
		})
		console.error(`\n  \x1b[31m✗ Smoke test FAILED: draw functions missing ctx parameter:\n    ${locations.join("\n    ")}\x1b[0m\n`)
		process.exit(1)
	}

	// Check delegate .draw() calls pass 2 arguments (atom, ctx)
	const delegateDraws = [...mainSource.matchAll(/\.draw\((\w+)\s*\)/g)]
	// Filter to only calls inside on.load (after the on.load marker)
	const onLoadIndex = mainSource.indexOf("\non.load(() => {")
	const badDelegates = delegateDraws.filter(m => {
		if (m.index < onLoadIndex) return false
		// Skip commented-out lines
		const lineStart = mainSource.lastIndexOf("\n", m.index) + 1
		const linePrefix = mainSource.substring(lineStart, m.index).trim()
		if (linePrefix.startsWith("//")) return false
		// Only flag element draw delegates (preceded by element name or atom.element)
		const before = mainSource.substring(Math.max(0, m.index - 100), m.index)
		return /(?:TRIANGLE_|COLOURTODE_|CIRCLE|DIAMOND_|atom\.element)/.test(before)
	})
	if (badDelegates.length > 0) {
		const locations = badDelegates.map(m => {
			const line = mainSource.substring(0, m.index).split("\n").length
			const context = mainSource.substring(Math.max(0, m.index - 30), m.index + m[0].length).trim()
			return `line ${line}: ${context}`
		})
		console.error(`\n  \x1b[31m✗ Smoke test FAILED: delegate draw calls missing ctx:\n    ${locations.join("\n    ")}\x1b[0m\n`)
		process.exit(1)
	}

	console.log(`  \x1b[32m✓ Smoke test passed: ${drawDefs.length} draw functions have ctx, ${delegateDraws.length} delegate calls OK\x1b[0m\n`)

} catch (e) {
	console.error(`\n  \x1b[31m✗ Smoke test FAILED: ${e.message}\x1b[0m`)
	if (e.stack) console.error(`    at ${e.stack.split("\n")[1].trim()}`)
	console.error()
	process.exit(1)
}
