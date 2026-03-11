// Real browser test — loads index.html in Chromium via Playwright
// Catches JS errors, missing renders, and broken UI that jsdom tests miss

const { test } = require("node:test")
const assert = require("node:assert/strict")
const { chromium } = require("@playwright/test")
const http = require("node:http")
const fs = require("node:fs")
const path = require("node:path")

const PORT = 9222
const ROOT = path.resolve(__dirname, "..")

function startServer() {
	const mimeTypes = {
		".html": "text/html",
		".js": "application/javascript",
		".css": "text/css",
		".png": "image/png",
	}

	const server = http.createServer((req, res) => {
		const filePath = path.join(ROOT, req.url === "/" ? "index.html" : req.url)
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

let server, browser, page
const errors = []

test("browser tests", async (t) => {
	server = await startServer()
	browser = await chromium.launch()
	page = await browser.newPage()

	page.on("pageerror", (err) => errors.push(err.message))
	page.on("requestfailed", (req) => errors.push(`Failed to load: ${req.url()}`))

	await page.goto(`http://localhost:${PORT}/`, { waitUntil: "load" })
	await page.waitForTimeout(500)

	await t.test("no JavaScript errors", () => {
		assert.equal(errors.length, 0, `JS errors: ${errors.join("; ")}`)
	})

	await t.test("canvas elements exist", async () => {
		const count = await page.locator("canvas").count()
		assert.ok(count >= 1, `Expected at least 1 canvas, found ${count}`)
	})

	await t.test("canvas has rendered content", async () => {
		const hasContent = await page.evaluate(() => {
			const canvas = document.querySelector("canvas")
			if (!canvas) return false
			const ctx = canvas.getContext("2d")
			const spots = [
				[canvas.width / 2, canvas.height / 2],
				[50, 50],
				[canvas.width - 50, 50],
				[50, canvas.height - 50],
			]
			for (const [x, y] of spots) {
				const pixel = ctx.getImageData(x, y, 1, 1).data
				if (pixel[3] > 0) return true
			}
			return false
		})
		assert.ok(hasContent, "Canvas appears blank")
	})

	await t.test("UI elements rendered on canvas", async () => {
		const nonBlank = await page.evaluate(() => {
			const canvases = document.querySelectorAll("canvas")
			const canvas = canvases.length > 1 ? canvases[1] : canvases[0]
			if (!canvas) return 0
			const ctx = canvas.getContext("2d")
			let count = 0
			for (let x = 0; x < canvas.width; x += 20) {
				for (let y = 0; y < canvas.height; y += 20) {
					const pixel = ctx.getImageData(x, y, 1, 1).data
					if (pixel[3] > 0) count++
				}
			}
			return count
		})
		assert.ok(nonBlank > 0, "No UI elements rendered")
	})

	await t.test("toolbar shapes visible", async () => {
		const brightPixels = await page.evaluate(() => {
			const canvases = document.querySelectorAll("canvas")
			const canvas = canvases.length > 1 ? canvases[1] : canvases[0]
			if (!canvas) return 0
			const ctx = canvas.getContext("2d")
			const dpr = window.devicePixelRatio || 1
			const w = Math.min(400 * dpr, canvas.width)
			const h = Math.min(60 * dpr, canvas.height)
			const data = ctx.getImageData(0, 0, w, h).data
			let count = 0
			for (let i = 0; i < data.length; i += 4) {
				if (data[i] + data[i+1] + data[i+2] > 600 && data[i+3] > 200) count++
			}
			return count
		})
		assert.ok(brightPixels > 50, `Only ${brightPixels} bright pixels in toolbar region`)
	})

	await t.test("paddle visible", async () => {
		const nonBlackPixels = await page.evaluate(() => {
			const canvases = document.querySelectorAll("canvas")
			const canvas = canvases.length > 1 ? canvases[1] : canvases[0]
			if (!canvas) return 0
			const ctx = canvas.getContext("2d")
			const dpr = window.devicePixelRatio || 1
			const x = 0, y = Math.round(60 * dpr)
			const w = Math.min(80 * dpr, canvas.width)
			const h = Math.min(250 * dpr, canvas.height)
			const data = ctx.getImageData(x, y, w, h).data
			let count = 0
			for (let i = 0; i < data.length; i += 4) {
				if (data[i+3] > 200 && (data[i] > 20 || data[i+1] > 20 || data[i+2] > 20)) count++
			}
			return count
		})
		assert.ok(nonBlackPixels > 30, `Only ${nonBlackPixels} non-black pixels in paddle region`)
	})

	await browser.close()
	server.close()
})
