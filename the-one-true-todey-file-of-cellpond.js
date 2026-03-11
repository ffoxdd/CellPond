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
	const cell = world.cellGrid.pick(x, y)
	return cell
}

const pickRandomVisibleCell = () => {

	if (!state.view.visible) return undefined
	if (state.view.fullyVisible) return pickRandomCell()

	const x = state.region.left + (Random.Uint32 / 4294967295) * state.region.width
	const y = state.region.top + (Random.Uint32 / 4294967295) * state.region.height
	const cell = world.cellGrid.pick(x, y)
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

const world = new World()
var ruleRegistry
var drawQueue


//=======//
// SETUP //
//=======//
// Setup World
const worldCell = new Cell({colour: world.size * 111})
world.cellGrid.add(worldCell)

on.load(() => {

	ruleRegistry = new RuleRegistry()
	UI.ruleRegistry = ruleRegistry

	// Setup Show
	const show = Show.start({paused: false, scale: DPR})
	const {context, canvas} = show
	canvas.style["position"] = "absolute"

	// DrawQueue class defined in source/draw-queue.js
	drawQueue = new DrawQueue(state, canvas, world.cellGrid)

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

	// Cursor functions moved to source/cursor.js
	// Game tick functions moved to source/game-tick.js

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

	KEYDOWN[0] = () => world.setSize(0)
	KEYDOWN[1] = () => world.setSize(1)
	KEYDOWN[2] = () => world.setSize(2)
	KEYDOWN[3] = () => world.setSize(3)
	KEYDOWN[4] = () => world.setSize(4)
	KEYDOWN[5] = () => world.setSize(5)
	KEYDOWN[6] = () => world.setSize(6)
	KEYDOWN[7] = () => world.setSize(7)
	KEYDOWN[8] = () => world.setSize(8)
	KEYDOWN[9] = () => world.setSize(9)

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
	const gameTick = createGameTick({world, state, drawQueue, ruleRegistry, pickRandomCell})

	drawQueue.drawAll()
	show.tick = () => {

		updateHand()
		updateCursor()
		updateCamera()

		if (drawQueue.needsReset) {
			drawQueue.addAllCells()
			drawQueue.needsReset = false
		}

		if (!show.paused) gameTick.fireRandomSpotEvents()
		else gameTick.fireRandomSpotDrawEvents()

		context.putImageData(state.image.data, 0, 0)

		// Draw void
		context.clearRect(0, 0, state.view.left, state.view.bottom)
		context.clearRect(state.view.left, 0, canvas.width, state.view.top)
		context.clearRect(state.view.right, state.view.top, canvas.width, canvas.height)
		context.clearRect(0, state.view.bottom, canvas.width, canvas.height)

		state.time++
		if (state.time > state.maxTime) state.time = 0

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

	// ColourTode tick functions moved to source/colourtode-tick.js
	requestAnimationFrame(colourTodeTick)

	// Hand state machine defined in source/hand.js
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

	//===============//
	// UI EXPOSURES  //
	//===============//
	UI.HAND = HAND
	UI.DPR = DPR
	UI.world = world
	UI.cellGrid = world.cellGrid
	UI.overrideCells = (cells) => world.overrideCells(cells, drawQueue)
	UI.drawQueue = drawQueue
	UI.colourTodeCanvas = colourTodeCanvas
	UI.colourTodeContext = colourTodeContext
	UI.state = state
	UI.show = show
	UI.brush = brush
	UI.canvas = canvas
	UI.CT_SCALE = CT_SCALE
	UI.updateImageSize = updateImageSize

	const atomRegistry = new AtomRegistry()
	UI.atomRegistry = atomRegistry

	//=======================//
	// COLOURTODE - CHILDREN //
	//=======================//
	const createChild = (...args) => atomRegistry.createChild(...args)
	const deleteChild = (...args) => atomRegistry.deleteChild(...args)
	const giveChild = (...args) => atomRegistry.giveChild(...args)
	const freeChild = (...args) => atomRegistry.freeChild(...args)

	UI.createChild = (...args) => atomRegistry.createChild(...args)
	UI.deleteChild = (...args) => atomRegistry.deleteChild(...args)
	UI.giveChild = (...args) => atomRegistry.giveChild(...args)
	UI.freeChild = (...args) => atomRegistry.freeChild(...args)
	UI.hand = hand

	state.brush.hoverColour = Colour.Void
	UI.on("brushColourChanged", setBrushColour)

	// Paddle setup
	paddles = []
	UI.paddles = paddles
	UI.makeDiagramCellsFromCellAtoms = makeDiagramCellsFromCellAtoms

	UI.createPaddle = createPaddle
	UI.deletePaddle = deletePaddle
	UI.updatePaddleSize = updatePaddleSize
	UI.updatePaddleRule = updatePaddleRule
	UI.positionPaddles = positionPaddles
	UI.on("paddleSizeChanged", updatePaddleSize)
	UI.on("paddleRuleChanged", updatePaddleRule)
	UI.on("paddleCreate", createPaddle)
	UI.on("paddleDelete", deletePaddle)

	//====================//
	// COLOURTODE - TOOLS //
	//====================//
	squareTool = addMenuTool(new ColourtodeSquare())
	menuRight += UI.BORDER_THICKNESS
	const triangleTool = addMenuTool(new ColourtodeTriangle(), "triangle")
	menuRight -= UI.BORDER_THICKNESS
	const circleTool = addMenuTool(new SymmetryCircle(), "circle")
	const hexagonTool = addMenuTool(new Hexagon(), "hexagon")
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

	squareTool.update = squareToolUpdate
	triangleTool.update = squareToolUpdate
	circleTool.update = squareToolUpdate
	tallRectangleTool.update = squareToolUpdate
	hexagonTool.update = squareToolUpdate

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

})

//=============================================================
// just let go
//  of what you know
