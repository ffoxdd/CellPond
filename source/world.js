//=========//
// WORLD   //
//=========//
class World {
	constructor(gridSize = 128) {
		this.gridSize = gridSize
		this.cellGrid = new CellGrid(gridSize)
		this.built = false
		this.setSize(6)
	}

	setSize(size) {
		this.size = size
		this.cellCount = 2 ** (size * 2)
		this.dimension = 2 ** size
		this.cellSize = 1 / this.dimension
	}

	overrideCells(cells, drawQueue) {
		this.cellGrid.clear()
		for (const cell of cells) {
			this.cellGrid.add(cell)
		}
		drawQueue.requestReset()
	}
}
