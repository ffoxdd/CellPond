const { describe, it, run } = require("./runner")
const assert = require("node:assert/strict")
const { loadCellPond } = require("./setup")

const { context: cellpond } = loadCellPond()

// Helper: compare arrays by value (avoids cross-realm deepStrictEqual issues)
function assertArrayEqual(actual, expected) {
	assert.equal(actual.length, expected.length, `length: ${actual.length} !== ${expected.length}`)
	for (let i = 0; i < expected.length; i++) {
		assert.equal(actual[i], expected[i], `index ${i}: ${actual[i]} !== ${expected[i]}`)
	}
}

//=================//
// DRAGON - NUMBER //
//=================//
describe("makeNumber", () => {

	it("creates a number with default values", () => {
		const num = cellpond.makeNumber({values: [true, false, false, false, false, false, false, false, false, false]})
		assert.equal(num.values[0], true)
		assert.equal(num.values[1], false)
		assert.equal(num.channel, 0)
		assert.equal(num.variable, undefined)
	})

	it("creates a number with a variable", () => {
		const num = cellpond.makeNumber({variable: "red"})
		assert.equal(num.variable, "red")
		// variable numbers get all-true values
		assert.equal(num.values.every(v => v === true), true)
	})

	it("creates a number with custom channel", () => {
		const num = cellpond.makeNumber({values: [true], channel: 2})
		assert.equal(num.channel, 2)
	})

})

describe("makeNumberFromInt", () => {

	it("creates a number with only one value set", () => {
		const num = cellpond.makeNumber({values: [false, false, false, false, false, true, false, false, false, false]})
		assert.equal(num.values[5], true)
		assert.equal(num.values[0], false)
		assert.equal(num.values[9], false)
	})

})

//================//
// DRAGON - ARRAY //
//================//
describe("makeArray", () => {

	it("creates an array with undefined channels by default", () => {
		const arr = cellpond.makeArray()
		assert.equal(arr.channels.length, 3)
		assert.equal(arr.channels[0], undefined)
		assert.equal(arr.channels[1], undefined)
		assert.equal(arr.channels[2], undefined)
	})

	it("creates an array with stamp", () => {
		const arr = cellpond.makeArray({stamp: "a"})
		assert.equal(arr.stamp, "a")
	})

})

describe("makeArrayFromSplash", () => {

	it("creates a colour array from splash 000", () => {
		const arr = cellpond.makeArrayFromSplash(0)
		const splashes = cellpond.getSplashesArrayFromArray(arr)
		assert.equal(splashes.length, 1)
		assert.equal(splashes[0], 0)
	})

	it("creates a colour array from splash 999", () => {
		const arr = cellpond.makeArrayFromSplash(999)
		const splashes = cellpond.getSplashesArrayFromArray(arr)
		assert.equal(splashes.length, 1)
		assert.equal(splashes[0], 999)
	})

	it("creates a colour array from splash 305", () => {
		const arr = cellpond.makeArrayFromSplash(305)
		const splashes = cellpond.getSplashesArrayFromArray(arr)
		assert.equal(splashes.length, 1)
		assert.equal(splashes[0], 305)
	})

})

describe("getSplashesArrayFromArray", () => {

	it("returns all possible splashes for wildcard array", () => {
		const arr = cellpond.makeArray({
			channels: [
				cellpond.makeNumber({values: [true, true, false, false, false, false, false, false, false, false], channel: 0}),
				cellpond.makeNumber({values: [true, false, false, false, false, false, false, false, false, false], channel: 1}),
				cellpond.makeNumber({values: [true, false, false, false, false, false, false, false, false, false], channel: 2}),
			]
		})
		const splashes = cellpond.getSplashesArrayFromArray(arr)
		assert.equal(splashes.length, 2) // 000 and 100
		assert.ok(splashes.includes(0))
		assert.ok(splashes.includes(100))
	})

})

describe("cloneDragonArray", () => {

	it("creates an independent copy", () => {
		const original = cellpond.makeArrayFromSplash(555)
		const clone = cellpond.cloneDragonArray(original)
		// Modify original
		original.channels[0].values[5] = false
		original.channels[0].values[0] = true
		// Clone should be unaffected
		assert.equal(clone.channels[0].values[5], true)
		assert.equal(clone.channels[0].values[0], false)
	})

	it("clones undefined as all-true", () => {
		const clone = cellpond.cloneDragonArray(undefined)
		assert.equal(clone.channels[0].values.every(v => v), true)
		assert.equal(clone.channels[1].values.every(v => v), true)
		assert.equal(clone.channels[2].values.every(v => v), true)
	})

})

//==================//
// DRAGON - DIAGRAM //
//==================//
describe("makeDiagram", () => {

	it("creates an empty diagram by default", () => {
		const diagram = cellpond.makeDiagram()
		assert.equal(diagram.left.length, 0)
		assert.equal(diagram.right, undefined)
		assert.equal(diagram.isDiagram, true)
	})

	it("creates a diagram with left and right sides", () => {
		const diagram = cellpond.makeDiagram({
			left: [cellpond.makeDiagramCell()],
			right: [cellpond.makeDiagramCell()],
		})
		assert.equal(diagram.left.length, 1)
		assert.equal(diagram.right.length, 1)
	})

})

describe("makeDiagramCell", () => {

	it("creates a cell with default values", () => {
		const cell = cellpond.makeDiagramCell()
		assert.equal(cell.x, 0)
		assert.equal(cell.y, 0)
		assert.equal(cell.width, 1)
		assert.equal(cell.height, 1)
		assert.equal(cell.splitX, 1)
		assert.equal(cell.splitY, 1)
	})

	it("creates a cell with custom position and size", () => {
		const cell = cellpond.makeDiagramCell({x: 1, y: 2, width: 0.5, height: 0.25})
		assert.equal(cell.x, 1)
		assert.equal(cell.y, 2)
		assert.equal(cell.width, 0.5)
		assert.equal(cell.height, 0.25)
	})

})

describe("getDiagramDimensions", () => {

	it("returns dimensions of a single-cell diagram", () => {
		const diagram = cellpond.makeDiagram({
			left: [cellpond.makeDiagramCell({x: 0, y: 0, width: 1, height: 1})],
		})
		assertArrayEqual(cellpond.getDiagramDimensions(diagram), [1, 1])
	})

	it("returns dimensions of a multi-cell diagram", () => {
		const diagram = cellpond.makeDiagram({
			left: [
				cellpond.makeDiagramCell({x: 0, y: 0, width: 1, height: 1}),
				cellpond.makeDiagramCell({x: 1, y: 0, width: 1, height: 1}),
			],
		})
		assertArrayEqual(cellpond.getDiagramDimensions(diagram), [2, 1])
	})

})

describe("normaliseDiagram", () => {

	it("scales a 2x1 diagram to fit in 1x1", () => {
		const diagram = cellpond.makeDiagram({
			left: [
				cellpond.makeDiagramCell({x: 0, y: 0, width: 1, height: 1}),
				cellpond.makeDiagramCell({x: 1, y: 0, width: 1, height: 1}),
			],
		})
		cellpond.normaliseDiagram(diagram)
		assert.equal(diagram.left[0].width, 0.5)
		assert.equal(diagram.left[1].x, 0.5)
	})

})

//==========================//
// DRAGON - TRANSFORMATIONS //
//==========================//
describe("DRAGON_TRANSFORMATIONS", () => {

	it("NONE has 1 transformation", () => {
		assert.equal(cellpond.DRAGON_TRANSFORMATIONS.NONE.length, 1)
	})

	it("X has 2 transformations", () => {
		assert.equal(cellpond.DRAGON_TRANSFORMATIONS.X.length, 2)
	})

	it("R has 4 transformations", () => {
		assert.equal(cellpond.DRAGON_TRANSFORMATIONS.R.length, 4)
	})

	it("XYR has 8 transformations", () => {
		assert.equal(cellpond.DRAGON_TRANSFORMATIONS.XYR.length, 8)
	})

	it("NONE identity returns same position", () => {
		assertArrayEqual(cellpond.DRAGON_TRANSFORMATIONS.NONE[0](1, 2, 1, 1, 3, 3), [1, 2])
	})

	it("X mirror flips x", () => {
		const [x, y] = cellpond.DRAGON_TRANSFORMATIONS.X[1](0, 0, 1, 1, 2, 2)
		assert.equal(x, 1) // -0-1+2 = 1
		assert.equal(y, 0)
	})

})

describe("getOrderedCellAtoms", () => {

	it("sorts cells left-to-right, top-to-bottom", () => {
		const cells = [
			{x: 1, y: 0},
			{x: 0, y: 1},
			{x: 0, y: 0},
		]
		const ordered = cellpond.getOrderedCellAtoms(cells)
		assert.equal(ordered[0].x, 0)
		assert.equal(ordered[0].y, 0)
		assert.equal(ordered[1].x, 0)
		assert.equal(ordered[1].y, 1)
		assert.equal(ordered[2].x, 1)
		assert.equal(ordered[2].y, 0)
	})

})

//=================//
// DRAGON - ORIGIN //
//=================//
describe("getOriginOfDiagram", () => {

	it("returns the cell at (0,0)", () => {
		const diagram = cellpond.makeDiagram({
			left: [
				cellpond.makeDiagramCell({x: 1, y: 0}),
				cellpond.makeDiagramCell({x: 0, y: 0}),
			],
		})
		const origin = cellpond.getOriginOfDiagram(diagram)
		assert.equal(origin.x, 0)
		assert.equal(origin.y, 0)
	})

})

//====================//
// CHANNEL_VARIABLES  //
//====================//
describe("CHANNEL_VARIABLES", () => {

	it("has red, green, blue", () => {
		assertArrayEqual(cellpond.CHANNEL_VARIABLES, ["red", "green", "blue"])
	})

})

run()
