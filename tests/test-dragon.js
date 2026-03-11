const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const { loadCellPond } = require("./setup")

const { context: cellpond } = loadCellPond()

const DragonNumber = () => cellpond.DragonNumber
const DragonArray = () => cellpond.DragonArray
const DiagramCell = () => cellpond.DiagramCell
const Diagram = () => cellpond.Diagram
const Rule = () => cellpond.Rule
const RuleRegistry = () => cellpond.RuleRegistry

function assertArrayEqual(actual, expected) {
	assert.equal(actual.length, expected.length, `length: ${actual.length} !== ${expected.length}`)
	for (let i = 0; i < expected.length; i++) {
		assert.equal(actual[i], expected[i], `index ${i}: ${actual[i]} !== ${expected[i]}`)
	}
}

//=================//
// DRAGON - NUMBER //
//=================//
describe("DragonNumber", () => {

	it("creates with default values", () => {
		const num = new (DragonNumber())({values: [true, false, false, false, false, false, false, false, false, false]})
		assert.equal(num.values[0], true)
		assert.equal(num.values[1], false)
		assert.equal(num.channel, 0)
		assert.equal(num.variable, undefined)
	})

	it("creates with a variable (all-true values)", () => {
		const num = new (DragonNumber())({variable: "red"})
		assert.equal(num.variable, "red")
		assert.equal(num.values.every(v => v === true), true)
	})

	it("creates with custom channel", () => {
		const num = new (DragonNumber())({values: [true], channel: 2})
		assert.equal(num.channel, 2)
	})

	it("clone creates independent copy", () => {
		const original = new (DragonNumber())({values: [true, false, false, false, false, false, false, false, false, false]})
		const clone = original.clone()
		original.values[0] = false
		assert.equal(clone.values[0], true)
	})

	it("fromInt creates number with single value set", () => {
		const num = DragonNumber().fromInt(5)
		assert.equal(num.values[5], true)
		assert.equal(num.values[0], false)
		assert.equal(num.values[9], false)
	})

	it("emptyValues returns all false", () => {
		const values = DragonNumber().emptyValues()
		assert.equal(values.every(v => v === false), true)
		assert.equal(values.length, 10)
	})

	it("allValues returns all true", () => {
		const values = DragonNumber().allValues()
		assert.equal(values.every(v => v === true), true)
		assert.equal(values.length, 10)
	})

})

//================//
// DRAGON - ARRAY //
//================//
describe("DragonArray", () => {

	it("creates with undefined channels by default", () => {
		const arr = new (DragonArray())()
		assert.equal(arr.channels.length, 3)
		assert.equal(arr.channels[0], undefined)
	})

	it("creates with stamp", () => {
		const arr = new (DragonArray())({stamp: "a"})
		assert.equal(arr.stamp, "a")
	})

	it("fromSplash(0) round-trips", () => {
		const arr = DragonArray().fromSplash(0)
		const splashes = arr.getSplashes()
		assert.equal(splashes.length, 1)
		assert.equal(splashes[0], 0)
	})

	it("fromSplash(999) round-trips", () => {
		const arr = DragonArray().fromSplash(999)
		assert.equal(arr.getSplashes()[0], 999)
	})

	it("fromSplash(305) round-trips", () => {
		const arr = DragonArray().fromSplash(305)
		assert.equal(arr.getSplashes()[0], 305)
	})

	it("getSplashes returns all possible values", () => {
		const arr = new (DragonArray())({
			channels: [
				new (DragonNumber())({values: [true, true, false, false, false, false, false, false, false, false], channel: 0}),
				new (DragonNumber())({values: [true, false, false, false, false, false, false, false, false, false], channel: 1}),
				new (DragonNumber())({values: [true, false, false, false, false, false, false, false, false, false], channel: 2}),
			]
		})
		const splashes = arr.getSplashes()
		assert.equal(splashes.length, 2)
		assert.ok(splashes.includes(0))
		assert.ok(splashes.includes(100))
	})

	it("getSplashSet returns a Set", () => {
		const arr = DragonArray().fromSplash(555)
		const set = arr.getSplashSet()
		assert.ok(set.has(555))
		assert.equal(set.size, 1)
	})

	it("clone creates independent copy", () => {
		const original = DragonArray().fromSplash(555)
		const clone = original.clone()
		original.channels[0].values[5] = false
		original.channels[0].values[0] = true
		assert.equal(clone.channels[0].values[5], true)
		assert.equal(clone.channels[0].values[0], false)
	})

	it("wildcard has all values true", () => {
		const wc = DragonArray().wildcard()
		assert.equal(wc.channels[0].values.every(v => v), true)
		assert.equal(wc.channels[1].values.every(v => v), true)
		assert.equal(wc.channels[2].values.every(v => v), true)
	})

	it("cloneContent handles undefined", () => {
		const result = DragonArray().cloneContent(undefined)
		assert.equal(result.channels[0].values.every(v => v), true)
	})

	it("isDynamic returns true when channel has variable", () => {
		const arr = new (DragonArray())({
			channels: [
				new (DragonNumber())({variable: "red", channel: 0}),
				new (DragonNumber())({variable: "green", channel: 1}),
				new (DragonNumber())({variable: "blue", channel: 2}),
			]
		})
		assert.equal(arr.isDynamic(), true)
	})

	it("isDynamic returns false for static array", () => {
		const arr = DragonArray().fromSplash(555)
		assert.equal(arr.isDynamic(), false)
	})

})

//==================//
// DRAGON - DIAGRAM //
//==================//
describe("DiagramCell", () => {

	it("creates with default values", () => {
		const cell = new (DiagramCell())()
		assert.equal(cell.x, 0)
		assert.equal(cell.y, 0)
		assert.equal(cell.width, 1)
		assert.equal(cell.height, 1)
		assert.equal(cell.splitX, 1)
		assert.equal(cell.splitY, 1)
	})

	it("creates with custom position", () => {
		const cell = new (DiagramCell())({x: 1, y: 2, width: 0.5, height: 0.25})
		assert.equal(cell.x, 1)
		assert.equal(cell.y, 2)
		assert.equal(cell.width, 0.5)
	})

	it("clone creates independent copy", () => {
		const original = new (DiagramCell())({content: DragonArray().fromSplash(999)})
		const clone = original.clone()
		original.content.channels[0].values[9] = false
		assert.equal(clone.content.channels[0].values[9], true)
	})

})

describe("Diagram", () => {

	it("creates empty by default", () => {
		const d = new (Diagram())()
		assert.equal(d.left.length, 0)
		assert.equal(d.right, undefined)
		assert.equal(d.isDiagram, true)
	})

	it("getDimensions for single cell", () => {
		const d = new (Diagram())({left: [new (DiagramCell())({x: 0, y: 0, width: 1, height: 1})]})
		assertArrayEqual(d.getDimensions(), [1, 1])
	})

	it("getDimensions for multi-cell", () => {
		const d = new (Diagram())({
			left: [
				new (DiagramCell())({x: 0, y: 0, width: 1, height: 1}),
				new (DiagramCell())({x: 1, y: 0, width: 1, height: 1}),
			]
		})
		assertArrayEqual(d.getDimensions(), [2, 1])
	})

	it("normalise scales to fit 1x1", () => {
		const d = new (Diagram())({
			left: [
				new (DiagramCell())({x: 0, y: 0, width: 1, height: 1}),
				new (DiagramCell())({x: 1, y: 0, width: 1, height: 1}),
			]
		})
		d.normalise()
		assert.equal(d.left[0].width, 0.5)
		assert.equal(d.left[1].x, 0.5)
	})

	it("getOrigin returns cell at (0,0)", () => {
		const d = new (Diagram())({
			left: [
				new (DiagramCell())({x: 1, y: 0}),
				new (DiagramCell())({x: 0, y: 0}),
			]
		})
		const origin = d.getOrigin()
		assert.equal(origin.x, 0)
		assert.equal(origin.y, 0)
	})

	it("clone creates independent copy", () => {
		const d = new (Diagram())({
			left: [new (DiagramCell())({x: 5, y: 3})],
			right: [new (DiagramCell())({x: 0, y: 0})],
		})
		const clone = d.clone()
		d.left[0].x = 99
		assert.equal(clone.left[0].x, 5)
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
		assert.equal(x, 1)
		assert.equal(y, 0)
	})

})

describe("sortByPosition", () => {

	it("sorts cells left-to-right, top-to-bottom", () => {
		const cells = [{x: 1, y: 0}, {x: 0, y: 1}, {x: 0, y: 0}]
		const ordered = cellpond.sortByPosition(cells)
		assert.equal(ordered[0].x, 0)
		assert.equal(ordered[0].y, 0)
		assert.equal(ordered[1].x, 0)
		assert.equal(ordered[1].y, 1)
		assert.equal(ordered[2].x, 1)
	})

})

//======================//
// DRAGON - RULEREGISTRY //
//======================//
describe("RuleRegistry", () => {

	it("starts with empty behaveFunctions", () => {
		const reg = new (RuleRegistry())()
		assert.equal(reg.behaveFunctions.length, 0)
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
