// Real browser test — loads index.html in Chromium via Playwright
// Catches JS errors, missing renders, and broken UI that jsdom tests miss

const { chromium } = require("@playwright/test")
const http = require("http")
const fs = require("fs")
const path = require("path")

const PORT = 9222
const ROOT = path.resolve(__dirname, "..")

// Simple static file server
function startServer() {
	const mimeTypes = {
		".html": "text/html",
		".js": "application/javascript",
		".css": "text/css",
		".png": "image/png",
	}

	const server = http.createServer((req, res) => {
		let filePath = path.join(ROOT, req.url === "/" ? "index.html" : req.url)
		const ext = path.extname(filePath)
		const mime = mimeTypes[ext] || "application/octet-stream"

		fs.readFile(filePath, (err, data) => {
			if (err) {
				res.writeHead(404)
				res.end("Not found")
				return
			}
			res.writeHead(200, { "Content-Type": mime })
			res.end(data)
		})
	})

	return new Promise((resolve) => {
		server.listen(PORT, () => resolve(server))
	})
}

async function run() {
	const server = await startServer()
	const errors = []
	let passed = 0

	const browser = await chromium.launch()
	const page = await browser.newPage()

	// Collect all JS errors
	page.on("pageerror", (err) => {
		errors.push(`JS Error: ${err.message}`)
	})

	// Collect failed network requests
	page.on("requestfailed", (req) => {
		errors.push(`Failed to load: ${req.url()} — ${req.failure().errorText}`)
	})

	await page.goto(`http://localhost:${PORT}/`, { waitUntil: "load" })

	// Wait a moment for rendering
	await page.waitForTimeout(500)

	// Test 1: No JS errors
	if (errors.length === 0) {
		console.log("  \x1b[32m✓\x1b[0m No JavaScript errors")
		passed++
	} else {
		console.log("  \x1b[31m✗\x1b[0m JavaScript errors found:")
		errors.forEach((e) => console.log("    " + e))
	}

	// Test 2: Canvas elements exist
	const canvasCount = await page.locator("canvas").count()
	if (canvasCount >= 1) {
		console.log(`  \x1b[32m✓\x1b[0m Found ${canvasCount} canvas element(s)`)
		passed++
	} else {
		console.log("  \x1b[31m✗\x1b[0m No canvas elements found")
	}

	// Test 3: Canvas has non-trivial content (not blank)
	const hasContent = await page.evaluate(() => {
		const canvas = document.querySelector("canvas")
		if (!canvas) return false
		const ctx = canvas.getContext("2d")
		// Sample pixels from several spots
		const spots = [
			[canvas.width / 2, canvas.height / 2],
			[50, 50],
			[canvas.width - 50, 50],
			[50, canvas.height - 50],
		]
		let nonBlank = 0
		for (const [x, y] of spots) {
			const pixel = ctx.getImageData(x, y, 1, 1).data
			// Check if pixel has any color (not fully transparent)
			if (pixel[3] > 0) nonBlank++
		}
		return nonBlank > 0
	})

	if (hasContent) {
		console.log("  \x1b[32m✓\x1b[0m Canvas has rendered content")
		passed++
	} else {
		console.log("  \x1b[31m✗\x1b[0m Canvas appears blank")
	}

	// Test 4: UI canvas (paddles, tools) has some rendered content
	const hasPaddleArea = await page.evaluate(() => {
		const canvases = document.querySelectorAll("canvas")
		const canvas = canvases.length > 1 ? canvases[1] : canvases[0]
		if (!canvas) return false
		const ctx = canvas.getContext("2d")
		// Sample across the whole canvas
		let nonBlank = 0
		for (let x = 0; x < canvas.width; x += 20) {
			for (let y = 0; y < canvas.height; y += 20) {
				const pixel = ctx.getImageData(x, y, 1, 1).data
				if (pixel[3] > 0) nonBlank++
			}
		}
		return nonBlank > 0
	})

	if (hasPaddleArea) {
		console.log("  \x1b[32m✓\x1b[0m UI elements rendered on paddle canvas")
		passed++
	} else {
		console.log("  \x1b[31m✗\x1b[0m No UI elements found on paddle canvas")
	}

	const total = 4
	console.log(`\n  \x1b[${passed === total ? "32" : "31"}m${passed}/${total} browser tests passing\x1b[0m`)

	await browser.close()
	server.close()

	if (passed < total || errors.length > 0) {
		process.exit(1)
	}
}

run().catch((e) => {
	console.error("Browser test failed:", e)
	process.exit(1)
})
