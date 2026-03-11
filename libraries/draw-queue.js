//=============//
// DRAW QUEUE  //
//=============//
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
		for (const section of DrawQueue.shuffleArray([...this.cellGrid.sections])) {
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

	static shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const r = Random.Uint32 % (i+1)
			;[array[i], array[r]] = [array[r], array[i]]
		}
		return array
	}
}
