// Sets up a jsdom environment that can load CellPond's browser scripts
// Stubs out canvas rendering since we're testing logic, not visuals

const { JSDOM } = require("jsdom")
const vm = require("vm")
const fs = require("fs")
const path = require("path")

function readScript(filePath) {
	return fs.readFileSync(path.resolve(__dirname, "..", filePath), "utf-8")
}

function createEnvironment() {
	const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
		url: "http://localhost",
		pretendToBeVisual: false,
	})

	const window = dom.window

	// Stub canvas getContext — jsdom doesn't support canvas
	const stubContext = () => ({
		fillRect() {},
		clearRect() {},
		strokeRect() {},
		beginPath() {},
		closePath() {},
		moveTo() {},
		lineTo() {},
		arc() {},
		fill() {},
		stroke() {},
		save() {},
		restore() {},
		translate() {},
		scale() {},
		rotate() {},
		setTransform() {},
		drawImage() {},
		measureText() { return { width: 0 } },
		getImageData() { return { data: new Uint8ClampedArray(4) } },
		putImageData() {},
		createLinearGradient() { return { addColorStop() {} } },
		createRadialGradient() { return { addColorStop() {} } },
		createPattern() { return {} },
		fillStyle: "",
		strokeStyle: "",
		lineWidth: 1,
		font: "10px sans-serif",
		textAlign: "start",
		textBaseline: "alphabetic",
		globalAlpha: 1,
		globalCompositeOperation: "source-over",
		imageSmoothingEnabled: true,
		shadowColor: "",
		shadowBlur: 0,
		shadowOffsetX: 0,
		shadowOffsetY: 0,
		fillText() {},
		strokeText() {},
		clip() {},
		rect() {},
		quadraticCurveTo() {},
		bezierCurveTo() {},
		lineCap: "butt",
		lineJoin: "miter",
		miterLimit: 10,
		setLineDash() {},
		getLineDash() { return [] },
		lineDashOffset: 0,
		canvas: null,
	})

	const origCreateElement = window.document.createElement.bind(window.document)
	window.document.createElement = function(tag, ...args) {
		const el = origCreateElement(tag, ...args)
		if (tag.toLowerCase() === "canvas") {
			el.getContext = () => {
				const ctx = stubContext()
				ctx.canvas = el
				return ctx
			}
			el.toDataURL = () => "data:image/png;base64,stub"
		}
		return el
	}

	// Globals that CellPond expects
	window.devicePixelRatio = 1
	window.innerWidth = 800
	window.innerHeight = 600
	window.requestAnimationFrame = () => {}  // stub — no render loop in tests

	return { dom, window }
}

function loadCellPond() {
	const { dom, window } = createEnvironment()
	window.console = console

	// Load the main file up to (but not including) on.load(() => { ... })
	// Everything before line 465 is pure logic: makeCell, pickCell, grid, state, etc.
	// The on.load block sets up UI (canvas, render loop, input) which hangs in Node.
	const mainSource = readScript("the-one-true-todey-file-of-cellpond.js")
	const onLoadIndex = mainSource.indexOf("\non.load(() => {")
	const coreSource = mainSource.substring(0, onLoadIndex)

	const scripts = [
		readScript("libraries/habitat-embed.js"),
		readScript("libraries/show.js"),
		readScript("libraries/linked-list.js"),
		"Habitat.install(this);",
		readScript("libraries/colour.js"),
		readScript("libraries/lz-string.js"),
		readScript("source/colour.js"),
		readScript("source/camera.js"),
		readScript("source/cell.js"),
		coreSource,
		// Stub DRAGON_INSTRUCTION — defined inside on.load (which is truncated for tests)
		// dragon.js's makeDiagramCell defaults to DRAGON_INSTRUCTION.recolour at call time
		`DRAGON_INSTRUCTION = {};
		 DRAGON_INSTRUCTION.nothing = (cell) => () => ({drawn: 0});
		 DRAGON_INSTRUCTION.nothing.type = "NOTHING";
		 DRAGON_INSTRUCTION.recolour = (cell) => () => ({drawn: 0});
		 DRAGON_INSTRUCTION.recolour.type = "RECOLOUR";
		 DRAGON_INSTRUCTION.split = (cell) => () => ({drawn: 0});
		 DRAGON_INSTRUCTION.split.type = "SPLIT";
		 DRAGON_INSTRUCTION.merge = (cell) => () => ({drawn: 0});
		 DRAGON_INSTRUCTION.merge.type = "MERGE";`,
		readScript("source/dragon.js"),
		// Initialize ruleRegistry — normally done inside on.load which is truncated for tests
		`ruleRegistry = new RuleRegistry();`,
	]

	const combined = scripts.join("\n;\n")

	// const/let in vm contexts don't become properties on the context object.
	// Use var to re-export the bindings we need for testing.
	const exportBlock = `
		var __cellpond_exports__ = {
			Cell, CellGrid, cellGrid,
			getRGB, clamp, wrap,
			state, world,
			WORLD_SIZE, WORLD_CELL_COUNT, WORLD_DIMENSION, WORLD_CELL_SIZE,
			setWorldSize,
			fits, aligns, isFit,
			DragonNumber, DragonArray, DiagramCell, Diagram, Rule,
			RuleRegistry, ruleRegistry,
			DRAGON_TRANSFORMATIONS, CHANNEL_VARIABLES,
			sortByPosition,
		};
		for (var __k__ in __cellpond_exports__) {
			this[__k__] = __cellpond_exports__[__k__];
		}
	`

	const fullScript = combined + "\n;\n" + exportBlock
	const context = vm.createContext(window)

	const script = new vm.Script(fullScript, { filename: "cellpond-core.js" })
	script.runInContext(context)

	return { dom, window, context }
}

module.exports = { loadCellPond }
