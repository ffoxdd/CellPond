//==================//
// PADDLE MANAGER   //
//==================//
const PADDLE_MARGIN = UI.SQUARE_SIZE / 2

const updatePaddleSize = (paddle) => {

	const cellAtomWidth = UI.SQUARE_SIZE
	const OPTION_MARGIN = 10

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
	paddle.setLimits()

	//=============================//
	// ARRANGING PADDLE's CHILDREN //
	//=============================//
	for (const slot of paddle.slots) {
		UI.deleteChild(paddle, slot)
	}
	paddle.slots = []

	if (paddle.rightTriangle !== undefined) {
		for (const cellAtom of paddle.cellAtoms) {

			const slot = UI.createChild(paddle, new Slot(), {bottom: true})
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
		const [x, y, r] = getRGB(paddle.symmetryCircle.value)

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
	const chance = paddle.chance === undefined? undefined : paddle.chance.getValue()
	const rule = new Rule({steps: [diagram], transformations, locked, chance})
	paddle.rule = rule
	if (paddle.registry !== undefined) {
		UI.ruleRegistry.unregister(paddle.registry)
	}
	if (locked && paddle.rightTriangle !== undefined) {
		paddle.registry = UI.ruleRegistry.register(rule)
	}
}

const getAllAtoms = (pool) => {
	if (pool === undefined) pool = UI.atomRegistry.atoms
	const atoms = [...pool]
	for (const atom of atoms) {
		atoms.push(...getAllAtoms(atom.children))
	}
	return atoms
}

const getAllBaseAtoms = () => {
	const atoms = [...UI.atomRegistry.atoms]
	for (const paddle of UI.paddles) {
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

	if (UI.paddles.length > 1) {
		UI.unlockMenuTool("triangle")
	}

	if (UI.paddles.length > 2) {
		let ruleCount = 0
		for (const paddle of UI.paddles) {
			if (paddle.rightTriangle !== undefined) {
				ruleCount++
			}
		}
		if (ruleCount >= 2) {
			UI.unlockMenuTool("hexagon")
		}
	}

	let previous = undefined
	for (const paddle of UI.paddles) {
		if (previous === undefined) {
			paddle.y = Paddle.Y + UI.paddleScroll
			previous = paddle
			continue
		}

		paddle.y = previous.y + previous.height + PADDLE_MARGIN
		previous = paddle
	}
}

const deletePaddle = (paddle, id = UI.paddles.indexOf(paddle)) => {
	UI.paddles.splice(id, 1)
	if (paddle.registry !== undefined) {
		UI.ruleRegistry.unregister(paddle.registry)
	}
	UI.atomRegistry.delete(paddle)
	positionPaddles()
}

const createPaddle = () => {
	const paddle = new Paddle(paddleLayout())
	UI.paddles.push(paddle)
	positionPaddles()
	UI.atomRegistry.register(paddle)
	return paddle
}
