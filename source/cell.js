//======//
// CELL //
//======//
class Cell {
	constructor({x=0, y=0, width=1, height=1, colour=112} = {}) {
		this.x = x
		this.y = y
		this.width = width
		this.height = height
		this.colour = colour

		this.left = x
		this.right = x + width
		this.top = y
		this.bottom = y + height
		this.centerX = x + width/2
		this.centerY = y + height/2
		this.size = width * height

		this.sections = []
		this.isDeleted = false
	}
}

//======//
// GRID //
//======//
// The grid divides the 0-1 coordinate space into gridSize x gridSize sections.
// Each section is a Set of cells that overlap it.
// This gives O(1) spatial lookup instead of scanning every cell.
// Cells can appear in multiple sections if they span more than one.
class CellGrid {

	constructor(gridSize = 128) {
		this.gridSize = gridSize
		this.sections = []
		this.cellCount = 0
		this.initialise()
	}

	initialise() {
		for (let x = 0; x < this.gridSize; x++) {
			for (let y = 0; y < this.gridSize; y++) {
				const section = new Set()
				this.sections.push(section)
				section.left = x / this.gridSize
				section.top = y / this.gridSize
				section.right = section.left + 1/this.gridSize
				section.bottom = section.top + 1/this.gridSize
				section.isSection = true
			}
		}
	}

	// Register a cell in every grid section it overlaps
	cache(cell) {
		const left = Math.floor(cell.left * this.gridSize)
		const top = Math.floor(cell.top * this.gridSize)
		const right = Math.ceil(cell.right * this.gridSize)
		const bottom = Math.ceil(cell.bottom * this.gridSize)

		for (let x = left; x < right; x++) {
			for (let y = top; y < bottom; y++) {
				const id = x*this.gridSize + y
				if (this.sections[id] === undefined) {
					continue
				}
				this.sections[id].add(cell)
				cell.sections.push(this.sections[id])
			}
		}
	}

	// Remove a cell from every grid section it was registered in
	uncache(cell) {
		for (const section of cell.sections) {
			section.delete(cell)
		}
	}

	add(cell) {
		this.cache(cell)
		this.cellCount++
	}

	remove(cell) {
		this.uncache(cell)
		cell.isDeleted = true
		this.cellCount--
	}

	getAll() {
		const cells = new Set()
		for (const section of this.sections) {
			for (const cell of section.values()) {
				cells.add(cell)
			}
		}
		return cells
	}

	clear() {
		for (const section of this.sections) {
			for (const cell of section.values()) {
				cell.isDeleted = true
				cell.sections = []
			}
			section.clear()
		}
		this.cellCount = 0
		this.sections = []
		this.initialise()
	}

	// Find the cell at a point in 0-1 coordinate space
	pick(x, y) {
		if (x >= 1) return undefined
		if (y >= 1) return undefined
		if (x <  0) return undefined
		if (y <  0) return undefined

		const gridX = Math.floor(x * this.gridSize)
		const gridY = Math.floor(y * this.gridSize)
		const sectionId = gridX*this.gridSize + gridY
		const section = this.sections[sectionId]

		if (section === undefined) return undefined

		let i = 1
		const size = section.size
		const values = section.values()

		for (const cell of values) {
			// If this is the last cell in the section, it must be the one
			// (the largest/parent cell is always last — it's the fallback)
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

	pickNeighbour(cell, dx, dy) {
		const x = cell.centerX + dx*cell.width
		const y = cell.centerY + dy*cell.height
		return this.pick(x, y)
	}

	// Replace a cell with a grid of smaller cells
	split(cell, width, height) {
		const childWidth = cell.width / width
		const childHeight = cell.height / height
		const children = []

		for (let ix = 0; ix < width; ix++) {
			const x = cell.x + childWidth*ix
			for (let iy = 0; iy < height; iy++) {
				const y = cell.y + childHeight*iy
				const child = new Cell({x, y, width: childWidth, height: childHeight, colour: cell.colour})
				children.push(child)
			}
		}

		this.remove(cell)
		for (const child of children) {
			this.add(child)
		}

		return children
	}

	// Combine cells into one cell covering their bounding box
	merge(cells) {
		let left = 1
		let top = 1
		let right = 0
		let bottom = 0

		for (const cell of cells) {
			if (cell.left < left) left = cell.left
			if (cell.top < top) top = cell.top
			if (cell.right > right) right = cell.right
			if (cell.bottom > bottom) bottom = cell.bottom
			this.remove(cell)
		}

		const cell = new Cell({
			x: left,
			y: top,
			width: right-left,
			height: bottom-top,
			colour: cells[0].colour,
		})

		this.add(cell)
		return cell
	}
}

//==============//
// CELL FITTING //
//==============//
// Check if two cells share an edge
const isFit = (cell, connection) => {
	if (cell.height === connection.height && cell.top === connection.top) {
		if (cell.left === connection.right) return true
		if (cell.right === connection.left) return true
	}

	if (cell.width === connection.width && cell.right === connection.right) {
		if (cell.top === connection.bottom) return true
		if (cell.bottom === connection.top) return true
	}

	return false
}

// Check if cells are all the same size
const aligns = (cells) => {
	const [head, ...tail] = cells
	return tail.every(cell => cell.width === head.width && cell.height === head.height)
}

// Check if cells form a connected group (adjacent in any arrangement)
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
