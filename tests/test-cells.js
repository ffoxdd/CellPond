const { describe, it, run } = require("./runner")
const assert = require("node:assert/strict")
const { loadCellPond } = require("./setup")

const { context: w } = loadCellPond()

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
		const cell = w.makeCell()
		assert.equal(cell.x, 0)
		assert.equal(cell.y, 0)
		assert.equal(cell.width, 1)
		assert.equal(cell.height, 1)
		assert.equal(cell.colour, 112)
	})

	it("creates a cell with custom values", () => {
		const cell = w.makeCell({ x: 0.25, y: 0.5, width: 0.25, height: 0.25, colour: 999 })
		assert.equal(cell.x, 0.25)
		assert.equal(cell.y, 0.5)
		assert.equal(cell.width, 0.25)
		assert.equal(cell.height, 0.25)
		assert.equal(cell.colour, 999)
	})

	it("computes left/right/top/bottom", () => {
		const cell = w.makeCell({ x: 0.25, y: 0.5, width: 0.25, height: 0.125 })
		assert.equal(cell.left, 0.25)
		assert.equal(cell.right, 0.5)
		assert.equal(cell.top, 0.5)
		assert.equal(cell.bottom, 0.625)
	})

	it("computes center", () => {
		const cell = w.makeCell({ x: 0.0, y: 0.0, width: 0.5, height: 0.5 })
		assert.equal(cell.centerX, 0.25)
		assert.equal(cell.centerY, 0.25)
	})

	it("computes size as area", () => {
		const cell = w.makeCell({ x: 0, y: 0, width: 0.5, height: 0.25 })
		assert.equal(cell.size, 0.125)
	})

	it("starts with empty sections array", () => {
		const cell = w.makeCell()
		assert.equal(cell.sections.length, 0)
	})

})

//==============//
// Pure helpers //
//==============//
describe("getRGB", () => {

	it("splits splash into r, g, b components", () => {
		assertArrayEqual(w.getRGB(999), [900, 90, 9])
	})

	it("handles zeros", () => {
		assertArrayEqual(w.getRGB(0), [0, 0, 0])
	})

	it("handles mixed values", () => {
		assertArrayEqual(w.getRGB(305), [300, 0, 5])
	})

	it("handles single digit", () => {
		assertArrayEqual(w.getRGB(7), [0, 0, 7])
	})

	it("handles two digits", () => {
		assertArrayEqual(w.getRGB(42), [0, 40, 2])
	})

})

describe("clamp", () => {

	it("returns value when in range", () => {
		assert.equal(w.clamp(5, 0, 10), 5)
	})

	it("clamps to min", () => {
		assert.equal(w.clamp(-1, 0, 10), 0)
	})

	it("clamps to max", () => {
		assert.equal(w.clamp(15, 0, 10), 10)
	})

	it("returns min when equal to min", () => {
		assert.equal(w.clamp(0, 0, 10), 0)
	})

	it("returns max when equal to max", () => {
		assert.equal(w.clamp(10, 0, 10), 10)
	})

})

describe("wrap", () => {

	it("returns value when in range", () => {
		assert.equal(w.wrap(5, 0, 9), 5)
	})

	it("wraps above max", () => {
		assert.equal(w.wrap(10, 0, 9), 0)
	})

	it("wraps below min", () => {
		assert.equal(w.wrap(-1, 0, 9), 9)
	})

	it("wraps multiple times above", () => {
		assert.equal(w.wrap(20, 0, 9), 0)
	})

	it("wraps multiple times below", () => {
		assert.equal(w.wrap(-11, 0, 9), 9)
	})

})

//===================//
// Grid and caching  //
//===================//
describe("grid and caching", () => {

	it("grid has GRID_SIZE * GRID_SIZE sections", () => {
		assert.equal(w.state.grid.length, w.GRID_SIZE * w.GRID_SIZE)
	})

	it("sections are Sets", () => {
		// Can't use instanceof cross-realm, so check for Set-like behaviour
		const section = w.state.grid[0]
		assert.equal(typeof section.has, "function")
		assert.equal(typeof section.add, "function")
		assert.equal(typeof section.delete, "function")
	})

	it("cacheCell places cell into correct sections", () => {
		const cell = w.makeCell({ x: 0.0, y: 0.0, width: 1 / w.GRID_SIZE, height: 1 / w.GRID_SIZE })
		w.cacheCell(cell)

		assert.ok(cell.sections.length > 0)
		assert.ok(w.state.grid[0].has(cell))

		w.uncacheCell(cell)
	})

	it("uncacheCell removes cell from all sections", () => {
		const cell = w.makeCell({ x: 0.0, y: 0.0, width: 1 / w.GRID_SIZE, height: 1 / w.GRID_SIZE })
		w.cacheCell(cell)
		w.uncacheCell(cell)

		assert.equal(w.state.grid[0].has(cell), false)
	})

	it("large cell spans multiple sections", () => {
		const cell = w.makeCell({ x: 0.0, y: 0.0, width: 0.5, height: 0.5 })
		w.cacheCell(cell)

		assert.ok(cell.sections.length > 1)

		w.uncacheCell(cell)
	})

})

//====================//
// addCell/deleteCell //
//====================//
describe("addCell and deleteCell", () => {

	it("addCell increments cellCount", () => {
		const before = w.state.cellCount
		const cell = w.makeCell({ x: 0.1, y: 0.1, width: 0.01, height: 0.01 })
		w.addCell(cell)
		assert.equal(w.state.cellCount, before + 1)
		w.deleteCell(cell)
	})

	it("deleteCell decrements cellCount", () => {
		const cell = w.makeCell({ x: 0.1, y: 0.1, width: 0.01, height: 0.01 })
		w.addCell(cell)
		const before = w.state.cellCount
		w.deleteCell(cell)
		assert.equal(w.state.cellCount, before - 1)
	})

	it("deleteCell marks cell as deleted", () => {
		const cell = w.makeCell({ x: 0.2, y: 0.2, width: 0.01, height: 0.01 })
		w.addCell(cell)
		w.deleteCell(cell)
		assert.equal(cell.isDeleted, true)
	})

})

//==========//
// pickCell //
//==========//
describe("pickCell", () => {

	it("returns undefined for out-of-bounds coordinates", () => {
		assert.equal(w.pickCell(-0.1, 0.5), undefined)
		assert.equal(w.pickCell(0.5, -0.1), undefined)
		assert.equal(w.pickCell(1.0, 0.5), undefined)
		assert.equal(w.pickCell(0.5, 1.0), undefined)
	})

	it("finds a cell inside bounds", () => {
		const found = w.pickCell(0.5, 0.5)
		assert.ok(found !== undefined)
	})

	it("returns the world cell when only world exists", () => {
		const found = w.pickCell(0.5, 0.5)
		assert.equal(found, w.world)
	})

})

//===============//
// pickNeighbour //
//===============//
describe("pickNeighbour", () => {

	it("returns undefined when neighbour is out of bounds", () => {
		const cell = w.makeCell({ x: 0.9, y: 0.9, width: 0.1, height: 0.1 })
		w.addCell(cell)

		const found = w.pickNeighbour(cell, 1, 0)
		assert.equal(found, undefined)

		w.deleteCell(cell)
	})

})

//============//
// getCells   //
//============//
describe("getCells", () => {

	it("returns cells including world", () => {
		const cells = w.getCells()
		assert.ok(cells.size > 0)
	})

	it("added cell appears exactly once", () => {
		const cell = w.makeCell({ x: 0.7, y: 0.7, width: 0.01, height: 0.01 })
		w.addCell(cell)

		const cells = w.getCells()
		let count = 0
		for (const c of cells) {
			if (c === cell) count++
		}
		assert.equal(count, 1)

		w.deleteCell(cell)
	})

})

//============//
// WORLD_SIZE //
//============//
describe("world size constants", () => {

	it("WORLD_SIZE is set", () => {
		assert.notEqual(w.WORLD_SIZE, undefined)
	})

	it("WORLD_CELL_COUNT is 2^(WORLD_SIZE*2)", () => {
		assert.equal(w.WORLD_CELL_COUNT, 2 ** (w.WORLD_SIZE * 2))
	})

	it("WORLD_DIMENSION is 2^WORLD_SIZE", () => {
		assert.equal(w.WORLD_DIMENSION, 2 ** w.WORLD_SIZE)
	})

	it("WORLD_CELL_SIZE is 1/WORLD_DIMENSION", () => {
		assert.equal(w.WORLD_CELL_SIZE, 1 / w.WORLD_DIMENSION)
	})

})

run()
