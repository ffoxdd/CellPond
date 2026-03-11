//==========//
// CURSOR   //
//==========//
let pencilled = false
let dropperStartX = undefined
let dropperStartY = undefined
let dropperStartT = undefined

const updateCursor = () => {

	updateBrush()
	updatePan()

	const [x, y] = Mouse.position
	state.cursor.previous.x = x
	state.cursor.previous.y = y

}

const updateBrush = () => {

	if (!world.built) return

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

	const size = state.brush.size * world.cellSize

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
		iy = (world.cellSize * sy) * (ay / ax)
		ix = world.cellSize * sx
	} else {
		ix = (world.cellSize * sx) * (ax / ay)
		iy = world.cellSize * sy
	}

	const points = new Set()

	const length = biggest / world.cellSize

	if (dx === 0 && dy === 0) {
		for (let dx = -size/2; dx <= size/2; dx += world.cellSize) {
			for (let dy = -size/2; dy <= size/2; dy += world.cellSize) {
				points.add([x + dx, y + dy])
			}
		}
	}
	else for (let i = 0; i <= length; i++) {

		const X = px + ix * i
		const Y = py + iy * i

		for (let dx = -size/2; dx <= size/2; dx += world.cellSize) {
			for (let dy = -size/2; dy <= size/2; dy += world.cellSize) {
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

	let cell = world.cellGrid.pick(x, y)
	if (cell === undefined) return
	if (!single && (cell.width !== world.cellSize || cell.height != world.cellSize)) {
		const worldCells = getWorldCellsSet(x, y)
		if (worldCells !== undefined) {
			const merged = world.cellGrid.merge([...worldCells])
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
	const snappedX = Math.floor(x*world.dimension) / world.dimension
	const snappedY = Math.floor(y*world.dimension) / world.dimension

	const sectionSizeScale = world.gridSize / world.dimension

	const sections = new Set()
	for (let wx = 0; wx < sectionSizeScale; wx++) {
		const gridX = Math.floor((snappedX + wx * world.cellSize / sectionSizeScale) * world.gridSize)
		for (let wy = 0; wy < sectionSizeScale; wy++) {
			const gridY = Math.floor((snappedY + wy * world.cellSize / sectionSizeScale) * world.gridSize)
			const sectionId = gridX*world.gridSize + gridY
			const section = world.cellGrid.sections[sectionId]
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

const updatePan = () => {

	const [x, y] = Mouse.position

	if (hand.state === HAND.BRUSH || hand.state === HAND.BRUSHING || hand.state === HAND.PENCILLING) {
		const cell = world.cellGrid.pick(...getCursorView(x, y))
		if (cell !== undefined)	state.brush.hoverColour = cell.colour
	} else {
		const atom = UI.atomRegistry.getAt(x / UI.CT_SCALE, y / UI.CT_SCALE)

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
		UI.updateImageSize()
	}
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

	world.cellGrid.remove(cell)
	for (const child of children) {
		world.cellGrid.add(child)
	}

	return children

}
