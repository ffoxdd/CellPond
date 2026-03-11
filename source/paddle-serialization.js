//=========================//
// PADDLE SERIALIZATION   //
//=========================//
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
				UI.setBrushColour(v.value)
			}
			loadedColour = true
		}
		const square = v.isLeftSlot ? new Slot() : UI.makeSquareFromValue(v.value)
		square.isLeftSlot = v.isLeftSlot
		UI.atomRegistry.register(square)
		UI.giveChild(paddle, square)
		square.attached = true
		square.x = v.x
		square.y = v.y
		square.highlightedSide = "left"
		atoms.push(square)

		if (v.slotted !== undefined) {
			const slotted = UI.makeSquareFromValue(v.slotted)
			UI.atomRegistry.register(slotted)
			UI.giveChild(paddle, slotted)
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
	const circle = UI.createChild(paddle, new SymmetryCircle())
	circle.value = value
	return circle
}

PADDLE_PACK.chance = (paddle, value) => {
	if (value === undefined) return
	return value.ons
}

PADDLE_UNPACK.chance = (paddle, value) => {
	const hex = UI.createChild(paddle, new Hexagon())
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
	const arrow = UI.createChild(paddle, new ColourtodeTriangle())
	return arrow
}

window.packPaddles = () => {
	const packedPaddles = []
	for (const paddle of UI.paddles) {
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
	UI.unlockMenuTool("triangle")
	UI.unlockMenuTool("circle")
	UI.unlockMenuTool("hexagon")
	try {
		while (UI.paddles.length > 0) {
			UI.deletePaddle(UI.paddles[UI.paddles.length-1])
		}
		for (const packed of JSON.parse(pack)) {
			const paddle = UI.createPaddle()
			for (const key in packed) {
				const unpacker = PADDLE_UNPACK[key]
				if (unpacker === undefined) continue
				const v = unpacker(paddle, packed[key])
				if (v !== undefined) {
					paddle[key] = v
				}
			}
			UI.updatePaddleSize(paddle)
			UI.updatePaddleRule(paddle)
		}
		UI.positionPaddles()
	} catch(e) {
		console.error(e)
		alert("Error loading rules... Sorry! Please contact @todepond :)")
	}
}
