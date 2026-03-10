// Simple test runner for CellPond

const suites = []
let currentSuite = null

function describe(name, fn) {
	const suite = { name, tests: [], passed: 0, failed: 0 }
	suites.push(suite)
	currentSuite = suite
	fn()
	currentSuite = null
}

function it(name, fn) {
	currentSuite.tests.push({ name, fn })
}

function run() {
	// Safety timeout — if something hangs, exit with error after 10s
	const timeout = setTimeout(() => {
		console.log("\n  \x1b[31mTIMEOUT: tests took too long\x1b[0m\n")
		process.exit(1)
	}, 10000)

	let totalPassed = 0
	let totalFailed = 0

	for (const suite of suites) {
		console.log(`\n  ${suite.name}`)
		for (const test of suite.tests) {
			try {
				test.fn()
				suite.passed++
				totalPassed++
				console.log(`    \x1b[32m✓\x1b[0m ${test.name}`)
			} catch (e) {
				suite.failed++
				totalFailed++
				console.log(`    \x1b[31m✗\x1b[0m ${test.name}`)
				console.log(`      \x1b[31m${e.message}\x1b[0m`)
			}
		}
	}

	clearTimeout(timeout)

	console.log()
	if (totalFailed === 0) {
		console.log(`  \x1b[32m${totalPassed} passing\x1b[0m`)
	} else {
		console.log(`  \x1b[32m${totalPassed} passing\x1b[0m`)
		console.log(`  \x1b[31m${totalFailed} failing\x1b[0m`)
	}
	console.log()

	process.exit(totalFailed > 0 ? 1 : 0)
}

module.exports = { describe, it, run }
