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
		"Cell", "CellGrid", "cellGrid",
		"DragonNumber", "DragonArray", "DiagramCell", "Diagram", "Rule",
		"RuleRegistry", "ruleRegistry",
		"DRAGON_TRANSFORMATIONS", "CHANNEL_VARIABLES",
		"state", "world",
		"getRGB", "clamp", "wrap",
		"sortByPosition",
		"WORLD_SIZE", "WORLD_CELL_COUNT", "WORLD_DIMENSION", "WORLD_CELL_SIZE",
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

	console.log(`\n  \x1b[32m✓ Smoke test passed: all scripts loaded, ${required.length} globals verified, ${checks.length} constructors OK\x1b[0m\n`)

} catch (e) {
	console.error(`\n  \x1b[31m✗ Smoke test FAILED: ${e.message}\x1b[0m`)
	if (e.stack) console.error(`    at ${e.stack.split("\n")[1].trim()}`)
	console.error()
	process.exit(1)
}
