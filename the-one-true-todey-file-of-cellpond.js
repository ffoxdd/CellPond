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
			PADDLE.scroll -= 50 * dy
			positionPaddles()
		}

		else if (e.ctrlKey || e.metaKey) {
			if (CT_SCALE - dy * 0.1 > 0.05)
				CT_SCALE -= dy * 0.1
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
			const highlight = createChild(atom, HIGHLIGHT, {bottom: true})
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

	const atomRegistry = new AtomRegistry()


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
		const child = new Atom(element)
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

	const COLOURTODE_RECTANGLE = {
		draw: (atom, ctx) => {
			let {x, y} = atom.getPosition()

			let X = Math.round(x)
			let Y = Math.round(y)
			let W = Math.round(atom.width)
			let H = Math.round(atom.height)
			let R = Math.round(atom.width/2)

			if (atom.hasBorder) {

				if (atom.hasInner) {

					let border = BORDER_THICKNESS
					if (atom.borderColour === undefined) {
						ctx.fillStyle = Colour.splash(atom.colour.splash)
						if (atom.isTool) {
							ctx.fillStyle = Colour.splash(atom.colour.splash)
							border *= 1.5
						} else if (atom.width === atom.height) {
							border *= 1.5
						}
					}
					else {
						ctx.fillStyle = atom.borderColour
					}

					ctx.beginPath()
					ctx.rect(X, Y, W, H)
					if (atom.stamp !== undefined) {
						ctx.arc(X+R, Y+R, Math.round((PADDLE_HANDLE.size - OPTION_MARGIN/2)/2), 0, 2*Math.PI)
					}


					if (atom.isGradient) {
						ctx.putImageData(atom.gradient, X * CT_SCALE, Y * CT_SCALE)
					} else {

						ctx.fill("evenodd")

						ctx.beginPath()
						ctx.fillStyle = atom.colour
						ctx.rect(X+border, Y+border, W-border*2, H-border*2)
						if (atom.stamp !== undefined) {
							ctx.arc(X+R, Y+R, Math.round((PADDLE_HANDLE.size - OPTION_MARGIN/2)/2)+border, 0, 2*Math.PI)
						}
						ctx.fill("evenodd")
					}
				}

				else {
					if (atom.borderColour === undefined) {
						ctx.strokeStyle = borderColours[atom.colour.splash]
					}
					else {
						ctx.strokeStyle = atom.borderColour
					}

					X = Math.round(x + 0.5) - 0.5
					Y = Math.round(y + 0.5) - 0.5

					ctx.lineWidth = BORDER_THICKNESS
					ctx.strokeRect(X, Y, W, H)
				}
			}

			else {
				ctx.fillStyle = atom.colour
				ctx.fillRect(X, Y, W, H)
			}

		},
		offscreen: (atom) => {
			const {x, y} = atom.getPosition()
			const left = x
			const right = x + atom.width
			const top = y
			const bottom = y + atom.height
			if (right < 0) return true
			if (bottom < 0) return true
			if (left > canvas.width) return true
			if (top > canvas.height) return true
			return false
		},
		overlaps: (atom, mx, my) => {
			const {x, y} = atom.getPosition()
			let border = BORDER_THICKNESS
			if (atom.isTool || atom.isSquare || atom.isTallRectangle) {
				border *= 1.5
			}
			const left = x
			const right = x + atom.width
			const top = y
			const bottom = y + atom.height

			if (mx < left) return false
			if (my < top) return false
			if (mx > right) return false
			if (my > bottom) return false
			
			return true
		},
	}

	const CIRCLE = {
		draw: (atom, ctx) => {
			const {x, y} = atom.getPosition()

			const X = x + atom.width/2
			const Y = y + atom.height/2
			let R = (atom.width/2)

			if (atom.hasBorder) {
				if (atom.isTool) {
					atom.borderColour = toolBorderColours[atom.colour.splash]
				}
				ctx.fillStyle = atom.borderColour !== undefined? atom.borderColour : Colour.Void
				ctx.beginPath()
				ctx.arc(X, Y, R, 0, 2*Math.PI)
				ctx.fill()
				let borderScale = atom.borderScale !== undefined? atom.borderScale : 1.0
				R = (atom.width/2 - BORDER_THICKNESS*1.5 * borderScale)
			}

			ctx.fillStyle = atom.colour
			ctx.beginPath()
			ctx.arc(X, Y, R, 0, 2*Math.PI)
			ctx.fill()

		},
		offscreen: COLOURTODE_RECTANGLE.offscreen,
		overlaps: COLOURTODE_RECTANGLE.overlaps,
		
	}

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

	// Ctrl+F: sqdef
	const COLOURTODE_SQUARE = {
		isSquare: true,
		hasBorder: true,
		draw: (atom, ctx) => {
			if (atom.value.isDiagram) return
			else COLOURTODE_RECTANGLE.draw(atom, ctx)
		},
		overlaps: COLOURTODE_RECTANGLE.overlaps,
		offscreen: COLOURTODE_RECTANGLE.offscreen,
		touch: (atom) => {
			setBrushColour(atom.value)
			return atom
		},
		click: (atom) => {

			if (atom.joins.length > 0) {
				if (atom.parent === atomRegistry.baseParent || !atom.parent.isPaddle) {
					if (atom.joinExpanded) {
						atom.joinUnepxand(atom)
					} else {
						atom.joinExpand(atom)
					}
				}
			}

			else if (atom.value.isDiagram) {

			}

			else if (!atom.expanded) {

				if (atom.parent === atomRegistry.baseParent || !atom.parent.isPaddle) {
					atom.expand(atom)
				}

			}
			else {
				atom.unexpand(atom)
			}

			setBrushColour(atom.value)
		},

		expand: (atom) => {
			atom.expanded = true
			atom.createPicker(atom)
			if (atom.value.channels.some(v => v === undefined)) {
				// unlockMenuTool("hexagon")
				// unlockMenuTool("wide_rectangle")
				unlockMenuTool("triangle")
			}
		},

		unexpand: (atom) => {
			atom.expanded = false
			atom.redExpanded = atom.red && atom.red.expanded
			atom.greenExpanded = atom.green && atom.green.expanded
			atom.blueExpanded = atom.blue && atom.blue.expanded
			atom.deletePicker(atom)
		},

		createPicker: (atom) => {
			const pickerHandle = createChild(atom, SYMMETRY_HANDLE)
			pickerHandle.width += OPTION_MARGIN
			atom.pickerHandle = pickerHandle
			atom.pickerHandle.behindParent = true
			
			const pickerPad = createChild(atom, COLOURTODE_PICKER_PAD)
			atom.pickerPad = pickerPad

			if (atom.value.channels[2] !== undefined) {
				if (atom.value.channels[2].variable === undefined) {
					const blue = createChild(atom, COLOURTODE_PICKER_CHANNEL)
					blue.channelSlot = "blue" //note: a colour doesn't necessarily have to be in its own channel slot
					blue.x += COLOURTODE_PICKER_PAD_MARGIN + 3 * (COLOURTODE_SQUARE.size + COLOURTODE_PICKER_PAD_MARGIN)
					blue.value = atom.value.channels[2]
					blue.needsColoursUpdate = true
					atom.blue = blue
					blue.deletedOptions = atom.deletedBlueOptions
					if (atom.blueExpanded) atom.blue.click(atom.blue)
					atom.blue.attached = true
				} else {
					// alert('no')
					const hexagon = atom.variableAtoms[2]
					hexagon.behindOtherChildren = false
					atomRegistry.register(hexagon)
					giveChild(atom, hexagon)
					hexagon.variable = "blue"
					hexagon.x = (COLOURTODE_PICKER_PAD_MARGIN + COLOURTODE_SQUARE.size)*3 + (COLOURTODE_SQUARE.size + COLOURTODE_PICKER_PAD_MARGIN)/2 - hexagon.width/3
					hexagon.y = atom.height/2 - hexagon.height/2
					hexagon.attached = true

					atom.blue = hexagon
				}
			}

			if (atom.value.channels[1] !== undefined) {
				if (atom.value.channels[1].variable === undefined) {
					const green = createChild(atom, COLOURTODE_PICKER_CHANNEL)
					green.channelSlot = "green" //note: a colour doesn't necessarily have to be in its own channel slot
					green.x += COLOURTODE_PICKER_PAD_MARGIN + 2 * (COLOURTODE_SQUARE.size + COLOURTODE_PICKER_PAD_MARGIN)
					green.value = atom.value.channels[1]
					green.needsColoursUpdate = true
					atom.green = green
					green.deletedOptions = atom.deletedGreenOptions
					if (atom.greenExpanded) atom.green.click(atom.green)
					atom.green.attached = true
				} else {
					// alert('noo')
					const hexagon = atom.variableAtoms[1]
					hexagon.behindOtherChildren = false
					atomRegistry.register(hexagon)
					giveChild(atom, hexagon)
					hexagon.variable = "green"
					hexagon.x = (COLOURTODE_PICKER_PAD_MARGIN + COLOURTODE_SQUARE.size)*2 + (COLOURTODE_SQUARE.size + COLOURTODE_PICKER_PAD_MARGIN)/2 - hexagon.width/3
					hexagon.y = atom.height/2 - hexagon.height/2
					hexagon.attached = true

					atom.green = hexagon
				}
			}

			if (atom.value.channels[0] !== undefined) {
				if (atom.value.channels[0].variable === undefined) {
					const red = createChild(atom, COLOURTODE_PICKER_CHANNEL)
					red.channelSlot = "red" //note: a colour doesn't necessarily have to be in its own channel slot
					red.x += COLOURTODE_PICKER_PAD_MARGIN + COLOURTODE_SQUARE.size + COLOURTODE_PICKER_PAD_MARGIN
					red.value = atom.value.channels[0]
					red.needsColoursUpdate = true
					atom.red = red
					red.deletedOptions = atom.deletedRedOptions
					if (atom.redExpanded) atom.red.click(atom.red)
					atom.red.attached = true
				} else {
					const triangle = atom.variableAtoms[0]
					triangle.behindOtherChildren = false
					atomRegistry.register(triangle)
					giveChild(atom, triangle)
					triangle.x = (COLOURTODE_PICKER_PAD_MARGIN + COLOURTODE_SQUARE.size) + (COLOURTODE_SQUARE.size + COLOURTODE_PICKER_PAD_MARGIN)/2 - triangle.width/3
					triangle.y = atom.height/2 - triangle.height/2
					triangle.attached = true

					atom.red = triangle
				}
			}
		},

		deletePicker: (atom) => {
			deleteChild(atom, atom.pickerPad)
			deleteChild(atom, atom.pickerHandle)
			if (atom.red) {
				atom.deletedRedOptions = atom.red.options
				deleteChild(atom, atom.red)
			}
			if (atom.green) {
				atom.deletedGreenOptions = atom.green.options
				deleteChild(atom, atom.green)
			}
			if (atom.blue) {
				atom.deletedBlueOptions = atom.blue.options
				deleteChild(atom, atom.blue)
			}
		},

		receiveNumber: (atom, number, channel = number.channel, {expanded, numberAtom} = {}) => {
			
			atom.redExpanded = atom.red && atom.red.expanded
			atom.greenExpanded = atom.green && atom.green.expanded
			atom.blueExpanded = atom.blue && atom.blue.expanded
			
			if (atom.variableAtoms === undefined) {
				atom.variableAtoms = [undefined, undefined, undefined]
			}

			if (number !== undefined && number.variable !== undefined) {
				atom.variableAtoms[channel] = numberAtom
			} else {
				atom.variableAtoms[channel] = undefined
			}

			if (expanded !== undefined) {
				const channelName = CHANNEL_NAMES[channel]
				atom[`${channelName}Expanded`] = expanded
			}

			atom.value.channels[channel] = number

			atom.deletePicker(atom)
			atom.createPicker(atom)
			atom.needsColoursUpdate = true
			atom.colourTicker = Infinity

			if (atom.parent !== atomRegistry.baseParent) {
				const paddle = atom.parent
				updatePaddleRule(paddle)
			}

			const brushDiagramCell = new DiagramCell({content: atom.value})
			state.brush.colour = new Diagram({left: [brushDiagramCell]})

			squareTool.toolbarNeedsColourUpdate = true
			triangleTool.toolbarNeedsColourUpdate = true
			circleTool.toolbarNeedsColourUpdate = true
			// wideRectangleTool.toolbarNeedsColourUpdate = true
			tallRectangleTool.toolbarNeedsColourUpdate = true

		},

		construct: (atom) => {
			atom.needsColoursUpdate = true
			if (typeof state.brush.colour === "number") {
				atom.value = DragonArray.fromSplash(state.brush.colour)
			} else {
				atom.value = DragonArray.cloneContent(state.brush.colour.left[0].content)
			}
			
			atom.colourId = 0
			atom.dcolourId = 1
			atom.colourTicker = Infinity
			atom.joins = []
			atom.joinColourIds = []
			atom.variableAtoms = []

			atom.gradient = new ImageData(atom.width * CT_SCALE, atom.height * CT_SCALE)
			atom.headGradient = new ImageData(atom.width * CT_SCALE, atom.height * CT_SCALE)

		},

		updateGradient: (atom) => {
			const valueClone = DragonArray.cloneContent(atom.value)
			valueClone.joins = []
			atom.colours = valueClone.getSplashes()

			// Create pixel values for gradient
			atom.isGradient = true

			if (atom.joins.length > 0 && !atom.joinExpanded) {
				const joinGradients = []
				for (const join of atom.joins) {
					join.updateGradient(join)
					joinGradients.push(join.gradient)
				}
				atom.headGradient = getGradientImageFromColours({
					colours: atom.colours,
					width: atom.width * CT_SCALE,
					height: atom.height * CT_SCALE,
					stamp: atom.value.stamp,
					gradient: atom.headGradient,
				})

				const gradients = [atom.headGradient, ...joinGradients]
				atom.gradient = getMergedGradient({
					gradients,
					width: atom.width * CT_SCALE,
					height: atom.height * CT_SCALE,
					stamp: atom.value.stamp,
					mergedGradient: atom.gradient,
				})
				
			} else {
				atom.gradient = getGradientImageFromColours({
					colours: atom.colours,
					width: atom.width * CT_SCALE,
					height: atom.height * CT_SCALE,
					gradient: atom.gradient,
					stamp: atom.value.stamp,
				})
			}
		},
		
		// Ctrl+F: sqwww
		update: (atom) => {
			
			if (atom.value.isDiagram) {
				if (atom.multiAtoms === undefined || atom.multiAtoms.length === 0) {
					atom.multiAtoms = []
					const diagram = atom.value
					const [diagramWidth, diagramHeight] = diagram.getDimensions()
					const cellAtomWidth = atom.width / diagramWidth
					const cellAtomHeight = atom.height / diagramHeight
					for (const diagramCell of diagram.left) {
						const multiAtom = createChild(atom, COLOURTODE_SQUARE)
						multiAtom.x = diagramCell.x * cellAtomWidth
						multiAtom.y = diagramCell.y * cellAtomHeight
						multiAtom.width = diagramCell.width * cellAtomWidth
						multiAtom.height = diagramCell.height * cellAtomHeight
						multiAtom.value = diagramCell.content
						atom.multiAtoms.push(multiAtom)
					}
				}

			} else {

				if (atom.needsColoursUpdate) {
					atom.updateGradient(atom)
					atom.needsColoursUpdate = false
				}
			}

			const {x, y} = atom.getPosition()

			atom.highlightedAtom = undefined

			if (hand.content === atom && hand.state === HAND.DRAGGING) {

				const left = x
				const top = y
				const right = x + atom.width
				const bottom = y + atom.height

				if (atom.highlight !== undefined) {
					deleteChild(atom, atom.highlight)
					atom.highlight = undefined
				}
				
				if (atom.highlightedAtom === undefined) {
					const atoms = getAllBaseAtoms()
					for (let other of atoms) {
						if (other === atom) continue
						if (!other.isSquare) continue
						if (other.joins.length > 0 && other.joinExpanded) {
							other = other.pickerPad
						}
						
						const {x: ox, y: oy} = other.getPosition()
						const oleft = ox
						const oright = ox + other.width
						const otop = oy
						const obottom = oy + other.height

						if (left > oright) continue
						if (right < oleft) continue
						if (bottom < otop) continue
						if (top > obottom) continue

						if (other.isPicker) {
							atom.highlightedAtom = other.parent
						} else {
							if (other.parent !== atomRegistry.baseParent) continue
							atom.highlightedAtom = other
						}

						atom.highlight = createChild(atom, HIGHLIGHT, {bottom: true})
						atom.highlight.hasBorder = true
						atom.highlight.hasInner = false
						atom.highlight.width = other.width
						atom.highlight.height = other.height
						atom.highlight.x = ox
						atom.highlight.y = oy

						break

					}
				}

				if (atom.highlightedAtom === undefined) for (const paddle of paddles) {

					if (!paddle.expanded) continue

					const {x: px, y: py} = paddle.getPosition()
					const pleft = px
					const pright = px + paddle.width
					const ptop = py
					const pbottom = py + paddle.height

					if (left > pright) continue
					if (right < pleft) continue
					if (top > pbottom) continue
					if (bottom < ptop) continue

					if (paddle.cellAtoms.length === 0) {

						const {x: dummyLeftX, y: dummyLeftY} = paddle.dummyLeft.getPosition()
						const {x: dummyRightX, y: dummyRightY} = paddle.dummyRight.getPosition()

						if (paddle.rightTriangle === undefined) {
							atom.highlight = createChild(atom, HIGHLIGHT, {bottom: true})
							atom.highlight.hasBorder = true
							atom.highlight.colour = Colour.Grey
							atom.highlight.x = dummyLeftX
							atom.highlight.y = dummyLeftY
							atom.highlight.width = paddle.dummyLeft.width
							atom.highlight.height = paddle.dummyLeft.height
							atom.highlightedSide = "left"

							atom.highlightedAtom = paddle
						} else if (left > pleft + paddle.rightTriangle.x) {
							atom.highlight = createChild(atom, HIGHLIGHT, {bottom: true})
							atom.highlight.hasBorder = true
							atom.highlight.colour = Colour.Grey
							atom.highlight.x = dummyRightX
							atom.highlight.y = dummyRightY
							atom.highlight.width = paddle.dummyRight.width
							atom.highlight.height = paddle.dummyRight.height
							atom.highlightedSide = "right"
							atom.highlightedAtom = paddle
						} else {
							atom.highlight = createChild(atom, HIGHLIGHT, {bottom: true})
							atom.highlight.hasBorder = true
							atom.highlight.colour = Colour.Grey
							atom.highlight.x = dummyLeftX
							atom.highlight.y = dummyLeftY
							atom.highlight.width = paddle.dummyLeft.width
							atom.highlight.height = paddle.dummyLeft.height
							atom.highlightedSide = "left"
							atom.highlightedAtom = paddle
						}
						break

					}

					else if (paddle.rightTriangle !== undefined && left > pleft + paddle.rightTriangle.x) {

						let winningDistance = Infinity
						let winningSide = undefined
						let winningCellAtom = undefined

						for (const catom of paddle.cellAtoms) {
							const cellAtom = catom.slot
							const {x: cx, y: cy} = cellAtom.getPosition()
							const cleft = cx
							const cright = cx + cellAtom.width
							const ctop = cy
							const cbottom = cy + cellAtom.height

							const spotCenter = [cleft, ctop]
							const spotLeft = [cleft - cellAtom.width, ctop]
							const spotAbove = [cleft, ctop - cellAtom.height]
							const spotRight = [cright, ctop]
							const spotBelow = [cleft, cbottom]

							const dspotCenter = Math.hypot(x - spotCenter[0], y - spotCenter[1])
							if (catom.slotted === undefined && isCellAtomSlotFree(paddle, spotCenter, true) && dspotCenter < winningDistance) {
								winningDistance = dspotCenter
								winningCellAtom = cellAtom
								winningSide = "slot"
							}

							const dspotLeft = Math.hypot(x - spotLeft[0], y - spotLeft[1])
							if (!isCellAtomSpotFilled(paddle, spotLeft, true) && dspotLeft < winningDistance) {
								winningDistance = dspotLeft
								winningCellAtom = cellAtom
								winningSide = "left"
							}

							const dspotAbove = Math.hypot(x - spotAbove[0], y - spotAbove[1])
							if (!isCellAtomSpotFilled(paddle, spotAbove, true) && dspotAbove < winningDistance) {
								winningDistance = dspotAbove
								winningCellAtom = cellAtom
								winningSide = "above"
							}

							const dspotRight = Math.hypot(x - spotRight[0], y - spotRight[1])
							if (!isCellAtomSpotFilled(paddle, spotRight, true) && dspotRight < winningDistance) {
								winningDistance = dspotRight
								winningCellAtom = cellAtom
								winningSide = "right"
							}

							const dspotBelow = Math.hypot(x - spotBelow[0], y - spotBelow[1])
							if (!isCellAtomSpotFilled(paddle, spotBelow, true) && dspotBelow < winningDistance) {
								winningDistance = dspotBelow
								winningCellAtom = cellAtom
								winningSide = "below"
							}
						}

						const {x: cx, y: cy} = winningCellAtom.getPosition()

						atom.highlight = createChild(atom, HIGHLIGHT, {bottom: true})
						if (winningSide === "left" || winningSide === "right") {
							atom.highlight.width = HIGHLIGHT_THICKNESS
							atom.highlight.height = winningCellAtom.height
						}
						else if (winningSide === "above" || winningSide === "below") {
							atom.highlight.width = winningCellAtom.width
							atom.highlight.height = HIGHLIGHT_THICKNESS
						}

						if (winningSide === "left") {
							atom.highlight.x = cx - HIGHLIGHT_THICKNESS/2
							atom.highlight.y = cy
						}
						else if (winningSide === "right") {
							atom.highlight.x = cx - HIGHLIGHT_THICKNESS/2 + winningCellAtom.width
							atom.highlight.y = cy
						}
						else if (winningSide === "above") {
							atom.highlight.x = cx
							atom.highlight.y = cy - HIGHLIGHT_THICKNESS/2
						}
						else if (winningSide === "below") {
							atom.highlight.x = cx
							atom.highlight.y = cy - HIGHLIGHT_THICKNESS/2 + winningCellAtom.height
						}

						if (winningSide === "slot") {
							atom.highlight.width = COLOURTODE_SQUARE.size
							atom.highlight.height = COLOURTODE_SQUARE.size
							const {x: cx, y: cy} = winningCellAtom.getPosition()
							atom.highlight.x = cx
							atom.highlight.y = cy
							atom.highlight.hasBorder = true
							atom.highlight.colour = Colour.Grey
						}

						atom.highlightedAtom = winningCellAtom
						atom.highlightedSide = winningSide

						break

					}

					else {
						let winningDistance = Infinity
						let winningSide = undefined
						let winningCellAtom = undefined

						for (const cellAtom of paddle.cellAtoms) {
							const {x: cx, y: cy} = cellAtom.getPosition()
							const cleft = cx
							const cright = cx + cellAtom.width
							const ctop = cy
							const cbottom = cy + cellAtom.height

							const spotCenter = [cleft, ctop]
							const spotLeft = [cleft - cellAtom.width, ctop]
							const spotAbove = [cleft, ctop - cellAtom.height]
							const spotRight = [cright, ctop]
							const spotBelow = [cleft, cbottom]

							const dspotCenter = Math.hypot(x - spotCenter[0], y - spotCenter[1])
							if (isCellAtomSlotFree(paddle, spotCenter) && dspotCenter < winningDistance) {
								winningDistance = dspotCenter
								winningCellAtom = cellAtom
								winningSide = "slot"
							}

							const dspotLeft = Math.hypot(x - spotLeft[0], y - spotLeft[1])
							if (!isCellAtomSpotFilled(paddle, spotLeft) && dspotLeft < winningDistance) {
								winningDistance = dspotLeft
								winningCellAtom = cellAtom
								winningSide = "left"
							}

							const dspotAbove = Math.hypot(x - spotAbove[0], y - spotAbove[1])
							if (!isCellAtomSpotFilled(paddle, spotAbove) && dspotAbove < winningDistance) {
								winningDistance = dspotAbove
								winningCellAtom = cellAtom
								winningSide = "above"
							}

							const dspotRight = Math.hypot(x - spotRight[0], y - spotRight[1])
							if (!isCellAtomSpotFilled(paddle, spotRight) && dspotRight < winningDistance) {
								winningDistance = dspotRight
								winningCellAtom = cellAtom
								winningSide = "right"
							}

							const dspotBelow = Math.hypot(x - spotBelow[0], y - spotBelow[1])
							if (!isCellAtomSpotFilled(paddle, spotBelow) && dspotBelow < winningDistance) {
								winningDistance = dspotBelow
								winningCellAtom = cellAtom
								winningSide = "below"
							}
						}

						const {x: cx, y: cy} = winningCellAtom.getPosition()

						atom.highlight = createChild(atom, HIGHLIGHT, {bottom: true})
						if (winningSide === "left" || winningSide === "right") {
							atom.highlight.width = HIGHLIGHT_THICKNESS
							atom.highlight.height = winningCellAtom.height
						}
						else if (winningSide === "above" || winningSide === "below") {
							atom.highlight.width = winningCellAtom.width
							atom.highlight.height = HIGHLIGHT_THICKNESS
						}

						if (winningSide === "left") {
							atom.highlight.x = cx - HIGHLIGHT_THICKNESS/2
							atom.highlight.y = cy
						}
						else if (winningSide === "right") {
							atom.highlight.x = cx - HIGHLIGHT_THICKNESS/2 + winningCellAtom.width
							atom.highlight.y = cy
						}
						else if (winningSide === "above") {
							atom.highlight.x = cx
							atom.highlight.y = cy - HIGHLIGHT_THICKNESS/2
						}
						else if (winningSide === "below") {
							atom.highlight.x = cx
							atom.highlight.y = cy - HIGHLIGHT_THICKNESS/2 + winningCellAtom.height
						}

						if (winningSide === "slot") {
							atom.highlight.width = COLOURTODE_SQUARE.size
							atom.highlight.height = COLOURTODE_SQUARE.size
							const {x: cx, y: cy} = winningCellAtom.getPosition()
							atom.highlight.x = cx
							atom.highlight.y = cy
							atom.highlight.hasBorder = true
							atom.highlight.colour = Colour.Grey
						}

						atom.highlightedAtom = winningCellAtom
						atom.highlightedSide = winningSide

						break

					}

				}


			}

			if (atom.highlightedAtom === undefined && atom.highlight !== undefined) {
				deleteChild(atom, atom.highlight)
				atom.highlight = undefined
			}

		},

		drop: (atom) => {
			if (atom.highlight !== undefined) {

				if (atom.highlightedAtom.isPaddle) {
					const paddle = atom.highlightedAtom
					atom.attached = true

					atom.dx = 0
					atom.dy = 0

					if (atom.highlightedSide === "right") {

						const dummy = createChild(paddle, SLOT, {bottom: true})
						dummy.x = PADDLE.width/2 - atom.width/2
						dummy.y = PADDLE.height/2 - atom.height/2
						dummy.isLeftSlot = true
						dummy.isSlot = false
						paddle.cellAtoms.push(dummy)

						dummy.slotted = atom
						atom.cellAtom = dummy
						atom.x = atom.highlightedAtom.x
						atom.y = atom.highlightedAtom.y
						atom.slottee = true
						giveChild(paddle, atom)

					} else {
						paddle.cellAtoms.push(atom)
						atom.x = atom.highlightedAtom.x
						atom.y = atom.highlightedAtom.y
						
						giveChild(paddle, atom)
					}

					updatePaddleSize(paddle)
				}
				else if (atom.highlightedAtom.isSlot && atom.highlightedSide === "slot") {
					const slot = atom.highlightedAtom
					const paddle = slot.parent
					atom.attached = true
					giveChild(paddle, atom)
					atom.x = slot.x
					atom.y = slot.y
					atom.dx = 0
					atom.dy = 0
					slot.cellAtom.slotted = atom
					atom.cellAtom = slot.cellAtom
					atom.slottee = true

					updatePaddleSize(slot.parent)
				}
				else if (atom.highlightedAtom.isLeftSlot && atom.highlightedSide === "slot") {
					const slot = atom.highlightedAtom
					const paddle = slot.parent
					const id = paddle.cellAtoms.indexOf(slot)
					paddle.cellAtoms.splice(id, 1)
					atom.x = slot.x
					atom.y = slot.y
					atom.dx = 0
					atom.dy = 0

					atom.attached = true
					paddle.cellAtoms.push(atom)
					atom.slotted = slot.slotted
					atom.slot = slot.slot
					if (slot.slotted !== undefined) {
						slot.slotted.cellAtom = atom
					}
					giveChild(paddle, atom)
					updatePaddleRule(paddle)
					deleteChild(paddle, slot)

				}
				else if (atom.highlightedAtom.isSlot && atom.highlightedSide !== "slot") {
					const slot = atom.highlightedAtom
					const paddle = slot.parent
					atom.attached = true
					giveChild(paddle, atom)

					const dummy = createChild(paddle, SLOT, {bottom: true})
					dummy.isLeftSlot = true
					paddle.cellAtoms.push(dummy)
					dummy.isSlot = false
					dummy.slotted = atom
					dummy.slotted.cellAtom = dummy
					dummy.slot = slot
					atom.slotted = undefined

					if (atom.expanded) {
						atom.unexpand(atom)
					}

					if (atom.highlightedSide === "left") {
						atom.x = slot.x - atom.width
						atom.y = slot.y
					} else if (atom.highlightedSide === "right") {
						atom.x = slot.x + slot.width
						atom.y = slot.y
					} else if (atom.highlightedSide === "above") {
						atom.x = slot.x
						atom.y = slot.y - atom.height
					} else if (atom.highlightedSide === "below") {
						atom.x = slot.x
						atom.y = slot.y + slot.height
					}

					dummy.x = atom.x - paddle.offset
					dummy.y = atom.y

					atom.cellAtom = dummy
					atom.slottee = true
					atom.dx = 0
					atom.dy = 0
					updatePaddleSize(paddle)
				}
				else if ((atom.highlightedAtom.isLeftSlot || atom.highlightedAtom.isSquare) && atom.highlightedAtom.parent.isPaddle) {
					const square = atom.highlightedAtom
					const paddle = square.parent
					atom.attached = true
					giveChild(paddle, atom)
					paddle.cellAtoms.push(atom)
					if (atom.expanded) {
						atom.unexpand(atom)
					}

					if (atom.highlightedSide === "left") {
						atom.x = square.x - atom.width
						atom.y = square.y
					} else if (atom.highlightedSide === "right") {
						atom.x = square.x + square.width
						atom.y = square.y
					} else if (atom.highlightedSide === "above") {
						atom.x = square.x
						atom.y = square.y - atom.height
					} else if (atom.highlightedSide === "below") {
						atom.x = square.x
						atom.y = square.y + square.height
					}

					if (paddle.rightTriangle !== undefined && atom.slotted !== undefined) {
						atomRegistry.register(atom.slotted)
						giveChild(paddle, atom.slotted)
					}

					atom.dx = 0
					atom.dy = 0
					updatePaddleSize(paddle)

				}
				else {
					const joinee = atom.highlightedAtom
					const joiner = atom

					if (joinee.expanded) {
						joinee.unexpand(joinee)
					}

					if (joiner.expanded) {
						joiner.unexpand(joiner)
					}
					
					if (joinee.joinExpanded) {
						joinee.joinUnepxand(joinee)
					}

					joinee.joins.push(joiner)
					atomRegistry.delete(joiner)
					
					joinee.joinExpand(joinee)
					
					
					joinee.value.joins.push(joiner.value)
					joinee.needsColoursUpdate = true
					joinee.colourTicker = Infinity

					setBrushColour(joinee.value)
					
				}
				
				if (atom.expanded) {
					atom.unexpand(atom)
				}
				
				if (atom.joinExpanded) {
					atom.joinUnepxand(atom)
				}

			}
		},

		joinExpand: (atom) => {
			atom.joinExpanded = true
			
			const pickerPad = createChild(atom, COLOURTODE_PICKER_PAD)
			atom.pickerPad = pickerPad
			pickerPad.width = atom.width + OPTION_MARGIN*2
			pickerPad.x = -OPTION_MARGIN
			pickerPad.height = (atom.joins.length) * (atom.height + OPTION_MARGIN) + OPTION_MARGIN
			pickerPad.y = atom.height + OPTION_MARGIN
			pickerPad.touch = (atom) => atom
			pickerPad.grab = (atom) => atom.parent
			pickerPad.dragOnly = true

			const pickerHandle = createChild(atom, COLOURTODE_PICKER_PAD)
			atom.pickerHandle = pickerHandle
			pickerHandle.width = SYMMETRY_HANDLE.height
			pickerHandle.x = atom.width/2 - pickerHandle.width/2
			pickerHandle.height = SYMMETRY_HANDLE.width
			pickerHandle.y = atom.height
			pickerHandle.touch = (atom) => atom
			pickerHandle.grab = (atom) => atom.parent
			pickerHandle.dragOnly = true

			for (let i = 0; i < atom.joins.length; i++) {
				const joiner = atom.joins[i]
				atomRegistry.register(joiner)
				giveChild(atom, joiner)
				joiner.x = 0
				joiner.y = (i+1) * (atom.height + OPTION_MARGIN) + OPTION_MARGIN
				joiner.dx = 0
				joiner.dy = 0
				joiner.isJoiner = true
				joiner.touch = (atom) => atom.parent
			}
			
			atom.needsColoursUpdate = true
			atom.colourTicker = Infinity

			if (atom.multiAtoms !== undefined) {
				for (const multiAtom of atom.multiAtoms) {
					atomRegistry.bringToFront(multiAtom)
				}
			}

			atom.attached = false
			
		},

		joinUnepxand: (atom) => {
			atom.joinExpanded = false
			deleteChild(atom, atom.pickerPad)
			deleteChild(atom, atom.pickerHandle)

			for (let i = 0; i < atom.joins.length; i++) {
				const joiner = atom.joins[i]
				deleteChild(atom, joiner)
			}
			
			atom.needsColoursUpdate = true
			atom.colourTicker = Infinity

		},

		// ONLY USE .value NOT ANYTHING ELSE
		clone: (atom) => {
			const newAtom = makeSquareFromValue(atom.value)
			
			const {x, y} = atom.getPosition()
			newAtom.x = x
			newAtom.y = y

			return newAtom
		},

		rightDraggable: true,
		rightDrag: (atom) => {
			const newAtom = atom.clone(atom)

			hand.offset.x -= atom.x - newAtom.x
			hand.offset.y -= atom.y - newAtom.y

			atomRegistry.register(newAtom)
			setBrushColour(newAtom.value)

			return newAtom
		},

		// Ctrl+f: sqdra
		drag: (atom) => {

			if (atom.joins.length > 0 && atom.joinExpanded) {
				return atom
			}

			if (atom.isJoiner) {
				const id = atom.parent.joins.indexOf(atom)
				atom.parent.joins.splice(id, 1)
				atom.parent.value.joins.splice(id, 1)
				atom.parent.joinUnepxand(atom.parent)
				if (atom.parent.joins.length > 0) {
					atom.parent.joinExpand(atom.parent)
				}
				freeChild(atom.parent, atom)
				atom.isJoiner = false
				atom.touch = COLOURTODE_SQUARE.touch
			}

			if (atom.attached) {

				const paddle = atom.parent

				if (atom.slottee) {
					atom.attached = false
					atom.slottee = false
					freeChild(paddle, atom)
					atom.cellAtom.slotted = undefined
					if (atom.cellAtom.isLeftSlot) {
						deleteChild(paddle, atom.cellAtom)
						const id = paddle.cellAtoms.indexOf(atom.cellAtom)
						paddle.cellAtoms.splice(id, 1)
					}
					atom.cellAtom = undefined
					updatePaddleSize(paddle)
					return atom
				}
				
				const {x, y} = atom
				atom.attached = false
				freeChild(paddle, atom)

				const id = paddle.cellAtoms.indexOf(atom)
				paddle.cellAtoms.splice(id, 1)
				
				atom.slot = undefined
				if (paddle.rightTriangle !== undefined && atom.slotted !== undefined) {
					const dummy = createChild(paddle, SLOT, {bottom: true})
					dummy.x = x
					dummy.y = y
					dummy.isLeftSlot = true
					paddle.cellAtoms.push(dummy)
					dummy.isSlot = false
					dummy.slotted = atom.slotted
					dummy.slotted.cellAtom = dummy
					atom.slotted = undefined
				}
				updatePaddleSize(paddle)

			}

			return atom
		},

		size: 40,
		expanded: false,
	}

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

	const TRIANGLE_RIGHT = {
		size: COLOURTODE_SQUARE.size,
		width: COLOURTODE_SQUARE.size * Math.sqrt(3)/2, //the only reason width is set is for the menu spacing
		draw: (atom, ctx) => {

			const {x, y} = atom.getPosition()

			let size = atom.size
			if (atom.isTool) size -= BORDER_THICKNESS*2.5
			if (!atom.isTool) size -= 2 

			const height = size
			const width = size * Math.sqrt(3)/2

			const left = x
			const right = left + width
			let top = y + 1
			if (atom.isTool) top += BORDER_THICKNESS*1.25
			const bottom = top + height
			const middleY = top + height/2

			ctx.fillStyle = atom.colour
			const path = new Path2D()

			path.moveTo(left, top)
			path.lineTo(right, middleY)
			path.lineTo(left, bottom)
			path.closePath()
			ctx.fillStyle = atom.colour
			ctx.fill(path)
			if (atom.hasBorder) {
				ctx.lineWidth = BORDER_THICKNESS*1.5
				ctx.strokeStyle = atom.borderColour

				if (atom.isTool) {
					ctx.strokeStyle = toolBorderColours[atom.colour.splash]
				}
				ctx.stroke(path)
			}
		},
		overlaps: (atom, x, y) => {
			
			const {x: ax, y: ay} = atom.getPosition()

			const height = atom.size
			const width = atom.size * Math.sqrt(3)/2
			
			const left = ax
			const right = left + width
			const top = ay
			const bottom = top + height

			if (x < left) return false
			if (y < top) return false
			if (x > right) return false
			if (y > bottom) return false

			return true
		},
		offscreen: (atom) => {

			const {x, y} = atom.getPosition()

			const height = atom.size
			const width = atom.size * Math.sqrt(3)/2
			
			const left = x
			const right = left + width
			const top = y
			const bottom = top + height

			if (right < 0) return true
			if (bottom < 0) return true
			if (left > canvas.width) return true
			if (top > canvas.height) return true
			return false
		},
	}

	const TRIANGLE_UP = {
		size: COLOURTODE_SQUARE.size,
		draw: (atom, ctx) => {

			const {x, y} = atom.getPosition()

			const width = atom.size
			const height = atom.size * Math.sqrt(3)/2
			const diff = atom.size - height

			const left = x
			const right = left + width
			const top = y + diff/2
			const bottom = top + height
			const middleX = left + width/2

			ctx.fillStyle = atom.colour
			const path = new Path2D()

			path.moveTo(left, bottom)
			path.lineTo(middleX, top)
			path.lineTo(right, bottom)
			path.closePath()
			ctx.fillStyle = atom.colour
			ctx.fill(path)
			if (atom.hasBorder) {
				ctx.lineWidth = BORDER_THICKNESS*1.5
				ctx.strokeStyle = atom.borderColour
				ctx.stroke(path)
			}
		},
		overlaps: (atom, x, y) => {
			
			const {x: ax, y: ay} = atom.getPosition()

			const width = atom.size
			const height = atom.size * Math.sqrt(3)/2
			
			const left = ax
			const right = left + width
			const top = ay
			const bottom = top + height

			if (x < left) return false
			if (y < top) return false
			if (x > right) return false
			if (y > bottom) return false

			return true
		},
		offscreen: (atom) => {

			const {x, y} = atom.getPosition()

			const width = atom.size
			const height = atom.size * Math.sqrt(3)/2
			
			const left = x
			const right = left + width
			const top = y
			const bottom = top + height

			if (right < 0) return true
			if (bottom < 0) return true
			if (left > canvas.width) return true
			if (top > canvas.height) return true
			return false
		},
	}

	const TRIANGLE_DOWN = {
		size: COLOURTODE_SQUARE.size,
		draw: (atom, ctx) => {

			const {x, y} = atom.getPosition()

			const width = atom.size
			const height = atom.size * Math.sqrt(3)/2
			const diff = atom.size - height

			const left = x
			const right = left + width
			const top = y + diff/2
			const bottom = top + height
			const middleX = left + width/2

			ctx.fillStyle = atom.colour
			const path = new Path2D()

			path.moveTo(left, top)
			path.lineTo(middleX, bottom)
			path.lineTo(right, top)
			path.closePath()
			ctx.fillStyle = atom.colour
			ctx.fill(path)
			if (atom.hasBorder) {
				ctx.lineWidth = BORDER_THICKNESS*1.5
				ctx.strokeStyle = atom.borderColour
				ctx.stroke(path)
			}
		},
		overlaps: (atom, x, y) => {
			
			const {x: ax, y: ay} = atom.getPosition()

			const width = atom.size
			const height = atom.size * Math.sqrt(3)/2
			
			const left = ax
			const right = left + width
			const top = ay
			const bottom = top + height

			if (x < left) return false
			if (y < top) return false
			if (x > right) return false
			if (y > bottom) return false

			return true
		},
		offscreen: (atom) => {

			const {x, y} = atom.getPosition()

			const width = atom.size
			const height = atom.size * Math.sqrt(3)/2
			
			const left = x
			const right = left + width
			const top = y
			const bottom = top + height

			if (right < 0) return true
			if (bottom < 0) return true
			if (left > canvas.width) return true
			if (top > canvas.height) return true
			return false
		},
	}


	const TRIANGLE_LEFT = {
		size: COLOURTODE_SQUARE.size,
		width: COLOURTODE_SQUARE.size * Math.sqrt(3)/2, //the only reason width is set is for the menu spacing
		draw: (atom, ctx) => {

			const {x, y} = atom.getPosition()

			let size = atom.size
			if (atom.isTool) size -= BORDER_THICKNESS*2.5
			if (!atom.isTool) size -= 2 

			const height = size
			const width = size * Math.sqrt(3)/2
			
			const left = x
			const right = left + width
			let top = y + 1
			if (atom.isTool) top += BORDER_THICKNESS*1.25
			const bottom = top + height
			const middleY = top + height/2

			ctx.fillStyle = atom.colour
			const path = new Path2D()

			path.moveTo(right, top)
			path.lineTo(left, middleY)
			path.lineTo(right, bottom)
			path.closePath()
			ctx.fillStyle = atom.colour
			ctx.fill(path)
			if (atom.hasBorder) {
				ctx.lineWidth = BORDER_THICKNESS*1.5
				ctx.strokeStyle = atom.borderColour

				if (atom.isTool) {
					ctx.strokeStyle = toolBorderColours[atom.colour.splash]
				}
				ctx.stroke(path)
			}
		},
		overlaps: (atom, x, y) => {
			
			const {x: ax, y: ay} = atom.getPosition()

			const height = atom.size
			const width = atom.size * Math.sqrt(3)/2
			
			const left = ax
			const right = left + width
			const top = ay
			const bottom = top + height

			if (x < left) return false
			if (y < top) return false
			if (x > right) return false
			if (y > bottom) return false

			return true
		},
		offscreen: (atom) => {

			const {x, y} = atom.getPosition()

			const height = atom.size
			const width = atom.size * Math.sqrt(3)/2
			
			const left = x
			const right = left + width
			const top = y
			const bottom = top + height

			if (right < 0) return true
			if (bottom < 0) return true
			if (left > canvas.width) return true
			if (top > canvas.height) return true
			return false
		},
	}

	// Ctrl+F: trdef
	const COLOURTODE_TRIANGLE = {
		behindOtherChildren: true,
		expanded: false,
		draw: (atom, ctx) => {
			if (atom.direction === "right") TRIANGLE_RIGHT.draw(atom, ctx)
			else if (atom.direction === "down") TRIANGLE_DOWN.draw(atom, ctx)
			else if (atom.direction === "up") TRIANGLE_UP.draw(atom, ctx)
			else if (atom.direction === "left") TRIANGLE_LEFT.draw(atom, ctx)
			else TRIANGLE_RIGHT.draw(atom, ctx)
		},
		colour: Colour.splash(999),
		overlaps: TRIANGLE_RIGHT.overlaps,
		offscreen: TRIANGLE_RIGHT.offscreen,
		size: COLOURTODE_SQUARE.size,
		width: TRIANGLE_RIGHT.width,
		direction: "right",
		click: (atom) => {
			
			if (atom.parent.isPaddle) {
				atom.parent.pinhole.locked = !atom.parent.pinhole.locked
				updatePaddleRule(atom.parent)
				return
			}

			if (atom.expanded) {
				atom.unexpand(atom)
			}
			else {
				atom.expand(atom)
			}
		},

		expand: (atom) => {
			atom.pad = createChild(atom, TRIANGLE_PAD)
			atom.handle = createChild(atom, TRIANGLE_HANDLE)
			atom.expanded = true

			atom.upPick = createChild(atom, TRIANGLE_PICK_UP)
			atom.downPick = createChild(atom, TRIANGLE_PICK_DOWN)
			
			if (atom.direction === "up") atom.upPick.value = true
			if (atom.direction === "down") atom.downPick.value = true
		},

		unexpand: (atom) => {
			deleteChild(atom, atom.pad)
			deleteChild(atom, atom.handle)
			deleteChild(atom, atom.upPick)
			deleteChild(atom, atom.downPick)
			atom.expanded = false
		},

		highlighter: true,

		// Returns what atom to highlight when being hovered over stuff
		hover: (atom) => {

			atom.highlightedSlot = undefined

			// FIND A PADDLE!???
			if (atom.direction === "right") {

				// Get my bounds
				const {x, y} = atom.getPosition()
				const left = x
				const top = y
				const right = x + atom.width
				const bottom = y + atom.height

				for (const paddle of paddles) {

					// Don't pick hidden or filled paddles
					if (!paddle.expanded) continue
					if (paddle.pinhole.locked) continue
					if (paddle.rightTriangle !== undefined) continue

					// Get paddle bounds
					const {x: px, y: py} = paddle.getPosition()
					const pleft = px
					const pright = px + paddle.width
					const ptop = py
					const pbottom = py + paddle.height

					// Check if I am hovering over the paddle
					if (left > pright) continue
					if (right < pleft) continue
					if (top > pbottom) continue
					if (bottom < ptop) continue

					// Return the highlight and the highlighted atom (the paddle)
					return paddle
				}
			}

			// FIND A SQUARE TO STAMP????
			if (true) {
				
				const {x, y} = atom.getPosition()
				const left = x
				const top = y
				const right = x + atom.width
				const bottom = y + atom.height

				const others = getAllBaseAtoms()
				for (const other of others) {
					if (!other.isSquare) continue
					
					const {x: px, y: py} = other.getPosition()
					const pleft = px
					const pright = px + other.width
					const ptop = py
					const pbottom = py + other.height
					
					if (left > pright) continue
					if (right < pleft) continue
					if (top > pbottom) continue
					if (bottom < ptop) continue

					return other
				}

				// FIND A CHANNEL????
				let winningDistance = Infinity
				let winningSquare = undefined
				let winningSlot = undefined

				const atoms = getAllBaseAtoms()
				for (const other of atoms) {
					if (other === atom) continue
					if (!other.isSquare) continue
					if (!other.expanded) continue

					const {x: px, y: py} = other.pickerPad.getPosition()
					const pleft = px
					const pright = px + other.pickerPad.width
					const ptop = py
					const pbottom = py + other.pickerPad.height

					if (left > pright) continue
					if (right < pleft) continue
					if (bottom < ptop) continue
					if (top > pbottom) continue

					const slots = ["red", "green", "blue"].filter(slot => other[slot] === undefined)
					if (slots.length === 0) continue
					const {x: ax, y: ay} = other.getPosition()

					for (const slot of slots) {
						const slotId = CHANNEL_IDS[slot]
						const sx = ax + other.size + OPTION_MARGIN*2 + slotId*(COLOURTODE_SQUARE.size + COLOURTODE_PICKER_PAD_MARGIN)
						const sy = ay + OPTION_MARGIN
						const distance = Math.hypot(x - sx, y - sy)
						if (distance < winningDistance) {
							winningDistance = distance
							winningSlot = slot
							winningSquare = other
						}
					}

					if (winningSquare !== undefined) {

						const {x: ax, y: ay} = winningSquare.getPosition()
						const slotId = CHANNEL_IDS[winningSlot]

						if (atom.highlight !== undefined) {
							deleteChild(atom, atom.highlight)
							atom.highlight = undefined
						}

						atom.highlight = createChild(atom, HIGHLIGHT, {bottom: true})
						atom.highlight.hasBorder = true
						atom.highlight.x = ax + winningSquare.size + OPTION_MARGIN + slotId*(OPTION_MARGIN+winningSquare.size)
						atom.highlight.y = ay
						atom.highlight.width = OPTION_MARGIN*2+winningSquare.size
						atom.highlightedAtom = winningSquare
						atom.highlightedSlot = winningSlot
					}
				}

				return winningSquare

				// return
			}

			return undefined
		},

		updateValue: (atom) => {
			if (atom.direction === "up" || atom.direction === "down") {
				atom.variable = atom.highlightedSlot
			} else if (atom.direction === "left") {
				if (atom.highlightedSlot === "red") atom.variable = "blue"
				else if (atom.highlightedSlot === "green") atom.variable = "red"
				else if (atom.highlightedSlot === "blue") atom.variable = "green"
			} else if (atom.direction === "right") {
				if (atom.highlightedSlot === "red") atom.variable = "green"
				else if (atom.highlightedSlot === "green") atom.variable = "blue"
				else if (atom.highlightedSlot === "blue") atom.variable = "red"
			}
			const add = atom.direction === "up" ? DragonNumber.fromInt(1) : undefined
			const subtract = atom.direction === "down" ? DragonNumber.fromInt(1) : undefined
			const value = new DragonNumber({channel: atom.channelId, variable: atom.variable, add, subtract})
			atom.value = value
		},

		place: (atom, receiver) => {

			if (receiver.isSquare && atom.highlightedSlot !== undefined) {
				atom.channelId = CHANNEL_IDS[atom.highlightedSlot]
				atom.updateValue(atom)

				const square = receiver
				square.receiveNumber(square, atom.value, atom.channelId, {expanded: atom.expanded, numberAtom: atom})
				atomRegistry.delete(atom)
				atom.dx = 0
				atom.dy = 0
				return
			}

			if (receiver.isSquare) {
				const square = receiver

				if (square.stamp === undefined) {
					square.stamp = "circle"
					square.value.stamp = "circle"
					square.needsColoursUpdate = true
				} else {
					square.stamp = undefined
					square.value.stamp = undefined
					square.needsColoursUpdate = true
				}

				const diagramCell = new DiagramCell({content: square.value})
				state.brush.colour = new Diagram({left: [diagramCell]})

				squareTool.toolbarNeedsColourUpdate = true
				circleTool.toolbarNeedsColourUpdate = true
				triangleTool.toolbarNeedsColourUpdate = true
				// wideRectangleTool.toolbarNeedsColourUpdate = true
				tallRectangleTool.toolbarNeedsColourUpdate = true

				if (square.parent.isPaddle) {
					updatePaddleRule(square.parent)
				}
				return
			}
			
			if (receiver.isPaddle) {
				const paddle = receiver
				giveChild(paddle, atom)
				paddle.rightTriangle = atom
				atom.x = PADDLE.width/2 - atom.width/2
				atom.y = PADDLE.height/2 - atom.height/2
				atom.dx = 0
				atom.dy = 0

				atom.hasBorder = false
				paddle.pinhole.locked = atom.colour === Colour.splash(999)

				for (const cellAtom of paddle.cellAtoms) {
					if (cellAtom.slotted !== undefined) {
						atomRegistry.register(cellAtom.slotted)
						giveChild(paddle, cellAtom.slotted)
					}
				}

				updatePaddleSize(paddle)

				if (atom.expanded) {
					atom.unexpand(atom)
				}

				atom.attached = true

				unlockMenuTool("circle")
			}

		},

		rightDraggable: true,
		rightDrag: (atom) => {
			const clone = new Atom(COLOURTODE_TRIANGLE)
			clone.direction = atom.direction
			const {x, y} = atom.getPosition()
			hand.offset.x -= atom.x - x
			hand.offset.y -= atom.y - y
			clone.x = x
			clone.y = y
			atomRegistry.register(clone)
			return clone
		},

		drag: (atom) => {

			if (atom.parent.isSquare) {
				const square = atom.parent
				atom.attached = false
				square[atom.highlightedSlot] = undefined
				freeChild(square, atom)
				square.receiveNumber(square, undefined, atom.channelId)
				return atom
			}

			if (!atom.parent.isPaddle) return atom
			const paddle = atom.parent
			// 	clone.direction = atom.direction
			// 	clone.x = x
			// 	clone.y = y
			// }

			atom.attached = false
			freeChild(paddle, atom)
			paddle.rightTriangle = undefined

			for (const cellAtom of paddle.cellAtoms) {
				if (cellAtom.slotted !== undefined) {
					const {x, y} = cellAtom.slotted.getPosition()
					freeChild(paddle, cellAtom.slotted)
					cellAtom.slotted.cellAtom = undefined
					cellAtom.slotted.attached = false
					cellAtom.slotted.x = x
					cellAtom.slotted.y = y
					cellAtom.slotted.slottee = false
					cellAtom.slotted = undefined
				}
			}

			if (atom.colour !== Colour.splash(999)) {
				atom.hasBorder = true
				atom.borderColour = Colour.Grey
			}

			paddle.pinhole.locked = false

			updatePaddleSize(paddle)
			return atom
		},

	}

	const OPTION_MARGIN = 10
	const CHANNEL_HEIGHT = COLOURTODE_SQUARE.size - OPTION_MARGIN*2
	const OPTION_SPACING = CHANNEL_HEIGHT + OPTION_MARGIN

	const COLOURTODE_PICKER_PAD_MARGIN = OPTION_MARGIN
	const COLOURTODE_PICKER_PAD = {
		draw: COLOURTODE_RECTANGLE.draw,
		overlaps: COLOURTODE_RECTANGLE.overlaps,
		offscreen: COLOURTODE_RECTANGLE.offscreen,
		grab: (atom) => atom.parent,
		colour: Colour.Grey,
		width: COLOURTODE_PICKER_PAD_MARGIN + 3*(COLOURTODE_SQUARE.size + COLOURTODE_PICKER_PAD_MARGIN),
		height: COLOURTODE_SQUARE.size,
		y: 0,
		x: COLOURTODE_SQUARE.size + COLOURTODE_PICKER_PAD_MARGIN,
		dragOnly: true,
		isPicker: true,
	}

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

	// Ctrl+F: redef
	const COLOURTODE_PICKER_CHANNEL = {
		
		//behindChildren: true,
		hasBorder: true,
		draw: COLOURTODE_RECTANGLE.draw,
		overlaps: COLOURTODE_RECTANGLE.overlaps,
		offscreen: COLOURTODE_RECTANGLE.offscreen,
		width: COLOURTODE_SQUARE.size,
		y: (COLOURTODE_SQUARE.size - CHANNEL_HEIGHT)/2,
		height: CHANNEL_HEIGHT,
		
		grab: (atom) => {
			return atom
		},

		rightDraggable: true,
		rightDrag: (atom) => {
			const clone = new Atom(COLOURTODE_PICKER_CHANNEL)
			atomRegistry.register(clone)
			const {x, y} = atom.getPosition()
			hand.offset.x -= atom.x - x
			hand.offset.y -= atom.y - y
			clone.value = atom.value.clone()
			if (atom.expanded) {
				clone.createOptions(clone)
				clone.expanded = true
			}
			return clone
		},

		drag: (atom) => {
			if (atom.parent.isSquare) {
				const square = atom.parent
				square[atom.channelSlot] = undefined
				const channelId = CHANNEL_IDS[atom.channelSlot]
				square.receiveNumber(square, undefined, channelId)
				freeChild(square, atom)
				atom.channelSlot = CHANNEL_NAMES[atom.value.channel]
				atom.updateColours(atom)
				atom.attached = false

				
				atom.needsColoursUpdate = true
				atom.colourTicker = Infinity

				// unlockMenuTool("wide_rectangle")
			}

			else if (atom.parent.isTallRectangle) {
				const diamond = atom.parent
				freeChild(diamond, atom)
				diamond.operationAtoms[atom.highlightedSlot] = undefined
				const operationName = atom.highlightedSlot === "padTop"? "add" : "subtract"
				diamond.value[operationName] = undefined
				atom.attached = false
				if (diamond.expanded) {
					diamond.unexpand(diamond)
					diamond.expand(diamond)
				} else {
					const handle = atom.highlightedSlot === "padTop"? "handleTop" : "handleBottom"
					deleteChild(diamond, diamond[handle], {quiet: true})
					deleteChild(diamond, diamond[atom.highlightedSlot], {quiet: true})
					diamond.expand(diamond)
					diamond.unexpand(diamond)
				}
			}

			else if (atom.parent.isPaddle) {
				const paddle = atom.parent
				paddle.chance = undefined
				freeChild(paddle, atom)
				updatePaddleSize(paddle)
			}

			return atom
		},

		construct: (atom) => {
			const values = [false, false, false, false, false, false, false, false, false, true]
			const channel = Random.Uint8 % 3
			atom.value = new DragonNumber({values, channel})
			atom.needsColoursUpdate = true
			atom.colourId = 0
			atom.dcolourId = 1
			atom.colourTicker = Infinity

			atom.selectionBack = createChild(atom, COLOURTODE_CHANNEL_SELECTION_SIDE)

			const selectionTop = createChild(atom, COLOURTODE_CHANNEL_SELECTION_END)
			atom.selectionTop = selectionTop
			atom.selectionTop.isTop = true
			selectionTop.dragOnly = false

			const selectionBottom = createChild(atom, COLOURTODE_CHANNEL_SELECTION_END)
			atom.selectionBottom = selectionBottom
			atom.selectionBottom.isTop = false
			selectionBottom.dragOnly = false

			atom.positionSelection(atom)
		},

		positionSelection: (atom, start, end, top, bottom) => {
			
			if (!atom.expanded) {

				atom.selectionTop.y = -atom.selectionTop.height
				
				atom.selectionBottom.y = atom.height

			}
			
			else {
				const optionSpacing = OPTION_SPACING

				atom.selectionTop.y = end - atom.selectionTop.height
				atom.selectionBottom.y = start + optionSpacing - atom.selectionBottom.height

				atom.selectionTop.minY = top - atom.selectionTop.height
				atom.selectionTop.maxY = atom.selectionBottom.y - optionSpacing

				atom.selectionBottom.minY = atom.selectionTop.y + optionSpacing
				atom.selectionBottom.maxY = bottom - atom.selectionBottom.height + optionSpacing
			}

			atom.positionSelectionBack(atom)

			// bring selectors to front!
			const selectionTopId = atom.children.indexOf(atom.selectionTop)
			atom.children.splice(selectionTopId, 1)
			atom.children.push(atom.selectionTop)

			const selectionBottomId = atom.children.indexOf(atom.selectionBottom)
			atom.children.splice(selectionBottomId, 1)
			atom.children.push(atom.selectionBottom)

			if (atom.parent.isTallRectangle) {
				const operationName = atom.highlightedSlot === "padTop"? "add" : "subtract"
				atom.parent.value[operationName] = atom.value
			}

		},

		positionSelectionBack: (atom) => {
			atom.selectionBack.x = -COLOURTODE_CHANNEL_SELECTION_END.height
			atom.selectionBack.y = atom.selectionTop.y
			atom.selectionBack.height = atom.selectionBottom.y - atom.selectionTop.y + atom.selectionTop.height
			atom.selectionBack.width = atom.width + COLOURTODE_CHANNEL_SELECTION_END.height*2
		},

		update: (atom) => {

			if (atom.expanded) {
				if (atom.needsColoursUpdate) {
					atom.needsColoursUpdate = false
					atom.isGradient = true
					atom.gradient = getGradientImageFromColours({
						colours: atom.colours,
						width: atom.width * CT_SCALE,
						height: atom.height * CT_SCALE,
						gradient: atom.gradient
					})
					atom.updateColours(atom)
				}
			}

			if (!atom.expanded && atom.needsColoursUpdate) {
				atom.needsColoursUpdate = false
				
				if (atom.parent.isSquare) {
					
					const channels = []

					for (let i = 0; i < 3; i++) {
						if (i === atom.value.channel) {
							channels[i] = atom.value
						}
						else {
							const values = [true, false, false, false, false, false, false, false, false, false]
							channels[i] = new DragonNumber({values, channel: i})
						}
					}
					
					const array = new DragonArray({channels})
					atom.colours = array.getSplashes()

				}
				else {

					let array = undefined

					for (let i = 0; i < 10; i++) {
						const v = atom.value.values[i]
						if (v === false) continue
						const join = DragonArray.fromSplash(`${i}${i}${i}`)
						if (array === undefined) {
							array = join
						} else {
							array.joins.push(join)
						}
					}

					atom.colours = array.getSplashes()
				}

				atom.isGradient = true
				atom.gradient = getGradientImageFromColours({
					colours: atom.colours,
					width: atom.width * CT_SCALE,
					height: atom.height * CT_SCALE,
					gradient: atom.gradient
				})
			}

			atom.highlightedAtom = undefined
			if (hand.content === atom && hand.state === HAND.DRAGGING) {

				const {x, y} = atom.getPosition()
				let left = x
				let top = y
				let right = x + atom.width
				let bottom = y + atom.height

				if (atom.highlight !== undefined) {
					deleteChild(atom, atom.highlight)
					atom.highlight = undefined
				}

				let winningDistance = Infinity
				let winningSquare = undefined
				let winningSlot = undefined

				const atoms = getAllBaseAtoms()
				for (const square of atoms) {

					const other = square
					if (other.isTallRectangle) {
						if (!other.expanded) continue
						const slotNames = ["padTop", "padBottom"]
						for (const slotName of slotNames) {
							
							let endAtom = other
	
							while (endAtom.isTallRectangle && endAtom.operationAtoms[slotName] !== undefined) {
								endAtom = endAtom.operationAtoms[slotName]
							}
							
							if (!endAtom.isTallRectangle) continue
							if (!endAtom.expanded) continue
	
							const slot = endAtom[slotName]
							const {x: px, y: py} = slot.getPosition()
							const pleft = px
							const pright = px + slot.width
							const ptop = py
							const pbottom = py + slot.height
	
							if (left > pright) continue
							if (right < pleft) continue
							if (bottom < ptop) continue
							if (top > pbottom) continue
	
							atom.highlightedSlot = slotName
							atom.highlightedAtom = slot
							break
	
						}
					} else {

						if (!square.isSquare) continue
						if (!square.expanded) continue

						const {x: px, y: py} = square.pickerPad.getPosition()

						const pleft = px
						const pright = px + square.pickerPad.width
						const ptop = py
						const pbottom = py + square.pickerPad.height

						if (left > pright) continue
						if (right < pleft) continue
						if (bottom < ptop) continue
						if (top > pbottom) continue

						const slots = ["red", "green", "blue"].filter(slot => square[slot] === undefined)
						if (slots.length === 0) continue
						
						const {x: ax, y: ay} = square.getPosition()

						for (const slot of slots) {
							const slotId = CHANNEL_IDS[slot]
							const sx = ax + square.size + OPTION_MARGIN*2 + slotId*(COLOURTODE_SQUARE.size + COLOURTODE_PICKER_PAD_MARGIN)
							const sy = ay + OPTION_MARGIN
							const distance = Math.hypot(x - sx, y - sy)
							if (distance < winningDistance) {
								winningDistance = distance
								winningSquare = square
								winningSlot = slot
							}
						}
					}

				}

				if (winningSquare !== undefined) {

					const {x: ax, y: ay} = winningSquare.getPosition()
					const slotId = CHANNEL_IDS[winningSlot]

					atom.highlight = createChild(atom, HIGHLIGHT, {bottom: true})
					atom.highlight.hasBorder = true
					atom.highlight.x = ax + winningSquare.size + OPTION_MARGIN + slotId*(OPTION_MARGIN+winningSquare.size)
					atom.highlight.y = ay
					atom.highlight.width = OPTION_MARGIN*2+winningSquare.size
					atom.highlightedAtom = winningSquare
					atom.highlightedSlot = winningSlot
				} else if (atom.highlightedAtom) {
					const {x: ax, y: ay} = atom.highlightedAtom.getPosition()

					atom.highlight = createChild(atom, HIGHLIGHT, {bottom: true})
					atom.highlight.hasBorder = true
					atom.highlight.x = ax
					atom.highlight.y = ay
					atom.highlight.width = atom.highlightedAtom.width
					atom.highlight.height = atom.highlightedAtom.height
				} else {

					
				}

			}
			
			if (atom.highlightedAtom === undefined && atom.highlight !== undefined) {
				deleteChild(atom, atom.highlight)
				atom.highlight = undefined
			}
			
			

		},

		drop: (atom) => {
			if (atom.highlight !== undefined) {

				if (atom.highlightedAtom.isSquare) {
					const square = atom.highlightedAtom
					const slotId = CHANNEL_IDS[atom.highlightedSlot]
					atom.value.channel = slotId
					
					square.receiveNumber(square, atom.value, slotId, {expanded: atom.expanded})
					atomRegistry.delete(atom)
				} else {
					const diamond = atom.highlightedAtom.parent
					
					const operationName = atom.highlightedSlot === "padTop"? "add" : "subtract"
					diamond.value[operationName] = atom.value
					diamond.operationAtoms[atom.highlightedSlot] = atom
					atom.x = atom.highlightedAtom.x + OPTION_MARGIN
					atom.y = atom.highlightedAtom.y + atom.highlightedAtom.height/2 - atom.height/2
					atom.dx = 0
					atom.dy = 0
					giveChild(diamond, atom)

					atom.attached = true

				}
			} else if (atom.highlightPaddle !== undefined) {
				const paddle = atom.highlightedPaddle
				atom.attached = true
				giveChild(paddle, atom)
				
				paddle.chance = atom
				updatePaddleSize(paddle)
				
				atom.dx = 0
				atom.dy = 0
			}
			
			// unlockMenuTool("hexagon")
			//unlockMenuTool("tall_rectangle")
			unlockMenuTool("triangle")
		},

		click: (atom) => {
			if (!atom.expanded) {
				atom.expanded = true
				atom.colourId = 0
				atom.colourTicker = Infinity
				atom.needsColoursUpdate = true
				atom.createOptions(atom)
			}
			else {
				atom.expanded = false
				atom.deleteOptions(atom)
				atom.needsColoursUpdate = true
			}
		},

		deleteOptions: (atom) => {

			if (atom.options !== undefined) {
				atom.deletedOptions = atom.options
			}

			for (const option of atom.options) {
				if (atom !== option) deleteChild(atom, option)
			}
			atom.needsColoursUpdate = true
			atom.colourTicker = Infinity
			atom.positionSelection(atom)
		},

		updateColours: (atom) => {
			let parentR = undefined
			let parentG = undefined
			let parentB = undefined

			if (atom.parent.isSquare) {

				let redNumber = atom.parent.value.channels[0]
				let greenNumber = atom.parent.value.channels[1]
				let blueNumber = atom.parent.value.channels[2]

				if (redNumber === undefined) redNumber = new DragonNumber({channel: 0, values: [true, false, false, false, false, false, false, false, false, false]})
				if (greenNumber === undefined) greenNumber = new DragonNumber({channel: 1, values: [true, false, false, false, false, false, false, false, false, false]})
				if (blueNumber === undefined) blueNumber = new DragonNumber({channel: 2, values: [true, false, false, false, false, false, false, false, false, false]})

				parentR = new DragonNumber({values: [...redNumber.values], channel: redNumber.channel})
				parentG = new DragonNumber({values: [...greenNumber.values], channel: greenNumber.channel})
				parentB = new DragonNumber({values: [...blueNumber.values], channel: blueNumber.channel})
			}
			else {
				const values = [false, false, false, false, false, false, false, false, false, false]
				parentR = new DragonNumber({values: [...values], channel: 0})
				parentG = new DragonNumber({values: [...values], channel: 1})
				parentB = new DragonNumber({values: [...values], channel: 2})
			}

			const parentChannels = [parentR, parentG, parentB]
			const mainParentChannel = parentChannels[CHANNEL_IDS[atom.channelSlot]]
			if (mainParentChannel !== undefined) mainParentChannel.values = [false, false, false, false, false, false, false, false, false, false]

			if (atom.options !== undefined && atom.options.length > 0) {
				for (let i = 0; i < 10; i++) {

					const option = atom.options[i]
					
					if (atom.parent.isSquare) {
						mainParentChannel.values[9-i] = true
						if (i > 0) mainParentChannel.values[9-i+1] = false
					} else {
						for (const c of parentChannels) {
							c.values[9-i] = true
							if (i > 0) c.values[9-i+1] = false
						}
					}

					const baseArray = new DragonArray({channels: parentChannels})

					const colours = baseArray.getSplashes()

					option.colours = colours
					option.colourTicker = Infinity
					if (option !== atom) {
						option.needsColoursUpdateCountdown = i
						option.needsColoursUpdate = false
						//option.needsColoursUpdate = true
						//option.updateColours(option)
					}
				}
			}
		},

		getCenterId: (atom) => {
			let startId = undefined
			let endId = undefined
	
			for (let i = 0; i < atom.value.values.length; i++) {
				const value = atom.value.values[i]
				if (value) {
					if (startId === undefined) startId = i
					endId = i
				}
			}
			return Math.round((endId + startId) / 2)
		},

		getStartAndEndId: (atom) => {
			let startId = undefined
			let endId = undefined
	
			for (let i = 0; i < atom.value.values.length; i++) {
				const value = atom.value.values[i]
				if (value) {
					if (startId === undefined) startId = i
					endId = i
				}
			}
			return [startId, endId]
		},

		createOptions: (atom) => {

			const oldOptions = atom.parent.isSquare ? atom.deletedOptions : undefined
			atom.options = []

			let startId = undefined
			let endId = undefined
	
			for (let i = 0; i < atom.value.values.length; i++) {
				const value = atom.value.values[i]
				if (value) {
					if (startId === undefined) startId = i
					endId = i
				}
			}
	
			if (startId === undefined) throw new Error("[ColourTode] Number cannot be NOTHING. Please let @TodePond know if you see this error!")
			const centerOptionId = atom.getCenterId(atom)
			
			const optionSpacing = OPTION_SPACING
			let top = (centerOptionId - 9) * optionSpacing
			let bottom = centerOptionId*optionSpacing

			
			const start = top + (9-startId) * optionSpacing
			const end = top + (9-endId) * optionSpacing

			for (let i = 0; i < 10; i++) {
				if (centerOptionId === 9-i) {
					if (oldOptions !== undefined) {
					}
					atom.options.push(atom)
					continue
				}

				const pityTop = i !== 9 - endId + 1
				const pityBottom = i !== 9 - startId - 1
				const option = createChild(atom, {...COLOURTODE_PICKER_CHANNEL_OPTION, pityTop, pityBottom})
				
				if (oldOptions !== undefined) {
					option.isGradient = oldOptions[i].isGradient
					option.gradient = oldOptions[i].gradient
				}

				option.y = top + i * optionSpacing
				option.value = 9 - i
				//option.needsColoursUpdate = true
				option.needsColoursUpdateCountdown = i
				option.needsColoursUpdate = true
				//option.updateColours(option)
				atom.options.push(option)
			}


			atom.positionSelection(atom, start, end, top, bottom)
			
			atom.updateColours(atom)
		}
	}

	// Ctrl+F: exdef
	const MAGIC_NUMBER = 0.8660254
	const MINUS_MAGIC_NUMBER = (1 - MAGIC_NUMBER)
	const COLOURTODE_HEXAGON = {
		colour: Colour.Black,
		hasBorder: true,
		borderColour: Colour.Grey,
		width: COLOURTODE_PICKER_CHANNEL.width,
		height: COLOURTODE_PICKER_CHANNEL.width,
		overlaps: COLOURTODE_RECTANGLE.overlaps,
		offscreen: COLOURTODE_RECTANGLE.offscreen,
		draw: (atom, ctx) => {
			const {x, y} = atom.getPosition()
			const {width, height} = atom
			let points = [
				[x + width*MINUS_MAGIC_NUMBER*2, y],
				[x + width*(MAGIC_NUMBER-MINUS_MAGIC_NUMBER), y],
				[x + width, y + height*MAGIC_NUMBER/2],
				[x + width*(MAGIC_NUMBER-MINUS_MAGIC_NUMBER), y + height*MAGIC_NUMBER],
				[x + width*MINUS_MAGIC_NUMBER*2, y + height*MAGIC_NUMBER],
				[x, y + height*MAGIC_NUMBER/2],
			]

			points = points.map(([x, y]) => [x, y + MINUS_MAGIC_NUMBER/2*height])

			const extraSegmentCorners = []
			for (let i = 0; i < 6; i++) {
				const nextId = wrap(i+1, 0, 5)
				const point = points[i]
				const next = points[nextId]
				const mid = [0, 1].map(axis => (point[axis] + next[axis])/2)
				extraSegmentCorners.push(mid)
			}

			const center = [x+width/2, y+height/2]
			const segmentPoints = points.map((p, i) => {
				const offset = 1
				const id = wrap(i+offset, 0, 5)
				const point = points[wrap(i+offset+1, 0, 5)]
				const nextId = wrap(i+offset+1, 0, 5)
				const nextMid = extraSegmentCorners[nextId]
				const mid = extraSegmentCorners[id]
				return [center, mid, point, nextMid]
			})

			const [head, ...tail] = points

			const path = new Path2D()
			path.moveTo(...head)
			for (const point of tail) {
				path.lineTo(...point)
			}
			path.closePath()

			ctx.fillStyle = atom.colour
			ctx.fill(path)

			if (atom.ons !== undefined) {
				for (let i = 0; i < 6; i++) {
					if (!atom.ons[i]) continue
					const [shead, ...stail] = segmentPoints[i]
					const spath = new Path2D()
					spath.moveTo(...shead)
					for (const point of stail) {
						spath.lineTo(...point)
					}
					spath.closePath()
					ctx.fillStyle = Colour.Silver
					ctx.fill(spath)
					ctx.lineWidth = 1 / CT_SCALE
					ctx.strokeStyle = Colour.Silver
					ctx.stroke(spath)
				}
			}

			if (atom.hasBorder) {
				ctx.lineWidth = BORDER_THICKNESS*1.5
				ctx.strokeStyle = atom.borderColour
				ctx.stroke(path)

				if (atom.parent.isSquare) {
					SYMMETRY_TOGGLE_Y.drawY(atom, ctx, atom.size - 8, 4)
				}
			}
		},
		getValue: (atom) => {
			let score = 0
			for (const on of atom.ons) {
				if (on) score++
			}
			return score
		},
		click: (atom) => {
			if (atom.expanded) {
				atom.unexpand(atom)
			} else {
				atom.expand(atom)
			}
		},
		unexpand: (atom) => {
			atom.expanded = false
			for (const thing of atom.handles) {
				deleteChild(atom, thing)
			}
			for (const thing of atom.buttons) {
				deleteChild(atom, thing)
			}

			atom.handles = []
			atom.buttons = []
		},
		expand: (atom) => {
			atom.expanded = true
			atom.handles = []
			atom.buttons = []


			const {width, height} = atom

			const edge = width*MINUS_MAGIC_NUMBER*1.67
			const handlePositions = [
				[width, height/2 - HEXAGON_HANDLE.height/2],
				[width - edge, height  - HEXAGON_HANDLE.height/2],
				[edge, height  - HEXAGON_HANDLE.height/2],
				[0, height/2  - HEXAGON_HANDLE.height/2],
				[edge, 0 - HEXAGON_HANDLE.height/2],
				[width - edge, 0 - HEXAGON_HANDLE.height/2],
			]

			let buttonPositions = [
				[width, height/2],
				[width - edge, height],
				[edge, height],
				[0, height/2],
				[edge, 0],
				[width - edge, 0],
			]

			buttonPositions = buttonPositions.map(([x, y], i) => {
				const [tx, ty] = [x - atom.width/2, y - atom.height/2]
				let [sx, sy] = []
				if (i % 3 === 0) {
					;[sx, sy] = [tx * 2.2, ty * 2.2]
				} else {
					;[sx, sy] = [tx * 2, ty * 2]
				}
				return [sx + atom.width/2, sy + atom.height/2]
			})

			for (let i = 0; i < 6; i++) {
				const handle = createChild(atom, HEXAGON_HANDLE)
				handle.rotation = i
				handle.x = handlePositions[i][0] - HEXAGON_HANDLE.width/2
				handle.y = handlePositions[i][1]
				atom.handles.push(handle)
				
				const button = createChild(atom, HEXAGON_BUTTON)
				button.x = buttonPositions[i][0] - HEXAGON_BUTTON.size/2
				button.y = buttonPositions[i][1] - HEXAGON_BUTTON.size/2
				atom.buttons.push(button)
				button.id = i

				if (atom.ons[i]) {
					button.inner.selected = true
					button.inner.colour = Colour.Silver
				}
				
			}
		},
		construct: (atom) => {
			atom.ons = [false, false, false, false, false, false]
		},
		updateValue: (atom) => {
			const channel = CHANNEL_IDS[atom.variable]
			const addZero = !atom.ons[1] && !atom.ons[0] && !atom.ons[5]
			const subtractZero = !atom.ons[2] && !atom.ons[3] && !atom.ons[4]
			const bothZero = !addZero && !subtractZero
			const addValues = [addZero || bothZero, atom.ons[1], atom.ons[0], atom.ons[5], false, false, false, false, false, false]
			const subtractValues = [subtractZero || bothZero, atom.ons[2], atom.ons[3], atom.ons[4], false, false, false, false, false, false]
			const add = new DragonNumber({values: addValues})
			const subtract = new DragonNumber({values: subtractValues})
			
			const value = new DragonNumber({channel, variable: atom.variable, add, subtract})
			atom.value = value
		},
		hover: (atom) => {

			const {x, y} = atom.getPosition()
			let left = x
			let top = y
			let right = x + atom.width
			let bottom = y + atom.height

			for (const paddle of paddles) {
				const {x: px, y: py} = paddle.getPosition()
				const pright = px + paddle.width
				const ptop = py
				const pbottom = py + paddle.height

				if (paddle.chance === undefined && paddle.expanded && left <= pright && right >= pright && ((top < pbottom && top > ptop) || (bottom > ptop && bottom < pbottom))) {
					if (atom.highlightPaddle !== undefined) {
						deleteChild(atom, atom.highlightPaddle)
					}

					atom.highlight = createChild(atom, HIGHLIGHT, {bottom: true})
					atom.highlight.width = HIGHLIGHT_THICKNESS
					atom.highlight.height = paddle.height
					atom.highlight.y = ptop
					atom.highlight.x = pright - HIGHLIGHT_THICKNESS/2
					return paddle
				}
			}
			





			// 			winningDistance = distance
			// 			winningSlot = slot
			// 			winningSquare = other
			// 		}
			// 	}



			// 	}
			// }

		},
		place: (atom, paddle) => {
			if (paddle.isPaddle) {
				atom.attached = true
				giveChild(paddle, atom)
				
				paddle.chance = atom
				updatePaddleSize(paddle)
				
				atom.dx = 0
				atom.dy = 0
			} 
			// else if (paddle.isSquare) {
			// 	square.receiveNumber(square, atom.value, slotId, {expanded: atom.expanded, numberAtom: atom})
			// }
		},
		drag: (atom) => {
			if (atom.parent.isPaddle) {
				const paddle = atom.parent
				freeChild(paddle, atom)
				paddle.chance = undefined
				updatePaddleSize(paddle)
			} else if (atom.parent.isSquare) {
				const square = atom.parent
				square[atom.variable] = undefined
				const channelId = CHANNEL_IDS[atom.variable]
				square.receiveNumber(square, undefined, channelId)
				freeChild(square, atom)
				atom.attached = false
			}

			return atom
		},
		rightDraggable: true,
		rightDrag: (atom) => {
			const clone = atom.clone(atom)
			atomRegistry.register(clone)
			hand.offset.x -= atom.x - clone.x
			hand.offset.y -= atom.y - clone.y
			return clone
		},
		clone: (atom) => {
			const clone = new Atom(COLOURTODE_HEXAGON)
			for (let i = 0; i < 6; i++) {
				clone.ons[i] = atom.ons[i]
			}
			if (atom.expanded) {
				clone.expand(clone)
			}
			const {x, y} = atom.getPosition()
			clone.x = x
			clone.y = y
			return clone
		}
	}

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

	const HEXAGON_BUTTON = {
		size: COLOURTODE_SQUARE.size,
		offscreen: CIRCLE.offscreen,
		overlaps: CIRCLE.overlaps,
		colour: Colour.Grey,
		grab: (atom) => atom.parent,
		behindChildren: true,
		draw: (atom, ctx) => {
			CIRCLE.draw(atom, ctx)
		},
		construct: (atom) => {
			atom.inner = createChild(atom, HEXAGON_BUTTON_INNER, {bottom: false})
			atom.inner.x = atom.width/2 - atom.inner.width/2
			atom.inner.y = atom.height/2 - atom.inner.height/2
		},
		click: (atom) => {
			if (atom.inner.selected) {
				atom.inner.selected = false
				atom.inner.colour = Colour.Grey
			} else {
				atom.inner.selected = true
				atom.inner.colour = Colour.Silver
			}

			const hexagon = atom.parent
			hexagon.ons[atom.id] = atom.inner.selected
			
			if (hexagon.parent.isPaddle) {
				const paddle = hexagon.parent
				updatePaddleSize(paddle)
			} else if (hexagon.parent.isSquare) {
				const square = hexagon.parent
				hexagon.updateValue(hexagon)
				const slotId = CHANNEL_IDS[hexagon.variable]
				square.receiveNumber(square, hexagon.value, slotId, {expanded: hexagon.expanded, numberAtom: hexagon})
			}

			atomRegistry.bringToFront(atom.parent)
		}
	}

	const HEXAGON_BUTTON_INNER = {
		size: COLOURTODE_SQUARE.size * 2/3,
		offscreen: CIRCLE.offscreen,
		overlaps: CIRCLE.overlaps,
		grab: (atom) => atom.parent,
		touch: (atom) => atom.parent,
		draw: CIRCLE.draw,
		hasBorder: true,
		borderColour: Colour.Black,
		colour: Colour.Grey,
	}

	const HEXAGON_HANDLE = {
		offscreen: COLOURTODE_RECTANGLE.offscreen,
		overlaps: (atom, x, y) => {
			atom.y -= atom.height/2
			atom.height *= 2
			const result = COLOURTODE_RECTANGLE.overlaps(atom, x, y)
			atom.height /= 2
			atom.y += atom.height/2
			return result
		},
		colour: Colour.Grey,
		rotation: 0,
		touch: (atom) => atom.parent,
		grab: (atom) => atom.parent,
		x: 50,
		width: COLOURTODE_SQUARE.size/2 + COLOURTODE_SQUARE.size/4,
		height: COLOURTODE_SQUARE.size / 3,
		draw: (atom, ctx) => {

			const {x, y} = atom.getPosition()
			const {width, height} = atom

			const path = new Path2D()
			let points = [
				[x, y],
				[x+width, y],
				[x+width, y+height],
				[x, y+height],
			]
			
			if (atom.rotation > 0) {
				points = points.map(point => rotate(point, [x+width/2, y+height/2], atom.rotation * Math.PI/3))
			}

			const [head, ...tail] = points

			path.moveTo(...head)
			for (const point of tail) {
				path.lineTo(...point)
			}

			ctx.fillStyle = atom.colour
			ctx.fill(path)
		}
	}

	const COLOURTODE_CHANNEL_SELECTION_END = {
		draw: (atom, ctx) => {
			const {x, y} = atom.getPosition()

			

			

			const X = Math.round(x)
			const Y = Math.round(y)
			const W = Math.round(atom.width)
			const H = Math.round(atom.height)

			ctx.fillStyle = Colour.Grey
			ctx.fillRect(X, Y, W, H)
			
		},
		overlaps: COLOURTODE_RECTANGLE.overlaps,
		offscreen: COLOURTODE_RECTANGLE.offscreen,
		height: OPTION_SPACING - CHANNEL_HEIGHT,
		width: COLOURTODE_SQUARE.size + OPTION_MARGIN*2,
		x: - OPTION_MARGIN,
		//grabbable: false,
		dragOnly: true,
		grab: (atom) => atom.parent.expanded? atom : atom.parent,
		touch: (atom) => atom.parent.expanded? atom : atom.parent,
		cursor: (atom) => {
			return atom.parent.expanded? "ns-resize" : "pointer"
		},
		move: (atom) => {
			atom.parent.positionSelectionBack(atom.parent)
		},
		drop: (atom) => {
			let distanceFromMiddle = Math.round((atom.y+CHANNEL_HEIGHT/2) / OPTION_SPACING)

			const oldNumber = atom.parent.value

			let [startId, endId] = atom.parent.getStartAndEndId(atom.parent)
			let centerId = atom.parent.getCenterId(atom.parent)

			if (atom.isTop) {
				endId = centerId - distanceFromMiddle
			}
			if (!atom.isTop) {
				startId = centerId - (distanceFromMiddle-1)
			}

			const values = [false, false, false, false, false, false, false, false, false, false]
			for (let i = startId; i <= endId; i++) {
				values[i] = true
			}

			const number = new DragonNumber({channel: oldNumber.channel, values})
			atom.parent.value = number
			atom.parent.deleteOptions(atom.parent)
			atom.parent.createOptions(atom.parent)

			atom.dx = 0
			atom.dy = 0

			
			if (atom.parent.parent.isSquare) {
				const square = atom.parent.parent
				const channel = CHANNEL_IDS[atom.parent.channelSlot]
				square.receiveNumber(square, number, channel)
			}

			if (atom.parent.parent.isPaddle) {
				const paddle = atom.parent.parent
				updatePaddleSize(paddle)
			}

		},
		dragLockX: true,
	}

	const COLOURTODE_CHANNEL_SELECTION_SIDE = {
		overlaps: COLOURTODE_RECTANGLE.overlaps,
		offscreen: COLOURTODE_RECTANGLE.offscreen,
		width: (COLOURTODE_SQUARE.size - CHANNEL_HEIGHT)/2,
		height: COLOURTODE_SQUARE.size,
		//grabbable: false,
		grab: (atom) => atom.parent,
		touch: (atom) => atom.parent,
		dragLockX: true,
		draw: COLOURTODE_RECTANGLE.draw,
		colour: Colour.Grey,
	}

	const COLOURTODE_PICKER_CHANNEL_OPTION = {
		draw: COLOURTODE_RECTANGLE.draw,
		overlaps: COLOURTODE_RECTANGLE.overlaps,
		offscreen: COLOURTODE_RECTANGLE.offscreen,
		height: CHANNEL_HEIGHT,
		width: COLOURTODE_SQUARE.size,
		grab: (atom) => atom.parent,
		hasBorder: true,
		
		colourTicker: Infinity,
		colours: [999],
		colourId: 0,
		dcolourId: 1,
		update: (atom) => {

			if (atom.needsColoursUpdateCountdown >= 0) {
				atom.needsColoursUpdateCountdown--
				if (atom.needsColoursUpdateCountdown < 0) {
					atom.needsColoursUpdate = true
				}
			}

			if (atom.needsColoursUpdate) {
				atom.updateColours(atom)
				atom.needsColoursUpdateCountdown = -1
				atom.needsColoursUpdate = false
			}
		},

		getId: (atom) => {			
			const parent = atom.parent
			const centerId = parent.getCenterId(parent)
			const offset = atom.y / OPTION_SPACING
			return centerId - offset
		},

		updateColours: (atom) => {
			atom.isGradient = true
			atom.gradient = getGradientImageFromColours({
				colours: atom.colours,
				width: atom.width * CT_SCALE,
				height: atom.height * CT_SCALE,
				gradient: atom.gradient
			})
		},

		touch: (atom) => {
			const id = atom.getId(atom)
			if (atom.parent.value.values[id]) return atom.parent
			return atom
		},

		click: (atom) => {

			const values = [false, false, false, false, false, false, false, false, false, false]
			values[atom.value] = true
			const number = new DragonNumber({values, channel: atom.parent.value.channel})
			const parent = atom.parent
			parent.value = number
			parent.deleteOptions(parent)
			parent.createOptions(parent)
			parent.needsColoursUpdate = true

			if (parent.parent.isSquare) {
				const square = parent.parent
				const channel = CHANNEL_IDS[parent.channelSlot]
				square.receiveNumber(square, number, channel)
			}

			if (parent.parent.isPaddle) {
				const paddle = parent.parent
				updatePaddleSize(paddle)
			}
		},

		construct: (atom) => {

			if (atom.pityTop) {
				const topPity = createChild(atom, COLOURTODE_OPTION_PADDING)
				topPity.y = -topPity.height
			}

			if (atom.pityBottom) {
				const bottomPity = createChild(atom, COLOURTODE_OPTION_PADDING)
				bottomPity.y = atom.height
			}

			//TODO: add cursor pity on the sides too
		}
	}

	// DIAMOND
	// Ctrl+F: dedef
	const COLOURTODE_TALL_RECTANGLE = {
		behindChildren: true,
		highlighter: true,
		rightDraggable: true,
		rightDrag: (atom) => {
			const clone = new Atom(COLOURTODE_TALL_RECTANGLE)
			atomRegistry.register(clone)
			const {x, y} = atom.getPosition()
			hand.offset.x -= atom.x - x
			hand.offset.y -= atom.y - y
			clone.variable = atom.variable
			if (atom.expanded) {
				clone.expand(clone)
			}
			clone.updateAppearance(clone)
			return clone
		},
		drag: (atom) => {
			if (atom.parent.isSquare) {
				const square = atom.parent
				square[atom.channelSlot] = undefined
				const channelId = CHANNEL_IDS[atom.channelSlot]
				square.receiveNumber(square, undefined, channelId)
				freeChild(square, atom)
				atom.updateAppearance(atom)
				atom.attached = false
			} else if (atom.parent.isTallRectangle) {
				const diamond = atom.parent
				freeChild(diamond, atom)
				diamond.operationAtoms[atom.highlightedSlot] = undefined
				const operationName = atom.highlightedSlot === "padTop"? "add" : "subtract"
				diamond.value[operationName] = undefined
				if (atom.expanded) {
					atom.unexpand(atom)
					atom.expand(atom)
				}
				atom.attached = false
				if (diamond.expanded) {
					diamond.unexpand(diamond)
					diamond.expand(diamond)
				} else {
					const handle = atom.highlightedSlot === "padTop"? "handleTop" : "handleBottom"
					deleteChild(diamond, diamond[handle], {quiet: true})
					deleteChild(diamond, diamond[atom.highlightedSlot], {quiet: true})
					diamond.expand(diamond)
					diamond.unexpand(diamond)
				}
			}
			return atom
		},
		hover: (atom) => {

			const {x, y} = atom.getPosition()
			const left = x
			const top = y
			const right = x + atom.width
			const bottom = y + atom.height

			let winningDistance = Infinity
			let winningSquare = undefined
			let winningSlot = undefined

			const atoms = getAllBaseAtoms()
			for (const other of atoms) {
				if (other === atom) continue

				if (other.isTallRectangle) {
					if (!other.expanded) continue
					const slotNames = ["padTop", "padBottom"]
					for (const slotName of slotNames) {
						
						let endAtom = other

						while (endAtom.isTallRectangle && endAtom.operationAtoms[slotName] !== undefined) {
							endAtom = endAtom.operationAtoms[slotName]
						}
						
						if (!endAtom.isTallRectangle) continue
						if (!endAtom.expanded) continue

						const slot = endAtom[slotName]
						const {x: px, y: py} = slot.getPosition()
						const pleft = px
						const pright = px + slot.width
						const ptop = py
						const pbottom = py + slot.height

						if (left > pright) continue
						if (right < pleft) continue
						if (bottom < ptop) continue
						if (top > pbottom) continue

						atom.highlightedSlot = slotName
						return slot

					}
					continue
				}

				if (!other.isSquare) continue
				if (!other.expanded) continue

				const {x: px, y: py} = other.pickerPad.getPosition()
				const pleft = px
				const pright = px + other.pickerPad.width
				const ptop = py
				const pbottom = py + other.pickerPad.height

				if (left > pright) continue
				if (right < pleft) continue
				if (bottom < ptop) continue
				if (top > pbottom) continue

				const slots = ["red", "green", "blue"].filter(slot => other[slot] === undefined)
				if (slots.length === 0) continue
				const {x: ax, y: ay} = other.getPosition()

				for (const slot of slots) {
					const slotId = CHANNEL_IDS[slot]
					const sx = ax + other.size + OPTION_MARGIN*2 + slotId*(COLOURTODE_SQUARE.size + COLOURTODE_PICKER_PAD_MARGIN)
					const sy = ay + OPTION_MARGIN
					const distance = Math.hypot(x - sx, y - sy)
					if (distance < winningDistance) {
						winningDistance = distance
						winningSlot = slot
						winningSquare = other
					}
				}

				if (winningSquare !== undefined) {

					const {x: ax, y: ay} = winningSquare.getPosition()
					const slotId = CHANNEL_IDS[winningSlot]

					atom.highlight = createChild(atom, HIGHLIGHT, {bottom: true})
					atom.highlight.hasBorder = true
					atom.highlight.x = ax + winningSquare.size + OPTION_MARGIN + slotId*(OPTION_MARGIN+winningSquare.size)
					atom.highlight.y = ay
					atom.highlight.width = OPTION_MARGIN*2+winningSquare.size
					atom.highlightedAtom = winningSquare
					atom.highlightedSlot = winningSlot
				}
				
				return
			}
		},
		place: (atom, highlightedAtom) => {

			atom.attached = true
			atom.dx = 0
			atom.dy = 0

			if (!highlightedAtom.isSquare) {
				const diamond = highlightedAtom.parent
				
				const operationName = atom.highlightedSlot === "padTop"? "add" : "subtract"
				diamond.value[operationName] = atom.value
				diamond.operationAtoms[atom.highlightedSlot] = atom
				atom.x = 0
				atom.y = highlightedAtom.y + highlightedAtom.height/2 - atom.height/2
				giveChild(diamond, atom)

				if (atom.expanded) {
					atom.unexpand(atom)
					atom.expand(atom)
				}

				return
			}

			const square = atom.highlightedAtom
			const slotId = CHANNEL_IDS[atom.highlightedSlot]
			square.receiveNumber(square, atom.value, slotId, {expanded: atom.expanded, numberAtom: atom})
			atomRegistry.delete(atom)
		},
		draw: (atom, ctx) => {
			const {x, y} = atom.getPosition()

			let size = atom.size

			const height = size
			const width = size
			
			const left = (x)
			let right = left + (width)
			let top = (y)
			let bottom = top + (height)
			const middleY = top + (height/2)
			const middleX = left + (width/2)

			ctx.fillStyle = atom.colour
			const path = new Path2D()

			path.moveTo(...[middleX, top].map(n => (n)))
			path.lineTo(...[right, middleY].map(n => (n)))
			path.lineTo(...[middleX, bottom].map(n => (n)))
			path.lineTo(...[left, middleY].map(n => (n)))

			path.closePath()
			ctx.fillStyle = atom.colour
			ctx.fill(path)
			if (atom.hasBorder) {
				ctx.lineWidth = BORDER_THICKNESS
				ctx.strokeStyle = atom.borderColour

				if (atom.isTool) {
					ctx.lineWidth = BORDER_THICKNESS*1.5
					ctx.strokeStyle = toolBorderColours[atom.colour.splash]
				}
				ctx.stroke(path)
			}
		},
		offscreen: COLOURTODE_RECTANGLE.offscreen,
		overlaps: COLOURTODE_RECTANGLE.overlaps,
		hasBorder: true,
		isTallRectangle: true,
		size: CHANNEL_HEIGHT + OPTION_MARGIN/3*2,
		height: CHANNEL_HEIGHT + OPTION_MARGIN/3*2,
		width: CHANNEL_HEIGHT + OPTION_MARGIN/3*2,
		construct: (atom) => {
			atom.variable = CHANNEL_VARIABLES[Random.Uint8 % 3]
			atom.value = new DragonNumber({variable: atom.variable})
			atom.updateAppearance(atom)
			if (!atom.isTool) {
				atom.width += BORDER_THICKNESS/2
				atom.height += BORDER_THICKNESS/2
				atom.size += BORDER_THICKNESS/2
			}
			atom.operationAtoms = {padTop: undefined, padBottom: undefined}

		},
		makeOperationAtoms: (atom) => {
			if (atom.value.add !== undefined) {

				if (atom.operationAtoms.padtop === undefined) {
					if (atom.value.add.variable === undefined) {
						const operationAtom = createChild(atom, COLOURTODE_PICKER_CHANNEL)
						operationAtom.value = atom.value.add
						atom.operationAtoms.padTop = operationAtom
						operationAtom.x = atom.padTop.x + OPTION_MARGIN
						operationAtom.y = atom.padTop.y + atom.padTop.height/2 - operationAtom.height/2
						operationAtom.highlightedSlot = "padTop"
					} else {
						const operationAtom = createChild(atom, COLOURTODE_TALL_RECTANGLE)
						operationAtom.value = atom.value.add
						operationAtom.variable = atom.value.add.variable
						operationAtom.makeOperationAtoms(operationAtom)
						operationAtom.highlightedSlot = "padTop"
						operationAtom.x = 0
						operationAtom.y = atom.padTop.y + atom.padTop.height/2 - operationAtom.height/2
						operationAtom.updateAppearance(operationAtom)
						atom.operationAtoms.padTop = operationAtom
					}
				}
			}

			if (atom.value.subtract !== undefined) {

				if (atom.operationAtoms.padBottom === undefined) {
					if (atom.value.subtract.variable === undefined) {
						const operationAtom = createChild(atom, COLOURTODE_PICKER_CHANNEL)
						operationAtom.value = atom.value.subtract
						atom.operationAtoms.padBottom = operationAtom
						operationAtom.x = atom.padBottom.x + OPTION_MARGIN
						operationAtom.y = atom.padBottom.y + atom.padBottom.height/2 - operationAtom.height/2
						operationAtom.highlightedSlot = "padBottom"
					} else {

					}
				}
			}
		},
		updateAppearance: (atom) => {
			if (atom.variable === "red") {
				atom.colour = Colour.Red
			} else if (atom.variable === "green") {
				atom.colour = Colour.Green
			} else if (atom.variable === "blue") {
				atom.colour = Colour.Blue
			}

			atom.borderColour = borderColours[atom.colour.splash]
		},
		expanded: false,
		click: (atom) => {
			if (!atom.expanded) {
				atom.expand(atom)
			} else {
				atom.unexpand(atom)
			}
		},
		expand: (atom) => {
			atom.expanded = true

			if (atom.value.add === undefined) {
				if (atom.y < 0 || !(atom.parent.isTallRectangle && atom.parent.operationAtoms.padBottom === atom)) {
					atom.handleTop = createChild(atom, SYMMETRY_HANDLE)
					atom.handleTop.width = atom.handleTop.height
					atom.handleTop.height *= 2
					atom.handleTop.y = atom.height/2 - atom.handleTop.height
					atom.handleTop.x = atom.width/2 - atom.handleTop.width/2
					atom.handleTop.behindParent = true

					atom.padTop = createChild(atom, SYMMETRY_PAD)
					atom.padTop.height = COLOURTODE_PICKER_PAD.height
					atom.padTop.width = COLOURTODE_SQUARE.size + COLOURTODE_PICKER_PAD_MARGIN*2
					atom.padTop.x = atom.width/2 - atom.padTop.width/2
					atom.padTop.y = -atom.padTop.height - OPTION_MARGIN
				}
			}

			if (atom.value.subtract === undefined) {
				if (atom.y > 0 || !(atom.parent.isTallRectangle && atom.parent.operationAtoms.padTop === atom)) {
					atom.handleBottom = createChild(atom, SYMMETRY_HANDLE)
					atom.handleBottom.width = atom.handleBottom.height
					atom.handleBottom.height *= 2
					atom.handleBottom.y = atom.height/2
					atom.handleBottom.x = atom.width/2 - atom.handleBottom.width/2
					atom.handleBottom.behindParent = true

					atom.padBottom = createChild(atom, SYMMETRY_PAD)
					atom.padBottom.height = COLOURTODE_PICKER_PAD.height
					atom.padBottom.width = COLOURTODE_SQUARE.size + COLOURTODE_PICKER_PAD_MARGIN*2
					atom.padBottom.x = atom.width/2 - atom.padBottom.width/2
					atom.padBottom.y = atom.height + OPTION_MARGIN
				}
			}
			
			atom.handleRight = createChild(atom, SYMMETRY_HANDLE)
			atom.handleRight.y = atom.height/2 - atom.handleRight.height/2
			atom.handleRight.x = atom.width/2
			atom.handleRight.width *= 2.5
			atom.handleRight.behindParent = true

			atom.padRight = createChild(atom, SYMMETRY_PAD)
			atom.padRight.height = COLOURTODE_PICKER_PAD.height
			atom.padRight.width = OPTION_MARGIN + (atom.width+OPTION_MARGIN/1.5)*3
			atom.padRight.y = atom.height/2 - atom.padRight.height/2
			atom.padRight.x = atom.width/2 + (COLOURTODE_SQUARE.size + COLOURTODE_PICKER_PAD_MARGIN*2)/2 + OPTION_MARGIN
			
			

			atom.red = createChild(atom, DIAMOND_CHOICE)
			atom.red.x = atom.padRight.x + OPTION_MARGIN/Math.SQRT2
			atom.red.borderColour = Colour.Red
			atom.red.colour = Colour.Black
			atom.red.value = "red"

			atom.green = createChild(atom, DIAMOND_CHOICE)
			atom.green.x = atom.padRight.x + OPTION_MARGIN/Math.SQRT2 + (atom.green.width+OPTION_MARGIN)*1
			atom.green.borderColour = Colour.Green
			atom.green.colour = Colour.Black
			atom.green.value = "green"
			
			atom.blue = createChild(atom, DIAMOND_CHOICE)
			atom.blue.x = atom.padRight.x + OPTION_MARGIN/Math.SQRT2 + (atom.blue.width+OPTION_MARGIN)*2
			atom.blue.borderColour = Colour.Blue
			atom.blue.colour = Colour.Black
			atom.blue.value = "blue"

			atom.winnerPin = createChild(atom, DIAMOND_PIN)
			atom.winnerPin.x = atom[atom.variable].x + atom.winnerPin.width/2
			atom.winnerPin.y = atom.winnerPin.height/2
			atom.winnerPin.colour = atom[atom.variable].borderColour
			atom.winnerPin.borderColour = atom.winnerPin.colour

			for (const operation of ["padTop", "padBottom"]) {
				const operationAtom = atom.operationAtoms[operation]
				if (operationAtom === undefined) continue
				atomRegistry.register(operationAtom)
				giveChild(atom, operationAtom)
			}

			for (const child of atom.children) {
				if (!child.isTallRectangle) continue
				if (child.expanded) {
					child.unexpand(child)
					child.expand(child)
				}
			}

		},
		unexpand: (atom) => {
			atom.expanded = false

			deleteChild(atom, atom.red)
			deleteChild(atom, atom.green)
			deleteChild(atom, atom.blue)

			deleteChild(atom, atom.padRight)
			deleteChild(atom, atom.handleRight)
			deleteChild(atom, atom.winnerPin)
			
			if (atom.value.add === undefined) {
				deleteChild(atom, atom.padTop, {quiet: true})
				deleteChild(atom, atom.handleTop, {quiet: true})
			}
			
			if (atom.value.subtract === undefined) {
				deleteChild(atom, atom.padBottom, {quiet: true})
				deleteChild(atom, atom.handleBottom, {quiet: true})
			}
			
			

			

		}
	}

	const DIAMOND_CHOICE = {
		draw: (atom, ctx) => {
			COLOURTODE_TALL_RECTANGLE.draw(atom, ctx)
		},
		offscreen: COLOURTODE_RECTANGLE.offscreen,
		overlaps: COLOURTODE_RECTANGLE.overlaps,
		hasBorder: true,
		size: CHANNEL_HEIGHT + OPTION_MARGIN/3*2,
		height: CHANNEL_HEIGHT + OPTION_MARGIN/3*2,
		width: CHANNEL_HEIGHT + OPTION_MARGIN/3*2,
		grab: (atom) => atom.parent,
		click: (atom) => {
			if (atom.value === atom.parent.variable) return

			atom.parent.variable = atom.value
			atom.parent.value.variable = atom.value

			atom.parent.winnerPin.x = atom.x + atom.parent.winnerPin.width/2
			atom.parent.winnerPin.colour = atom.borderColour
			atom.parent.winnerPin.borderColour = atom.borderColour

			atom.parent.updateAppearance(atom.parent)

			const diamond = atom.parent
			let topDiamond = diamond
			let top = diamond.parent
			while (!top.isSquare) {
				if (top === atomRegistry.baseParent) return
				topDiamond = top
				top = top.parent
			}

			let channelNumber = 0
			if (topDiamond.channelSlot === "green") channelNumber = 1
			if (topDiamond.channelSlot === "blue") channelNumber = 2

			const topChannel = top.variableAtoms[channelNumber]
			top.receiveNumber(top, topChannel.value, channelNumber, {expanded: topChannel.expanded, numberAtom: topChannel})

		}
	}
	
	const DIAMOND_PIN = {
		draw: (atom, ctx) => {
			COLOURTODE_TALL_RECTANGLE.draw(atom, ctx)
		},
		offscreen: COLOURTODE_RECTANGLE.offscreen,
		overlaps: COLOURTODE_RECTANGLE.overlaps,
		hasBorder: true,
		size: (CHANNEL_HEIGHT + OPTION_MARGIN/3*2) / 2,
		height: (CHANNEL_HEIGHT + OPTION_MARGIN/3*2) / 2,
		width: (CHANNEL_HEIGHT + OPTION_MARGIN/3*2) / 2,
		grab: (atom) => atom.parent,
		touch: (atom) => atom.parent,
	}
	
	const COLOURTODE_OPTION_PADDING = {
		draw: () => {},
		overlaps: COLOURTODE_RECTANGLE.overlaps,
		offscreen: COLOURTODE_RECTANGLE.offscreen,
		grab: (atom) => atom.parent.parent,
		touch: (atom) => atom.parent,
		colour: Colour.Grey,
		width: COLOURTODE_SQUARE.size,
		height: OPTION_SPACING - CHANNEL_HEIGHT,
		y: 0,
		x: 0,
		//dragOnly: true,
	}

	paddles = []

	// Ctrl+F: addef
	const PADDLE_MARGIN = COLOURTODE_SQUARE.size/2
	const PADDLE = {
		stayAtBack: true,
		attached: true,
		noDampen: true,
		isPaddle: true,
		behindChildren: true,
		draw: COLOURTODE_RECTANGLE.draw,
		overlaps: COLOURTODE_RECTANGLE.overlaps,
		offscreen: COLOURTODE_RECTANGLE.offscreen,
		colour: Colour.Grey,
		size: COLOURTODE_SQUARE.size + OPTION_MARGIN*4, //for legacy
		width: COLOURTODE_SQUARE.size + OPTION_MARGIN*4,
		height: COLOURTODE_SQUARE.size + OPTION_MARGIN*4,
		dragOnly: true,
		dragLockY: true,
		scroll: 0,
		rightTriangle: undefined,
		x: Math.round(PADDLE_MARGIN), //needed for handle creation
		y: COLOURTODE_SQUARE.size + OPTION_MARGIN + PADDLE_MARGIN,
		construct: (paddle) => {

			paddle.cellAtoms = []
			paddle.slots = []

			const handle = createChild(paddle, PADDLE_HANDLE)
			paddle.handle = handle
			paddle.setLimits(paddle)
			paddle.x = paddle.minX
			paddle.expanded = false

			paddle.pinhole = createChild(handle, PIN_HOLE)

			paddle.dummyLeft = createChild(paddle, SLOT)
			paddle.dummyLeft.visible = false

			paddle.dummyRight = createChild(paddle, SLOT)
			paddle.dummyRight.visible = false

			updatePaddleSize(paddle)

		},

		setLimits: (paddle) => {
			paddle.maxX = paddle.handle.width
			paddle.minX = paddle.handle.width - paddle.width
		},

		drop: (paddle) => {

			const distanceFromMax = paddle.maxX - paddle.x
			const distanceFromMin = paddle.x - paddle.minX

			if (distanceFromMax < distanceFromMin) {
				paddle.x = paddle.maxX
				paddle.expanded = true
				updatePaddleRule(paddle)

				if (paddles.last === paddle) {
					createPaddle()
				}

			} else {
				paddle.x = paddle.minX
				paddle.expanded = false
				updatePaddleRule(paddle)

				if (paddles.last !== paddle) {
					deletePaddle(paddle)
				}
			}
			paddle.dx = 0
		},

		click: (paddle) => {
			const cells = makeDiagramCellsFromCellAtoms(paddle.cellAtoms)
			const diagram = new Diagram({left: cells})
			setBrushColour(diagram)
		},

		drag: (paddle, x, y) => {
			if (false && paddle.pinhole.locked) {
				const square = new Atom(COLOURTODE_SQUARE)
				hand.offset.x = -square.width/2
				hand.offset.y = -square.height/2
				const cells = makeDiagramCellsFromCellAtoms(paddle.cellAtoms)
				const diagram = new Diagram({left: cells})
				diagram.normalise()

				square.value = diagram
				atomRegistry.register(square)
				state.brush.colour = new Diagram({left: [new DiagramCell({content: diagram})]})
				square.update(square)
				return square
			}
			return paddle
		},

		rightDraggable: true,
		getColour: (paddle) => {
			let cellAtoms = paddle.cellAtoms
			if (cellAtoms.length === 0) {
				
				const leftClone = new DragonArray({channels: [undefined, undefined, undefined]})
				return leftClone

			} else if (cellAtoms.length === 1) {
				const leftClone = DragonArray.cloneContent(cellAtoms[0].value)
				return leftClone
			}
			const cells = makeDiagramCellsFromCellAtoms(cellAtoms)
			const diagram = new Diagram({left: cells})
			diagram.normalise()
			return diagram
		},
		rightDrag: (paddle) => {
			let cellAtoms = paddle.cellAtoms
			if (cellAtoms.length === 0) {
				
				const square = new Atom(COLOURTODE_SQUARE)
				hand.offset.x = -square.width/2
				hand.offset.y = -square.height/2
				const leftClone = new DragonArray({channels: [undefined, undefined, undefined]})
				setBrushColour(leftClone)
				atomRegistry.register(square)
				square.value = leftClone
				square.update(square)
				return square

			} else if (cellAtoms.length === 1) {
				const leftClone = DragonArray.cloneContent(cellAtoms[0].value)
				const square = cellAtoms[0].clone(cellAtoms[0])
				hand.offset.x = -square.width/2
				hand.offset.y = -square.height/2
				setBrushColour(leftClone)
				atomRegistry.register(square)
				square.value = leftClone
				square.update(square)
				return square
			}
			const square = new Atom(COLOURTODE_SQUARE)
			hand.offset.x = -square.width/2
			hand.offset.y = -square.height/2
			const cells = makeDiagramCellsFromCellAtoms(cellAtoms)
			const diagram = new Diagram({left: cells})
			diagram.normalise()

			square.value = diagram
			atomRegistry.register(square)
			setBrushColour(diagram)
			square.update(square)
			return square
		},
	}

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

	const SLOT = {
		visible: true,
		isSlot: true,
		behindChildren: true,
		//hasBorder: true,
		draw: (atom, ctx) => {

			if (!atom.visible) return
			
			const {x, y} = atom.getPosition()

			const left = x
			const right = x + atom.width
			const top = y
			const bottom = y + atom.height

			

			ctx.fillStyle = atom.colour
			

			const w = atom.width/3
			const h = atom.width/3
			const X = x + atom.width/2 - w/2
			const Y = y + atom.height/2 - h/2
			ctx.fillRect(...[X, Y, w, h].map(n => Math.round(n)))

		},
		offscreen: COLOURTODE_RECTANGLE.offscreen,
		overlaps: COLOURTODE_RECTANGLE.overlaps,
		colour: Colour.Black,
		size: COLOURTODE_SQUARE.size,
		grab: (atom) => atom.parent,
		dragOnly: true,
	}

	const cellAtomWidth = COLOURTODE_SQUARE.size
	// Ctrl+F: adwww
	const updatePaddleSize = (paddle) => {
		
		let width = PADDLE.width
		let height = PADDLE.size

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

			const yPadding = (PADDLE.height/2 - COLOURTODE_SQUARE.size/2)
			const xPadding = (PADDLE.width/2 - COLOURTODE_SQUARE.size/2)

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
			width += SYMMETRY_CIRCLE.size/3
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

				const slot = createChild(paddle, SLOT, {bottom: true})
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
				paddle.y = PADDLE.y + PADDLE.scroll
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
		const paddle = new Atom(PADDLE)
		paddles.push(paddle)
		positionPaddles()
		atomRegistry.register(paddle)
		return paddle
	}

	const PADDLE_HANDLE = {
		isPaddleHandle: true,
		attached: true,
		behindChildren: true,
		draw: COLOURTODE_RECTANGLE.draw,
		overlaps: COLOURTODE_RECTANGLE.overlaps,
		offscreen: COLOURTODE_RECTANGLE.offscreen,
		colour: Colour.Grey,
		size: PADDLE.x,
		x: -PADDLE.x,
		y: PADDLE.size/2 - PADDLE.x/2,
		touch: (atom) => atom.parent.pinhole,
		grab: (atom) => {
			return atom.parent.pinhole
		},
	}

	const PIN_HOLE = {
		isPinhole: true,
		attached: true,
		locked: false,
		borderScale: 1/2,
		borderColour: Colour.Black,
		draw: (atom, ctx) => {
			return
			if (atom.locked) {
				atom.hasBorder = true
				atom.colour = Colour.Grey				
			}
			else {
				atom.hasBorder = false
				atom.colour = Colour.Black
			}
			CIRCLE.draw(atom, ctx)
		},
		overlaps: CIRCLE.overlaps,
		offscreen: CIRCLE.offscreen,
		colour: Colour.Black,
		size: PADDLE_HANDLE.size - OPTION_MARGIN/2,
		y: OPTION_MARGIN/2/2,
		x: OPTION_MARGIN/2/2,
		click: (atom) => {
			return
			const handle = atom.parent
			const paddle = handle.parent
			if (atom.locked) {
				atom.locked = false
				paddle.grabbable = true
				handle.draggable = true
				paddle.draggable = true
				atom.draggable = true
				updatePaddleRule(paddle)
			} 

			else {
				atom.locked = true
				handle.draggable = false
				atom.draggable = false

				for (const cellAtom of paddle.cellAtoms) {
					if (cellAtom.expanded) {
						cellAtom.unexpand(cellAtom)
					}
					if (cellAtom.slotted !== undefined) {
						const slotted = cellAtom.slotted
						if (slotted.expanded) {
							slotted.unexpand(slotted)
						}
					}
					if (cellAtom.joins.length > 0 && cellAtom.joinExpanded) {
						cellAtom.joinUnepxand(cellAtom)
					}
				}

				

				if (paddle.cellAtoms.length === 0) {
					paddle.grabbable = false
					paddle.draggable = false
				}
				updatePaddleRule(paddle)
			}
		},
		grab: (atom) => atom.parent.parent,
		
	}

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

	// Ctrl+F: cedef
	const SYMMETRY_CIRCLE = {
		hasBorder: true,
		draw: (atom, ctx) => {
			CIRCLE.draw(atom, ctx)
			if (atom.value === undefined) return
			const [x, y, r] = getXYR(atom.value)
			if (x > 0) SYMMETRY_TOGGLE_X.drawX(atom, ctx)
			if (y > 0) SYMMETRY_TOGGLE_Y.drawY(atom, ctx)
			if (r > 0) SYMMETRY_TOGGLE_R.drawR(atom, ctx)
		},
		offscreen: CIRCLE.offscreen,
		overlaps: CIRCLE.overlaps,
		//behindChildren: true,
		expanded: false,
		borderColour: Colour.Grey,
		colour: Colour.Black,
		value: 0,
		click: (atom) => {
			
			if (atom.expanded) {
				atom.unexpand(atom)
			}

			else {

				atom.expand(atom)
			}
		},

		expand: (atom) => {
			atom.pad = createChild(atom, SYMMETRY_PAD)
			atom.handle = createChild(atom, SYMMETRY_HANDLE)
			atom.handle.width += OPTION_MARGIN
			atom.expanded = true

			const [x, y, r] = getXYR(atom.value)
			atom.xToggle = createChild(atom, SYMMETRY_TOGGLE_X)
			atom.yToggle = createChild(atom, SYMMETRY_TOGGLE_Y)
			atom.rToggle = createChild(atom, SYMMETRY_TOGGLE_R)

			if (x > 0) atom.xToggle.value = true
			if (y > 0) atom.yToggle.value = true
			if (r > 0) atom.rToggle.value = true
		},

		unexpand: (atom) => {
			deleteChild(atom, atom.pad)
			deleteChild(atom, atom.handle)
			deleteChild(atom, atom.xToggle)
			deleteChild(atom, atom.yToggle)
			deleteChild(atom, atom.rToggle)
			atom.expanded = false
		},
		
		size: COLOURTODE_SQUARE.size,
		update: (atom) => {
			
			const {x, y} = atom.getPosition()

			const id = atomRegistry.atoms.indexOf(atom)
			const left = x
			const top = y
			const right = x + atom.width
			const bottom = y + atom.height

			if (hand.content === atom) for (const paddle of paddles) {
				const pid = atomRegistry.atoms.indexOf(paddle)
				const {x: px, y: py} = paddle.getPosition()
				const pright = px + paddle.width
				const ptop = py
				const pbottom = py + paddle.height


				if (!paddle.hasSymmetry && paddle.expanded && id > pid && left <= pright && right >= pright && ((top < pbottom && top > ptop) || (bottom > ptop && bottom < pbottom))) {
					if (atom.highlightPaddle !== undefined) {
						deleteChild(atom, atom.highlightPaddle)
					}

					atom.highlightPaddle = createChild(atom, HIGHLIGHT, {bottom: true})
					atom.highlightPaddle.width = HIGHLIGHT_THICKNESS
					atom.highlightPaddle.height = paddle.height
					atom.highlightPaddle.y = ptop
					atom.highlightPaddle.x = pright - HIGHLIGHT_THICKNESS/2
					atom.highlightedPaddle = paddle
					return
				}

			}

			if (atom.highlightPaddle !== undefined) {
				deleteChild(atom, atom.highlightPaddle)
				atom.highlightPaddle = undefined
				atom.highlightedPaddle = undefined
			}
		},
		drop: (atom) => {

			if (!atom.attached) {
				if (atom.highlightedPaddle !== undefined) {
					const paddle = atom.highlightedPaddle
					atom.attached = true
					giveChild(paddle, atom)
					
					paddle.hasSymmetry = true
					paddle.symmetryCircle = atom
					updatePaddleSize(paddle)

					atom.dx = 0
					atom.dy = 0
					
					

					

				}
			}
			
		},

		drag: (atom) => {

			if (atom.attached) {
				const paddle = atom.parent

				

				atom.attached = false
				freeChild(paddle, atom)
				paddle.hasSymmetry = false
				paddle.symmetryCircle = undefined
				updatePaddleSize(paddle)
			}

			return atom
		},

		rightDraggable: true,
		rightDrag: (atom) => {
			const clone = new Atom(SYMMETRY_CIRCLE)
			clone.value = atom.value
			const {x, y} = atom.getPosition()
			hand.offset.x -= atom.x - x
			hand.offset.y -= atom.y - y
			clone.x = x
			clone.y = y
			atomRegistry.register(clone)
			return clone
		},
	}

	const HIGHLIGHT_THICKNESS = BORDER_THICKNESS
	const HIGHLIGHT = {
		behindParent: true,
		draw: COLOURTODE_RECTANGLE.draw,
		offscreen: COLOURTODE_RECTANGLE.offscreen,
		overlaps: COLOURTODE_RECTANGLE.overlaps,
		draggable: false,
		grabbable: false,
		justVisual: true,
		colour: Colour.splash(999),
		borderColour: Colour.splash(999),
		hasAbsolutePosition: true,
		hasInner: false,
	}

	const TRIANGLE_PAD = {
		draw: COLOURTODE_RECTANGLE.draw,
		offscreen: COLOURTODE_RECTANGLE.offscreen,
		overlaps: COLOURTODE_RECTANGLE.overlaps,
		dragOnly: true,
		width: SYMMETRY_CIRCLE.size,
		x: SYMMETRY_CIRCLE.size*Math.sqrt(3)/2 + OPTION_MARGIN,
		height: (SYMMETRY_CIRCLE.size * 2) - OPTION_MARGIN,
		y: -SYMMETRY_CIRCLE.size/2 + OPTION_MARGIN/2,
		colour: Colour.Grey,
		grab: (atom) => atom.parent,
	}

	const TRIANGLE_HANDLE = {
		draw: COLOURTODE_RECTANGLE.draw,
		offscreen: COLOURTODE_RECTANGLE.offscreen,
		overlaps: COLOURTODE_RECTANGLE.overlaps,
		dragOnly: true,
		width: SYMMETRY_CIRCLE.size/2 + OPTION_MARGIN,
		x: SYMMETRY_CIRCLE.size/2,
		height: SYMMETRY_CIRCLE.size / 3,
		y: SYMMETRY_CIRCLE.size/2 - (SYMMETRY_CIRCLE.size / 3)/2,
		colour: Colour.Grey,
		grab: (atom) => atom.parent,
	}

	const SYMMETRY_PAD = {
		draw: COLOURTODE_RECTANGLE.draw,
		offscreen: COLOURTODE_RECTANGLE.offscreen,
		overlaps: COLOURTODE_RECTANGLE.overlaps,
		dragOnly: true,
		width: SYMMETRY_CIRCLE.size,
		x: SYMMETRY_CIRCLE.size + OPTION_MARGIN,
		height: (SYMMETRY_CIRCLE.size * 3) - OPTION_MARGIN,
		y: -(SYMMETRY_CIRCLE.size * 3)/3 + OPTION_MARGIN/2,
		colour: Colour.Grey,
		grab: (atom) => atom.parent,
	}

	const SYMMETRY_HANDLE = {
		draw: COLOURTODE_RECTANGLE.draw,
		offscreen: COLOURTODE_RECTANGLE.offscreen,
		overlaps: COLOURTODE_RECTANGLE.overlaps,
		dragOnly: true,
		//touch: (atom) => atom.parent,
		width: SYMMETRY_CIRCLE.size/2,
		x: SYMMETRY_CIRCLE.size/2 + SYMMETRY_CIRCLE.size/4,
		height: SYMMETRY_CIRCLE.size / 3,
		y: SYMMETRY_CIRCLE.size/2 - (SYMMETRY_CIRCLE.size / 3)/2,
		colour: Colour.Grey,
		grab: (atom) => atom.parent,
	}

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

	const TRIANGLE_PICK_UP = {
		hasBorder: true,
		colour: Colour.Black,
		borderColour: Colour.Black,
		draw: (atom, ctx) => {
			TRIANGLE_UP.draw(atom, ctx)
		},
		touch: (atom) => {
			atom.colour = Colour.Silver
			return atom
		},
		click: (atom) => {
			
			const triangle = atom.parent
			// triangle.upPick.value = false
			// triangle.rightPick.value = false
			// triangle.downPick.value = false
			atom.colour = Colour.Black
			
			triangle.direction = rotateTriangleRotation(triangle.direction, true)
			atom.value = true

			triangle.updateValue(triangle)
			const parent = triangle.parent
			if (parent.isSquare) {
				parent.receiveNumber(parent, triangle.value, triangle.channelId, {expanded: triangle.expanded, numberAtom: triangle})
			}
		},
		offscreen: TRIANGLE_UP.offscreen,
		overlaps: TRIANGLE_UP.overlaps,
		
		value: false,
		size: COLOURTODE_SQUARE.size - OPTION_MARGIN*1.5,
		grab: (atom) => atom.parent,
		x: TRIANGLE_PAD.x + TRIANGLE_PAD.width/2 - (COLOURTODE_SQUARE.size - OPTION_MARGIN*1.5)/2,
		y: TRIANGLE_PAD.y + OPTION_MARGIN*1.5/2,
	}

	const TRIANGLE_PICK_DOWN = {
		hasBorder: true,
		colour: Colour.Black,
		borderColour: Colour.Black,
		draw: (atom, ctx) => {
			TRIANGLE_DOWN.draw(atom, ctx)
		},
		touch: (atom) => {
			atom.colour = Colour.Silver
			return atom
		},
		click: (atom) => {
			
			const triangle = atom.parent
			// triangle.upPick.value = false
			// triangle.rightPick.value = false
			// triangle.downPick.value = false
			atom.colour = Colour.Black
			
			triangle.direction = rotateTriangleRotation(triangle.direction, false)
			atom.value = true


			triangle.updateValue(triangle)
			const parent = triangle.parent
			if (parent.isSquare) {
				parent.receiveNumber(parent, triangle.value, triangle.channelId, {expanded: triangle.expanded, numberAtom: triangle})
			}

		},
		offscreen: TRIANGLE_DOWN.offscreen,
		overlaps: TRIANGLE_DOWN.overlaps,
		
		value: false,
		size: COLOURTODE_SQUARE.size - OPTION_MARGIN*1.5,
		grab: (atom) => atom.parent,
		x: TRIANGLE_PAD.x + TRIANGLE_PAD.width/2 - (COLOURTODE_SQUARE.size - OPTION_MARGIN*1.5)/2,
		y: TRIANGLE_PAD.y + TRIANGLE_PAD.height - (COLOURTODE_SQUARE.size - OPTION_MARGIN*1.5) - OPTION_MARGIN/2,
	}
	
	const SYMMETRY_TOGGLE_X = {
		hasBorder: true,
		borderColour: Colour.Black,
		colour: Colour.Grey,
		draw: (atom, ctx) => {
			atom.colour = atom.value? Colour.Silver : Colour.Grey
			CIRCLE.draw(atom, ctx)
			atom.drawX(atom, ctx)
		},
		drawX: (atom, ctx) => {
			const {x, y} = atom.getPosition()

			const W = (atom.size)
			const H = (BORDER_THICKNESS*1.0)
			const X = (x)
			const Y = (y + atom.size/2 - BORDER_THICKNESS*1.0/2)

			ctx.fillStyle = atom.borderColour
			ctx.fillRect(X, Y, W, H)
		},
		offscreen: CIRCLE.offscreen,
		overlaps: CIRCLE.overlaps,
		expanded: false,
		click: (atom) => {
			atom.value = !atom.value
			let [x, y, r] = getXYR(atom.parent.value)
			x = atom.value? 100 : 0
			atom.parent.value = x+y+r
			const circle = atom.parent
			if (circle.parent !== atomRegistry.baseParent) {
				const paddle = circle.parent
				updatePaddleRule(paddle)
			}
		},
		value: false,
		size: COLOURTODE_SQUARE.size - OPTION_MARGIN,
		grab: (atom) => atom.parent,
		x: SYMMETRY_PAD.x + SYMMETRY_PAD.width/2 - (COLOURTODE_SQUARE.size - OPTION_MARGIN)/2,
		y: SYMMETRY_PAD.y + OPTION_MARGIN/2,
	}
	
	const SYMMETRY_TOGGLE_Y = {
		hasBorder: true,
		borderColour: Colour.Black,
		colour: Colour.Grey,
		draw: (atom, ctx) => {
			atom.colour = atom.value? Colour.Silver : Colour.Grey
			CIRCLE.draw(atom, ctx)
			atom.drawY(atom, ctx)
		},
		drawY: (atom, ctx, height = atom.size, offset = 0) => {
			const {x, y} = atom.getPosition()

			const W = (BORDER_THICKNESS*1.0)
			const H = (height)
			const X = (x + atom.size/2 - BORDER_THICKNESS*1.0/2)
			const Y = (y) + offset

			ctx.fillStyle = atom.borderColour
			ctx.fillRect(X, Y, W, H)
		},
		offscreen: CIRCLE.offscreen,
		overlaps: CIRCLE.overlaps,
		expanded: false,
		click: (atom) => {
			atom.value = !atom.value
			let [x, y, r] = getXYR(atom.parent.value)
			y = atom.value? 10 : 0
			atom.parent.value = x+y+r
			const circle = atom.parent
			if (circle.parent !== atomRegistry.baseParent) {
				const paddle = circle.parent
				updatePaddleRule(paddle)
			}
		},
		value: false,
		size: COLOURTODE_SQUARE.size - OPTION_MARGIN,
		grab: (atom) => atom.parent,
		x: SYMMETRY_PAD.x + SYMMETRY_PAD.width/2 - (COLOURTODE_SQUARE.size - OPTION_MARGIN)/2,
		y: OPTION_MARGIN/2,
	}
	
	const SYMMETRY_TOGGLE_R = {
		hasBorder: true,
		borderColour: Colour.Black,
		colour: Colour.Grey,
		draw: (atom, ctx) => {
			atom.colour = atom.value? Colour.Silver : Colour.Grey
			CIRCLE.draw(atom, ctx)
			atom.drawR(atom, ctx)
		},
		drawR: (atom, ctx) => {
			const {x, y} = atom.getPosition()

			let X = (x + atom.size/2)
			let Y = (y + atom.size/2)
			let R = atom.size/2 - (BORDER_THICKNESS*1.5)*2

			ctx.fillStyle = atom.borderColour
			ctx.beginPath()
			ctx.arc(X, Y, R, 0, 2*Math.PI)
			ctx.fill()
			
			R -= BORDER_THICKNESS
			ctx.fillStyle = atom.colour
			ctx.beginPath()
			ctx.arc(X, Y, R, 0, 2*Math.PI)
			ctx.fill()
		},
		offscreen: CIRCLE.offscreen,
		overlaps: CIRCLE.overlaps,
		expanded: false,
		click: (atom) => {
			atom.value = !atom.value
			let [x, y, r] = getXYR(atom.parent.value)
			r = atom.value? 1 : 0
			atom.parent.value = x+y+r
			const circle = atom.parent
			if (circle.parent !== atomRegistry.baseParent) {
				const paddle = circle.parent
				updatePaddleRule(paddle)
			}
		},
		value: false,
		size: COLOURTODE_SQUARE.size - OPTION_MARGIN,
		grab: (atom) => atom.parent,
		x: SYMMETRY_PAD.x + SYMMETRY_PAD.width/2 - (COLOURTODE_SQUARE.size - OPTION_MARGIN)/2,
		y: SYMMETRY_PAD.y + SYMMETRY_PAD.height - (COLOURTODE_SQUARE.size - OPTION_MARGIN) - OPTION_MARGIN/2,
	}

	//====================//
	// COLOURTODE - TOOLS //
	//====================//
	const makeSquareFromValue = (value) => {

		const newAtom = new Atom({...COLOURTODE_SQUARE})
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
				
				const triangle = new Atom(COLOURTODE_TRIANGLE)
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

	let menuRight = 10

	const COLOURTODE_TOOL = {
		element: COLOURTODE_SQUARE,
		draw: (atom, ctx) => {
			if ((atom.previousBrushColour !== state.brush.colour) || atom.toolbarNeedsColourUpdate) {
				atom.update(atom)
			}
			if (atom.unlocked) {
				atom.element.draw(atom, ctx)
			}
		},
		overlaps: (atom, x, y) => atom.element.overlaps(atom, x, y),
		grab: (atom, x, y) => {
			return atom
		},
		drag: (atom) => {

			if (atom === squareTool) {
				const newAtom = makeSquareFromValue(atom.value)
				atomRegistry.register(newAtom)
				return newAtom
			}

			const newAtom = new Atom({...atom.element, x: atom.x, y: atom.y})
			atomRegistry.register(newAtom)

			if (newAtom.value !== undefined) {
				
			}

			return newAtom
		},
		cursor: () => "move",
	}

	let menuId = 0
	const addMenuTool = (element, unlockName) => {
		const {width = COLOURTODE_SQUARE.size, height = COLOURTODE_SQUARE.size, size} = element
		
		let y = COLOURTODE_PICKER_PAD_MARGIN
		if (height < COLOURTODE_SQUARE.size) {
			y += (COLOURTODE_SQUARE.size - height)/2
		}
		y += BORDER_THICKNESS

		const atom = new Atom({...COLOURTODE_TOOL, width, height, size, x: Math.round(menuRight), y, element})
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

	squareTool = addMenuTool(COLOURTODE_SQUARE)
	menuRight += BORDER_THICKNESS
	const triangleTool = addMenuTool(COLOURTODE_TRIANGLE, "triangle")
	//triangleTool.size -= BORDER_THICKNESS*1.5
	//triangleTool.y += BORDER_THICKNESS*1.5 / 2
	menuRight -= BORDER_THICKNESS
	const circleTool = addMenuTool(SYMMETRY_CIRCLE, "circle")
	const hexagonTool = addMenuTool(COLOURTODE_HEXAGON, "hexagon")
	//menuRight += BORDER_THICKNESS
	const tallRectangleTool = {} //addMenuTool(COLOURTODE_TALL_RECTANGLE, "tall_rectangle")
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
						const multiAtom = createChild(atom, COLOURTODE_SQUARE)
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
			COLOURTODE_SQUARE.updateGradient(atom)
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
			const square = v.isLeftSlot ? new Atom(SLOT) : makeSquareFromValue(v.value)
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
		const circle = createChild(paddle, SYMMETRY_CIRCLE)
		circle.value = value
		return circle
	}

	PADDLE_PACK.chance = (paddle, value) => {
		if (value === undefined) return
		return value.ons
	}

	PADDLE_UNPACK.chance = (paddle, value) => {
		const hex = createChild(paddle, COLOURTODE_HEXAGON)
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
		const arrow = createChild(paddle, COLOURTODE_TRIANGLE)
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
