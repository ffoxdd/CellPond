const { describe, it, run } = require("./runner")
const assert = require("node:assert/strict")
const { loadCellPond } = require("./setup")

const { context: cellpond } = loadCellPond()

// Helper: approximate equality for floating point
assert.closeTo = (actual, expected, tolerance, message) => {
	if (Math.abs(actual - expected) > tolerance) {
		throw new Error(message || `Expected ${actual} to be within ${tolerance} of ${expected}`)
	}
}

// Helper: compare arrays by value (avoids cross-realm deepStrictEqual issues)
function assertArrayEqual(actual, expected) {
	assert.equal(actual.length, expected.length, `length: ${actual.length} !== ${expected.length}`)
	for (let i = 0; i < expected.length; i++) {
		assert.equal(actual[i], expected[i], `index ${i}: ${actual[i]} !== ${expected[i]}`)
	}
}

//===========//
// makeCell  //
//===========//
describe("makeCell", () => {

	it("creates a cell with default values", () => {
		const cell = cellpond.makeCell()
		assert.equal(cell.x, 0)
		assert.equal(cell.y, 0)
		assert.equal(cell.width, 1)
		assert.equal(cell.height, 1)
		assert.equal(cell.colour, 112)
	})

	it("creates a cell with custom values", () => {
		const cell = cellpond.makeCell({ x: 0.25, y: 0.5, width: 0.25, height: 0.25, colour: 999 })
		assert.equal(cell.x, 0.25)
		assert.equal(cell.y, 0.5)
		assert.equal(cell.width, 0.25)
		assert.equal(cell.height, 0.25)
		assert.equal(cell.colour, 999)
	})

	it("computes left/right/top/bottom", () => {
		const cell = cellpond.makeCell({ x: 0.25, y: 0.5, width: 0.25, height: 0.125 })
		assert.equal(cell.left, 0.25)
		assert.equal(cell.right, 0.5)
		assert.equal(cell.top, 0.5)
		assert.equal(cell.bottom, 0.625)
	})

	it("computes center", () => {
		const cell = cellpond.makeCell({ x: 0.0, y: 0.0, width: 0.5, height: 0.5 })
		assert.equal(cell.centerX, 0.25)
		assert.equal(cell.centerY, 0.25)
	})

	it("computes size as area", () => {
		const cell = cellpond.makeCell({ x: 0, y: 0, width: 0.5, height: 0.25 })
		assert.equal(cell.size, 0.125)
	})

	it("starts with empty sections array", () => {
		const cell = cellpond.makeCell()
		assert.equal(cell.sections.length, 0)
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

//===================//
// Grid and caching  //
//===================//
describe("grid and caching", () => {

	it("grid has GRID_SIZE * GRID_SIZE sections", () => {
		assert.equal(cellpond.state.grid.length, cellpond.GRID_SIZE * cellpond.GRID_SIZE)
	})

	it("sections are Sets", () => {
		// Can't use instanceof cross-realm, so check for Set-like behaviour
		const section = cellpond.state.grid[0]
		assert.equal(typeof section.has, "function")
		assert.equal(typeof section.add, "function")
		assert.equal(typeof section.delete, "function")
	})

	it("cacheCell places cell into correct sections", () => {
		const cell = cellpond.makeCell({ x: 0.0, y: 0.0, width: 1 / cellpond.GRID_SIZE, height: 1 / cellpond.GRID_SIZE })
		cellpond.cacheCell(cell)

		assert.ok(cell.sections.length > 0)
		assert.ok(cellpond.state.grid[0].has(cell))

		cellpond.uncacheCell(cell)
	})

	it("uncacheCell removes cell from all sections", () => {
		const cell = cellpond.makeCell({ x: 0.0, y: 0.0, width: 1 / cellpond.GRID_SIZE, height: 1 / cellpond.GRID_SIZE })
		cellpond.cacheCell(cell)
		cellpond.uncacheCell(cell)

		assert.equal(cellpond.state.grid[0].has(cell), false)
	})

	it("large cell spans multiple sections", () => {
		const cell = cellpond.makeCell({ x: 0.0, y: 0.0, width: 0.5, height: 0.5 })
		cellpond.cacheCell(cell)

		assert.ok(cell.sections.length > 1)

		cellpond.uncacheCell(cell)
	})

})

//====================//
// addCell/deleteCell //
//====================//
describe("addCell and deleteCell", () => {

	it("addCell increments cellCount", () => {
		const before = cellpond.state.cellCount
		const cell = cellpond.makeCell({ x: 0.1, y: 0.1, width: 0.01, height: 0.01 })
		cellpond.addCell(cell)
		assert.equal(cellpond.state.cellCount, before + 1)
		cellpond.deleteCell(cell)
	})

	it("deleteCell decrements cellCount", () => {
		const cell = cellpond.makeCell({ x: 0.1, y: 0.1, width: 0.01, height: 0.01 })
		cellpond.addCell(cell)
		const before = cellpond.state.cellCount
		cellpond.deleteCell(cell)
		assert.equal(cellpond.state.cellCount, before - 1)
	})

	it("deleteCell marks cell as deleted", () => {
		const cell = cellpond.makeCell({ x: 0.2, y: 0.2, width: 0.01, height: 0.01 })
		cellpond.addCell(cell)
		cellpond.deleteCell(cell)
		assert.equal(cell.isDeleted, true)
	})

})

//==========//
// pickCell //
//==========//
describe("pickCell", () => {

	it("returns undefined for out-of-bounds coordinates", () => {
		assert.equal(cellpond.pickCell(-0.1, 0.5), undefined)
		assert.equal(cellpond.pickCell(0.5, -0.1), undefined)
		assert.equal(cellpond.pickCell(1.0, 0.5), undefined)
		assert.equal(cellpond.pickCell(0.5, 1.0), undefined)
	})

	it("finds a cell inside bounds", () => {
		const found = cellpond.pickCell(0.5, 0.5)
		assert.ok(found !== undefined)
	})

	it("returns the world cell when only world exists", () => {
		const found = cellpond.pickCell(0.5, 0.5)
		assert.equal(found, cellpond.world)
	})

})

//===============//
// pickNeighbour //
//===============//
describe("pickNeighbour", () => {

	it("returns undefined when neighbour is out of bounds", () => {
		const cell = cellpond.makeCell({ x: 0.9, y: 0.9, width: 0.1, height: 0.1 })
		cellpond.addCell(cell)

		const found = cellpond.pickNeighbour(cell, 1, 0)
		assert.equal(found, undefined)

		cellpond.deleteCell(cell)
	})

})

//============//
// getCells   //
//============//
describe("getCells", () => {

	it("returns cells including world", () => {
		const cells = cellpond.getCells()
		assert.ok(cells.size > 0)
	})

	it("added cell appears exactly once", () => {
		const cell = cellpond.makeCell({ x: 0.7, y: 0.7, width: 0.01, height: 0.01 })
		cellpond.addCell(cell)

		const cells = cellpond.getCells()
		let count = 0
		for (const c of cells) {
			if (c === cell) count++
		}
		assert.equal(count, 1)

		cellpond.deleteCell(cell)
	})

})

//============//
// WORLD_SIZE //
//============//
describe("world size constants", () => {

	it("WORLD_SIZE is set", () => {
		assert.notEqual(cellpond.WORLD_SIZE, undefined)
	})

	it("WORLD_CELL_COUNT is 2^(WORLD_SIZE*2)", () => {
		assert.equal(cellpond.WORLD_CELL_COUNT, 2 ** (cellpond.WORLD_SIZE * 2))
	})

	it("WORLD_DIMENSION is 2^WORLD_SIZE", () => {
		assert.equal(cellpond.WORLD_DIMENSION, 2 ** cellpond.WORLD_SIZE)
	})

	it("WORLD_CELL_SIZE is 1/WORLD_DIMENSION", () => {
		assert.equal(cellpond.WORLD_CELL_SIZE, 1 / cellpond.WORLD_DIMENSION)
	})

})

//===========//
// splitCell //
//===========//
describe("splitCell", () => {

	it("splits a cell into a 2x2 grid", () => {
		const cell = cellpond.makeCell({ x: 0.2, y: 0.2, width: 0.1, height: 0.1, colour: 555 })
		cellpond.addCell(cell)
		const countBefore = cellpond.state.cellCount

		const children = cellpond.splitCell(cell, 2, 2)

		assert.equal(children.length, 4)
		// Original cell removed, 4 children added: net +3
		assert.equal(cellpond.state.cellCount, countBefore + 3)
		assert.equal(cell.isDeleted, true)

		// Children should tile the original cell's area
		for (const child of children) {
			assert.equal(child.width, 0.05)
			assert.equal(child.height, 0.05)
			assert.equal(child.colour, 555)
			cellpond.deleteCell(child)
		}
	})

	it("splits a cell into a 1x3 grid", () => {
		const cell = cellpond.makeCell({ x: 0.0, y: 0.6, width: 0.3, height: 0.3, colour: 222 })
		cellpond.addCell(cell)

		const children = cellpond.splitCell(cell, 1, 3)

		assert.equal(children.length, 3)
		for (const child of children) {
			assert.equal(child.width, 0.3)
			assert.closeTo(child.height, 0.1, 1e-10)
			cellpond.deleteCell(child)
		}
	})

})

//============//
// mergeCells //
//============//
describe("mergeCells", () => {

	it("merges adjacent cells into one", () => {
		const a = cellpond.makeCell({ x: 0.2, y: 0.2, width: 0.1, height: 0.1, colour: 333 })
		const b = cellpond.makeCell({ x: 0.3, y: 0.2, width: 0.1, height: 0.1, colour: 333 })
		cellpond.addCell(a)
		cellpond.addCell(b)
		const countBefore = cellpond.state.cellCount

		const merged = cellpond.mergeCells([a, b])

		// Two removed, one added: net -1
		assert.equal(cellpond.state.cellCount, countBefore - 1)
		assert.equal(merged.x, 0.2)
		assert.equal(merged.y, 0.2)
		assert.closeTo(merged.width, 0.2, 1e-9)
		assert.closeTo(merged.height, 0.1, 1e-9)
		assert.equal(merged.colour, 333)
		assert.equal(a.isDeleted, true)
		assert.equal(b.isDeleted, true)

		cellpond.deleteCell(merged)
	})

})

//=================//
// fits and aligns //
//=================//
describe("isFit", () => {

	it("returns true for horizontally adjacent cells", () => {
		const a = cellpond.makeCell({ x: 0.0, y: 0.0, width: 0.1, height: 0.1 })
		const b = cellpond.makeCell({ x: 0.1, y: 0.0, width: 0.1, height: 0.1 })
		assert.ok(cellpond.isFit(a, b))
	})

	it("returns true for vertically adjacent cells", () => {
		const a = cellpond.makeCell({ x: 0.0, y: 0.0, width: 0.1, height: 0.1 })
		const b = cellpond.makeCell({ x: 0.0, y: 0.1, width: 0.1, height: 0.1 })
		assert.ok(cellpond.isFit(a, b))
	})

	it("returns undefined for non-adjacent cells", () => {
		const a = cellpond.makeCell({ x: 0.0, y: 0.0, width: 0.1, height: 0.1 })
		const b = cellpond.makeCell({ x: 0.5, y: 0.5, width: 0.1, height: 0.1 })
		assert.equal(cellpond.isFit(a, b), undefined)
	})

})

describe("aligns", () => {

	it("returns true when all cells are the same size", () => {
		const a = cellpond.makeCell({ x: 0.0, y: 0.0, width: 0.1, height: 0.1 })
		const b = cellpond.makeCell({ x: 0.1, y: 0.0, width: 0.1, height: 0.1 })
		const c = cellpond.makeCell({ x: 0.2, y: 0.0, width: 0.1, height: 0.1 })
		assert.equal(cellpond.aligns([a, b, c]), true)
	})

	it("returns false when cells have different sizes", () => {
		const a = cellpond.makeCell({ x: 0.0, y: 0.0, width: 0.1, height: 0.1 })
		const b = cellpond.makeCell({ x: 0.1, y: 0.0, width: 0.2, height: 0.1 })
		assert.equal(cellpond.aligns([a, b]), false)
	})

})

describe("fits", () => {

	it("returns true for cells that tile a rectangle", () => {
		const a = cellpond.makeCell({ x: 0.0, y: 0.0, width: 0.1, height: 0.1 })
		const b = cellpond.makeCell({ x: 0.1, y: 0.0, width: 0.1, height: 0.1 })
		assert.equal(cellpond.fits([a, b]), true)
	})

	it("returns false for disconnected cells", () => {
		const a = cellpond.makeCell({ x: 0.0, y: 0.0, width: 0.1, height: 0.1 })
		const b = cellpond.makeCell({ x: 0.5, y: 0.5, width: 0.1, height: 0.1 })
		assert.equal(cellpond.fits([a, b]), false)
	})

})

run()
