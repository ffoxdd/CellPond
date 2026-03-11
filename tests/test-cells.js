const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const { loadCellPond } = require("./setup")

const { context: cellpond } = loadCellPond()

// Helpers
function closeTo(actual, expected, tolerance, message) {
	if (Math.abs(actual - expected) > tolerance) {
		throw new Error(message || `Expected ${actual} to be within ${tolerance} of ${expected}`)
	}
}

function assertArrayEqual(actual, expected) {
	assert.equal(actual.length, expected.length, `length: ${actual.length} !== ${expected.length}`)
	for (let i = 0; i < expected.length; i++) {
		assert.equal(actual[i], expected[i], `index ${i}: ${actual[i]} !== ${expected[i]}`)
	}
}

const grid = () => cellpond.world.cellGrid
const Cell = () => cellpond.Cell

//======//
// Cell //
//======//
describe("Cell", () => {

	it("creates a cell with default values", () => {
		const cell = new (Cell())()
		assert.equal(cell.x, 0)
		assert.equal(cell.y, 0)
		assert.equal(cell.width, 1)
		assert.equal(cell.height, 1)
		assert.equal(cell.colour, 112)
	})

	it("creates a cell with custom values", () => {
		const cell = new (Cell())({ x: 0.25, y: 0.5, width: 0.25, height: 0.25, colour: 999 })
		assert.equal(cell.x, 0.25)
		assert.equal(cell.y, 0.5)
		assert.equal(cell.width, 0.25)
		assert.equal(cell.height, 0.25)
		assert.equal(cell.colour, 999)
	})

	it("computes left/right/top/bottom", () => {
		const cell = new (Cell())({ x: 0.25, y: 0.5, width: 0.25, height: 0.125 })
		assert.equal(cell.left, 0.25)
		assert.equal(cell.right, 0.5)
		assert.equal(cell.top, 0.5)
		assert.equal(cell.bottom, 0.625)
	})

	it("computes center", () => {
		const cell = new (Cell())({ x: 0.0, y: 0.0, width: 0.5, height: 0.5 })
		assert.equal(cell.centerX, 0.25)
		assert.equal(cell.centerY, 0.25)
	})

	it("computes size as area", () => {
		const cell = new (Cell())({ x: 0, y: 0, width: 0.5, height: 0.25 })
		assert.equal(cell.size, 0.125)
	})

	it("starts with empty sections and not deleted", () => {
		const cell = new (Cell())()
		assert.equal(cell.sections.length, 0)
		assert.equal(cell.isDeleted, false)
	})

})

//==============//
// Pure helpers //
//==============//
describe("getRGB", () => {

	it("splits splash into r, g, b components", () => {
		assertArrayEqual(cellpond.getRGB(999), [900, 90, 9])
	})

	it("handles zeros", () => {
		assertArrayEqual(cellpond.getRGB(0), [0, 0, 0])
	})

	it("handles mixed values", () => {
		assertArrayEqual(cellpond.getRGB(305), [300, 0, 5])
	})

	it("handles single digit", () => {
		assertArrayEqual(cellpond.getRGB(7), [0, 0, 7])
	})

	it("handles two digits", () => {
		assertArrayEqual(cellpond.getRGB(42), [0, 40, 2])
	})

})

describe("clamp", () => {

	it("returns value when in range", () => {
		assert.equal(cellpond.clamp(5, 0, 10), 5)
	})

	it("clamps to min", () => {
		assert.equal(cellpond.clamp(-1, 0, 10), 0)
	})

	it("clamps to max", () => {
		assert.equal(cellpond.clamp(15, 0, 10), 10)
	})

	it("returns min when equal to min", () => {
		assert.equal(cellpond.clamp(0, 0, 10), 0)
	})

	it("returns max when equal to max", () => {
		assert.equal(cellpond.clamp(10, 0, 10), 10)
	})

})

describe("wrap", () => {

	it("returns value when in range", () => {
		assert.equal(cellpond.wrap(5, 0, 9), 5)
	})

	it("wraps above max", () => {
		assert.equal(cellpond.wrap(10, 0, 9), 0)
	})

	it("wraps below min", () => {
		assert.equal(cellpond.wrap(-1, 0, 9), 9)
	})

	it("wraps multiple times above", () => {
		assert.equal(cellpond.wrap(20, 0, 9), 0)
	})

	it("wraps multiple times below", () => {
		assert.equal(cellpond.wrap(-11, 0, 9), 9)
	})

})

//==========//
// CellGrid //
//==========//
describe("CellGrid basics", () => {

	it("has gridSize * gridSize sections", () => {
		assert.equal(grid().sections.length, grid().gridSize * grid().gridSize)
	})

	it("sections are Sets", () => {
		const section = grid().sections[0]
		assert.equal(typeof section.has, "function")
		assert.equal(typeof section.add, "function")
		assert.equal(typeof section.delete, "function")
	})

})

describe("CellGrid.add and CellGrid.remove", () => {

	it("add increments cellCount", () => {
		const before = grid().cellCount
		const cell = new (Cell())({ x: 0.1, y: 0.1, width: 0.01, height: 0.01 })
		grid().add(cell)
		assert.equal(grid().cellCount, before + 1)
		grid().remove(cell)
	})

	it("remove decrements cellCount", () => {
		const cell = new (Cell())({ x: 0.1, y: 0.1, width: 0.01, height: 0.01 })
		grid().add(cell)
		const before = grid().cellCount
		grid().remove(cell)
		assert.equal(grid().cellCount, before - 1)
	})

	it("remove marks cell as deleted", () => {
		const cell = new (Cell())({ x: 0.2, y: 0.2, width: 0.01, height: 0.01 })
		grid().add(cell)
		grid().remove(cell)
		assert.equal(cell.isDeleted, true)
	})

	it("add places cell into grid sections", () => {
		const cell = new (Cell())({ x: 0.0, y: 0.0, width: 1 / grid().gridSize, height: 1 / grid().gridSize })
		grid().add(cell)
		assert.ok(cell.sections.length > 0)
		assert.ok(grid().sections[0].has(cell))
		grid().remove(cell)
	})

	it("remove clears cell from grid sections", () => {
		const cell = new (Cell())({ x: 0.0, y: 0.0, width: 1 / grid().gridSize, height: 1 / grid().gridSize })
		grid().add(cell)
		grid().remove(cell)
		assert.equal(grid().sections[0].has(cell), false)
	})

	it("large cell spans multiple sections", () => {
		const cell = new (Cell())({ x: 0.0, y: 0.0, width: 0.5, height: 0.5 })
		grid().add(cell)
		assert.ok(cell.sections.length > 1)
		grid().remove(cell)
	})

})

describe("CellGrid.pick", () => {

	it("returns undefined for out-of-bounds coordinates", () => {
		assert.equal(grid().pick(-0.1, 0.5), undefined)
		assert.equal(grid().pick(0.5, -0.1), undefined)
		assert.equal(grid().pick(1.0, 0.5), undefined)
		assert.equal(grid().pick(0.5, 1.0), undefined)
	})

	it("finds a cell inside bounds", () => {
		const found = grid().pick(0.5, 0.5)
		assert.ok(found !== undefined)
	})

	it("returns the full-size cell when only one exists", () => {
		const found = grid().pick(0.5, 0.5)
		assert.equal(found.x, 0)
		assert.equal(found.y, 0)
		assert.equal(found.width, 1)
		assert.equal(found.height, 1)
	})

})

describe("CellGrid.pickNeighbour", () => {

	it("returns undefined when neighbour is out of bounds", () => {
		const cell = new (Cell())({ x: 0.9, y: 0.9, width: 0.1, height: 0.1 })
		grid().add(cell)
		const found = grid().pickNeighbour(cell, 1, 0)
		assert.equal(found, undefined)
		grid().remove(cell)
	})

})

describe("CellGrid.getAll", () => {

	it("returns cells including world", () => {
		const cells = grid().getAll()
		assert.ok(cells.size > 0)
	})

	it("added cell appears exactly once", () => {
		const cell = new (Cell())({ x: 0.7, y: 0.7, width: 0.01, height: 0.01 })
		grid().add(cell)

		const cells = grid().getAll()
		let count = 0
		for (const c of cells) {
			if (c === cell) count++
		}
		assert.equal(count, 1)

		grid().remove(cell)
	})

})

//============//
// WORLD //
//=======//
describe("world size constants", () => {

	it("world.size is set", () => {
		assert.notEqual(cellpond.world.size, undefined)
	})

	it("world.cellCount is 2^(size*2)", () => {
		assert.equal(cellpond.world.cellCount, 2 ** (cellpond.world.size * 2))
	})

	it("world.dimension is 2^size", () => {
		assert.equal(cellpond.world.dimension, 2 ** cellpond.world.size)
	})

	it("world.cellSize is 1/dimension", () => {
		assert.equal(cellpond.world.cellSize, 1 / cellpond.world.dimension)
	})

})

//=====================//
// CellGrid.split/merge //
//=====================//
describe("CellGrid.split", () => {

	it("splits a cell into a 2x2 grid", () => {
		const cell = new (Cell())({ x: 0.2, y: 0.2, width: 0.1, height: 0.1, colour: 555 })
		grid().add(cell)
		const countBefore = grid().cellCount

		const children = grid().split(cell, 2, 2)

		assert.equal(children.length, 4)
		assert.equal(grid().cellCount, countBefore + 3)
		assert.equal(cell.isDeleted, true)

		for (const child of children) {
			assert.equal(child.width, 0.05)
			assert.equal(child.height, 0.05)
			assert.equal(child.colour, 555)
			grid().remove(child)
		}
	})

	it("splits a cell into a 1x3 grid", () => {
		const cell = new (Cell())({ x: 0.0, y: 0.6, width: 0.3, height: 0.3, colour: 222 })
		grid().add(cell)

		const children = grid().split(cell, 1, 3)

		assert.equal(children.length, 3)
		for (const child of children) {
			assert.equal(child.width, 0.3)
			closeTo(child.height, 0.1, 1e-10)
			grid().remove(child)
		}
	})

})

describe("CellGrid.merge", () => {

	it("merges adjacent cells into one", () => {
		const a = new (Cell())({ x: 0.2, y: 0.2, width: 0.1, height: 0.1, colour: 333 })
		const b = new (Cell())({ x: 0.3, y: 0.2, width: 0.1, height: 0.1, colour: 333 })
		grid().add(a)
		grid().add(b)
		const countBefore = grid().cellCount

		const merged = grid().merge([a, b])

		assert.equal(grid().cellCount, countBefore - 1)
		assert.equal(merged.x, 0.2)
		assert.equal(merged.y, 0.2)
		closeTo(merged.width, 0.2, 1e-9)
		closeTo(merged.height, 0.1, 1e-9)
		assert.equal(merged.colour, 333)
		assert.equal(a.isDeleted, true)
		assert.equal(b.isDeleted, true)

		grid().remove(merged)
	})

})

//==============//
// Cell fitting //
//==============//
describe("isFit", () => {

	it("returns true for horizontally adjacent cells", () => {
		const a = new (Cell())({ x: 0.0, y: 0.0, width: 0.1, height: 0.1 })
		const b = new (Cell())({ x: 0.1, y: 0.0, width: 0.1, height: 0.1 })
		assert.equal(cellpond.isFit(a, b), true)
	})

	it("returns true for vertically adjacent cells", () => {
		const a = new (Cell())({ x: 0.0, y: 0.0, width: 0.1, height: 0.1 })
		const b = new (Cell())({ x: 0.0, y: 0.1, width: 0.1, height: 0.1 })
		assert.equal(cellpond.isFit(a, b), true)
	})

	it("returns false for non-adjacent cells", () => {
		const a = new (Cell())({ x: 0.0, y: 0.0, width: 0.1, height: 0.1 })
		const b = new (Cell())({ x: 0.5, y: 0.5, width: 0.1, height: 0.1 })
		assert.equal(cellpond.isFit(a, b), false)
	})

})

describe("aligns", () => {

	it("returns true when all cells are the same size", () => {
		const a = new (Cell())({ x: 0.0, y: 0.0, width: 0.1, height: 0.1 })
		const b = new (Cell())({ x: 0.1, y: 0.0, width: 0.1, height: 0.1 })
		const c = new (Cell())({ x: 0.2, y: 0.0, width: 0.1, height: 0.1 })
		assert.equal(cellpond.aligns([a, b, c]), true)
	})

	it("returns false when cells have different sizes", () => {
		const a = new (Cell())({ x: 0.0, y: 0.0, width: 0.1, height: 0.1 })
		const b = new (Cell())({ x: 0.1, y: 0.0, width: 0.2, height: 0.1 })
		assert.equal(cellpond.aligns([a, b]), false)
	})

})

describe("fits", () => {

	it("returns true for cells that tile a rectangle", () => {
		const a = new (Cell())({ x: 0.0, y: 0.0, width: 0.1, height: 0.1 })
		const b = new (Cell())({ x: 0.1, y: 0.0, width: 0.1, height: 0.1 })
		assert.equal(cellpond.fits([a, b]), true)
	})

	it("returns false for disconnected cells", () => {
		const a = new (Cell())({ x: 0.0, y: 0.0, width: 0.1, height: 0.1 })
		const b = new (Cell())({ x: 0.5, y: 0.5, width: 0.1, height: 0.1 })
		assert.equal(cellpond.fits([a, b]), false)
	})

})
