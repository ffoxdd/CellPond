//=========//
// DRAGON  //
//=========//
// The Dragon is the rule engine of CellPond.
// It transforms user-drawn rules into executable behaviour functions.

const CHANNEL_VARIABLES = ["red", "green", "blue"]

//=================//
// DRAGON - NUMBER //
//=================//
// A DragonNumber represents a set of possible digit values (0-9).
// Each position in the values array is true/false for whether that digit is possible.
class DragonNumber {
	constructor({values, channel = 0, variable, add, subtract} = {}) {
		if (variable !== undefined) {
			this.values = DragonNumber.allValues()
		} else {
			this.values = values
		}
		this.variable = variable
		this.channel = channel
		this.add = add
		this.subtract = subtract
	}

	clone() {
		return new DragonNumber({
			values: [...this.values],
			variable: this.variable,
			channel: this.channel,
			add: this.add ? this.add.clone() : undefined,
			subtract: this.subtract ? this.subtract.clone() : undefined,
		})
	}

	evaluate(args = {}) {
		if (this.variable === undefined) {
			return this.values
		}

		let results = DragonNumber.EVALUATORS[this.variable](this, args)
		const isHue = this.variable === "red"

		if (this.add !== undefined) {
			results = DragonArray.addChannelToResults(results, this.add, {source: args.source, multiplier: 1, isHue})
		}
		if (this.subtract !== undefined) {
			results = DragonArray.addChannelToResults(results, this.subtract, {source: args.source, multiplier: -1, isHue})
		}

		return results
	}

	static fromInt(int) {
		return new DragonNumber({values: DragonNumber.valuesFromInt(int)})
	}

	static valuesFromInt(int) {
		const values = DragonNumber.emptyValues()
		values[int] = true
		return values
	}

	static emptyValues() {
		return [false, false, false, false, false, false, false, false, false, false]
	}

	static allValues() {
		return [true, true, true, true, true, true, true, true, true, true]
	}
}

DragonNumber.EVALUATORS = {
	red(number, {source} = {}) {
		if (source === undefined) return DragonNumber.allValues()
		const [r] = getRGB(source)
		return DragonNumber.valuesFromInt(r / 100)
	},
	green(number, {source} = {}) {
		if (source === undefined) return DragonNumber.allValues()
		const [, g] = getRGB(source)
		return DragonNumber.valuesFromInt(g / 10)
	},
	blue(number, {source} = {}) {
		if (source === undefined) return DragonNumber.allValues()
		const [,, b] = getRGB(source)
		return DragonNumber.valuesFromInt(b)
	},
}

//================//
// DRAGON - ARRAY //
//================//
// A DragonArray represents a colour pattern: 3 channels (R, G, B) of DragonNumbers.
// Channels can be undefined (wildcard), and arrays can have joins (OR combinations).
class DragonArray {
	constructor({channels, stamp, joins = []} = {}) {
		this.channels = channels !== undefined ? channels : [undefined, undefined, undefined]
		this.stamp = stamp
		this.joins = joins
	}

	clone() {
		const red = this.channels[0] != null ? this.channels[0].clone() : undefined
		const green = this.channels[1] != null ? this.channels[1].clone() : undefined
		const blue = this.channels[2] != null ? this.channels[2].clone() : undefined
		const joins = this.joins.map(j => j.clone())
		return new DragonArray({stamp: this.stamp, channels: [red, green, blue], joins})
	}

	getSplashes(args = {}) {
		const splashes = []
		for (const join of this.joins) {
			splashes.push(...join.getSplashes())
		}

		if (this.isDiagram) {
			splashes.push(900)
			return splashes
		}

		let [reds, greens, blues] = this.channels
		if (reds === undefined) reds = new DragonNumber({channel: 0, variable: "red"})
		if (greens === undefined) greens = new DragonNumber({channel: 1, variable: "green"})
		if (blues === undefined) blues = new DragonNumber({channel: 2, variable: "blue"})

		const rvalues = reds.evaluate(args)
		const gvalues = greens.evaluate(args)
		const bvalues = blues.evaluate(args)

		for (let r = 0; r < rvalues.length; r++) {
			if (!rvalues[r]) continue
			for (let g = 0; g < gvalues.length; g++) {
				if (!gvalues[g]) continue
				for (let b = 0; b < bvalues.length; b++) {
					if (!bvalues[b]) continue
					splashes.push(r * 100 + g * 10 + b)
				}
			}
		}

		return splashes
	}

	getSplashSet(args) {
		return new Set(this.getSplashes(args))
	}

	fillEmptyChannels() {
		for (let i = 0; i < 3; i++) {
			if (this.channels[i] !== undefined) continue
			this.channels[i] = new DragonNumber({
				channel: i,
				variable: CHANNEL_VARIABLES[i],
			})
		}
	}

	isDynamic() {
		for (const channel of this.channels) {
			if (channel === undefined) return false
			if (channel.variable !== undefined) return true
		}
		return false
	}

	static fromSplash(splash) {
		let [r, g, b] = getRGB(splash)
		r /= 100
		g /= 10
		return new DragonArray({
			channels: [
				new DragonNumber({values: DragonNumber.valuesFromInt(r), channel: 0}),
				new DragonNumber({values: DragonNumber.valuesFromInt(g), channel: 1}),
				new DragonNumber({values: DragonNumber.valuesFromInt(b), channel: 2}),
			]
		})
	}

	static wildcard() {
		return new DragonArray({
			channels: [
				new DragonNumber({values: DragonNumber.allValues(), channel: 0}),
				new DragonNumber({values: DragonNumber.allValues(), channel: 1}),
				new DragonNumber({values: DragonNumber.allValues(), channel: 2}),
			]
		})
	}

	// Clone content that could be undefined, a DragonArray, or a Diagram
	static cloneContent(content) {
		if (content === undefined) return DragonArray.wildcard()
		return content.clone()
	}

	static addChannelToResults(augendResults, addend, {source, multiplier = 1, isHue = false}) {
		let addendResults = addend.values
		if (addend.variable !== undefined) {
			addendResults = DragonNumber.EVALUATORS[addend.variable](addend, {source})
		}

		const addendChoices = addendResults.map((v, i) => v === true ? i : false).filter(v => v !== false)
		const augendChoices = augendResults.map((v, i) => v === true ? i : false).filter(v => v !== false)

		const choices = new Set()
		for (const augendChoice of augendChoices) {
			for (const addendChoice of addendChoices) {
				choices.add(clamp(augendChoice + addendChoice * multiplier, 0, 9))
			}
		}

		let results = DragonNumber.emptyValues()
		for (const choice of choices) {
			results[choice] = true
		}

		if (addend.add !== undefined) {
			results = DragonArray.addChannelToResults(results, addend.add, {source, multiplier: 1, isHue})
		}
		if (addend.subtract !== undefined) {
			results = DragonArray.addChannelToResults(results, addend.subtract, {source, multiplier: -1, isHue})
		}

		return results
	}
}

//==================//
// DRAGON - DIAGRAM //
//==================//
class DiagramCell {
	// Note: instruction default (DRAGON_INSTRUCTION.recolour) is resolved at call time
	constructor({x = 0, y = 0, width = 1, height = 1, content = new DragonArray(), instruction = DRAGON_INSTRUCTION.recolour, splitX = 1, splitY = 1} = {}) {
		this.x = x
		this.y = y
		this.width = width
		this.height = height
		this.content = content
		this.instruction = instruction
		this.splitX = splitX
		this.splitY = splitY
	}

	clone() {
		return new DiagramCell({
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
			content: DragonArray.cloneContent(this.content),
			instruction: this.instruction,
			splitX: this.splitX,
			splitY: this.splitY,
		})
	}
}

class Diagram {
	constructor({left = [], right, joins = []} = {}) {
		this.left = left
		this.right = right
		this.isDiagram = true
		this.joins = joins
	}

	clone() {
		const result = new Diagram()
		for (const sideName of ["left", "right"]) {
			if (this[sideName] === undefined) continue
			result[sideName] = this[sideName].map(cell => cell.clone())
		}
		return result
	}

	normalise() {
		const [width, height] = this.getDimensions()
		for (const sideName of ["left", "right"]) {
			if (this[sideName] === undefined) continue
			for (const cell of this[sideName]) {
				cell.width /= width
				cell.height /= height
				cell.x /= width
				cell.y /= height
			}
		}
		return this
	}

	getDimensions() {
		let left = Infinity
		let right = -Infinity
		let top = Infinity
		let bottom = -Infinity

		for (const cell of this.left) {
			const cleft = cell.x
			const cright = cell.x + cell.width
			const ctop = cell.y
			const cbottom = cell.y + cell.height

			if (cleft < left) left = cleft
			if (ctop < top) top = ctop
			if (cright > right) right = cright
			if (cbottom > bottom) bottom = cbottom
		}

		return [right - left, bottom - top]
	}

	getOrigin() {
		for (const cell of this.left) {
			if (cell.x === 0 && cell.y === 0) return cell
		}
	}

	// Scale so the smallest cell becomes 1x1
	static maximised(diagram) {
		let smallestWidth = Infinity
		let smallestHeight = Infinity

		for (const sideName of ["left", "right"]) {
			const side = diagram[sideName]
			if (side === undefined) continue
			for (const cell of side) {
				if (cell.width < smallestWidth) smallestWidth = cell.width
				if (cell.height < smallestHeight) smallestHeight = cell.height
			}
		}

		const result = new Diagram({joins: diagram.joins})
		for (const sideName of ["left", "right"]) {
			const side = diagram[sideName]
			if (side === undefined) continue
			if (result[sideName] === undefined) result[sideName] = []
			for (const cell of side) {
				const scaled = cell.clone()
				scaled.width /= smallestWidth
				scaled.height /= smallestHeight
				scaled.x /= smallestWidth
				scaled.y /= smallestHeight
				result[sideName].push(scaled)
			}
		}

		return result
	}
}

//===============//
// DRAGON - RULE //
//===============//
class Rule {
	constructor({steps = [], transformations = DRAGON_TRANSFORMATIONS.NONE, locked = true, chance} = {}) {
		this.steps = steps
		this.transformations = transformations
		this.locked = locked
		this.chance = chance
	}

	getOrigin() {
		return this.steps[0].getOrigin()
	}
}

//==========================//
// DRAGON - TRANSFORMATIONS //
//==========================//
const DRAGON_TRANSFORMATIONS = {
	NONE: [
		(x, y, w, h, W, H) => [x, y],
	],
	X: [
		(x, y, w, h, W, H) => [      x, y],
		(x, y, w, h, W, fh) => [-x-w+W, y],
	],
	Y: [
		(x, y, w, h, W, H) => [x,      y],
		(x, y, w, h, W, H) => [x, -y-h+H],
	],
	XY: [
		(x, y, w, h, W, H) => [     x,      y],
		(x, y, w, h, W, H) => [-x-w+W,      y],
		(x, y, w, h, W, H) => [     x, -y-h+H],
		(x, y, w, h, W, H) => [-x-w+W, -y-h+H],
	],
	R: [
		(x, y, w, h, W, H) => [     x,      y],
		(x, y, w, h, W, H) => [-y-h+H,      x],
		(x, y, w, h, W, H) => [-x-w+W, -y-h+H],
		(x, y, w, h, W, H) => [     y, -x-w+W],
	],
	XYR: [
		(x, y, w, h, W, H) => [     x,     y],
		(x, y, w, h, W, H) => [-y-h+H,     x],
		(x, y, w, h, W, H) => [-x-w+W, -y-h+H],
		(x, y, w, h, W, H) => [     y, -x-w+W],

		(x, y, w, h, W, H) => [-x-w+W,      y],
		(x, y, w, h, W, H) => [-y-h+H, -x-w+W],
		(x, y, w, h, W, H) => [     x, -y-h+H],
		(x, y, w, h, W, H) => [     y,      x],
	]
}

const getTransformedRule = (rule, transformation, isTranslation) => {
	const [ruleWidth, ruleHeight] = rule.steps[0].getDimensions()
	const steps = rule.steps.map(step => getTransformedDiagram(step, transformation, isTranslation, ruleWidth, ruleHeight))
	return new Rule({steps, transformations: rule.transformations, locked: rule.locked, chance: rule.chance})
}

const getTransformedDiagram = (diagram, transformation, isTranslation, ruleWidth, ruleHeight) => {
	const {left, right} = diagram

	const transformedLeft = []
	const transformedRight = right === undefined ? undefined : []

	for (const cell of left) {
		transformedLeft.push(getTransformedCell(cell, transformation, ruleWidth, ruleHeight, isTranslation))
	}

	if (right !== undefined) {
		for (const cell of right) {
			transformedRight.push(getTransformedCell(cell, transformation, ruleWidth, ruleHeight, isTranslation))
		}
	}

	// Re-order split instructions left-to-right, top-to-bottom
	for (let i = 0; i < transformedRight.length; i++) {
		const diagramCell = transformedRight[i]
		if (diagramCell.instruction.type !== "SPLIT") continue
		const count = diagramCell.splitX * diagramCell.splitY
		const additional = transformedRight.slice(i + 1, i + 1 + count)
		const ordered = sortByPosition(additional)
		transformedRight.splice(i + 1, count, ...ordered)
	}

	return new Diagram({left: transformedLeft, right: transformedRight})
}

const getTransformedCell = (cell, transformation, diagramWidth, diagramHeight, isTranslation = false) => {
	let [x, y, width, height] = transformation(cell.x, cell.y, cell.width, cell.height, diagramWidth, diagramHeight)
	let {splitX, splitY} = cell

	if (!isTranslation) {
		const [newSplitX, newSplitY] = transformation(cell.splitX, cell.splitY, 1, 1, 1, 1).map(n => Math.abs(n))
		splitX = newSplitX
		splitY = newSplitY

		const [newWidth, newHeight] = transformation(cell.width, cell.height, 1, 1, 1, 1).map(n => Math.abs(n))
		width = newWidth
		height = newHeight
	}

	if (x === undefined) x = cell.x
	if (y === undefined) y = cell.y
	if (width === undefined) width = cell.width
	if (height === undefined) height = cell.height

	return new DiagramCell({x, y, splitX, splitY, width, height, content: cell.content, instruction: cell.instruction})
}

// Sort cells left-to-right, top-to-bottom
const sortByPosition = (cells) => {
	return [...cells].sort((a, b) => {
		if (a.x + 128 < b.x + 128) return -1
		if (a.x + 128 > b.x + 128) return 1
		if (a.y + 128 < b.y + 128) return -1
		if (a.y + 128 > b.y + 128) return 1
		return 0
	})
}

//======================//
// DRAGON - RULEREGISTRY //
//======================//
// Manages registered rules and their behaviour functions.
// The main file creates an instance — Dragon code doesn't touch global state.
class RuleRegistry {
	constructor() {
		this.behaveFunctions = []
	}

	register(rule) {
		// Apply symmetry transformations
		const transformedRules = []
		for (const transformation of rule.transformations) {
			transformedRules.push(getTransformedRule(rule, transformation))
		}

		// Get redundant rules (one per possible origin cell)
		const redundantRules = []
		for (const transformedRule of transformedRules) {
			redundantRules.push(...getRedundantRules(transformedRule))
		}

		// Compile into behave functions
		const behaveFunctions = []
		for (const redundantRule of redundantRules) {
			const behaveFunction = makeBehaveFunction(redundantRule)
			behaveFunctions.push(behaveFunction)
			this.behaveFunctions.push(behaveFunction)
		}

		return {redundantRules, transformedRules, behaveFunctions}
	}

	unregister({behaveFunctions}) {
		this.behaveFunctions = this.behaveFunctions.filter(f => !behaveFunctions.includes(f))
	}
}

// For one rule, take its 'origin' as any of the cells in the first step.
// Returns all those redundant variations.
const getRedundantRules = (rule) => {
	const redundantRules = []
	const [head] = rule.steps

	for (const cell of head.left) {
		const transformation = (x, y, width = 1, height = 1) => {
			return [
				(x - cell.x) / cell.width,
				(y - cell.y) / cell.height,
				width / cell.width,
				height / cell.height,
			]
		}
		redundantRules.push(getTransformedRule(rule, transformation, true))
	}

	return redundantRules
}

const getStampNamesOfStep = (step) => {
	const stampNames = new Set()
	for (const side of [step.left, step.right]) {
		for (const cell of side) {
			if (cell.content.stamp !== undefined) {
				stampNames.add(cell.content.stamp)
			}
		}
	}
	return [...stampNames.values()]
}

const makeBehaveFunction = (rule) => {
	const stepFunctions = rule.steps.map(step => {
		const stampNames = getStampNamesOfStep(step)
		const conditionFunction = makeConditionFunction(step, stampNames, rule.chance)
		const resultFunction = makeResultFunction(step, stampNames)

		return (origin, redraw) => {
			const [neighbours, stamps] = conditionFunction(origin)
			if (neighbours === undefined) return
			return resultFunction(neighbours, redraw, stamps)
		}
	})

	return (origin, redraw) => {
		for (const stepFunction of stepFunctions) {
			const drawn = stepFunction(origin, redraw)
			if (drawn !== undefined) return drawn
		}
		return undefined
	}
}

// References at call time: world.cellGrid (via World class), edgeMode (top-level), oneIn (Habitat global)
const makeConditionFunction = (diagram, stampNames, chance = 6) => {
	const conditions = diagram.left.map(cell => {
		const splashes = cell.content.getSplashSet()

		return (origin) => {
			const width = cell.width * origin.width
			const height = cell.height * origin.height

			let x = origin.x + cell.x * origin.width
			let y = origin.y + cell.y * origin.height

			if (edgeMode === 1) {
				while (x >= 1) x -= 1
				while (y >= 1) y -= 1
				while (x < 0) x += 1
				while (y < 0) y += 1
			}

			const neighbour = world.cellGrid.pick(x + width / 2, y + height / 2)

			if (neighbour === undefined) return [undefined, undefined]
			if (neighbour.left + 8 !== x + 8) return [undefined, undefined]
			if (neighbour.top + 8 !== y + 8) return [undefined, undefined]
			if (neighbour.width + 8 !== width + 8) return [undefined, undefined]
			if (neighbour.height + 8 !== height + 8) return [undefined, undefined]
			if (!splashes.has(neighbour.colour)) return [undefined, undefined]

			return [neighbour, cell.content.stamp]
		}
	})

	const chanceAmount = Math.round(10 ** (3 - chance / 2))

	return (origin) => {
		if (chance !== undefined && !oneIn(chanceAmount)) return [undefined, undefined]

		const neighbours = []
		const stamps = {}
		for (const stamp of stampNames) stamps[stamp] = []

		for (const condition of conditions) {
			const [neighbour, stamp] = condition(origin)
			if (neighbour === undefined) return [undefined, undefined]
			if (stamp !== undefined) stamps[stamp].push(neighbour.colour)
			neighbours.push(neighbour)
		}

		return [neighbours, stamps]
	}
}

const makeResultFunction = (diagram, stampNames) => {
	const results = diagram.right.map(cell => cell.instruction(cell))

	const refillStamp = (remainers, stamps, name) => {
		remainers[name] = [...stamps[name]]
	}

	return (neighbours, redraw, stamps) => {
		let drawn = 0
		let neighbourId = 0
		let skip = 0
		const bonusTargets = []

		const stampRemainers = {}
		for (const name of stampNames) refillStamp(stampRemainers, stamps, name)

		for (const instruction of results) {
			const target = bonusTargets.length > 0 ? bonusTargets.pop() : neighbours[neighbourId]
			const result = instruction(target, redraw, neighbours, neighbourId, stampRemainers)

			if (result.stampNameTakenFrom !== undefined) {
				if (stampRemainers[result.stampNameTakenFrom].length === 0) {
					refillStamp(stampRemainers, stamps, result.stampNameTakenFrom)
				}
			}

			const {drawn: resultDrawn, bonusTargets: resultBonusTargets, skip: resultSkip} = result
			if (resultSkip !== undefined) skip += resultSkip
			drawn += resultDrawn
			if (resultBonusTargets !== undefined) bonusTargets.push(...resultBonusTargets)

			if (bonusTargets.length === 0) {
				neighbourId++
				if (skip > 0) {
					neighbourId += skip
					skip = 0
				}
			}
		}

		return drawn
	}
}

//======================//
// DRAGON - INSTRUCTION //
//======================//
// The four primitive operations for the right-hand side of rules.
// Each factory takes a diagram cell and returns an instruction function
// that operates on a target cell during rule firing.
const DRAGON_INSTRUCTION = {}

DRAGON_INSTRUCTION.nothing = (cell) => () => {
	return {drawn: 0}
}
DRAGON_INSTRUCTION.nothing.type = "NOTHING"

DRAGON_INSTRUCTION.recolour = (cell) => {

	cell.content.fillEmptyChannels()

	const splashes = cell.content.getSplashes()
	const isDynamic = cell.content.isDynamic()

	const instruction = (target, redraw, neighbours, neighbourId, stamps) => {

		let colour = undefined
		let source = target.colour
		let stampNameTakenFrom = undefined

		if (cell.content.stamp === undefined) {
			colour = splashes[Random.Uint32 % splashes.length]
		} else {
			const stampChoices = stamps[cell.content.stamp]
			if (stampChoices.length === 0) {
				colour = splashes[Random.Uint32 % splashes.length]
			}
			else {
				const stampId = Random.Uint32 % stampChoices.length
				source = stampChoices[stampId]
				colour = source
				stampChoices.splice(stampId, 1)
				stampNameTakenFrom = cell.content.stamp
			}
		}

		if (isDynamic) {

			const parts = getRGB(colour)

			for (let i = 0; i < cell.content.channels.length; i++) {
				const channel = cell.content.channels[i]
				if (channel.variable === undefined) continue
				let results = DragonNumber.EVALUATORS[channel.variable](channel, {source})
				const isHue = channel.variable === "red"
				if (channel.add !== undefined) {
					results = DragonArray.addChannelToResults(results, channel.add, {source, multiplier: 1, isHue})
				}
				if (channel.subtract !== undefined) {
					results = DragonArray.addChannelToResults(results, channel.subtract, {source, multiplier: -1, isHue})
				}
				const choices = results.map((v, i) => v === true? i : false).filter(v => v !== false)
				const newPart = choices[Random.Uint8 % choices.length]
				colour -= parts[i]
				const m = 10 ** (2-i)
				colour += newPart * m
			}
		}

		let drawn = 0
		if (redraw) drawn += drawQueue.queueCell(target, colour)
		else target.colour = colour

		return {drawn, stampNameTakenFrom}
	}

	return instruction
}
DRAGON_INSTRUCTION.recolour.type = "RECOLOUR"

// A SPLIT REQUIRES THE CORRECT NUMBER OF RECOLOUR COMMANDS AFTER IT
// IF YOU DON'T, IT WILL GO WRONG
DRAGON_INSTRUCTION.split = (cell) => {

	const instruction = (target, redraw, neighbours, neighbourId, stamps) => {
		const children = world.cellGrid.split(target, cell.splitX, cell.splitY)
		return {drawn: 0, bonusTargets: children.reverse()}
	}
	return instruction

}
DRAGON_INSTRUCTION.split.type = "SPLIT"

DRAGON_INSTRUCTION.merge = (cell) => {

	const childCount = Math.abs(cell.splitX) * Math.abs(cell.splitY)

	const instruction = (target, redraw, neighbours, neighbourId, stamps) => {
		const children = neighbours.slice(neighbourId, neighbourId+childCount)
		const merged = world.cellGrid.merge(children)
		return {drawn: 0, skip: childCount-1, bonusTargets: [merged]}
	}

	return instruction

}
DRAGON_INSTRUCTION.merge.type = "MERGE"

//========================//
// DIAGRAM CELL UTILITIES //
//========================//
const isDragonArraySingleColour = (array) => {
	const splashes = array.getSplashSet()
	return splashes.size === 1
}

const isDragonArrayEqual = (a, b) => {

	for (let i = 0; i < 3; i++) {
		const achannel = a.channels[i]
		const bchannel = b.channels[i]
		if (achannel === undefined && bchannel !== undefined) return false
		if (achannel !== undefined && bchannel === undefined) return false
		if (achannel === undefined && bchannel === undefined) continue
		if (achannel.variable !== bchannel.variable) return false
	}

	const asplashes = a.getSplashes()
	const bsplashes = b.getSplashes()

	for (const asplash of asplashes) {
		const id = bsplashes.indexOf(asplash)
		if (id === -1) return false
		bsplashes.splice(id, 1)
	}

	if (bsplashes.length > 0) return false

	return true

}

const applyRangeStamp = (stampeds, value) => {
	if (value.stamp) return //already got a manual stamp
	const isSingle = isDragonArraySingleColour(value)
	if (!isSingle) {
		let newStamp = undefined
		for (let i = 0; i < stampeds.length; i++) {
			const stamped = stampeds[i]
			if (isDragonArrayEqual(stamped, value)) {
				newStamp = i
				break
			}
		}
		if (newStamp === undefined) {
			newStamp = stampeds.length
			stampeds.push(value)
		}
		value.stamp = newStamp.toString()
	}
}

const getTopLeftOfCellAtoms = (cellAtoms) => {
	let smallestX = Infinity
	let smallestY = Infinity
	let leader = undefined

	for (const cellAtom of cellAtoms) {
		if (cellAtom.x <= smallestX) {
			if (cellAtom.y <= smallestY) {
				leader = cellAtom
				smallestX = cellAtom.x
				smallestY = cellAtom.y
			}
		}
	}

	return leader
}

const getBounds = (cells) => {

	let left = Infinity
	let right = -Infinity
	let top = Infinity
	let bottom = -Infinity

	for (const cell of cells) {

		const cleft = cell.x
		const cright = cell.x + cell.width
		const ctop = cell.y
		const cbottom = cell.y + cell.height

		if (cleft < left) left = cleft
		if (ctop < top) top = ctop
		if (cright > right) right = cright
		if (cbottom > bottom) bottom = cbottom
	}


	return [left, right, top, bottom]
}

const makeDiagramCellsFromCellAtoms = (cellAtoms) => {

	const orderedCellAtoms = sortByPosition(cellAtoms)
	const [left, , top, ] = getBounds(cellAtoms)
	const diagramCells = []

	for (const cellAtom of cellAtoms) {
		const x = (cellAtom.x - left) / cellAtom.width
		const y = (cellAtom.y - top) / cellAtom.height

		const leftClone = DragonArray.cloneContent(cellAtom.value) //TODO: should act different for multis
		const diagramCell = new DiagramCell({x, y, content: leftClone})
		diagramCells.push(diagramCell)

	}

	return diagramCells

}
UI.makeDiagramCellsFromCellAtoms = makeDiagramCellsFromCellAtoms


//this only works on nested diagrams where every cell is the same size
const flattenAndFillDiagramCells = (diagramCells, fillContent) => {
	const orderedCells = sortByPosition(diagramCells)
	
	const [diagramLeft, diagramRight, diagramTop, diagramBottom] = getBounds(diagramCells)
	
	const diagramWidth = diagramRight - diagramLeft
	const diagramHeight = diagramBottom - diagramTop
	const dimX = diagramCells.length == 0 ? 1 : Math.round(diagramWidth/orderedCells[0].width)
	const dimY = diagramCells.length == 0 ? 1 : Math.round(diagramHeight/orderedCells[0].height)
	const miniWidth = 1/dimX
	const miniHeight = 1/dimY
	
	let addCount=0
	const flatList = []
	for (let x = 0; x < dimX; x++) {
		for (let y = 0; y < dimY; y++) {				
			const miniDiagramCell = orderedCells[addCount]
			
			let miniClone
			
			if (miniDiagramCell === undefined || ((miniDiagramCell.x-diagramLeft)/diagramWidth+128 != x/dimX+128) || ((miniDiagramCell.y-diagramTop)/diagramHeight+128 != y/dimY+128)){
				if(fillContent){
					miniClone = DragonArray.cloneContent(fillContent)
				} else {
					continue
				}
			} else { 
				addCount++
				if (miniDiagramCell.content.isDiagram){ //if mini-mini cells
					for (const miniMiniCell of flattenAndFillDiagramCells(miniDiagramCell.content.left,fillContent)) {
						const diagramCell = new DiagramCell({
							x: (x + miniMiniCell.x)/dimX,
							y: (y + miniMiniCell.y)/dimY,
							width: miniWidth * miniMiniCell.width,
							height: miniHeight * miniMiniCell.height,
							content: miniMiniCell.content,
						})
						flatList.push(diagramCell)
					}
					continue
				} else{
					miniClone = DragonArray.cloneContent(miniDiagramCell.content)
				}
			}
			
			const diagramCell = new DiagramCell({
				x: x/dimX,
				y: y/dimY,
				width: miniWidth,
				height: miniHeight,
				content: miniClone,
			})
			flatList.push(diagramCell)
		}
		
	}
	return flatList
}



//adds diagram to left assuming every cell is the same size
const addDiagramCellsToLeftList = (diagramCells, list, stampeds, posX, posY, sizeX=1, sizeY=1) => {
	//if empty list 
	if (diagramCells.length == 0){
		const red = new DragonNumber({values: [true, true, true, true, true, true, true, true, true, true], channel: 0})
		const green = new DragonNumber({values: [true, true, true, true, true, true, true, true, true, true], channel: 1})
		const blue = new DragonNumber({values: [true, true, true, true, true, true, true, true, true, true], channel: 2})
		const miniClone = new DragonArray({channels: [red, green, blue]})
		applyRangeStamp(stampeds, miniClone)
			const diagramCell = new DiagramCell({
				x: posX,
				y: posY,
				width: sizeX,
				height: sizeY,
				content: miniClone,
				instruction: DRAGON_INSTRUCTION.recolour,
			})
		list.push(diagramCell)
		return
	}
	
	
	let addCount = 0
	const orderedMiniLeftCells = sortByPosition(diagramCells)
	// get diagram dimensions
	const [diagramLeft, diagramRight, diagramTop, diagramBottom] = getBounds(diagramCells)
	const diagramWidth = diagramRight - diagramLeft
	const diagramHeight = diagramBottom - diagramTop
	const dimX = Math.round(diagramWidth/orderedMiniLeftCells[0].width)
	const dimY = Math.round(diagramHeight/orderedMiniLeftCells[0].height)

	
	let miniCounts = {X: dimX, Y: dimY, total: 0}
	// check for every mini cell
	for (let x = 0; x < dimX; x++) {
		for (let y = 0; y < dimY; y++) {				
			const miniDiagramCell = orderedMiniLeftCells[addCount]
			
			const miniX = posX + x/dimX*sizeX
			const miniY = posY + y/dimY*sizeY
			const miniWidth = sizeX/dimX
			const miniHeight = sizeY/dimY
			
			let miniClone
			//fills in not filled spaces
			if (miniDiagramCell === undefined || ((miniDiagramCell.x-diagramLeft)/diagramWidth+128 != x/dimX+128) || ((miniDiagramCell.y-diagramTop)/diagramHeight+128 != y/dimY+128)){
				const red = new DragonNumber({values: [true, true, true, true, true, true, true, true, true, true], channel: 0})
				const green = new DragonNumber({values: [true, true, true, true, true, true, true, true, true, true], channel: 1})
				const blue = new DragonNumber({values: [true, true, true, true, true, true, true, true, true, true], channel: 2})
				miniClone = new DragonArray({channels: [red, green, blue]})
				
			} else { 
				addCount++
				if (miniDiagramCell.content.isDiagram){ //if mini-mini cells
					const miniMiniCounts = addDiagramCellsToLeftList(miniDiagramCell.content.left, list, stampeds, miniX, miniY, miniWidth, miniHeight)
					if (miniMiniCounts){
						miniCounts[x*dimY + y] = miniMiniCounts
						miniCounts.total += miniMiniCounts.total-1
					}
					continue
				} else{
					miniClone = DragonArray.cloneContent(miniDiagramCell.content)
				}
			}
			
			applyRangeStamp(stampeds, miniClone)
			const diagramCell = new DiagramCell({
				x: miniX,
				y: miniY,
				width: miniWidth,
				height: miniHeight,
				content: miniClone,
				instruction: DRAGON_INSTRUCTION.recolour,
			})
			list.push(diagramCell)
		}
	}
	miniCounts.total+= dimX*dimY
	return miniCounts
}

//adds diagram to right assuming every cell is the same size
const addDiagramCellsToRightList = (diagramCells, list, stampeds, posX, posY, miniCounts={X: 1, Y: 1, total: 1}, sizeX=1, sizeY=1) => {
	
	//if empty cell fill with nothing(s)
	if (diagramCells === undefined || diagramCells.length==0) {
		for (let i = 0; i < miniCounts.total;i++) {
			const nothingCell = new DiagramCell({
				x: posX,
				y: posY,
				width: sizeX,
				height: sizeY,
				instruction: DRAGON_INSTRUCTION.nothing,
			})
			
			list.push(nothingCell)
		}
		return
	}
	
	const orderedMiniLeftCells = sortByPosition(diagramCells)
	// get diagram dimensions
	const [diagramLeft, diagramRight, diagramTop, diagramBottom] = getBounds(diagramCells)
	const diagramWidth = diagramRight - diagramLeft
	const diagramHeight = diagramBottom - diagramTop
	const dimX = Math.round(diagramWidth/orderedMiniLeftCells[0].width)
	const dimY = Math.round(diagramHeight/orderedMiniLeftCells[0].height)
	
	if(miniCounts.X != dimX || miniCounts.Y != dimY){ //left and right arent split the same
		if (miniCounts.total > 1){ // merge if left is split
			const mergeCell = new DiagramCell({
					x: posX,
					y: posY,
					width: sizeX,
					height: sizeY,
					instruction: DRAGON_INSTRUCTION.merge,
					splitX: 1,
					splitY: miniCounts.total,//workaround to merge not evenly split cells
			})
			
			list.push(mergeCell)
		}

		if (dimX * dimY != 1) { // split if rigth is split
			const splitCell = new DiagramCell({
				x: posX,
				y: posY,
				width: sizeX,
				height: sizeY,
				instruction: DRAGON_INSTRUCTION.split,
				splitX: dimX,
				splitY: dimY,
			})

			list.push(splitCell)
		}
		miniCounts={X: 1, Y: 1, total: 1} // after merge left is 1x1
	}
			
	let addCount = 0
	for (let x = 0; x < dimX; x++) {
		for (let y = 0; y < dimY; y++) {				
			const miniDiagramCell = orderedMiniLeftCells[addCount]
			
			const miniX = posX + x/dimX*sizeX
			const miniY = posY + y/dimY*sizeY
			const miniWidth = sizeX/dimX
			const miniHeight = sizeY/dimY
			
			let miniClone
			//fills in not filled spaces
			if (miniDiagramCell === undefined || (dimX*dimY > 1) && (((miniDiagramCell.x-diagramLeft)/diagramWidth+128 != x/dimX+128) || ((miniDiagramCell.y-diagramTop)/diagramHeight+128 != y/dimY+128))){
				addDiagramCellsToRightList(undefined, list, stampeds, miniX, miniY, miniCounts[x*dimY + y], miniWidth, miniHeight)
				continue
			} else if (miniDiagramCell.content.isDiagram) {//if mini-mini cells
				addDiagramCellsToRightList(miniDiagramCell.content.left, list, stampeds, miniX, miniY, miniCounts[x*dimY + y], miniWidth, miniHeight)
				
			} else if (miniCounts[x*dimY + y] !== undefined && miniCounts[x*dimY + y].total > 1){ // cells of left diagram need to get merged
				addDiagramCellsToRightList([miniDiagramCell], list, stampeds, miniX, miniY, miniCounts[x*dimY + y], miniWidth, miniHeight)
				
			} else { // left and right have same dimensions => recolour
				miniClone = DragonArray.cloneContent(miniDiagramCell.content)
				applyRangeStamp(stampeds, miniClone)
				const diagramCell = new DiagramCell({
					x: miniX,
					y: miniY,
					width: miniWidth,
					height: miniHeight,
					content: miniClone,
					instruction: DRAGON_INSTRUCTION.recolour,
				})
				list.push(diagramCell)
				
			}
			
			addCount++
			
		}
	}
}
