/*

ribbit

░██████╗██╗░░░██╗██████╗░██████╗░███████╗░█████╗░██╗░░░░░██╗░██████╗████████╗
██╔════╝██║░░░██║██╔══██╗██╔══██╗██╔════╝██╔══██╗██║░░░░░██║██╔════╝╚══██╔══╝
╚█████╗░██║░░░██║██████╔╝██████╔╝█████╗░░███████║██║░░░░░██║╚█████╗░░░░██║░░░
░╚═══██╗██║░░░██║██╔══██╗██╔══██╗██╔══╝░░██╔══██║██║░░░░░██║░╚═══██╗░░░██║░░░
██████╔╝╚██████╔╝██║░░██║██║░░██║███████╗██║░░██║███████╗██║██████╔╝░░░██║░░░
╚═════╝░░╚═════╝░╚═╝░░╚═╝╚═╝░░╚═╝╚══════╝╚═╝░░╚═╝╚══════╝╚═╝╚═════╝░░░░╚═╝░░░

░█████╗░██╗░░░██╗████████╗░█████╗░███╗░░░███╗░█████╗░████████╗██╗░██████╗███╗░░░███╗
██╔══██╗██║░░░██║╚══██╔══╝██╔══██╗████╗░████║██╔══██╗╚══██╔══╝██║██╔════╝████╗░████║
███████║██║░░░██║░░░██║░░░██║░░██║██╔████╔██║███████║░░░██║░░░██║╚█████╗░██╔████╔██║
██╔══██║██║░░░██║░░░██║░░░██║░░██║██║╚██╔╝██║██╔══██║░░░██║░░░██║░╚═══██╗██║╚██╔╝██║
██║░░██║╚██████╔╝░░░██║░░░╚█████╔╝██║░╚═╝░██║██║░░██║░░░██║░░░██║██████╔╝██║░╚═╝░██║
╚═╝░░╚═╝░╚═════╝░░░░╚═╝░░░░╚════╝░╚═╝░░░░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░╚═╝╚═════╝░╚═╝░░░░░╚═╝

Welcome traveller!
Welcome to the SOURCE of the CellPond.

If you venture further, may tode be with you.
What you are about to discover...
	... is a single javascript file ...
		... of gargantuan size ...
			... over 8000 lines ...
				... globally scoped ...

	>>> There is no room for fear here! <<<

Be brave.
	Trust no comments.
		Trust no names.

A simple seed ... grown into a mountain ...
	CellPond is a performance ...
		and by reading this you JOIN THE RITUAL ...

=============================================================

	... many months later

	the source of CellPond calls me back

	and it calls you too!

=============================================================

//------//
// FAQs //
//------//
Q:
A: it's a secret

*/

var middleClicked = false

document.addEventListener('mousedown', function(event) {
    if (event.button === 1) {
        middleClicked = true
    }
})

const urlParams = new URLSearchParams(window.location.search)
const NO_SECRET_MODE = urlParams.has("nosecret")
const NO_FOOLS_MODE = urlParams.has("nofools")
const UNLOCK_MODE = true
const SCALE = urlParams.get("scale") ?? 1
const DPR = urlParams.get("dpr") ?? devicePixelRatio
print('DPR:', DPR)
if (NO_SECRET_MODE) {
	localStorage.setItem("secretHasAlreadyBeenRevealed", "true")
}

const secretHasAlreadyBeenRevealed = localStorage.getItem("secretHasAlreadyBeenRevealed")


let brushColourCycleIndex = 0
const brushColourCycle = [
	999,

	Colour.Green.splash,
	Colour.Blue.splash,
	Colour.Red.splash,
	Colour.Yellow.splash,

	Colour.Black.splash,
	
	Colour.Rose.splash,
	Colour.Cyan.splash,
	Colour.Orange.splash,
	Colour.Purple.splash,
	Colour.Pink.splash,
	
	Colour.Grey.splash,
	Colour.Silver.splash,
]

let edgeMode = 0

const pickRandomCell = () => {
	const x = Random.Uint32 / 4294967295
	const y = Random.Uint32 / 4294967295
	const cell = cellGrid.pick(x, y)
	return cell
}

const pickRandomVisibleCell = () => {
	
	if (!state.view.visible) return undefined
	if (state.view.fullyVisible) return pickRandomCell()
	
	const x = state.region.left + (Random.Uint32 / 4294967295) * state.region.width
	const y = state.region.top + (Random.Uint32 / 4294967295) * state.region.height
	const cell = cellGrid.pick(x, y)
	return cell
}

//=======//
// STATE //
//=======//
const state = {

	ticker: () => {},
	time: 0,
	maxTime: 9999999,

	speed: {
		count: 4096 * 0.4,
		dynamic: false,
		redraw: 2.5,
		redrawRepeatScore: 0.5,
		redrawRepeatPenalty: 0.0,
	},

	image: {

		data: undefined,
		size: undefined,
		baseSize: undefined,

	},

	view: {

		height: undefined,
		width: undefined,
		iheight: undefined,
		iwidth: undefined,
		
		left: undefined,
		right: undefined,
		top: undefined,
		bottom: undefined,

		visible: true,
		fullyVisible: true,


	},

	region: {
		left: 0.0,
		right: 1.0,
		top: 0.0,
		bottom: 1.0,

		width: 1.0,
		height: 1.0,
	},

	camera: new Camera(),

	brush: {
		colour: Colour.Purple.splash,
		colour: Colour.Rose.splash,
		colour: Colour.Yellow.splash,
		colour: Colour.Grey.splash,
		colour: Colour.Green.splash,
		colour: 999,
		size: 3,
	},

	cursor: {
		previous: { 
			x: undefined,
			y: undefined,
		},
	},

}

let WORLD_SIZE = undefined
let WORLD_CELL_COUNT = undefined
let WORLD_DIMENSION = undefined
let WORLD_CELL_SIZE = undefined
const setWorldSize = (size) => {
	WORLD_SIZE = size
	WORLD_CELL_COUNT = 2 ** (WORLD_SIZE*2)
	WORLD_DIMENSION = 2 ** WORLD_SIZE
	WORLD_CELL_SIZE = 1 / WORLD_DIMENSION
}
setWorldSize(6)

const GRID_SIZE = 128
const cellGrid = new CellGrid(GRID_SIZE)
var ruleRegistry
var drawQueue

const overrideCells = (cells) => {
	cellGrid.clear()
	for (const cell of cells) {
		cellGrid.add(cell)
	}
	drawQueue.requestReset()
}


//=======//
// SETUP //
//=======//
// Setup World
const world = new Cell({colour: WORLD_SIZE * 111})
cellGrid.add(world)

on.load(() => {

	ruleRegistry = new RuleRegistry()

	// Setup Show
	const show = Show.start({paused: false, scale: DPR})
	const {context, canvas} = show
	canvas.style["position"] = "absolute"

	class DrawQueue {
		constructor(state, canvas, cellGrid) {
			this.state = state
			this.canvas = canvas
			this.cellGrid = cellGrid
			this.queue = new Set()
			this.priority = new Set()
			this.needsReset = false
			this.gridMode = true
		}

		requestReset() {
			this.needsReset = true
		}

		isSectionVisible(section) {
			if (section.right <= this.state.region.left) return false
			if (section.left >= this.state.region.right) return false
			if (section.bottom <= this.state.region.top) return false
			if (section.top >= this.state.region.bottom) return false
			return true
		}

		isCellVisible(cell) {
			if (cell.right <= this.state.region.left) return false
			if (cell.left >= this.state.region.right) return false
			if (cell.bottom <= this.state.region.top) return false
			if (cell.top >= this.state.region.bottom) return false
			return true
		}

		queueCell(cell, colour) {
			cell.colour = colour
			if (!this.isCellVisible(cell)) return 0
			this.priority.add(cell)
			this.queue.delete(cell)
			return 0.01
		}

		drawCell(cell, override) {
			return this.setCellColour(cell, cell.colour, override)
		}

		drawAll() {
			const cells = this.cellGrid.getAll()
			for (const cell of cells.values()) {
				this.setCellColour(cell, cell.colour)
			}
		}

		addAllCells() {
			this.queue.clear()
			for (const section of shuffleArray([...this.cellGrid.sections])) {
				if (!this.isSectionVisible(section)) continue
				for (const cell of section.values()) {
					this.queue.add(cell)
				}
			}
		}

		setCellColour(cell, colour, override = false) {
			if (cell.isDeleted) return 0
			cell.colour = colour
			if (!this.isCellVisible(cell)) return 0

			const size = this.state.image.size
			const imageWidth = this.canvas.width

			const panX = this.state.camera.x * this.state.camera.scale
			const panY = this.state.camera.y * this.state.camera.scale

			// Position
			let left = Math.round(size * cell.left + panX)
			if (left > this.canvas.width) return 0
			if (left < 0) left = 0

			let top = Math.round(size * cell.top + panY)
			if (top > this.canvas.height) return 0
			if (top < 0) top = 0

			let right = Math.round(size * cell.right + panX)
			if (right < 0) return 0
			if (right > this.canvas.width) right = this.canvas.width

			let bottom = Math.round(size * cell.bottom + panY)
			if (bottom < 0) return 0
			if (bottom > this.canvas.height) bottom = this.canvas.height

			// Colour
			const splash = Colour.splash(cell.colour)
			let red = splash[0]
			let green = splash[1]
			let blue = splash[2]

			// Draw
			const iy = imageWidth * 4

			const width = right-left
			const ix = 4
			const sx = width * ix

			let id = (top*imageWidth + left) * 4
			const data = this.state.image.data.data

			let borderRed = Colour.Void.red
			let borderGreen = Colour.Void.green
			let borderBlue = Colour.Void.blue

			if (!this.gridMode || width <= 3 || bottom-top <= 3) {
				borderRed = red
				borderGreen = green
				borderBlue = blue

				for (let y = top; y < bottom; y++) {
					for (let x = left; x < right; x++) {
						data[id] = red
						data[id+1] = green
						data[id+2] = blue
						id += 4
					}
					id += iy
					id -= sx
				}

				return 1
			}

			const left1 = left + 1
			const right_1 = right - 1
			const top1 = top + 1
			const bottom_1 = bottom - 1

			// DRAW TOP ROW
			data[id] = borderRed
			data[id+1] = borderGreen
			data[id+2] = borderBlue
			id += 4

			for (let x = left1; x < right_1; x++) {
				data[id] = borderRed
				data[id+1] = borderGreen
				data[id+2] = borderBlue
				id += 4
			}

			data[id] = borderRed
			data[id+1] = borderGreen
			data[id+2] = borderBlue
			id += 4
			id -= sx
			id += iy

			// DRAW MIDDLE ROWS
			for (let y = top1; y < bottom_1; y++) {

				data[id] = borderRed
				data[id+1] = borderGreen
				data[id+2] = borderBlue
				id += 4

				for (let x = left1; x < right_1; x++) {
					data[id] = red
					data[id+1] = green
					data[id+2] = blue
					id += 4
				}

				data[id] = borderRed
				data[id+1] = borderGreen
				data[id+2] = borderBlue
				id += 4

				id -= sx
				id += iy
			}

			// DRAW BOTTOM ROW
			data[id] = borderRed
			data[id+1] = borderGreen
			data[id+2] = borderBlue
			id += 4

			for (let x = left1; x < right_1; x++) {
				data[id] = borderRed
				data[id+1] = borderGreen
				data[id+2] = borderBlue
				id += 4
			}

			data[id] = borderRed
			data[id+1] = borderGreen
			data[id+2] = borderBlue

			return 1
		}
	}

	drawQueue = new DrawQueue(state, canvas, cellGrid)

	//===============//
	// IMAGE + SIZES //
	//===============//
	const updateImageSize = () => {
		state.image.baseSize = Math.min(canvas.width, canvas.height)
		state.image.size = state.image.baseSize * state.camera.scale

		state.image.left = state.camera.x * state.camera.scale
		state.image.top = state.camera.y * state.camera.scale
		state.image.right = state.image.left + state.image.size
		state.image.bottom = state.image.top + state.image.size

		state.view.left = clamp(state.image.left, 0, canvas.width)
		state.view.top = clamp(state.image.top, 0, canvas.height)
		state.view.right = clamp(state.image.right, 0, canvas.width)
		state.view.bottom = clamp(state.image.bottom, 0, canvas.height)
		
		state.view.width = state.view.right - state.view.left
		state.view.height = state.view.bottom - state.view.top

		state.view.visible = state.view.width > 0 && state.view.height > 0
		state.view.fullyVisible = state.view.left === state.image.left && state.view.right === state.image.right && state.view.top === state.image.top && state.view.bottom === state.image.bottom
		
		state.view.iwidth = Math.ceil(state.view.width)
		state.view.iheight = Math.ceil(state.view.height)

		state.region.left = (state.view.left - state.image.left) / state.image.size
		state.region.right = 1.0 + (state.view.right - state.image.right) / state.image.size
		state.region.top = (state.view.top - state.image.top) / state.image.size
		state.region.bottom = 1.0 + (state.view.bottom - state.image.bottom) / state.image.size

		state.region.width = state.region.right - state.region.left
		state.region.height = state.region.bottom - state.region.top

		drawQueue.requestReset()
	}

	const updateImageData = () => {
		state.image.data = context.getImageData(0, 0, canvas.width, canvas.height)
	}

	// Setup ImageData
	context.fillStyle = Colour.Void
	context.fillRect(0, 0, canvas.width, canvas.height)
	updateImageSize()
	updateImageData()

	state.camera.x += (canvas.width - state.image.size) / 2
	state.camera.y += (canvas.height - state.image.size) / 2

	//======//
	// DRAW //
	//======//
	show.resize = () => {
		context.fillStyle = Colour.Void
		context.fillRect(0, 0, canvas.width, canvas.height)
		updateImageSize()
		updateImageData()
	}

	const stampScale = (scale) => {
		updateImageSize()
	}

	//========//
	// CURSOR //
	//========//
	const updateCursor = () => {

		updateBrush()
		updatePan()

		const [x, y] = Mouse.position
		state.cursor.previous.x = x
		state.cursor.previous.y = y
		
	}

	let pencilled = false
	const updateBrush = () => {

		if (!state.worldBuilt) return

		if (!Mouse.Middle) {
			pencilled = false
		}

		if (hand.state !== HAND.BRUSHING && hand.state !== HAND.PENCILLING) return

		if (Mouse.Middle && !pencilled) {
			const [x, y] = Mouse.position
			brush(...getCursorView(x, y), {single: true})
			pencilled = true
		}

		if (!Mouse.Left) return
		let [x, y] = getCursorView(...Mouse.position)
		if (x === undefined || y === undefined) {
			return
		}
		
		let [px, py] = getCursorView(state.cursor.previous.x, state.cursor.previous.y)
		
		const size = state.brush.size * WORLD_CELL_SIZE

		const dx = x - px
		const dy = y - py

		const sx = Math.sign(dx)
		const sy = Math.sign(dy)

		const ax = Math.abs(dx)
		const ay = Math.abs(dy)

		const biggest = Math.max(ax, ay)

		let ix = 0
		let iy = 0

		if (ax === biggest) {
			iy = (WORLD_CELL_SIZE * sy) * (ay / ax)
			ix = WORLD_CELL_SIZE * sx
		} else {
			ix = (WORLD_CELL_SIZE * sx) * (ax / ay)
			iy = WORLD_CELL_SIZE * sy
		}

		const points = new Set()

		const length = biggest / WORLD_CELL_SIZE

		if (dx === 0 && dy === 0) {
			for (let dx = -size/2; dx <= size/2; dx += WORLD_CELL_SIZE) {
				for (let dy = -size/2; dy <= size/2; dy += WORLD_CELL_SIZE) {
					points.add([x + dx, y + dy])
				}
			}
		}
		else for (let i = 0; i <= length; i++) {
			
			const X = px + ix * i
			const Y = py + iy * i

			for (let dx = -size/2; dx <= size/2; dx += WORLD_CELL_SIZE) {
				for (let dy = -size/2; dy <= size/2; dy += WORLD_CELL_SIZE) {
					points.add([X + dx, Y + dy])
				}
			}

		}

		for (const point of points.values()) {
			brush(point[0], point[1])
		}
		
	}

	const getCursorView = (x, y) => {
		x -= state.camera.x * state.camera.scale / DPR
		y -= state.camera.y * state.camera.scale / DPR

		x /= state.image.size
		y /= state.image.size

		x *= DPR
		y *= DPR

		return [x, y]
	}

	const brush = (x, y, {single = false} = {}) => {

		let cell = cellGrid.pick(x, y)
		if (cell === undefined) return
		if (!single && (cell.width !== WORLD_CELL_SIZE || cell.height != WORLD_CELL_SIZE)) {
			const worldCells = getWorldCellsSet(x, y)
			if (worldCells !== undefined) {
				const merged = cellGrid.merge([...worldCells])
				cell = merged
			}
		}

		if (typeof state.brush.colour === "number") {
			cell.colour = state.brush.colour
			drawQueue.drawCell(cell)
			return
		}

		let children = []
		if (state.brush.colour.left[0].content.isDiagram) {
			children = splitCellToDiagram(cell, state.brush.colour.left[0].content)
		} else {
			children = splitCellToDiagram(cell, state.brush.colour)
		}

		for (const child of children) {
			drawQueue.drawCell(child)
		}

	}


	const getWorldCellsSet = (x, y) => {

		const sections = getSectionsOfWorldCell(x, y)
		const worldCells = getWorldCellsFromSections(sections, x, y)

		return worldCells

	}

	const getSectionsOfWorldCell = (x, y) => {
		const snappedX = Math.floor(x*WORLD_DIMENSION) / WORLD_DIMENSION
		const snappedY = Math.floor(y*WORLD_DIMENSION) / WORLD_DIMENSION

		const sectionSizeScale = GRID_SIZE / WORLD_DIMENSION

		const sections = new Set()
		for (let wx = 0; wx < sectionSizeScale; wx++) {
			const gridX = Math.floor((snappedX + wx * WORLD_CELL_SIZE / sectionSizeScale) * GRID_SIZE)
			for (let wy = 0; wy < sectionSizeScale; wy++) {
				const gridY = Math.floor((snappedY + wy * WORLD_CELL_SIZE / sectionSizeScale) * GRID_SIZE)
				const sectionId = gridX*GRID_SIZE + gridY
				const section = cellGrid.sections[sectionId]
				sections.add(section)
			}
		}

		return sections
	}

	const getWorldCellsFromSections = (sections, x, y) => {
		const worldCells = new Set()

		// Check if any cells in these sections overlap with an outer section
		for (const section of sections.values()) {
			for (const cell of section.values()) {
				if (worldCells.has(cell)) continue
				for (const cellSection of cell.sections) {
					if (!sections.has(cellSection)) return undefined
				}
				worldCells.add(cell)
			}
		}

		return worldCells
	}

	let dropperStartX = undefined
	let dropperStartY = undefined
	let dropperStartT = undefined

	state.brush.hoverColour = Colour.Void

	const updatePan = () => {

		const [x, y] = Mouse.position

		if (hand.state === HAND.BRUSH || hand.state === HAND.BRUSHING || hand.state === HAND.PENCILLING) {
			const cell = cellGrid.pick(...getCursorView(x, y))
			if (cell !== undefined)	state.brush.hoverColour = cell.colour
		} else {
			const atom = atomRegistry.getAt(x / CT_SCALE, y / CT_SCALE)

			if (atom !== undefined) {
				if (atom.isSquare || atom === squareTool) {
					state.brush.hoverColour = atom.value
					if (atom.joinExpanded) {
						const clon = DragonArray.cloneContent(atom.value)
						clon.joins = []
						state.brush.hoverColour = clon
					}
				} else if (atom.isTallRectangle) {
					// TODO: what colour should rectangles set the brush?
				} else if (atom.isPaddle) {
					state.brush.hoverColour = atom.getColour(atom)
				} else if (atom.isSlot) {
					state.brush.hoverColour = atom.parent.getColour(atom.parent)
				} else {
					state.brush.hoverColour = atom.colour.splash
				}
			} else {
				state.brush.hoverColour = Colour.Void
			}
		}

		if (!Mouse.Right) {

			if (dropperStartX !== undefined) {


				const dropperDistance = Math.hypot(x - dropperStartX, y - dropperStartY)
				const dropperTime = Date.now() - dropperStartT
				if (dropperTime < 100 || dropperDistance <= 0) {
					
					if (state.brush.hoverColour === Colour.Void) {
						brushColourCycleIndex++
						if (brushColourCycleIndex >= brushColourCycle.length) {
							brushColourCycleIndex = 0
						}

						setBrushColour(brushColourCycle[brushColourCycleIndex])
					}

					else {
						setBrushColour(state.brush.hoverColour)
					}

					squareTool.toolbarNeedsColourUpdate = true
				}

				drawQueue.requestReset()

			}

			dropperStartX = undefined
			dropperStartY = undefined
			return
		}

		drawQueue.requestReset()
		
		if (dropperStartX === undefined) {
			dropperStartX = x
			dropperStartY = y
			dropperStartT = Date.now()
			dropperMovement = 0
		}

		if (hand.state === HAND.FREE || hand.state == HAND.VOIDING || hand.state === HAND.BRUSH || hand.state === HAND.BRUSHING || hand.state === HAND.PENCILLING) {
			const {x: px, y: py} = state.cursor.previous
			if (px === undefined || py === undefined) return
			if (x === undefined || y === undefined) return
			const [dx, dy] = [x - px, y - py]
			state.camera.x += dx / state.camera.scale
			state.camera.y += dy / state.camera.scale
			updateImageSize()
		}
	}

	let CT_SCALE = DPR * SCALE
	on.wheel((e) => {

		e.preventDefault()

		let dy = e.deltaY / 100

		if (e.altKey) {
			UI.paddleScroll -= 50 * dy
			positionPaddles()
		}

		else if (e.ctrlKey || e.metaKey) {
			if (CT_SCALE - dy * 0.1 > 0.05)
				CT_SCALE -= dy * 0.1
			UI.CT_SCALE = CT_SCALE
			const allAtoms = getAllAtoms()
			for (const atom of allAtoms) {
				atom.needsColoursUpdate = true
			}
			squareTool.toolbarNeedsColourUpdate = true
		}

		else if (e.shiftKey) {
			if (dy === 0) dy = e.deltaX / 100
			state.brush.size -= Math.sign(dy)
			if (state.brush.size < 0) state.brush.size = 0
		}

		else {
			state.camera.zoom(dy, ...Mouse.position)
			updateImageSize()
		}

	}, {passive: false})

	on.keydown(e => {
		if (e.key === "Alt") e.preventDefault()
	}, {passive: false})

	on.keydown(e => {
		if (e.key === "f") {
			state.camera.x = 1920 * 1/3
			state.camera.y = 30
			state.camera.scale = 0.95
			updateImageSize()
		}
	})

	on.contextmenu((e) => {
		e.preventDefault()
	})

	//==========//
	// KEYBOARD //
	//==========//
	on.keydown(e => {
		const keydown = KEYDOWN[e.key]
		if (keydown !== undefined) keydown(e)
	})

	const KEYDOWN = {}
	KEYDOWN.e = () => state.camera.mscaleTarget += state.camera.mscaleTargetControl
	KEYDOWN.q = () => state.camera.mscaleTarget -= state.camera.mscaleTargetControl
	
	KEYDOWN.w = () => state.camera.dyTarget += state.camera.dsControl
	KEYDOWN.s = (e) => {
		if ((e.ctrlKey || e.metaKey)) return
		state.camera.dyTarget -= state.camera.dsControl
	}
	KEYDOWN.a = () => state.camera.dxTarget += state.camera.dsControl
	KEYDOWN['d'] = () => state.camera.dxTarget -= state.camera.dsControl

	KEYDOWN[0] = () => setWorldSize(0)
	KEYDOWN[1] = () => setWorldSize(1)
	KEYDOWN[2] = () => setWorldSize(2)
	KEYDOWN[3] = () => setWorldSize(3)
	KEYDOWN[4] = () => setWorldSize(4)
	KEYDOWN[5] = () => setWorldSize(5)
	KEYDOWN[6] = () => setWorldSize(6)
	KEYDOWN[7] = () => setWorldSize(7)
	KEYDOWN[8] = () => setWorldSize(8)
	KEYDOWN[9] = () => setWorldSize(9)

	KEYDOWN.r = () => {
		state.camera.mscaleTarget = 1.0
		state.camera.dxTarget = 0.0
		state.camera.dyTarget = 0.0
	}

	KEYDOWN["="] = () => edgeMode = 1
	KEYDOWN["-"] = () => edgeMode = 0
	KEYDOWN["o"] = () => edgeMode = edgeMode === 0 ? 1 : 0

	KEYDOWN["g"] = () => {
		drawQueue.gridMode = !drawQueue.gridMode
		drawQueue.requestReset()
	}

	const updateCamera = () => {
		state.camera.update(hand, canvas, updateImageSize)
	}

	//======//
	// TICK //
	//======//
	drawQueue.drawAll()
	show.tick = () => {

		updateHand()
		updateCursor()
		updateCamera()

		if (drawQueue.needsReset) {
			drawQueue.addAllCells()
			drawQueue.needsReset = false
		}

		if (!show.paused) fireRandomSpotEvents()
		else fireRandomSpotDrawEvents()

		context.putImageData(state.image.data, 0, 0)

		// Draw void
		context.clearRect(0, 0, state.view.left, state.view.bottom)
		context.clearRect(state.view.left, 0, canvas.width, state.view.top)
		context.clearRect(state.view.right, state.view.top, canvas.width, canvas.height)
		context.clearRect(0, state.view.bottom, canvas.width, canvas.height)

		state.time++
		if (state.time > state.maxTime) state.time = 0

	}

	const shuffleArray = (array) => {
		for (let i = array.length - 1; i > 0; i--) {
			const r = Random.Uint32 % (i+1)
			;[array[i], array[r]] = [array[r], array[i]]
		}
		return array
	}

	const fireRandomSpotEvents = () => {
		let count = state.speed.dynamic? state.speed.aer * cellGrid.cellCount : state.speed.count
		count = Math.min(count, cellGrid.cellCount)
		count *= state.worldBuilt? 1 : 0.1
		const redrawCount = count * state.speed.redraw
		let redraw = true
		if (!state.worldBuilt) redraw = false
		let drawnCount = 0
		for (let i = 0; i < count; i++) {
			const cell = pickRandomCell()

			if (redraw && drawnCount >= redrawCount) redraw = false
			const drawn = fireCellEvent(cell, redraw)
			drawnCount += drawn
		}

		for (const cell of drawQueue.priority) {
			drawnCount += drawQueue.drawCell(cell)
			drawQueue.priority.delete(cell)
			if (drawnCount >= redrawCount) break
		}

		for (const cell of drawQueue.queue) {
			drawnCount += drawQueue.drawCell(cell)
			drawQueue.queue.delete(cell)
			if (drawnCount >= redrawCount) break
		}
	}

	const fireRandomSpotDrawEvents = () => {
		if (!state.view.visible) return
		const count = state.speed.dynamic? state.speed.aer * cellGrid.cellCount : state.speed.count
		let redrawCount = count * state.speed.redraw
		if (!state.worldBuilt) redrawCount = 1

		let drawnCount = 0

		for (const cell of drawQueue.queue) {
			drawnCount += drawQueue.drawCell(cell)
			drawQueue.queue.delete(cell)
			if (drawnCount >= redrawCount) break
		}
	}

	// this function is currently full of debug code
	// Returns the number of cells it drew
	const fireCellEvent = (cell, redraw) => {

		if (BUILD_WORLD(cell, redraw) !== undefined) return 1

		ruleRegistry.behaveFunctions.shuffle()
		for (const behave of ruleRegistry.behaveFunctions) {
			const result = behave(cell, redraw)
			if (result === undefined) continue
			return result
		}
		return 0

	}
	
	const splitCellToDiagram = (cell, diagram) => {
		const flatDiagram = flattenAndFillDiagramCells(diagram.left, new DragonArray({channels: [undefined, undefined, undefined]}))
		
		const widthScale = cell.width
		const heightScale = cell.height

		const children = []
		for (const diagramCell of flatDiagram) {

			const colours = diagramCell.content.getSplashes({source: cell.colour})
			const colour = colours[Random.Uint32 % colours.length]

			const child = new Cell({
				x: cell.x + diagramCell.x * widthScale,
				y: cell.y + diagramCell.y * heightScale,
				width: diagramCell.width * widthScale,
				height: diagramCell.height * heightScale,
				colour: colour,
			})

			children.push(child)
		}

		cellGrid.remove(cell)
		for (const child of children) {
			cellGrid.add(child)
		}

		return children

	}
	

	//=========//
	// ELEMENT //
	//=========//
	// Behave functions must return how many cells got drawn
	const BUILD_WORLD = (cell, redraw) => {
		if (state.worldBuilt) return undefined
		if (cellGrid.cellCount >= WORLD_CELL_COUNT) {
			state.worldBuilt = true
			return undefined
		}

		if (cell.colour < 111) {
			return 0
		}

		cell.colour -= 111
		const width = 2
		const height = 2
		const children = cellGrid.split(cell, width, height)
		for (const child of children) {
			drawQueue.drawCell(child)
		}

		return 1
	}

	//====================//
	// COLOURTODE - STATE //
	//====================//
	const hand = {
		state: undefined,
		content: undefined,
		offset: {x: 0, y: 0},
		velocity: {x: 0, y: 0},
		velocityHistory: [],
		velocityMemory: 5,
		previous: {x: 0, y: 0},
	}

	//====================//
	// COLOURTODE - SETUP //
	//====================//
	const colourTodeCanvas = document.createElement("canvas")
	const colourTodeContext = colourTodeCanvas.getContext("2d")
	
	colourTodeCanvas.style["position"] = "absolute"
	colourTodeCanvas.style["top"] = "0px"
	
	document.body.append(colourTodeCanvas)

	on.resize(() => {
		colourTodeCanvas.width = innerWidth * DPR
		colourTodeCanvas.height = innerHeight * DPR
		colourTodeCanvas.style["width"] = innerWidth
		colourTodeCanvas.style["height"] = innerHeight
	})

	trigger("resize")

	//===================//
	// COLOURTODE - TICK //
	//===================//
	const colourTodeTick = () => {

		colourTodeUpdate()
		colourTodeDraw()
		requestAnimationFrame(colourTodeTick)
	}

	const updateHand = () => {
		if (hand.velocityHistory.length >= hand.velocityMemory) {
			hand.velocityHistory.shift()
		}

		if (Mouse.position !== undefined && Mouse.position[0] !== undefined && hand.previous.x !== undefined) {
			const [x, y] = Mouse.position.map(n => n / CT_SCALE)
			const dx = (x - hand.previous.x) * DPR
			const dy = (y - hand.previous.y) * DPR
			const velocity = {x: dx, y: dy}
			hand.velocityHistory.push(velocity)
			const sum = hand.velocityHistory.reduce((a, b) => ({x: a.x+b.x, y: a.y+b.y}), {x:0, y:0})
			const average = {x: sum.x / hand.velocityHistory.length, y: sum.y / hand.velocityHistory.length}
			hand.velocity.x = average.x
			hand.velocity.y = average.y
			hand.previous.x = x
			hand.previous.y = y
		}
	}
	
	const COLOURTODE_FRICTION = 0.9
	const colourTodeUpdate = () => {
		for (const atom of atomRegistry.atoms) {
			updateAtom(atom)
		}
	}

	const updateAtom = (atom, checkOffscreen = true) => {

		for (const child of atom.children) {
			updateAtom(child, false)
		}

		// HIGHLIGHT
		if (atom.hover !== undefined) {
			updateAtomHighlight(atom)
		}

		atom.update(atom)

		// MOVEMENT
		if (hand.content === atom) return
		if (atom.dx === 0 && atom.dy === 0) return

		atom.x += atom.dx
		atom.y += atom.dy

		atom.x = clamp(atom.x, atom.minX, atom.maxX)
		atom.y = clamp(atom.y, atom.minY, atom.maxY)

		atom.dx *= COLOURTODE_FRICTION
		atom.dy *= COLOURTODE_FRICTION

		if (checkOffscreen && atom.isOffscreen()) {
			atomRegistry.delete(atom)
			return
		}

		const [mx, my] = Mouse.position.map(n => n / CT_SCALE)
		if (hand.state.atommove) hand.state.atommove(atom, mx, my)
	}

	const updateAtomHighlight = (atom) => {
		// Remove the previous highlight
		atom.highlightedAtom = undefined

		// Only highlight if I'm being dragged
		if (hand.content !== atom) return
		if (hand.state !== HAND.DRAGGING) return
		
		if (atom.highlight !== undefined) {
			deleteChild(atom, atom.highlight)
			atom.highlight = undefined
		}

		const highlightedAtom = atom.hover(atom)

		// Create the highlight
		if (highlightedAtom === undefined) return

		if (atom.highlight === undefined) {
			const highlight = createChild(atom, new Highlight(), {bottom: true})
			highlight.hasBorder = true
			highlight.colour = Colour.Grey
			const {x, y} = highlightedAtom.getPosition()
			highlight.x = x
			highlight.y = y
			highlight.width = highlightedAtom.width
			highlight.height = highlightedAtom.height
			atom.highlight = highlight
		}

		atom.highlightedAtom = highlightedAtom
	}

	const colourTodeDraw = () => {
		colourTodeContext.clearRect(0, 0, colourTodeCanvas.width, colourTodeCanvas.height)
		colourTodeContext.scale(CT_SCALE, CT_SCALE)
		for (const atom of atomRegistry.atoms) {
			atom.drawTree(colourTodeContext)
		}
		colourTodeContext.scale(1/CT_SCALE, 1/CT_SCALE)
	}

	requestAnimationFrame(colourTodeTick)

	//===================//
	// COLOURTODE - HAND //
	//===================//
	const DRAG_PITY = 15
	const DRAG_PITY_TIME = 100
	const DRAG_UNPITY_SPEED = 10

	const HAND = {}
	HAND_RELEASE = 0.5
	HAND.FREE = {
		cursor: "auto",

		mousemove: (e) => {
			const x = e.clientX / CT_SCALE
			const y = e.clientY / CT_SCALE
			const atom = atomRegistry.getAt(x, y)
			if (atom !== undefined) {
				if (atom.grabbable) {
					if (!Mouse.Left) {
						if (atom.cursor !== undefined) changeHandState(HAND.HOVER, atom.cursor(atom, HAND.HOVER))
						else if (atom.dragOnly) changeHandState(HAND.HOVER, "move")
						else changeHandState(HAND.HOVER)
					}
					else {
						if (atom.grabbable && atom.draggable) {
							grabAtom(atom, x, y)
							hand.pityStartX = e.clientX
							hand.pityStartY = e.clientY
							hand.pityStartT = Date.now()
							changeHandState(HAND.TOUCHING)
							HAND.TOUCHING.mousemove(e)
						}
					}
				}
				return
			}

			let [mx, my] = Mouse.position
			mx *= DPR
			my *= DPR

			if (mx < state.view.left || mx > state.view.right || my < state.view.top || my > state.view.bottom) {
				return
			}
			if (Mouse.Left) changeHandState(HAND.BRUSHING)
			else if (Mouse.Middle) changeHandState(HAND.PENCILLING)
			else changeHandState(HAND.BRUSH)
		},

		mousedown: (e) => {
			if (!state.worldBuilt) return
			hand.voidingStart = [e.clientX, e.clientY]
			changeHandState(HAND.VOIDING)
		},

		atommove: (atom, mx, my) => {
			if (!atom.grabbable) return
			if (!atom.hitTest(mx, my)) return
			if (Mouse.Left) {
				grabAtom(atom, mx, my)
				changeHandState(HAND.DRAGGING)
				hand.content = hand.content.drag(hand.content, mx, my)
				return
			}
			if (atom.cursor !== undefined) changeHandState(HAND.HOVER, atom.cursor(atom, HAND.HOVER))
			else if (atom.dragOnly) changeHandState(HAND.HOVER, "move")
			else changeHandState(HAND.HOVER)
		},
		camerapan: () => {
			let [x, y] = Mouse.position
			x *= DPR
			y *= DPR
			if (x >= state.view.left && x <= state.view.right && y >= state.view.top && y <= state.view.bottom) {
				changeHandState(HAND.BRUSH)
				return
			}
		},
	}

	let voidingType = true
	HAND.VOIDING = {
		cursor: "auto",
		mousemove: (e) => {
			const start = hand.voidingStart
			const [sx, sy] = start
			const displacement = [e.clientX - sx, e.clientY - sy]
			const distance = Math.hypot(...displacement)
			if (distance > 10) {
				changeHandState(HAND.FREE)
				HAND.FREE.mousemove(e)
			}
		},
		mouseup: (e) => {
			const oldWorldSize = WORLD_SIZE
			setWorldSize(0)
			if (voidingType) {
				brush(0.5, 0.5)
			} else {
				const oldBrushColour = state.brush.colour
				state.brush.colour = oldWorldSize * 111
				brush(0.5, 0.5)
				state.brush.colour = oldBrushColour
				state.worldBuilt = false
				show.paused = false
				canvas.style["background-color"] = Colour.Void
			}
			voidingType = !voidingType
			setWorldSize(oldWorldSize)
			changeHandState(HAND.FREE)
		},
	}

	HAND.BRUSH = {
		cursor: "crosshair",
		mousemove: (e) => {
			const x = e.clientX / CT_SCALE
			const y = e.clientY / CT_SCALE
			const atom = atomRegistry.getAt(x, y)
			if (atom !== undefined) {
				if (atom.grabbable) {
					if (atom.cursor !== undefined) changeHandState(HAND.HOVER, atom.cursor(atom, HAND.HOVER))
					else if (atom.dragOnly) changeHandState(HAND.HOVER, "move")
					else changeHandState(HAND.HOVER)
				}
				else changeHandState(HAND.FREE)
				return
			}
			const mx = e.clientX * DPR
			const my = e.clientY * DPR
			if (mx >= state.view.left && mx <= state.view.right && my >= state.view.top && my <= state.view.bottom) {
				return
			}
			changeHandState(HAND.FREE)
		},
		mousedown: (e) => {
			changeHandState(HAND.BRUSHING)
		},
		middlemousedown: (e) => {
			changeHandState(HAND.PENCILLING)
		},
		atommove: (atom, mx, my) => {
			if (!atom.hitTest(mx, my)) return
			if (atom.grabbable) changeHandState(HAND.HOVER)
			else changeHandState(HAND.FREE)
		},
		camerapan: () => {
			let [x, y] = Mouse.position
			x *= DPR
			y *= DPR
			if (x >= state.view.left && x <= state.view.right && y >= state.view.top && y <= state.view.bottom) {
				return
			}
			changeHandState(HAND.FREE)
		},
	}

	HAND.BRUSHING = {
		cursor: "crosshair",
		mousemove: (e) => {
			const x = e.clientX * DPR
			const y = e.clientY * DPR
			if (x >= state.view.left && x <= state.view.right && y >= state.view.top && y <= state.view.bottom) {
				return
			}
			changeHandState(HAND.FREE)
		},
		mouseup: (e) => {
			changeHandState(HAND.BRUSH)
		},
		camerapan: () => {
			let [mx, my] = Mouse.position
			mx *= DPR
			my *= DPR
			if (mx >= state.view.left && mx <= state.view.right && my >= state.view.top && my <= state.view.bottom) {
				return
			}
			const [x, y] = Mouse.position.map(n => n / CT_SCALE)
			const atom = atomRegistry.getAt(x, y)
			if (atom !== undefined) {
				if (atom.grabbable) {
					if (atom.cursor !== undefined) changeHandState(HAND.HOVER, atom.cursor(atom, HAND.HOVER))
					else if (atom.dragOnly) changeHandState(HAND.HOVER, "move")
					else changeHandState(HAND.HOVER)
				}
				else changeHandState(HAND.FREE)
				return
			}
			changeHandState(HAND.FREE)
		},
	}

	HAND.PENCILLING = {
		cursor: "crosshair",
		mousemove: HAND.BRUSHING.mousemove,
		middlemouseup: HAND.BRUSHING.mouseup,
		camerapan: HAND.BRUSHING.camerapan,
	}

	HAND.HOVER = {
		cursor: "pointer",
		
		mousedown: (e) => {

			const atom = atomRegistry.getAt(e.clientX / CT_SCALE, e.clientY / CT_SCALE)
			if (atom === undefined) return
			if (!atom.grabbable) return
			grabAtom(atom, e.clientX / CT_SCALE, e.clientY / CT_SCALE)
			
			if (atom.dragOnly) {
				
				hand.pityStartX = e.clientX
				hand.pityStartY = e.clientY
				hand.pityStartT = Date.now()
				hand.hasStartedDragging = false
				hand.touchButton = 0
				changeHandState(HAND.TOUCHING, "move")
			}
			else {
				hand.pityStartX = e.clientX
				hand.pityStartY = e.clientY
				hand.pityStartT = Date.now()
				hand.hasStartedDragging = false
				hand.touchButton = 0
				changeHandState(HAND.TOUCHING)
			}

		},

		mousemove: (e) => {
			const x = e.clientX / CT_SCALE
			const y = e.clientY / CT_SCALE
			const atom = atomRegistry.getAt(x, y)
			if (atom !== undefined) {
				if (atom.grabbable) {
					if (atom.cursor !== undefined) changeHandState(HAND.HOVER, atom.cursor(atom, HAND.HOVER))
					else if (atom.dragOnly) changeHandState(HAND.HOVER, "move")
					else changeHandState(HAND.HOVER)
				}
				else changeHandState(HAND.FREE)
				return
			}
			const mx = e.clientX
			const my = e.clientY
			if (mx >= state.view.left && mx <= state.view.right && my >= state.view.top && my <= state.view.bottom) {
				changeHandState(HAND.BRUSH)
				return
			}
			changeHandState(HAND.FREE)
		},

		atommove: (atom, x, y) => {
			if (atom.hitTest(x, y)) return
			const newAtom = atomRegistry.getAt(x, y)
			if (newAtom !== undefined) {
				return
			}
			let [mx, my] = Mouse.position
			mx *= DPR
			my *= DPR
			if (mx >= state.view.left && mx <= state.view.right && my >= state.view.top && my <= state.view.bottom) {
				changeHandState(HAND.BRUSH)
				return
			}
			changeHandState(HAND.FREE)
		},

		rightmousedown: (e) => {
			const atom = atomRegistry.getAt(e.clientX / CT_SCALE, e.clientY / CT_SCALE)
			if (atom === undefined) return
			if (!atom.grabbable) return
			grabAtom(atom, e.clientX / CT_SCALE, e.clientY / CT_SCALE)
			
			if (atom.dragOnly) {
				
				hand.pityStartX = e.clientX
				hand.pityStartY = e.clientY
				hand.pityStartT = Date.now()
				hand.hasStartedDragging = false
				hand.touchButton = 2
				changeHandState(HAND.TOUCHING, "move")
			}
			else {
				hand.pityStartX = e.clientX
				hand.pityStartY = e.clientY
				hand.pityStartT = Date.now()
				hand.hasStartedDragging = false
				hand.touchButton = 2
				changeHandState(HAND.TOUCHING)
			}
		}
	}

	const dampen = (n, noReally) => {
		if (noReally) return n * 0.6
		return n
	}

	HAND.TOUCHING = {
		cursor: "pointer",
		mousemove: (e) => {
			if (e.movementX === 0 && e.movementY === 0) return
			if (hand.touchButton === 2 && !hand.content.rightDraggable) return

			const distanceFromPityStart = Math.hypot(e.clientX - hand.pityStartX, e.clientY - hand.pityStartY)
			const pity = DRAG_PITY

			const dx = e.clientX - hand.pityStartX
			const dy = e.clientY - hand.pityStartY
			
			if (!hand.content.dragLockX) hand.content.x = (hand.pityStartX + dampen(dx, hand.content.attached && !hand.content.noDampen)) / CT_SCALE * DPR + hand.offset.x
			if (!hand.content.dragLockY) hand.content.y = (hand.pityStartY + dampen(dy, hand.content.attached && !hand.content.noDampen)) / CT_SCALE * DPR + hand.offset.y

			hand.content.x = clamp(hand.content.x, hand.content.minX, hand.content.maxX)
			hand.content.y = clamp(hand.content.y, hand.content.minY, hand.content.maxY)

			if (distanceFromPityStart < pity) {
				return
			}

			const timeSincePityStart = Date.now() - hand.pityStartT
			if (timeSincePityStart < DRAG_PITY_TIME) {
				const handSpeed = Math.hypot(hand.velocity.x, hand.velocity.y)
				if (handSpeed <= DRAG_UNPITY_SPEED) return
			}

			if (!hand.content.dragLockX) hand.content.x = hand.pityStartX / CT_SCALE * DPR + hand.offset.x
			if (!hand.content.dragLockY) hand.content.y = hand.pityStartY / CT_SCALE * DPR + hand.offset.y

			hand.content.x = clamp(hand.content.x, hand.content.minX, hand.content.maxX)
			hand.content.y = clamp(hand.content.y, hand.content.minY, hand.content.maxY)

			const x = e.clientX / CT_SCALE
			const y = e.clientY / CT_SCALE
			if (hand.touchButton === 0 && hand.content.draggable) {
				changeHandState(HAND.DRAGGING)

				const attached = hand.content.attached && !hand.content.dragOnly && !hand.content.noDampen

				hand.content = hand.content.drag(hand.content, x, y)
				
				if (!hand.content.dragLockX) hand.content.x = (hand.pityStartX + dampen(dx, attached)) / CT_SCALE + hand.offset.x
				if (!hand.content.dragLockY) hand.content.y = (hand.pityStartY + dampen(dy, attached)) / CT_SCALE + hand.offset.y

				hand.content.x = clamp(hand.content.x, hand.content.minX, hand.content.maxX)
				hand.content.y = clamp(hand.content.y, hand.content.minY, hand.content.maxY)

				HAND.DRAGGING.mousemove(e)
				return
			} else if (hand.touchButton === 2 && hand.content.rightDraggable) {
				changeHandState(HAND.DRAGGING)

				const attached = hand.content.attached && !hand.content.dragOnly && !hand.content.noDampen

				hand.content = hand.content.rightDrag(hand.content, x, y)
				
				if (!hand.content.dragLockX) hand.content.x = (hand.pityStartX + dampen(dx, attached)) / CT_SCALE + hand.offset.x
				if (!hand.content.dragLockY) hand.content.y = (hand.pityStartY + dampen(dy, attached)) / CT_SCALE + hand.offset.y

				hand.content.x = clamp(hand.content.x, hand.content.minX, hand.content.maxX)
				hand.content.y = clamp(hand.content.y, hand.content.minY, hand.content.maxY)

				HAND.DRAGGING.mousemove(e)
				return
			}

			const atom = atomRegistry.getAt(x, y)
			if (atom !== undefined) {
				if (atom.grabbable) {
					if (atom.cursor !== undefined) changeHandState(HAND.HOVER, atom.cursor(atom, HAND.HOVER))
					else if (atom.dragOnly) changeHandState(HAND.HOVER, "move")
					else changeHandState(HAND.HOVER)
				}
				else changeHandState(HAND.FREE)
				return
			}
			const mx = e.clientX * DPR
			const my = e.clientY * DPR
			if (mx >= state.view.left && mx <= state.view.right && my >= state.view.top && my <= state.view.bottom) {
				changeHandState(HAND.BRUSH)
				return
			}
			changeHandState(HAND.FREE)
		},
		mouseup: (e) => {
			if (hand.touchButton !== 0) return
			hand.clickContent.click(hand.clickContent)
			hand.clickContent.dx = 0
			hand.clickContent.dy = 0
			hand.clickContent = undefined

			if (hand.content.attached) {
				hand.content.x = hand.pityStartX / CT_SCALE * DPR + hand.offset.x
				hand.content.y = hand.pityStartY / CT_SCALE * DPR + hand.offset.y
			}

			hand.content.dx = 0
			hand.content.dy = 0
			hand.content = undefined

			const x = e.clientX / CT_SCALE
			const y = e.clientY / CT_SCALE
			const atom = atomRegistry.getAt(x, y)
			if (atom !== undefined) {
				if (atom.cursor !== undefined) changeHandState(HAND.HOVER, atom.cursor(atom, HAND.HOVER))
				else if (atom.dragOnly) changeHandState(HAND.HOVER, "move")
				else changeHandState(HAND.HOVER)
			}
			else changeHandState(HAND.FREE)
		},
		rightmouseup: (e) => {
			if (hand.touchButton !== 2) return
			hand.clickContent.rightClick(hand.clickContent)
			hand.clickContent.dx = 0
			hand.clickContent.dy = 0
			hand.clickContent = undefined

			if (hand.content.attached) {
				hand.content.x = hand.pityStartX / CT_SCALE * DPR + hand.offset.x
				hand.content.y = hand.pityStartY / CT_SCALE * DPR + hand.offset.y
			}

			hand.content.dx = 0
			hand.content.dy = 0
			hand.content = undefined

			const x = e.clientX / CT_SCALE
			const y = e.clientY / CT_SCALE
			const atom = atomRegistry.getAt(x, y)
			if (atom !== undefined) {
				if (atom.cursor !== undefined) changeHandState(HAND.HOVER, atom.cursor(atom, HAND.HOVER))
				else if (atom.dragOnly) changeHandState(HAND.HOVER, "move")
				else changeHandState(HAND.HOVER)
			}
			else changeHandState(HAND.FREE)
		}
	}

	HAND.DRAGGING = {
		cursor: "move",
		mousemove: (e) => {
			if (!hand.hasStartedDragging) {
				hand.hasStartedDragging = true
				hand.content = hand.content.drag(hand.content, e.clientX / CT_SCALE * DPR, e.clientY / CT_SCALE * DPR)
			}

			const oldX = hand.content.x
			const oldY = hand.content.y

			if (!hand.content.dragLockX) hand.content.x = e.clientX / CT_SCALE * DPR + hand.offset.x
			if (!hand.content.dragLockY) hand.content.y = e.clientY / CT_SCALE * DPR + hand.offset.y

			hand.content.x = clamp(hand.content.x, hand.content.minX, hand.content.maxX)
			hand.content.y = clamp(hand.content.y, hand.content.minY, hand.content.maxY)

			const dx = hand.content.x - oldX
			const dy = hand.content.y - oldY
			hand.content.move(hand.content, dx, dy)
		},
		mouseup: (e) => {
			if (hand.touchButton !== 0) return
			hand.hasStartedDragging = true
			if (!hand.content.dragLockX) hand.content.dx = hand.velocity.x * HAND_RELEASE
			if (!hand.content.dragLockY) hand.content.dy = hand.velocity.y * HAND_RELEASE
			hand.content.drop(hand.content)
			if (hand.content.highlightedAtom !== undefined) {
				hand.content.place(hand.content, hand.content.highlightedAtom)
				if (hand.content.highlight !== undefined) {
					deleteChild(hand.content, hand.content.highlight)
					hand.content.highlight = undefined
				}
			}
			hand.content = undefined
			const x = e.clientX / CT_SCALE
			const y = e.clientY / CT_SCALE
			const atom = atomRegistry.getAt(x, y)
			if (atom !== undefined) {
				if (atom.grabbable) {
					if (atom.cursor !== undefined) changeHandState(HAND.HOVER, atom.cursor(atom, HAND.HOVER))
					else if (atom.dragOnly) changeHandState(HAND.HOVER, "move")
					else changeHandState(HAND.HOVER)
				}
				else changeHandState(HAND.FREE)
				return
			}
			else changeHandState(HAND.FREE)
			return
		},
		rightmouseup: (e) => {
			if (hand.touchButton !== 2) return
			hand.hasStartedDragging = true
			if (!hand.content.dragLockX) hand.content.dx = hand.velocity.x * HAND_RELEASE
			if (!hand.content.dragLockY) hand.content.dy = hand.velocity.y * HAND_RELEASE
			hand.content.drop(hand.content)
			if (hand.content.highlightedAtom !== undefined) {
				hand.content.place(hand.content, hand.content.highlightedAtom)
				if (hand.content.highlight !== undefined) {
					deleteChild(hand.content, hand.content.highlight)
					hand.content.highlight = undefined
				}
			}
			hand.content = undefined
			const x = e.clientX / CT_SCALE
			const y = e.clientY / CT_SCALE
			const atom = atomRegistry.getAt(x, y)
			if (atom !== undefined) {
				if (atom.grabbable) {
					if (atom.cursor !== undefined) changeHandState(HAND.HOVER, atom.cursor(atom, HAND.HOVER))
					else if (atom.dragOnly) changeHandState(HAND.HOVER, "move")
					else changeHandState(HAND.HOVER)
				}
				else changeHandState(HAND.FREE)
				return
			}
			else changeHandState(HAND.FREE)
			return
		}
	}

	const changeHandState = (state, cursor = state.cursor) => {
		if (hand.content !== undefined && hand.content.cursor !== undefined) {
			cursor = hand.content.cursor(hand.content, state)
		}
		colourTodeCanvas.style["cursor"] = cursor
		hand.state = state
	}

	on.mousemove(e => hand.state.mousemove? hand.state.mousemove(e) : undefined)
	on.mousedown(e => {

		if (e.button === 0) if (hand.state.mousedown) hand.state.mousedown(e)
		if (e.button === 1) if (hand.state.middlemousedown) hand.state.middlemousedown(e)
		if (e.button === 2) if (hand.state.rightmousedown) hand.state.rightmousedown(e)
	})
	on.mouseup(e => {
		if (e.button === 0) if (hand.state.mouseup) hand.state.mouseup(e)
		if (e.button === 1) if (hand.state.middlemouseup) hand.state.middlemouseup(e)
		if (e.button === 2) if (hand.state.rightmouseup) hand.state.rightmouseup(e)
		
	})

	hand.state = HAND.FREE

	//===================//
	// COLOURTODE - ATOM //
	//===================//
	class AtomRegistry {
		constructor() {
			this.atoms = []
			this.baseParent = {
				x: 0,
				y: 0,
				getPosition() { return {x: this.x, y: this.y} },
				grab: (atom, x, y, child = atom) => child,
				touch: (atom, child = atom) => child,
			}
		}

		register(atom) {
			this.atoms.push(atom)
		}

		delete(atom) {
			const id = this.atoms.indexOf(atom)
			this.atoms.splice(id, 1)
		}

		getAt(x, y) {
			x *= DPR
			y *= DPR
			for (let i = this.atoms.length-1; i >= 0; i--) {
				const atom = this.atoms[i]
				if (atom.justVisual) continue
				const result = atom.hitTest(x, y)
				if (result !== undefined) return result
			}
		}

		bringToFront(atom) {
			if (atom.parent === this.baseParent) {
				this.delete(atom)
				this.register(atom)
			}
			else {
				const childId = atom.parent.children.indexOf(atom)
				atom.parent.children.splice(childId, 1)
				atom.parent.children.push(atom)
				if (atom.parent.stayAtBack) this.bringToBack(atom.parent)
				else this.bringToFront(atom.parent)
			}
		}

		bringToBack(atom) {
			if (atom.parent === this.baseParent) {
				const id = this.atoms.indexOf(atom)
				this.atoms.splice(id, 1)
				this.atoms.unshift(atom)
			}
			else {
				const childId = atom.parent.children.indexOf(atom)
				atom.parent.children.splice(childId, 1)
				atom.parent.children.unshift(atom)
				if (atom.parent.stayAtBack) this.bringToBack(atom.parent)
				else this.bringToFront(atom.parent)
			}
		}
	}

	UI.HAND = HAND

	const atomRegistry = new AtomRegistry()
	UI.atomRegistry = atomRegistry


	const grabAtom = (atom, x, y) => {

		let previousTouched = atom
		let touched = atom.touch(atom)
		if (touched !== previousTouched) {
			const newTouched = touched.touch(touched, x, y, previousTouched)
			previousTouched = touched
			touched = newTouched
		}
		hand.clickContent = touched


		let previousGrabbed = atom
		let grabbed = atom.grab(atom, x, y)

		if (grabbed === undefined) return
		if (grabbed !== previousGrabbed) {
			const newGrabbed = grabbed.grab(grabbed, x, y, previousGrabbed)
			previousGrabbed = grabbed
			grabbed = newGrabbed
		}

		hand.content = grabbed
		const {x: grabbedX, y: grabbedY} = grabbed.getPosition({forceAbsolute: true})
		hand.offset.x = grabbedX - x * DPR
		hand.offset.y = grabbedY - y * DPR
		grabbed.dx = 0
		grabbed.dy = 0

		if (atom.stayAtBack) atomRegistry.bringToBack(grabbed)
		else atomRegistry.bringToFront(grabbed)

		return grabbed
	}



	//=======================//
	// COLOURTODE - CHILDREN //
	//=======================//
	const createChild = (parent, element, {bottom = false} = {}) => {
		const child = element instanceof Atom ? element : new Atom(element)
		if (!bottom) parent.children.push(child)
		else parent.children.unshift(child)
		child.parent = parent
		return child
	}
	
	const deleteChild = (parent, child, {quiet = false} = {}) => {
		const id = parent.children.indexOf(child)
		if (id === -1) {
			if (quiet) return
			else throw new Error(`Can't delete child of atom because I can't find it!`)
		}
		parent.children.splice(id, 1)
		child.parent = atomRegistry.baseParent
	}
	
	const giveChild = (parent, atom) => {
		if (atom === undefined) {
			throw new Error(`Can't give child because child is undefined`)
		}
		if (parent === undefined) {
			throw new Error(`Can't give child because parent is undefined`)
		}
		atomRegistry.delete(atom)
		if (atom.stayAtBack || atom.behindOtherChildren) parent.children.unshift(atom)
		else parent.children.push(atom)
		atom.parent = parent
	}

	const freeChild = (parent, child) => {
		if (hand.content === child) {
			const {x, y} = parent.getPosition()
			hand.offset.x += x
			hand.offset.y += y
		}
		deleteChild(parent, child)
		atomRegistry.register(child)
	}

	//======================//
	// COLOURTODE - ELEMENT //
	//======================//
	const COLOUR_CYCLE_SPEED = 5
	const COLOUR_CYCLE_LENGTH = 30
	const BORDER_THICKNESS = 3

	const getColourCycleLength = (atom) => {
		let length = Math.max(COLOUR_CYCLE_LENGTH / atom.colours.length, COLOUR_CYCLE_SPEED)
		return length
	}

	// prepare border colours
	borderColours = PREBUILT_BORDER_COLOURS

	const toolBorderColours = borderColours.clone
	toolBorderColours[999] = Colour.splash(999)

	// Populate UI config for extracted atom types
	UI.borderColours = borderColours
	UI.toolBorderColours = toolBorderColours
	UI.canvas = canvas
	UI.CT_SCALE = CT_SCALE
	UI.createChild = createChild
	UI.deleteChild = deleteChild
	UI.giveChild = giveChild
	UI.freeChild = freeChild
	UI.hand = hand

	const isCellAtomSpotFilled = (paddle, [sx, sy], slotted = false) => {
		for (let cellAtom of paddle.cellAtoms) {
			if (slotted) cellAtom = cellAtom.slot
			const {x, y} = cellAtom.getPosition()
			if (x === sx && y === sy) {
				return true
			}
		}
		return false
	}

	const isCellAtomSlotFree = (paddle, [sx, sy], slotted = false) => {
		for (let cellAtom of paddle.cellAtoms) {
			if (slotted) cellAtom = cellAtom.slot
			const {x, y} = cellAtom.getPosition()
			if (x === sx && y === sy) {
				if (cellAtom.isLeftSlot || cellAtom.isSlot) return true
			}
		}
		return false
	}
	UI.isCellAtomSpotFilled = isCellAtomSpotFilled
	UI.isCellAtomSlotFree = isCellAtomSlotFree

	const setBrushColour = (value) => {
		if (typeof value === "number") {
			state.brush.colour = value
			squareTool.toolbarNeedsColourUpdate = true
			squareTool.value = DragonArray.fromSplash(value)
		} else {
			const diagramCell = new DiagramCell({content: value})
			state.brush.colour = new Diagram({left: [diagramCell]})
			squareTool.value = diagramCell.content
			squareTool.toolbarNeedsColourUpdate = true
		}
	}
	UI.setBrushColour = setBrushColour


	const getWarpedGradientPoints = (width, height) => {
		
		const maxWidth = 1.0
		const maxHeight = 1.0

		
		
		const midWidth = maxWidth/2
		const midHeight = maxHeight/2



		return [
			[maxWidth, 0.0], [maxWidth, midHeight], [maxWidth, maxHeight],
			[midWidth, 0.0], [midWidth, midHeight], [midWidth, maxHeight],
			[0.0, 0.0],      [0.0, midHeight],      [0.0, maxHeight],
		]
	}

	const getDistancesFromGradientPoints = (x, y, points) => {
		const distances = []
		for (const [px, py] of points) {
			const displacement = [px-x, py-y]
			const distance = Math.hypot(...displacement)
			distances.push(distance)
		}
		return distances
	}

	const getGradientPointScoresFromDistances = (distances) => {
		const scores = []
		for (const distance of distances) {
			//else scores.push(0.0)
			scores.push(distance**2)
		}
		return scores
	}

	const lerp = (distance, line) => {

		const [a, b] = line
		const [ax, ay] = a
		const [bx, by] = b
		
		const x = ax + (bx - ax) * distance
		const y = ay + (by - ay) * distance
	
		const point = [x, y]
		return point
	
	}

	const getMergedGradient = ({gradients, width, height, mergedGradient = new ImageData(width, height), stamp}) => {
		
		;[width, height] = [width, height].map(dimension => Math.round(dimension))
		const newLength = width * height * 4
		if (mergedGradient.data.length !== newLength) {
			mergedGradient = new ImageData(width, height)
		}

		const count = gradients.length
		const step = 2*Math.PI / count
		let offset = -step/2 - Math.PI/2
		if (count === 2) offset -= Math.PI/4
		const limits = gradients.map((gradient, i) => {
			let angle = i*step+step
			
			return angle
		})
		
		let i = 0
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const dx = x - width/2
				const dy = y - height/2
				let angle = Math.atan2(dy, dx) - offset
				while (angle < 0) angle += 2*Math.PI
				while (angle > 2*Math.PI) angle -= 2*Math.PI
				let id = 0
				
				let blend = false
				let blendScore = 0
				while (angle > limits[id]) {
					id++
					if (id >= gradients.length) {
						id = 0
						break
					}
				}
				
				const diff = limits[id] - angle 
				const prevId = (id-1 < 0)? limits.length-1 : id-1
				const prevLimit = limits[prevId]
				const prefDiff = prevLimit - angle
				const nextId = (id+1 >= limits.length)? 0 : id+1
				let blendId = undefined

				const pity = 0.05
				if (Math.abs(prefDiff) < pity) {
					blend = true
					blendScore = (-prefDiff) / pity / 2 + 0.5
					blendId = prevId
				} else if (Math.abs(diff) < pity) {
					blend = true
					blendScore = (diff) / pity / 2 + 0.5
					blendId = nextId
				} else if (angle < pity) {
					blend = true
					blendScore = angle / pity / 2 + 0.5
					blendId = prevId
				}
				if (blend) {
					mergedGradient.data[i] = (gradients[id].data[i]*(blendScore) + gradients[blendId].data[i]*((1-blendScore)))
					mergedGradient.data[i+1] = (gradients[id].data[i+1]*(blendScore) + gradients[blendId].data[i+1]*((1-blendScore)))
					mergedGradient.data[i+2] = (gradients[id].data[i+2]*(blendScore) + gradients[blendId].data[i+2]*((1-blendScore)))
					mergedGradient.data[i+3] = (gradients[id].data[i+3]*(blendScore) + gradients[blendId].data[i+3]*((1-blendScore)))
				} else {
					mergedGradient.data[i] = gradients[id].data[i]
					mergedGradient.data[i+1] = gradients[id].data[i+1]
					mergedGradient.data[i+2] = gradients[id].data[i+2]
					mergedGradient.data[i+3] = gradients[id].data[i+3]
				}
				
				i += 4
			}
		}

		return mergedGradient
	}

	const getGradientImageFromColours = ({colours, width, height, gradient = new ImageData(width, height), stamp}) => {
		
		;[width, height] = [width, height].map(dimension => Math.round(dimension))
		//width = height = size
		const newLength = width * height * 4
		if (gradient.data.length !== newLength) {
			gradient = new ImageData(width, height)
		}
		let minRed = Infinity
		let maxRed = -Infinity
		let minGreen = Infinity
		let maxGreen = -Infinity
		let minBlue = Infinity
		let maxBlue = -Infinity

		for (const colour of colours) {
			const [r, g, b] = getRGB(colour)
			if (r < minRed) minRed = r
			if (r > maxRed) maxRed = r
			if (g < minGreen) minGreen = g
			if (g > maxGreen) maxGreen = g
			if (b < minBlue) minBlue = b
			if (b > maxBlue) maxBlue = b
		}


		const makeGradientColour = (red, green, blue) => {
			return Colour.splash(((red === 1? maxRed : minRed) + (green === 1? maxGreen : minGreen) + (blue === 1? maxBlue : minBlue)))
		}

		const gradientColours = [

			makeGradientColour(0, 0, 1),
			makeGradientColour(0, 0, 1),
			makeGradientColour(0, 0, 1),
			
			makeGradientColour(0, 1, 1),
			makeGradientColour(1, 0, 0),
			makeGradientColour(1, 0, 0),
			
			makeGradientColour(0, 1, 0),
			makeGradientColour(0, 1, 0),
			makeGradientColour(1, 0, 0),
			
			

		]

		const points = getWarpedGradientPoints(width, height)
		let i = 0
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {

				const distances = getDistancesFromGradientPoints(x / width, y / height, points)
				const scores = getGradientPointScoresFromDistances(distances)
				const sumValues = [0, 0, 0]
				const sumScore = scores.reduce((a, b) => a + b)
				for (let j = 0; j < 9; j++) {
					const score = scores[j]
					const colour = gradientColours[j]
					;[0, 1, 2].forEach(channel => sumValues[channel] += score * colour[channel])
				}
				const values = sumValues.map(value => value / sumScore)
				if (stamp === "circle" && x >= width/4 && x < width*3/4 && y >= height/4 && y < height*3/4) {
					
					gradient.data[i+3] = 0
				} else {
					gradient.data[i] = values[0]
					gradient.data[i+1] = values[1]
					gradient.data[i+2] = values[2]
					gradient.data[i+3] = 255
				}

				i += 4
				if (i >= gradient.data.length) break
			}
		}
		return gradient
	}

	// Ctrl+F: trdef


	const OPTION_MARGIN = 10
	const CHANNEL_HEIGHT = UI.SQUARE_SIZE - OPTION_MARGIN*2
	const OPTION_SPACING = CHANNEL_HEIGHT + OPTION_MARGIN


	const CHANNEL_IDS = {
		red: 0,
		green: 1,
		blue: 2,
	}

	const CHANNEL_NAMES = [
		"red",
		"green",
		"blue",
	]

	UI.CHANNEL_IDS = CHANNEL_IDS
	UI.CHANNEL_NAMES = CHANNEL_NAMES
	UI.OPTION_SPACING = OPTION_SPACING
	UI.getGradientImageFromColours = getGradientImageFromColours
	UI.getMergedGradient = getMergedGradient

	// Ctrl+F: redef
	// Ctrl+F: exdef
	const MAGIC_NUMBER = 0.8660254
	const MINUS_MAGIC_NUMBER = (1 - MAGIC_NUMBER)
	const rotate = ([x, y], [ox, oy], radians) => {
		const [dx, dy] = [x - ox, y - oy];
		const dd = Math.sqrt(dx ** 2 + dy ** 2);
		const angle = Math.atan2(dy, dx);
		const [rx, ry] = [
			dd * Math.cos(radians + angle),
			dd * Math.sin(radians + angle),
		];
		return [ox + rx, oy + ry];
	};
	UI.rotate = rotate




	// DIAMOND
	// Ctrl+F: dedef

	

	paddles = []
	UI.paddles = paddles

	// Ctrl+F: addef
	const PADDLE_MARGIN = UI.SQUARE_SIZE/2

	const fillPoints = (colour, points, ctx) => {
		
		const path = new Path2D()
		const [head, ...tail] = points
		path.moveTo(...head.map(n => Math.round(n)))
		for (const point of tail) {
			path.lineTo(...point.map(n => Math.round(n)))
		}
		path.closePath()

		ctx.fillStyle = colour
		ctx.fill(path)
	}


	const cellAtomWidth = UI.SQUARE_SIZE
	// Ctrl+F: adwww
	const updatePaddleSize = (paddle) => {
		
		let width = Paddle.WIDTH
		let height = Paddle.SIZE

		if (paddle.cellAtoms.length > 0) {
			let top = Infinity
			let bottom = -Infinity
			let right = -Infinity
			let left = Infinity

			for (const cellAtom of paddle.cellAtoms) {
				const cx = cellAtom.x
				const cy = cellAtom.y
				const cleft = cx
				const cright = cx + cellAtomWidth
				const ctop = cy
				const cbottom = cy + cellAtomWidth

				if (cleft < left) left = cleft
				if (cright > right) right = cright
				if (ctop < top) top = ctop
				if (cbottom > bottom) bottom = cbottom
			}

			let topOffset = 0
			let leftOffset = 0

			const yPadding = (Paddle.HEIGHT/2 - UI.SQUARE_SIZE/2)
			const xPadding = (Paddle.WIDTH/2 - UI.SQUARE_SIZE/2)

			const desiredTop = yPadding
			const desiredLeft = xPadding

			if (top !== desiredTop) {
				topOffset = desiredTop - top
				bottom += topOffset
			}
			if (left !== desiredLeft) {
				leftOffset = desiredLeft - left
				right += leftOffset
			}

			for (const cellAtom of paddle.cellAtoms) {
				cellAtom.y += topOffset
				cellAtom.x += leftOffset
			}

			const desiredWidth = right + xPadding
			const desiredHeight = bottom + yPadding

			width = desiredWidth
			height = desiredHeight

		}

		if (paddle.rightTriangle !== undefined) {
			paddle.rightTriangle.x = width
			paddle.rightTriangle.y = height/2 - paddle.rightTriangle.height/2
			width = width+width + paddle.rightTriangle.width
		}
		
		if (paddle.hasSymmetry || paddle.chance !== undefined) {
			width += SymmetryCircle.SIZE/3
		}

		paddle.width = width
		paddle.height = height
		paddle.setLimits(paddle)

		//=============================//
		// ARRANGING PADDLE's CHILDREN //
		//=============================//
		for (const slot of paddle.slots) {
			deleteChild(paddle, slot)
		}
		paddle.slots = []

		if (paddle.rightTriangle !== undefined) {
			for (const cellAtom of paddle.cellAtoms) {

				const slot = createChild(paddle, new Slot(), {bottom: true})
				cellAtom.slot = slot
				paddle.slots.push(slot)
				slot.x = cellAtom.x + paddle.rightTriangle.x + paddle.rightTriangle.width
				slot.y = cellAtom.y
				slot.cellAtom = cellAtom

				if (cellAtom.slotted !== undefined) {
					cellAtom.slotted.x = cellAtom.x + paddle.rightTriangle.x + paddle.rightTriangle.width
					cellAtom.slotted.y = cellAtom.y
					slot.colour = Colour.Grey
				}
				
			}
		}


		if (paddle.rightTriangle !== undefined) {
			if (paddle.cellAtoms[0] !== undefined && paddle.cellAtoms[0].slot !== undefined) {
				paddle.offset = paddle.cellAtoms[0].slot.x - paddle.cellAtoms[0].x
			} else {
				paddle.offset = 0
			}
		}

		if (paddle.symmetryCircle !== undefined) {
			paddle.symmetryCircle.x = paddle.width - paddle.symmetryCircle.width/2
			paddle.symmetryCircle.y = paddle.height/2 - paddle.symmetryCircle.height/2
		}

		if (paddle.chance !== undefined) {
			paddle.chance.x = paddle.width - paddle.chance.width/2
			paddle.chance.y = paddle.height/2 - paddle.chance.height/2
		}

		if (paddle.chance !== undefined && paddle.symmetryCircle !== undefined) {
			paddle.symmetryCircle.y -= paddle.symmetryCircle.height/2
			paddle.chance.y += paddle.symmetryCircle.height/2
			if (paddle.height > 100) {
				paddle.symmetryCircle.y -= OPTION_MARGIN/2
				paddle.chance.y += OPTION_MARGIN/2
			}
		}
		
		paddle.handle.y = paddle.height/2 - paddle.handle.height/2

		if (paddle.cellAtoms.length === 0) {
			paddle.dummyLeft.x = PADDLE_MARGIN
			paddle.dummyLeft.y = paddle.height/2 - paddle.dummyLeft.height/2
			
			paddle.dummyRight.x = paddle.width - PADDLE_MARGIN - paddle.dummyLeft.width
			paddle.dummyRight.y = paddle.height/2 - paddle.dummyRight.height/2
		}

		updatePaddleRule(paddle)
		positionPaddles()
	}
	UI.updatePaddleSize = updatePaddleSize

	const isDragonArraySingleColour = (array) => {
		const splashes = array.getSplashSet()
		return splashes.size === 1
	}

	const isDragonArrayEqual = (a, b) => {

		for (let i = 0; i < 3; i++) {
			const achannel = a.channels[i]
			const bchannel = b.channels[i]
			if (achannel === undefined && bchannel !== undefined) return false
			if (achannel !== undefined && bchannel === undefined) return false
			if (achannel === undefined && bchannel === undefined) continue
			if (achannel.variable !== bchannel.variable) return false
		}

		const asplashes = a.getSplashes()
		const bsplashes = b.getSplashes()

		for (const asplash of asplashes) {
			const id = bsplashes.indexOf(asplash)
			if (id === -1) return false
			bsplashes.splice(id, 1)
		}

		if (bsplashes.length > 0) return false

		return true

	}

	const applyRangeStamp = (stampeds, value) => {
		if (value.stamp) return //already got a manual stamp
		const isSingle = isDragonArraySingleColour(value)
		if (!isSingle) {
			let newStamp = undefined
			for (let i = 0; i < stampeds.length; i++) {
				const stamped = stampeds[i]
				if (isDragonArrayEqual(stamped, value)) {
					newStamp = i
					break
				}
			}
			if (newStamp === undefined) {
				newStamp = stampeds.length
				stampeds.push(value)
			}
			value.stamp = newStamp.toString()
		}
	}

	const getTopLeftOfCellAtoms = (cellAtoms) => {
		let smallestX = Infinity
		let smallestY = Infinity
		let leader = undefined

		for (const cellAtom of cellAtoms) {
			if (cellAtom.x <= smallestX) {
				if (cellAtom.y <= smallestY) {
					leader = cellAtom
					smallestX = cellAtom.x
					smallestY = cellAtom.y
				}
			}
		}

		return leader
	}

	const getBounds = (cells) => {

		let left = Infinity
		let right = -Infinity
		let top = Infinity
		let bottom = -Infinity

		for (const cell of cells) {

			const cleft = cell.x
			const cright = cell.x + cell.width
			const ctop = cell.y
			const cbottom = cell.y + cell.height

			if (cleft < left) left = cleft
			if (ctop < top) top = ctop
			if (cright > right) right = cright
			if (cbottom > bottom) bottom = cbottom
		}


		return [left, right, top, bottom]
	}
	
	const makeDiagramCellsFromCellAtoms = (cellAtoms) => {

		const orderedCellAtoms = sortByPosition(cellAtoms)
		const [left, , top, ] = getBounds(cellAtoms)
		const diagramCells = []

		for (const cellAtom of cellAtoms) {
			const x = (cellAtom.x - left) / cellAtom.width
			const y = (cellAtom.y - top) / cellAtom.height

			const leftClone = DragonArray.cloneContent(cellAtom.value) //TODO: should act different for multis
			const diagramCell = new DiagramCell({x, y, content: leftClone})
			diagramCells.push(diagramCell)

		}

		return diagramCells

	}
	UI.makeDiagramCellsFromCellAtoms = makeDiagramCellsFromCellAtoms


	//this only works on nested diagrams where every cell is the same size
	const flattenAndFillDiagramCells = (diagramCells, fillContent) => {
		const orderedCells = sortByPosition(diagramCells)
		
		const [diagramLeft, diagramRight, diagramTop, diagramBottom] = getBounds(diagramCells)
		
		const diagramWidth = diagramRight - diagramLeft
		const diagramHeight = diagramBottom - diagramTop
		const dimX = diagramCells.length == 0 ? 1 : Math.round(diagramWidth/orderedCells[0].width)
		const dimY = diagramCells.length == 0 ? 1 : Math.round(diagramHeight/orderedCells[0].height)
		const miniWidth = 1/dimX
		const miniHeight = 1/dimY
		
		let addCount=0
		const flatList = []
		for (let x = 0; x < dimX; x++) {
			for (let y = 0; y < dimY; y++) {				
				const miniDiagramCell = orderedCells[addCount]
				
				let miniClone
				
				if (miniDiagramCell === undefined || ((miniDiagramCell.x-diagramLeft)/diagramWidth+128 != x/dimX+128) || ((miniDiagramCell.y-diagramTop)/diagramHeight+128 != y/dimY+128)){
					if(fillContent){
						miniClone = DragonArray.cloneContent(fillContent)
					} else {
						continue
					}
				} else { 
					addCount++
					if (miniDiagramCell.content.isDiagram){ //if mini-mini cells
						for (const miniMiniCell of flattenAndFillDiagramCells(miniDiagramCell.content.left,fillContent)) {
							const diagramCell = new DiagramCell({
								x: (x + miniMiniCell.x)/dimX,
								y: (y + miniMiniCell.y)/dimY,
								width: miniWidth * miniMiniCell.width,
								height: miniHeight * miniMiniCell.height,
								content: miniMiniCell.content,
							})
							flatList.push(diagramCell)
						}
						continue
					} else{
						miniClone = DragonArray.cloneContent(miniDiagramCell.content)
					}
				}
				
				const diagramCell = new DiagramCell({
					x: x/dimX,
					y: y/dimY,
					width: miniWidth,
					height: miniHeight,
					content: miniClone,
				})
				flatList.push(diagramCell)
			}
			
		}
		return flatList
	}
	
	
	
	//adds diagram to left assuming every cell is the same size
	const addDiagramCellsToLeftList = (diagramCells, list, stampeds, posX, posY, sizeX=1, sizeY=1) => {
		//if empty list 
		if (diagramCells.length == 0){
			const red = new DragonNumber({values: [true, true, true, true, true, true, true, true, true, true], channel: 0})
			const green = new DragonNumber({values: [true, true, true, true, true, true, true, true, true, true], channel: 1})
			const blue = new DragonNumber({values: [true, true, true, true, true, true, true, true, true, true], channel: 2})
			const miniClone = new DragonArray({channels: [red, green, blue]})
			applyRangeStamp(stampeds, miniClone)
				const diagramCell = new DiagramCell({
					x: posX,
					y: posY,
					width: sizeX,
					height: sizeY,
					content: miniClone,
					instruction: DRAGON_INSTRUCTION.recolour,
				})
			list.push(diagramCell)
			return
		}
		
		
		let addCount = 0
		const orderedMiniLeftCells = sortByPosition(diagramCells)
		// get diagram dimensions
		const [diagramLeft, diagramRight, diagramTop, diagramBottom] = getBounds(diagramCells)
		const diagramWidth = diagramRight - diagramLeft
		const diagramHeight = diagramBottom - diagramTop
		const dimX = Math.round(diagramWidth/orderedMiniLeftCells[0].width)
		const dimY = Math.round(diagramHeight/orderedMiniLeftCells[0].height)

		
		let miniCounts = {X: dimX, Y: dimY, total: 0}
		// check for every mini cell
		for (let x = 0; x < dimX; x++) {
			for (let y = 0; y < dimY; y++) {				
				const miniDiagramCell = orderedMiniLeftCells[addCount]
				
				const miniX = posX + x/dimX*sizeX
				const miniY = posY + y/dimY*sizeY
				const miniWidth = sizeX/dimX
				const miniHeight = sizeY/dimY
				
				let miniClone
				//fills in not filled spaces
				if (miniDiagramCell === undefined || ((miniDiagramCell.x-diagramLeft)/diagramWidth+128 != x/dimX+128) || ((miniDiagramCell.y-diagramTop)/diagramHeight+128 != y/dimY+128)){
					const red = new DragonNumber({values: [true, true, true, true, true, true, true, true, true, true], channel: 0})
					const green = new DragonNumber({values: [true, true, true, true, true, true, true, true, true, true], channel: 1})
					const blue = new DragonNumber({values: [true, true, true, true, true, true, true, true, true, true], channel: 2})
					miniClone = new DragonArray({channels: [red, green, blue]})
					
				} else { 
					addCount++
					if (miniDiagramCell.content.isDiagram){ //if mini-mini cells
						const miniMiniCounts = addDiagramCellsToLeftList(miniDiagramCell.content.left, list, stampeds, miniX, miniY, miniWidth, miniHeight)
						if (miniMiniCounts){
							miniCounts[x*dimY + y] = miniMiniCounts
							miniCounts.total += miniMiniCounts.total-1
						}
						continue
					} else{
						miniClone = DragonArray.cloneContent(miniDiagramCell.content)
					}
				}
				
				applyRangeStamp(stampeds, miniClone)
				const diagramCell = new DiagramCell({
					x: miniX,
					y: miniY,
					width: miniWidth,
					height: miniHeight,
					content: miniClone,
					instruction: DRAGON_INSTRUCTION.recolour,
				})
				list.push(diagramCell)
			}
		}
		miniCounts.total+= dimX*dimY
		return miniCounts
	}
	
	//adds diagram to right assuming every cell is the same size
	const addDiagramCellsToRightList = (diagramCells, list, stampeds, posX, posY, miniCounts={X: 1, Y: 1, total: 1}, sizeX=1, sizeY=1) => {
		
		//if empty cell fill with nothing(s)
		if (diagramCells === undefined || diagramCells.length==0) {
			for (let i = 0; i < miniCounts.total;i++) {
				const nothingCell = new DiagramCell({
					x: posX,
					y: posY,
					width: sizeX,
					height: sizeY,
					instruction: DRAGON_INSTRUCTION.nothing,
				})
				
				list.push(nothingCell)
			}
			return
		}
		
		const orderedMiniLeftCells = sortByPosition(diagramCells)
		// get diagram dimensions
		const [diagramLeft, diagramRight, diagramTop, diagramBottom] = getBounds(diagramCells)
		const diagramWidth = diagramRight - diagramLeft
		const diagramHeight = diagramBottom - diagramTop
		const dimX = Math.round(diagramWidth/orderedMiniLeftCells[0].width)
		const dimY = Math.round(diagramHeight/orderedMiniLeftCells[0].height)
		
		if(miniCounts.X != dimX || miniCounts.Y != dimY){ //left and right arent split the same
			if (miniCounts.total > 1){ // merge if left is split
				const mergeCell = new DiagramCell({
						x: posX,
						y: posY,
						width: sizeX,
						height: sizeY,
						instruction: DRAGON_INSTRUCTION.merge,
						splitX: 1,
						splitY: miniCounts.total,//workaround to merge not evenly split cells
				})
				
				list.push(mergeCell)
			}

			if (dimX * dimY != 1) { // split if rigth is split
				const splitCell = new DiagramCell({
					x: posX,
					y: posY,
					width: sizeX,
					height: sizeY,
					instruction: DRAGON_INSTRUCTION.split,
					splitX: dimX,
					splitY: dimY,
				})

				list.push(splitCell)
			}
			miniCounts={X: 1, Y: 1, total: 1} // after merge left is 1x1
		}
				
		let addCount = 0
		for (let x = 0; x < dimX; x++) {
			for (let y = 0; y < dimY; y++) {				
				const miniDiagramCell = orderedMiniLeftCells[addCount]
				
				const miniX = posX + x/dimX*sizeX
				const miniY = posY + y/dimY*sizeY
				const miniWidth = sizeX/dimX
				const miniHeight = sizeY/dimY
				
				let miniClone
				//fills in not filled spaces
				if (miniDiagramCell === undefined || (dimX*dimY > 1) && (((miniDiagramCell.x-diagramLeft)/diagramWidth+128 != x/dimX+128) || ((miniDiagramCell.y-diagramTop)/diagramHeight+128 != y/dimY+128))){
					addDiagramCellsToRightList(undefined, list, stampeds, miniX, miniY, miniCounts[x*dimY + y], miniWidth, miniHeight)
					continue
				} else if (miniDiagramCell.content.isDiagram) {//if mini-mini cells
					addDiagramCellsToRightList(miniDiagramCell.content.left, list, stampeds, miniX, miniY, miniCounts[x*dimY + y], miniWidth, miniHeight)
					
				} else if (miniCounts[x*dimY + y] !== undefined && miniCounts[x*dimY + y].total > 1){ // cells of left diagram need to get merged
					addDiagramCellsToRightList([miniDiagramCell], list, stampeds, miniX, miniY, miniCounts[x*dimY + y], miniWidth, miniHeight)
					
				} else { // left and right have same dimensions => recolour
					miniClone = DragonArray.cloneContent(miniDiagramCell.content)
					applyRangeStamp(stampeds, miniClone)
					const diagramCell = new DiagramCell({
						x: miniX,
						y: miniY,
						width: miniWidth,
						height: miniHeight,
						content: miniClone,
						instruction: DRAGON_INSTRUCTION.recolour,
					})
					list.push(diagramCell)
					
				}
				
				addCount++
				
			}
		}
	}
	

	const updatePaddleRule = (paddle) => {

		if (!paddle.expanded) return

		if (paddle.rightTriangle !== undefined) {
			if (paddle.pinhole.locked) {
				paddle.rightTriangle.colour = Colour.splash(999)
			} else {
				paddle.rightTriangle.colour = Colour.splash(0)
			}
		}

		let transformations = DRAGON_TRANSFORMATIONS.NONE
		if (paddle.hasSymmetry) {
			const [x, y, r] = getXYR(paddle.symmetryCircle.value)

			const isX = x > 0
			const isY = y > 0
			const isR = r > 0

			let key = `${isY? "X" : ""}${isX? "Y" : ""}${isR? "R" : ""}`
			if (key === "") key = "NONE"
			else if (key === "XR" || key === "YR") key = "XYR"

			transformations = DRAGON_TRANSFORMATIONS[key]
		}

		const orderedCellAtoms = sortByPosition(paddle.cellAtoms)
		const origin = orderedCellAtoms[0]
		const left = []
		const right = []
		const stampeds = []
		for (const cellAtom of orderedCellAtoms) {
			const x = (cellAtom.x - origin.x) / cellAtom.width
			const y = (cellAtom.y - origin.y) / cellAtom.height

			//======//
			// LEFT //
			//======//
			let miniCount
			if (cellAtom.isLeftSlot) {

				const red = new DragonNumber({values: [true, true, true, true, true, true, true, true, true, true], channel: 0})
				const green = new DragonNumber({values: [true, true, true, true, true, true, true, true, true, true], channel: 1})
				const blue = new DragonNumber({values: [true, true, true, true, true, true, true, true, true, true], channel: 2})
				const leftClone = new DragonArray({channels: [red, green, blue]})
				applyRangeStamp(stampeds, leftClone)
				const diagramCell = new DiagramCell({x, y, content: leftClone})
				left.push(diagramCell)

			} else if (cellAtom.value.isDiagram) {
				// Check for every mini-cell	
				miniCount = addDiagramCellsToLeftList(cellAtom.value.left, left, stampeds, x, y)

			} else {
				
				// Just check for a single cell
				const leftClone = DragonArray.cloneContent(cellAtom.value)
				applyRangeStamp(stampeds, leftClone)
				const diagramCell = new DiagramCell({x, y, content: leftClone})
				left.push(diagramCell)
			}

			
			//=======//
			// RIGHT //
			//=======//
			const rightContent = cellAtom.slotted === undefined? undefined : cellAtom.slotted.value

			
			if (rightContent !== undefined && rightContent.isDiagram) {
			
				// Split the cell into mini-cells!
				// Recolour every mini-cell!
				addDiagramCellsToRightList(rightContent.left, right, stampeds, x, y, miniCount)
				
			} else if (rightContent === undefined){
				addDiagramCellsToRightList(rightContent, right, stampeds, x, y, miniCount)
			} else {
				const rightClone = DragonArray.cloneContent(rightContent)
				addDiagramCellsToRightList([new DiagramCell({x, y, content: rightClone})], right, stampeds, x, y, miniCount)
			}
		}
		
		const diagram = Diagram.maximised(new Diagram({left, right}))

		const locked = paddle.pinhole.locked
		const chance = paddle.chance === undefined? undefined : paddle.chance.getValue(paddle.chance)
		const rule = new Rule({steps: [diagram], transformations, locked, chance})
		paddle.rule = rule
		if (paddle.registry !== undefined) {
			ruleRegistry.unregister(paddle.registry)
		}
		if (locked && paddle.rightTriangle !== undefined) {
			paddle.registry = ruleRegistry.register(rule)
		}
	}
	const getAllAtoms = (pool = atomRegistry.atoms) => {
		const atoms = [...pool]
		for (const atom of atoms) {
			atoms.push(...getAllAtoms(atom.children))
		}
		return atoms
	}

	const getAllBaseAtoms = () => {
		const atoms = [...atomRegistry.atoms]
		for (const paddle of paddles) {
			for (const child of paddle.children) {
				if (child.isPinhole) continue
				if (child.isPaddleHandle) continue
				atoms.push(child)
			}
		}
		for (const atom of atoms) {
			if (atom.isSquare && atom.expanded) atoms.push(...atom.children)
		}
		return atoms
	}

	const positionPaddles = () => {

		if (paddles.length > 1) {
			unlockMenuTool("triangle")
		}
		
		if (paddles.length > 2) {
			let ruleCount = 0
			for (const paddle of paddles) {
				if (paddle.rightTriangle !== undefined) {
					ruleCount++
				}
			}
			if (ruleCount >= 2) {
				unlockMenuTool("hexagon")
			}
		}

		let previous = undefined
		for (const paddle of paddles) {
			if (previous === undefined) {
				paddle.y = Paddle.Y + UI.paddleScroll
				previous = paddle
				continue
			}

			paddle.y = previous.y + previous.height + PADDLE_MARGIN
			previous = paddle
		}
	}

	const deletePaddle = (paddle, id = paddles.indexOf(paddle)) => {
		paddles.splice(id, 1)
		if (paddle.registry !== undefined) {
			ruleRegistry.unregister(paddle.registry)
		}
		atomRegistry.delete(paddle)
		positionPaddles()
	}

	const createPaddle = () => {
		const paddle = new Paddle()
		paddles.push(paddle)
		positionPaddles()
		atomRegistry.register(paddle)
		return paddle
	}

	UI.PADDLE_HANDLE_SIZE = UI.PADDLE_X
	UI.updatePaddleRule = updatePaddleRule
	UI.createPaddle = createPaddle
	UI.deletePaddle = deletePaddle


	const SYMMETRY_TOGGLINGS = new Map()
	SYMMETRY_TOGGLINGS.set(0, DRAGON_TRANSFORMATIONS.NONE)
	SYMMETRY_TOGGLINGS.set(100, DRAGON_TRANSFORMATIONS.X)
	SYMMETRY_TOGGLINGS.set(10, DRAGON_TRANSFORMATIONS.Y)
	SYMMETRY_TOGGLINGS.set(110, DRAGON_TRANSFORMATIONS.XY)
	SYMMETRY_TOGGLINGS.set(1, DRAGON_TRANSFORMATIONS.R)
	SYMMETRY_TOGGLINGS.set(111, DRAGON_TRANSFORMATIONS.XYR)
	SYMMETRY_TOGGLINGS.set(101, DRAGON_TRANSFORMATIONS.XYR)
	SYMMETRY_TOGGLINGS.set(11, DRAGON_TRANSFORMATIONS.XYR)

	const getXYR = getRGB


	const HIGHLIGHT_THICKNESS = BORDER_THICKNESS


	const rotateTriangleRotation = (rotation, clockwise) => {
		clockwise = !clockwise
		switch (rotation) {
			case "right": return clockwise ? "down" : "up"
			case "down": return clockwise ? "left" : "right"
			case "left": return clockwise ? "up" : "down"
			case "up": return clockwise ? "right" : "left"
		}

		throw new Error("Invalid rotation or clockwiseness")
	}
	UI.rotateTriangleRotation = rotateTriangleRotation


	//====================//
	// COLOURTODE - TOOLS //
	//====================//
	const makeSquareFromValue = (value) => {

		const newAtom = new ColourtodeSquare()
		newAtom.value = DragonArray.cloneContent(value)

		if (newAtom.value !== undefined) {
			if (newAtom.value.joins !== undefined) {
				for (const j of newAtom.value.joins) {
					const joinAtom = makeSquareFromValue(j)
					newAtom.joins.push(joinAtom)
				}
			}
			newAtom.stamp = newAtom.value.stamp

		}
		
		if (!newAtom.value.isDiagram) {

			for (let i = 0; i < 3; i++) {
				const channel = newAtom.value.channels[i]
				if (channel === undefined) continue
				if (channel.variable === undefined) continue
				
				const triangle = new ColourtodeTriangle()
				newAtom.variableAtoms[i] = triangle
				triangle.highlightedSlot = CHANNEL_NAMES[i]
				triangle.channelId = i
				
				const leftVariable = i - 1 < 0? CHANNEL_NAMES[2] : CHANNEL_NAMES[i-1]
				const rightVariable = i + 1 > 2? CHANNEL_NAMES[0] : CHANNEL_NAMES[i+1]

				if (channel.subtract) triangle.direction = "down"
				else if (channel.add) triangle.direction = "up"
				else if (channel.variable === leftVariable) triangle.direction = "left"
				else if (channel.variable === rightVariable) triangle.direction = "right"
	
				triangle.updateValue(triangle)

				// newAtom.variableAtoms[i] = hexagon
				// hexagon.variable = channel.variable
				// hexagon.ons = [add.values[2], add.values[1], subtract.values[1], subtract.values[2], subtract.values[3], add.values[3]]
				// hexagon.updateValue(hexagon)
			}

		}

		if (newAtom.value !== undefined && newAtom.value.isDiagram) {
			newAtom.update(newAtom)
		}

		return newAtom
	}
	UI.makeSquareFromValue = makeSquareFromValue

	let menuRight = 10

	let menuId = 0
	const addMenuTool = (element, unlockName) => {
		const {width = UI.SQUARE_SIZE, height = UI.SQUARE_SIZE, size} = element

		let y = OPTION_MARGIN
		if (height < UI.SQUARE_SIZE) {
			y += (UI.SQUARE_SIZE - height)/2
		}
		y += BORDER_THICKNESS

		const atom = new ColourtodeTool({width, height, size, x: Math.round(menuRight), y, element})
		atom.menuId = menuId
		menuId++
		atom.attached = true
		atom.isTool = true
		atom.previousBrushColour = undefined
		atom.colourId = 0
		atom.dcolourId = 1
		atom.colourTicker = Infinity
		atom.hasBorder = true
		menuRight += width
		menuRight += OPTION_MARGIN

		atomRegistry.register(atom)

		if (unlockName === undefined) {
			atom.unlocked = true
		} else {
			atom.unlocked = false
			atom.grabbable = false
			unlocks[unlockName] = atom
			if (UNLOCK_MODE) unlockMenuTool(unlockName)
		}

		return atom
	}

	unlocks = {}
	const unlockMenuTool = (unlockName) => {
		const unlock = unlocks[unlockName]
		if (unlock.unlocked) return
		unlock.unlocked = true
		unlock.grabbable = true

		

	}

	squareTool = addMenuTool(new ColourtodeSquare())
	menuRight += BORDER_THICKNESS
	const triangleTool = addMenuTool(new ColourtodeTriangle(), "triangle")
	//triangleTool.size -= BORDER_THICKNESS*1.5
	//triangleTool.y += BORDER_THICKNESS*1.5 / 2
	menuRight -= BORDER_THICKNESS
	const circleTool = addMenuTool(new SymmetryCircle(), "circle")
	const hexagonTool = addMenuTool(new Hexagon(), "hexagon")
	//menuRight += BORDER_THICKNESS
	const tallRectangleTool = {} //addMenuTool(COLOURTODE_TALL_RECTANGLE, "tall_rectangle")
	UI.squareTool = squareTool
	UI.triangleTool = triangleTool
	UI.circleTool = circleTool
	UI.tallRectangleTool = tallRectangleTool
	UI.getAllBaseAtoms = getAllBaseAtoms
	UI.unlockMenuTool = unlockMenuTool
	createPaddle()
	
	squareTool.value = DragonArray.fromSplash(state.brush.colour)

	circleTool.borderScale = 1
	
	squareTool.update = (atom) => {

		if (atom.joinDrawId === undefined) {
			atom.joinDrawId = -1
			atom.joinDrawTimer = 0
		}

		

		if (atom.value !== undefined && atom === squareTool) {

			if (atom.previousBrushColour !== state.brush.colour || atom.toolbarNeedsColourUpdate) {
				atom.previousBrushColour = state.brush.colour
				if (atom.multiAtoms === undefined) {
					atom.multiAtoms = []
				}
				for (const multiAtom of atom.multiAtoms) {
					deleteChild(atom, multiAtom)
				}

				atom.multiAtoms = []

				if (atom.value.isDiagram) {
					const diagram = atom.value
					const [diagramWidth, diagramHeight] = diagram.getDimensions()
					const cellAtomWidth = atom.width / diagramWidth
					const cellAtomHeight = atom.height / diagramHeight
					for (const diagramCell of diagram.left) {
						const multiAtom = createChild(atom, new ColourtodeSquare())
						multiAtom.x = diagramCell.x * cellAtomWidth
						multiAtom.y = diagramCell.y * cellAtomHeight
						multiAtom.width = diagramCell.width * cellAtomWidth
						multiAtom.height = diagramCell.height * cellAtomHeight
						multiAtom.value = diagramCell.content
						multiAtom.update(multiAtom)
						atom.multiAtoms.push(multiAtom)
					}
				}
			}
		}

		const valueClone = DragonArray.cloneContent(atom.value)
		atom.colours = valueClone.getSplashes()

		if (atom.colourId >= atom.colours.length) {
			atom.colourId = 0
		}
		if (atom.toolbarNeedsColourUpdate && atom === squareTool) {
			atom.toolbarNeedsColourUpdate = false
			atom.isGradient = true
			atom.joins = []
			for (const joinValue of atom.value.joins) {
				const joinSquare = makeSquareFromValue(joinValue)
				atom.joins.push(joinSquare)
			}
			ColourtodeSquare.updateGradientFn(atom)
		} else {
			atom.colour = Colour.splash(999)
			atom.borderColour = Colour.splash(999)
		}
	}

	triangleTool.update = squareTool.update
	circleTool.update = squareTool.update
	// wideRectangleTool.update = squareTool.update
	tallRectangleTool.update = squareTool.update
	hexagonTool.update = squareTool.update
	
	//=========//
	// SHARING //
	//=========//
	on.keydown(e => {
		if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			e.preventDefault()
			savePaddles()
		} else if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
			e.preventDefault()
			openPaddles()
		} else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
			e.preventDefault()
			copyPaddles()
		}
	}, {passive: false})

	on.paste(async e => {
		const pack = e.clipboardData.getData('text')
		if (pack !== "") {
			unpackPaddles(pack)
			return
		}

		const item = e.clipboardData.items[0]
		const file = item.getAsFile()
		const p = await file.text()
		unpackPaddles(p)
	})

	on.dragover(e => {
		e.stopPropagation();
		e.preventDefault()
	}, {passive: false})

	on.drop(async (e) => {
		e.stopPropagation();
		e.preventDefault()
		const item = e.dataTransfer.items[0]
		const file = item.getAsFile()
		const p = await file.text()
		unpackPaddles(p)
	}, {passive: false})

	const PADDLE_PACK = {}
	const PADDLE_UNPACK = {}

	PADDLE_PACK.cellAtoms = (paddle, value) => {
		const cellAtoms = []
		for (const atom of value) {
			cellAtoms.push({
				isLeftSlot: atom.isLeftSlot,
				value: atom.value,
				x: atom.x,
				y: atom.y,
				slotted: atom.slotted ? atom.slotted.value : undefined,
			})
		}
		return cellAtoms
	}

	let loadedColour = false
	PADDLE_UNPACK.cellAtoms = (paddle, value) => {
		const atoms = []
		for (const v of value) {
			if (!loadedColour) {
				if (!v.isLeftSlot) {
					setBrushColour(v.value)
				}
				loadedColour = true
			}
			const square = v.isLeftSlot ? new Slot() : makeSquareFromValue(v.value)
			square.isLeftSlot = v.isLeftSlot
			atomRegistry.register(square)
			giveChild(paddle, square)
			square.attached = true
			square.x = v.x
			square.y = v.y
			square.highlightedSide = "left"
			atoms.push(square)

			if (v.slotted !== undefined) {
				const slotted = makeSquareFromValue(v.slotted)
				atomRegistry.register(slotted)
				giveChild(paddle, slotted)
				slotted.attached = true
				slotted.cellAtom = square
				slotted.highlightedSide = "slot"
				slotted.slottee = true
				square.slotted = slotted
			}
		}
		return atoms
	}

	PADDLE_PACK.symmetryCircle = (paddle, value) => {
		if (value === undefined) return
		return value.value
	}

	PADDLE_UNPACK.symmetryCircle = (paddle, value) => {
		const circle = createChild(paddle, new SymmetryCircle())
		circle.value = value
		return circle
	}

	PADDLE_PACK.chance = (paddle, value) => {
		if (value === undefined) return
		return value.ons
	}

	PADDLE_UNPACK.chance = (paddle, value) => {
		const hex = createChild(paddle, new Hexagon())
		hex.ons = value
		return hex
	}

	const keep = (paddle, value) => value
	PADDLE_PACK.expanded = keep
	PADDLE_PACK.x = keep
	PADDLE_PACK.y = keep
	PADDLE_PACK.width = keep
	PADDLE_PACK.height = keep
	PADDLE_PACK.hasSymmetry = keep

	PADDLE_UNPACK.expanded = keep
	PADDLE_UNPACK.x = keep
	PADDLE_UNPACK.y = keep
	PADDLE_UNPACK.width = keep
	PADDLE_UNPACK.height = keep
	PADDLE_UNPACK.hasSymmetry = keep

	PADDLE_PACK.pinhole = (paddle, value) => {
		return value.locked
	}

	PADDLE_UNPACK.pinhole = (paddle, value) => {
		paddle.pinhole.locked = value
		return paddle.pinhole
	}

	PADDLE_PACK.rightTriangle = (paddle, value) => {
		return value !== undefined
	}

	PADDLE_UNPACK.rightTriangle = (paddle, value) => {
		if (!value) return undefined
		const arrow = createChild(paddle, new ColourtodeTriangle())
		return arrow
	}

	window.packPaddles = () => {
		const packedPaddles = []
		for (const paddle of paddles) {
			const packedPaddle = {}
			for (const key in paddle) {
				const packer = PADDLE_PACK[key]
				if (packer === undefined) continue
				const v = packer(paddle, paddle[key])
				if (v !== undefined) {
					packedPaddle[key] = v
				}
			}
			packedPaddles.push(packedPaddle)
		}
		return JSON.stringify(packedPaddles)		
	}

	window.unpackPaddles = (pack) => {
	    	if (middleClicked) {
	        	middleClicked = false
	        	return
	    	}

		loadedColour = false
		unlockMenuTool("triangle")
		unlockMenuTool("circle")
		unlockMenuTool("hexagon")
		// unlockMenuTool("wide_rectangle")
		try {
			while (paddles.length > 0) {
				deletePaddle(paddles[paddles.length-1])
			}
			for (const packed of JSON.parse(pack)) {
				const paddle = createPaddle()
				for (const key in packed) {
					const unpacker = PADDLE_UNPACK[key]
					if (unpacker === undefined) continue
					const v = unpacker(paddle, packed[key])
					if (v !== undefined) {
						paddle[key] = v
					}
				}
				updatePaddleSize(paddle)
				updatePaddleRule(paddle)
			}
			positionPaddles()
		} catch(e) {
			console.error(e)
			alert("Error loading rules... Sorry! Please contact @todepond :)")
		}
	}


	const download = (content, fileName, contentType) => {
		var a = document.createElement("a")
		var file = new Blob([content], {type: contentType})
		a.href = URL.createObjectURL(file)
		a.download = fileName
		a.click()
	}
	
	const savePaddles = async () => {
		const pack = packPaddles(paddles);

		if (window.showSaveFilePicker) {
			// Use the Native File System API if available
			try {
				const result = await showSaveFilePicker({
					excludeAcceptAllOption: true,
					suggestedName: 'spell',
					startIn: 'downloads',
					types: [{
						description: 'JSON',
						accept: {'application/json': [".json"]}
					}],
				})
				const writable = await result.createWritable();
				await writable.write(pack);
				await writable.close();
			} catch (err) {
				console.error('Failed to save file:', err);
			}
		} else {
			// Fallback to the Blob and link method
			const blob = new Blob([pack], {type: 'application/json'});
			const url = URL.createObjectURL(blob);

			const link = document.createElement('a');
			link.href = url;
			link.download = 'spell.json';
			link.click();
			URL.revokeObjectURL(url);
		}
	}

	const openPaddles = () => {
		const opener = document.createElement('input')
		opener.type = "file"
		opener.onchange = async e => {
			const file = opener.files[0]
			const pack = await file.text()
			unpackPaddles(pack)
			Keyboard.Control = false
		}
		opener.click()
		Keyboard.Control = false
	}

	const copyPaddles = () => {
		const pack = packPaddles(paddles)
		print(pack)
		navigator.clipboard.writeText(pack)
	}

	// store the state of the grid
	window.packWorld = () => {
		const cells = cellGrid.getAll().values()
		const packedCells = cells.map(cell => {
			// x=0, y=0, width=1, height=1, colour=112
			const packedCell = {
				x: cell.x,
				y: cell.y,
				w: cell.width,
				h: cell.height,
				c: cell.colour,
			}
			return packedCell
		})
		const packedString = JSON.stringify([...packedCells])

		const compressedString = LZString.compress(packedString)
		return compressedString
	}

	window.unpackWorld = (compressedString) => {
		const packedString = LZString.decompress(compressedString)
		const packedCells = JSON.parse(packedString)
		// deleteAllCells()
		const cells = packedCells.map(packedCell => {
			const {x, y, w, h, c} = packedCell
			const cell = new Cell({
				x,
				y,
				width: w,
				height: h,
				colour: c,
			})
			return cell
		})
		overrideCells(cells)
	}
})

//=============================================================
// just let go
//  of what you know
