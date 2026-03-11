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

	// Test 5: Toolbar shapes visible in top-left region
	// The toolbar has 4 tool shapes (square, triangle, circle, hexagon)
	// rendered as white shapes in the top ~60px of the UI canvas
	const toolbarCheck = await page.evaluate(() => {
		const canvases = document.querySelectorAll("canvas")
		const canvas = canvases.length > 1 ? canvases[1] : canvases[0]
		if (!canvas) return { ok: false, reason: "no canvas" }
		const ctx = canvas.getContext("2d")
		const dpr = window.devicePixelRatio || 1

		// Scan the toolbar region (top 60px, left 400px) for bright pixels
		// Tools are white shapes on dark background
		const region = { x: 0, y: 0, w: Math.min(400 * dpr, canvas.width), h: Math.min(60 * dpr, canvas.height) }
		const imageData = ctx.getImageData(region.x, region.y, region.w, region.h)
		const data = imageData.data

		let brightPixels = 0
		for (let i = 0; i < data.length; i += 4) {
			// Check for bright (white-ish) pixels: R+G+B > 600
			if (data[i] + data[i+1] + data[i+2] > 600 && data[i+3] > 200) {
				brightPixels++
			}
		}

		return { ok: brightPixels > 50, brightPixels }
	})

	if (toolbarCheck.ok) {
		console.log(`  \x1b[32m✓\x1b[0m Toolbar shapes visible (${toolbarCheck.brightPixels} bright pixels)`)
		passed++
	} else {
		console.log(`  \x1b[31m✗\x1b[0m Toolbar shapes missing (${toolbarCheck.brightPixels} bright pixels in top-left)`)
	}

	// Test 6: Paddle visible (coloured rectangle on the left side, below toolbar)
	const paddleCheck = await page.evaluate(() => {
		const canvases = document.querySelectorAll("canvas")
		const canvas = canvases.length > 1 ? canvases[1] : canvases[0]
		if (!canvas) return { ok: false, reason: "no canvas" }
		const ctx = canvas.getContext("2d")
		const dpr = window.devicePixelRatio || 1

		// Paddle region: left edge, below toolbar (y=60-300, x=0-80)
		const region = { x: 0, y: Math.round(60 * dpr), w: Math.min(80 * dpr, canvas.width), h: Math.min(250 * dpr, canvas.height) }
		const imageData = ctx.getImageData(region.x, region.y, region.w, region.h)
		const data = imageData.data

		// Look for non-black pixels — the paddle is a coloured rectangle
		// (dark blue-grey) that stands out from the pure black background
		let nonBlackPixels = 0
		for (let i = 0; i < data.length; i += 4) {
			const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3]
			if (a > 200 && (r > 20 || g > 20 || b > 20)) {
				nonBlackPixels++
			}
		}

		return { ok: nonBlackPixels > 30, nonBlackPixels }
	})

	if (paddleCheck.ok) {
		console.log(`  \x1b[32m✓\x1b[0m Paddle visible (${paddleCheck.nonBlackPixels} non-black pixels)`)
		passed++
	} else {
		console.log(`  \x1b[31m✗\x1b[0m Paddle missing (${paddleCheck.nonBlackPixels} non-black pixels in paddle region)`)
	}

	const total = 6
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
