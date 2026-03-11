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
	UI.ruleRegistry = ruleRegistry

	// Setup Show
	const show = Show.start({paused: false, scale: DPR})
	const {context, canvas} = show
	canvas.style["position"] = "absolute"

	// DrawQueue class defined in source/draw-queue.js
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
					state.brush.hoverColour = atom.getColour()
				} else if (atom.isSlot) {
					state.brush.hoverColour = atom.parent.getColour()
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

	const shuffleArray = DrawQueue.shuffleArray

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

	// Hand state machine moved to source/hand.js

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

		atom.update()

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

		const highlightedAtom = atom.hover()

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

	// HAND state machine defined in source/hand.js

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

	UI.HAND = HAND
	UI.DPR = DPR
	UI.cellGrid = cellGrid
	UI.overrideCells = overrideCells
	UI.drawQueue = drawQueue
	UI.colourTodeCanvas = colourTodeCanvas
	UI.state = state
	UI.show = show
	UI.brush = brush

	const atomRegistry = new AtomRegistry()
	UI.atomRegistry = atomRegistry

	//=======================//
	// COLOURTODE - CHILDREN //
	//=======================//
	const createChild = (...args) => atomRegistry.createChild(...args)
	const deleteChild = (...args) => atomRegistry.deleteChild(...args)
	const giveChild = (...args) => atomRegistry.giveChild(...args)
	const freeChild = (...args) => atomRegistry.freeChild(...args)

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
	UI.createChild = (...args) => atomRegistry.createChild(...args)
	UI.deleteChild = (...args) => atomRegistry.deleteChild(...args)
	UI.giveChild = (...args) => atomRegistry.giveChild(...args)
	UI.freeChild = (...args) => atomRegistry.freeChild(...args)
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
	UI.on("brushColourChanged", setBrushColour)


	// Gradient functions defined in source/gradient.js

	const getMergedGradient = Gradient.getMergedGradient
	const getGradientImageFromColours = Gradient.getImageFromColours

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

	

	// Paddle manager functions moved to source/paddle-manager.js
	paddles = []
	UI.paddles = paddles
	UI.makeDiagramCellsFromCellAtoms = makeDiagramCellsFromCellAtoms

	UI.PADDLE_HANDLE_SIZE = UI.PADDLE_X
	UI.createPaddle = createPaddle
	UI.deletePaddle = deletePaddle
	UI.updatePaddleSize = updatePaddleSize
	UI.updatePaddleRule = updatePaddleRule
	UI.positionPaddles = positionPaddles
	UI.on("paddleSizeChanged", updatePaddleSize)
	UI.on("paddleRuleChanged", updatePaddleRule)
	UI.on("paddleCreate", createPaddle)
	UI.on("paddleDelete", deletePaddle)


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
	
				triangle.updateValue()

				// newAtom.variableAtoms[i] = hexagon
				// hexagon.variable = channel.variable
				// hexagon.ons = [add.values[2], add.values[1], subtract.values[1], subtract.values[2], subtract.values[3], add.values[3]]
				// hexagon.updateValue(hexagon)
			}

		}

		if (newAtom.value !== undefined && newAtom.value.isDiagram) {
			newAtom.update()
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
	UI.unlockMenuTool = unlockMenuTool

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
	UI.on("menuToolUnlock", unlockMenuTool)
	UI.on("toolbarColourChanged", () => {
		squareTool.toolbarNeedsColourUpdate = true
		triangleTool.toolbarNeedsColourUpdate = true
		circleTool.toolbarNeedsColourUpdate = true
		tallRectangleTool.toolbarNeedsColourUpdate = true
	})
	createPaddle()
	
	squareTool.value = DragonArray.fromSplash(state.brush.colour)

	circleTool.borderScale = 1
	
	squareTool.update = function() {

		if (this.joinDrawId === undefined) {
			this.joinDrawId = -1
			this.joinDrawTimer = 0
		}



		if (this.value !== undefined && this === squareTool) {

			if (this.previousBrushColour !== state.brush.colour || this.toolbarNeedsColourUpdate) {
				this.previousBrushColour = state.brush.colour
				if (this.multiAtoms === undefined) {
					this.multiAtoms = []
				}
				for (const multiAtom of this.multiAtoms) {
					deleteChild(this, multiAtom)
				}

				this.multiAtoms = []

				if (this.value.isDiagram) {
					const diagram = this.value
					const [diagramWidth, diagramHeight] = diagram.getDimensions()
					const cellAtomWidth = this.width / diagramWidth
					const cellAtomHeight = this.height / diagramHeight
					for (const diagramCell of diagram.left) {
						const multiAtom = createChild(this, new ColourtodeSquare())
						multiAtom.x = diagramCell.x * cellAtomWidth
						multiAtom.y = diagramCell.y * cellAtomHeight
						multiAtom.width = diagramCell.width * cellAtomWidth
						multiAtom.height = diagramCell.height * cellAtomHeight
						multiAtom.value = diagramCell.content
						multiAtom.update()
						this.multiAtoms.push(multiAtom)
					}
				}
			}
		}

		const valueClone = DragonArray.cloneContent(this.value)
		this.colours = valueClone.getSplashes()

		if (this.colourId >= this.colours.length) {
			this.colourId = 0
		}
		if (this.toolbarNeedsColourUpdate && this === squareTool) {
			this.toolbarNeedsColourUpdate = false
			this.isGradient = true
			this.joins = []
			for (const joinValue of this.value.joins) {
				const joinSquare = makeSquareFromValue(joinValue)
				this.joins.push(joinSquare)
			}
			ColourtodeSquare.updateGradientFn(this)
		} else {
			this.colour = Colour.splash(999)
			this.borderColour = Colour.splash(999)
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

	// Paddle serialization moved to source/paddle-serialization.js


	// File I/O functions moved to source/file-io.js

})

//=============================================================
// just let go
//  of what you know
