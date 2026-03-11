//====================//
// COLOURTODE - TOOLS //
//====================//
var unlocks = {}
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
UI.OPTION_SPACING = UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN
UI.getGradientImageFromColours = Gradient.getImageFromColours
UI.getMergedGradient = Gradient.getMergedGradient

borderColours = PREBUILT_BORDER_COLOURS
const toolBorderColours = borderColours.clone
toolBorderColours[999] = Colour.splash(999)
UI.borderColours = borderColours
UI.toolBorderColours = toolBorderColours

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

	let y = UI.OPTION_MARGIN
	if (height < UI.SQUARE_SIZE) {
		y += (UI.SQUARE_SIZE - height)/2
	}
	y += UI.BORDER_THICKNESS

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
	menuRight += UI.OPTION_MARGIN

	UI.atomRegistry.register(atom)

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

const unlockMenuTool = (unlockName) => {
	const unlock = unlocks[unlockName]
	if (unlock.unlocked) return
	unlock.unlocked = true
	unlock.grabbable = true
}
UI.unlockMenuTool = unlockMenuTool

const squareToolUpdate = function() {

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
				UI.deleteChild(this, multiAtom)
			}

			this.multiAtoms = []

			if (this.value.isDiagram) {
				const diagram = this.value
				const [diagramWidth, diagramHeight] = diagram.getDimensions()
				const cellAtomWidth = this.width / diagramWidth
				const cellAtomHeight = this.height / diagramHeight
				for (const diagramCell of diagram.left) {
					const multiAtom = UI.createChild(this, new ColourtodeSquare())
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
