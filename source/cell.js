//======//
// CELL //
//======//
const makeCell = ({x=0, y=0, width=1, height=1, colour=112} = {}) => {

	const left = x
	const right = x+width
	const top = y
	const bottom = y+height

	const size = width * height

	const centerX = left + width/2
	const centerY = top + height/2

	const sections = []
	const lastDraw = undefined
	//const lastDrawCount = 1
	const lastDrawRepeat = 0

	const cell = {x, y, width, height, colour, left, right, top, bottom, centerX, centerY, sections, size, lastDraw, lastDrawRepeat}
	return cell

}

//======//
// GRID //
//======//
// The grid is basically the screen cut up into smaller sections
// It helps to speed up cell lookup because it gives us a smaller area to search through
// Note: Cells can be in multiple sections if they are big enough :)
// NOTE: GRID_SIZE MUST BE BIG ENOUGH SO THAT SECTIONS ARE SMALLER OR EQUAL TO WORLD CELLS
const GRID_SIZE = 128
const initialiseGrid = () => {
	for (let x = 0; x < GRID_SIZE; x++) {
		for (let y = 0; y < GRID_SIZE; y++) {
			const section = new Set()
			state.grid.push(section)
			section.left = x / GRID_SIZE
			section.top = y / GRID_SIZE
			section.right = section.left + 1/GRID_SIZE
			section.bottom = section.top + 1/GRID_SIZE
			section.isSection = true
		}
	}
}

const cacheCell = (cell) => {
	const left = Math.floor(cell.left * GRID_SIZE)
	const top = Math.floor(cell.top * GRID_SIZE)
	const right = Math.ceil(cell.right * GRID_SIZE)
	const bottom = Math.ceil(cell.bottom * GRID_SIZE)

	for (let x = left; x < right; x++) {
		for (let y = top; y < bottom; y++) {
			const id = x*GRID_SIZE + y
			if (state.grid[id] === undefined) {
				continue
			}
			state.grid[id].add(cell)
			cell.sections.push(state.grid[id])
		}
	}
}

const uncacheCell = (cell) => {
	for (const section of cell.sections) {
		section.delete(cell)
	}
}

//=================//
// CELL OPERATIONS //
//=================//
const addCell = (cell) => {
	cacheCell(cell)
	state.cellCount++
}

const deleteCell = (cell) => {
	uncacheCell(cell)
	cell.isDeleted = true
	state.cellCount--
}

const getCells = () => {
	const cells = new Set()
	for (const section of state.grid) {
		for (const cell of section.values()) {
			cells.add(cell)
		}
	}
	return cells
}

const deleteAllCells = () => {
	for (const section of state.grid) {
		for (const cell of section.values()) {
			cell.isDeleted = true
			cell.sections = []
		}
		section.clear()
	}
	state.cellCount = 0
	state.grid = []
	initialiseGrid()
}

//=============//
// CELL LOOKUP //
//=============//
const pickCell = (x, y) => {

	if (x >= 1) return undefined
	if (y >= 1) return undefined
	if (x <  0) return undefined
	if (y <  0) return undefined

	const gridX = Math.floor(x * GRID_SIZE)
	const gridY = Math.floor(y * GRID_SIZE)
	const sectionId = gridX*GRID_SIZE + gridY
	const section = state.grid[sectionId]

	if (section === undefined) return undefined

	let i = 1
	const size = section.size
	const values = section.values()

	for (const cell of values) {
		if (i === size) return cell
		i++
		if (cell.left > x) continue
		if (cell.top > y) continue
		if (cell.right <= x) continue
		if (cell.bottom <= y) continue
		return cell
	}

	return undefined
}

const pickNeighbour = (cell, dx, dy) => {
	const centerX = cell.left + cell.width/2
	const centerY = cell.top + cell.height/2

	const x = centerX + dx*cell.width
	const y = centerY + dy*cell.height

	const neighbour = pickCell(x, y)
	return neighbour
}

//===============//
// SPLIT + MERGE //
//===============//
const splitCell = (cell, width, height) => {

	const childWidth = cell.width / width
	const childHeight = cell.height / height

	const children = []

	const xStart = cell.x
	const yStart = cell.y
	const dx = childWidth
	const dy = childHeight

	for (let ix = 0; ix < width; ix++) {
		const x = xStart + dx*ix
		for (let iy = 0; iy < height; iy++) {
			const y = yStart + dy*iy
			const child = makeCell({x, y, width: childWidth, height: childHeight, colour: cell.colour, lastDraw: cell.lastDraw})
			children.push(child)
		}
	}

	deleteCell(cell)
	for (const child of children) {
		addCell(child)
	}

	return children
}

// Warning: bugs will happen if you try to merge cells that don't align or aren't next to each other
const mergeCells = (cells) => {

	let left = 1
	let top = 1
	let right = 0
	let bottom = 0

	for (const cell of cells) {
		if (cell.left < left) left = cell.left
		if (cell.top < top) top = cell.top
		if (cell.right > right) right = cell.right
		if (cell.bottom > bottom) bottom = cell.bottom
		deleteCell(cell)
	}

	const cell = makeCell({
		x: left,
		y: top,
		width: right-left,
		height: bottom-top,
		colour: cells[0].colour,
		lastDraw: cells[0].lastDraw,
	})

	addCell(cell)

	return cell

}

//==============//
// CELL FITTING //
//==============//
// NOTE: this checks if the cells fit together in ANY POSSIBLE WAY
// it might not be the arrangement of cells that you are interested in
const fits = (cells) => {

	const [head, ...tail] = cells

	const connections = [head]
	let failureCount = 0

	let i = 0
	while (connections.length <= cells.length) {

		const cell = tail[i]
		const connection = connections.find(connection => isFit(cell, connection))
		if (!connection) {
			failureCount++
			if (failureCount === (cells.length - connections.length)) return false
		} else {
			failureCount = 0
			connections.push(cell)
		}

		i++
		if (i >= tail.length) i = 0
	}

	return true

}

// Only checks if cells are the same size
const aligns = (cells) => {

	const [head, ...tail] = cells
	const {width, height} = head
	const isAligned = tail.every(cell => cell.width === width && cell.height === height)
	return isAligned

}

const isFit = (cell, connection) => {
	if (cell.height === connection.height && cell.top === connection.top) {
		if (cell.left === connection.right) return true
		if (cell.right === connection.left) return true
	}

	if (cell.width === connection.width && cell.right === connection.right) {
		if (cell.top === connection.bottom) return true
		if (cell.bottom === connection.top) return true
	}

	return
}
