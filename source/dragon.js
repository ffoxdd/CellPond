//=========//
// DRAGON  //
//=========//
// The Dragon is the rule engine of CellPond.
// It transforms user-drawn rules into executable behaviour functions.

const CHANNEL_VARIABLES = [
	"red",
	"green",
	"blue",
]

//=================//
// DRAGON - NUMBER //
//=================//
const makeNumber = ({values, channel = 0, variable, add, subtract} = {}) => {
	let numberValues = undefined

	if (variable !== undefined) {
		// placeholder for places in the codebase that don't specify a source!
		numberValues = [true, true, true, true, true, true, true, true, true, true]
		//numberValues = [false, false, false, false, false, false, false, false, false, false]
	}

	else numberValues = values
	return {values: numberValues, variable, channel, add, subtract}
}

const cloneDragonNumber = (number) => {
	const values = [...number.values]
	const variable = number.variable
	const channel = number.channel
	const add = number.add === undefined? undefined : cloneDragonNumber(number.add)
	const subtract = number.subtract === undefined? undefined : cloneDragonNumber(number.subtract)
	const clone = makeNumber({values, variable, channel, add, subtract})
	return clone
}

const makeValuesFromInt = (int) => {
	const values = [false, false, false, false, false, false, false, false, false, false]
	values[int] = true
	return values
}

const makeNumberFromInt = (int) => {
	const values = makeValuesFromInt(int)
	return makeNumber({values})
}

const VARIABLE_EVALUATOR = {}

VARIABLE_EVALUATOR.red = (number, {source} = {}) => {
	if (source === undefined) {
		return [true, true, true, true, true, true, true, true, true, true]
	}
	const [r, g, b] = getRGB(source)
	const values = makeValuesFromInt(r / 100)
	return values
}

VARIABLE_EVALUATOR.green = (number, {source} = {}) => {
	if (source === undefined) {
		return [true, true, true, true, true, true, true, true, true, true]
	}
	const [r, g, b] = getRGB(source)
	const values = makeValuesFromInt(g / 10)
	return values
}

VARIABLE_EVALUATOR.blue = (number, {source} = {}) => {
	if (source === undefined) {
		return [true, true, true, true, true, true, true, true, true, true]
	}
	const [r, g, b] = getRGB(source)
	const values = makeValuesFromInt(b)
	return values
}

const evaluateNumber = (number, args = {}) => {
	if (number.variable === undefined) {
		return number.values
	}

	let results = VARIABLE_EVALUATOR[number.variable](number, args)
	const isHue = number.variable === "red"

	if (number.add !== undefined) {
		results = addChannelToResults(results, number.add, {source: args.source, multiplier: 1, isHue})
	}
	if (number.subtract !== undefined) {
		results = addChannelToResults(results, number.subtract, {source: args.source, multiplier: -1, isHue})
	}

	return results

}

//================//
// DRAGON - ARRAY //
//================//
// Channels[3] - what dragon numbers are in each colour channel (or undefined for a partial array)
// Stamp - what shape of stamp the channel has (or undefined for no stamp)
const makeArray = ({channels, stamp, joins = []} = {}) => {
	if (channels === undefined) channels = [undefined, undefined, undefined]
	return {channels, stamp, joins}
}

const makeArrayFromSplash = (splash) => {
	let [r, g, b] = getRGB(splash)
	r /= 100
	g /= 10
	const redValues = [false, false, false, false, false, false, false, false, false, false]
	const greenValues = [false, false, false, false, false, false, false, false, false, false]
	const blueValues = [false, false, false, false, false, false, false, false, false, false]
	redValues[r] = true
	greenValues[g] = true
	blueValues[b] = true
	const red = makeNumber({values: redValues, channel: 0})
	const green = makeNumber({values: greenValues, channel: 1})
	const blue = makeNumber({values: blueValues, channel: 2})

	const array = makeArray({channels: [red, green, blue]})
	return array
}

const getSplashesSetFromArray = (array, args) => {

	const splashesArray = getSplashesArrayFromArray(array, args)

	const splashes = new Set(splashesArray)
	return splashes
}

const getSplashesArrayFromArray = (array, args = {}) => {

	const splashes = []
	for (const join of array.joins) {
		const joinSplashes = getSplashesArrayFromArray(join)
		splashes.push(...joinSplashes)
	}


	if (array.isDiagram) {
		splashes.push(900) // backup in case of a bug in my code - shows red for error(!?)
		return splashes
	 }

	//if (array.channels === undefined) print(array)
	let [reds, greens, blues] = array.channels

	if (reds === undefined) reds = makeNumber({channel: 0, variable: "red"})
	if (greens === undefined) greens = makeNumber({channel: 1, variable: "green"})
	if (blues === undefined) blues = makeNumber({channel: 2, variable: "blue"})

	const rvalues = evaluateNumber(reds, args)
	const gvalues = evaluateNumber(greens, args)
	const bvalues = evaluateNumber(blues, args)

	for (let r = 0; r < rvalues.length; r++) {
		const red = rvalues[r]
		if (!red) continue
		for (let g = 0; g < gvalues.length; g++) {
			const green = gvalues[g]
			if (!green) continue
			for (let b = 0; b < bvalues.length; b++) {
				const blue = bvalues[b]
				if (!blue) continue
				const splash = r*100 + g*10 + b*1
				splashes.push(splash)
			}
		}
	}

	return splashes
}

const fillEmptyChannels = (array) => {
	for (let i = 0; i < 3; i++) {
		if (array.channels[i] !== undefined) continue
		array.channels[i] = makeNumber({
			channel: i,
			variable: CHANNEL_VARIABLES[i],
		})
	}
}

const isDragonArrayDynamic = (array) => {
	for (const channel of array.channels) {
		if (channel === undefined) return false
		if (channel.variable !== undefined) return true
	}
	return false
}

const cloneDragonArray = (array) => {

	if (array === undefined) {
		const red = makeNumber({values: [true, true, true, true, true, true, true, true, true, true], channel: 0})
		const green = makeNumber({values: [true, true, true, true, true, true, true, true, true, true], channel: 1})
		const blue = makeNumber({values: [true, true, true, true, true, true, true, true, true, true], channel: 2})
		const leftClone = makeArray({channels: [red, green, blue]})
		return leftClone
	}

	if (array.isDiagram) {
		return cloneDiagram(array)
	}

	let red = undefined
	let green = undefined
	let blue = undefined

	const stamp = array.stamp

	if (array.channels[0] !== undefined && array.channels[0] !== null) {
		red = cloneDragonNumber(array.channels[0])
	}

	if (array.channels[1] !== undefined && array.channels[1] !== null) {
		green = cloneDragonNumber(array.channels[1])
	}

	if (array.channels[2] !== undefined && array.channels[2] !== null) {
		blue = cloneDragonNumber(array.channels[2])
	}

	const joins = []
	for (const join of array.joins) {
		const joinClone = cloneDragonArray(join)
		joins.push(joinClone)
	}

	const clone = makeArray({stamp, channels: [red, green, blue], joins})
	return clone
}

const addChannelToResults = (augendResults, addend, {source, multiplier = 1, isHue = false}) => {
	let addendResults = addend.values
	if (addend.variable !== undefined) {
		addendResults = VARIABLE_EVALUATOR[addend.variable](addend, {source})
	}

	const addendChoices = addendResults.map((v, i) => v === true? i : false).filter(v => v !== false)
	const augendChoices = augendResults.map((v, i) => v === true? i : false).filter(v => v !== false)

	const choices = new Set()
	for (const augendChoice of augendChoices) {
		for (const addendChoice of addendChoices) {
			const choice = isHue? clamp(augendChoice + addendChoice*multiplier, 0, 9) : clamp(augendChoice + addendChoice*multiplier, 0, 9)
			choices.add(choice)
		}
	}

	let results = [false, false, false, false, false, false, false, false, false, false]
	for (const choice of choices) {
		results[choice] = true
	}

	if (addend.add !== undefined) {
		results = addChannelToResults(results, addend.add, {source, multiplier: 1, isHue})
	}

	if (addend.subtract !== undefined) {
		results = addChannelToResults(results, addend.add, {source, multiplier: -1, isHue})
	}

	return results

}

//==================//
// DRAGON - DIAGRAM //
//==================//
// Note: these functions don't check for safety at all
// for example, you can make an invalid diagram by having the left and right sides not match
// or you can make an invalid side by giving it two cells in the same place

// Right can be undefined to represent a single-sided diagram
const makeDiagram = ({left = [], right, joins = []} = {}) => {
	return {left, right, isDiagram: true, joins}
}

const cloneDiagram = (diagram) => {
	const clone = makeDiagram()
	for (const sideName of ["left", "right"]) {
		if (diagram[sideName] === undefined) continue
		const side = []
		for (const cell of diagram[sideName]) {
			const cloneCell = cloneDiagramCell(cell)
			side.push(cloneCell)
		}
		clone[sideName] = side
	}
	return clone
}

// Content can be a dragon-array or another dragon-diagram
// Note: instruction default (DRAGON_INSTRUCTION.recolour) is resolved at call time
const makeDiagramCell = ({x = 0, y = 0, width = 1, height = 1, content = makeArray(), instruction = DRAGON_INSTRUCTION.recolour, splitX = 1, splitY = 1} = {}) => {
	return {x, y, width, height, content, instruction, splitX, splitY}
}

const cloneDiagramCell = (cell) => {
	const content = cloneDragonArray(cell.content)
	return {...cell, content}
}

// Make the entire diagram fit within 1x1
const normaliseDiagram = (diagram) => {
	const [width, height] = getDiagramDimensions(diagram)

	for (const sideName of ["left", "right"]) {
		const side = diagram[sideName]
		if (side === undefined) continue
		for (const diagramCell of side) {
			diagramCell.width /= width
			diagramCell.height /= height
			diagramCell.x /= width
			diagramCell.y /= height
		}
	}

	return diagram
}

// Make the SMALLEST cell of a diagram be 1x1
// Note: doesn't really work if the diagram contains another diagram
const makeMaximisedDiagram = (diagram) => {

	let smallestWidth = Infinity
	let smallestHeight = Infinity

	for (const sideName of ["left", "right"]) {
		const side = diagram[sideName]
		if (side === undefined) continue
		for (const diagramCell of side) {
			if (diagramCell.width < smallestWidth) {
				smallestWidth = diagramCell.width
			}
			if (diagramCell.height < smallestHeight) {
				smallestHeight = diagramCell.height
			}
		}
	}

	const maximisedDiagram = makeDiagram({joins: diagram.joins})

	for (const sideName of ["left", "right"]) {
		const side = diagram[sideName]
		if (side === undefined) continue
		if (maximisedDiagram[sideName] === undefined) {
			maximisedDiagram[sideName] = []
		}
		for (const diagramCell of side) {
			const maximisedDiagramCell = cloneDiagramCell(diagramCell)
			maximisedDiagramCell.width /= smallestWidth
			maximisedDiagramCell.height /= smallestHeight
			maximisedDiagramCell.x /= smallestWidth
			maximisedDiagramCell.y /= smallestHeight
			maximisedDiagram[sideName].push(maximisedDiagramCell)
		}
	}

	return maximisedDiagram
}

const getDiagramDimensions = (diagram) => {

	let left = Infinity
	let right = -Infinity
	let top = Infinity
	let bottom = -Infinity

	for (const cell of diagram.left) {

		const cleft = cell.x
		const cright = cell.x + cell.width
		const ctop = cell.y
		const cbottom = cell.y + cell.height

		if (cleft < left) left = cleft
		if (ctop < top) top = ctop
		if (cright > right) right = cright
		if (cbottom > bottom) bottom = cbottom
	}

	const width = right - left
	const height = bottom - top

	return [width, height]
}

//===============//
// DRAGON - RULE //
//===============//
const makeRule = ({steps = [], transformations = DRAGON_TRANSFORMATIONS.NONE, locked = true, chance} = {}) => {
	return {steps, transformations, locked, chance}
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

	// TODO: SHOULD THIS ACTUALLY BE THE MAX SIZE OF ALL STEPS COMBINED???? NOT SURE NEEDS TESTING
	const [ruleWidth, ruleHeight] = getDiagramDimensions(rule.steps[0])

	const steps = rule.steps.map(step => getTransformedDiagram(step, transformation, isTranslation, ruleWidth, ruleHeight))

	const transformedRule = makeRule({steps, transformations: rule.transformations, locked: rule.locked, chance: rule.chance})
	return transformedRule
}

const getTransformedDiagram = (diagram, transformation, isTranslation, ruleWidth, ruleHeight) => {

	const {left, right} = diagram
	const [diagramWidth, diagramHeight] = [ruleWidth, ruleHeight]

	const transformedLeft = []
	const transformedRight = right === undefined? undefined : []

	for (let i = 0; i < left.length; i++) {
		const leftCell = left[i]
		const transformedLeftCell = getTransformedCell(leftCell, transformation, diagramWidth, diagramHeight, isTranslation)
		transformedLeft.push(transformedLeftCell)
	}

	for (let i = 0; i < right.length; i++) {
		const rightCell = right[i]
		const transformedRightCell = getTransformedCell(rightCell, transformation, diagramWidth, diagramHeight, isTranslation)
		transformedRight.push(transformedRightCell)
	}

	// Re-order the additional instruction from splitting - so that they are all in order from left-to-right, top-to-bottom
	// This is because the engine passes cells to the instruction in that order
	// (it does this specific static order for performance reasons - rather than dynamically finding the cells in any order you want)
	for (let i = 0; i < transformedRight.length; i++) {
		const diagramCell = transformedRight[i]
		if (diagramCell.instruction.type !== "SPLIT") continue
		const additionalInstructionCount = diagramCell.splitX * diagramCell.splitY
		const additionalInstructions = transformedRight.slice(i+1, i+1+additionalInstructionCount)
		const orderedAdditionalInstructions = getOrderedCellAtoms(additionalInstructions)
		transformedRight.splice(i+1, additionalInstructionCount, ...orderedAdditionalInstructions)
	}

	const transformedDiagram = makeDiagram({left: transformedLeft, right: transformedRight})
	return transformedDiagram
}

const getTransformedCell = (cell, transformation, diagramWidth, diagramHeight, isTranslation = false) => {

	let [x, y, width, height] = transformation(cell.x, cell.y, cell.width, cell.height, diagramWidth, diagramHeight)

	let {splitX, splitY} = cell

	// Detect rotation, and rotate splitX and splitY if need be
	if (!isTranslation) {
		const [testSplitX, testSplitY] = transformation(cell.splitX, cell.splitY, 1, 1, 1, 1).map(n => Math.abs(n))
		//print(transformation.toString(), splitX, splitY, "to", testSplitX, testSplitY)
		splitX = testSplitX
		splitY = testSplitY

		const [testWidth, testHeight] = transformation(cell.width, cell.height, 1, 1, 1, 1).map(n => Math.abs(n))
		//print(transformation.toString(), splitX, splitY, "to", testSplitX, testSplitY)
		width = testWidth
		height = testHeight

	}

	if (x === undefined) x = cell.x
	if (y === undefined) y = cell.y
	if (width === undefined) width = cell.width
	if (height === undefined) height = cell.height

	// leftover from when content could be a sub-diagram
	//const content = cell.content.isDiagram? getTransformedDiagram(cell.content, transformation) : cell.content
	const content = cell.content

	return makeDiagramCell({x, y, splitX, splitY, width, height, content, instruction: cell.instruction})
}

// Sort cells left-to-right, top-to-bottom
// (moved from COLOURTODE section — used by getTransformedDiagram)
const getOrderedCellAtoms = (cellAtoms) => {
	const orderedCellAtoms = [...cellAtoms].sort((a, b) => {
		if (a.x + 128 < b.x + 128) return -1
		if (a.x + 128 > b.x + 128) return 1
		if (a.y + 128 < b.y + 128) return -1
		if (a.y + 128 > b.y + 128) return 1
		return 0
	})
	return orderedCellAtoms
}

//=================//
// DRAGON - BEHAVE //
//=================//
// From a rule, register 'behave' functions that get used to implement the rules in the engine
// Note: This function doesn't check for safety
// eg: If it is a locked-in rule or not
// Or if the left side matches the shape of the right side
const chanceAmounts = [
	0.000001,
	0.00001,
	0.0001,
	0.001,
	0.01,
	0.1,
	1.0,
]

const registerRule = (rule) => {

	// Apply Symmetry!
	const transformedRules = []
	for (const transformation of rule.transformations) {
		const transformedRule = getTransformedRule(rule, transformation)
		transformedRules.push(transformedRule)
	}

	// Get Redundant Rules!
	const redundantRules = []
	for (const transformedRule of transformedRules) {
		const redundantTransformedRules = getRedundantRules(transformedRule)
		redundantRules.push(...redundantTransformedRules)
	}

	// Make behave functions!!!
	const behaveFunctions = []
	for (const redundantRule of redundantRules) {
		const behaveFunction = makeBehaveFunction(redundantRule)
		behaveFunctions.push(behaveFunction)
		state.dragon.behaves.push(behaveFunction)
	}

	return {redundantRules, transformedRules, behaveFunctions}

}

const unregisterRegistry = ({behaveFunctions}) => {
	state.dragon.behaves = state.dragon.behaves.filter(behaveFunction => !behaveFunctions.includes(behaveFunction))
}

// For one rule, we could take its 'origin' as any of the cells in the first step
// This function gets all those redundant variations
const getRedundantRules = (rule) => {

	const redundantRules = []
	const [head] = rule.steps

	for (const cell of head.left) {
		const transformation = (x, y, width = 1, height = 1) => {

			const newWidth = width / cell.width
			const newHeight = height / cell.height

			const newX = (x - cell.x) * 1/cell.width
			const newY = (y - cell.y) * 1/cell.height

			return [newX, newY, newWidth, newHeight]

		}
		const redundantRule = getTransformedRule(rule, transformation, true)
		redundantRules.push(redundantRule)
	}

	return redundantRules

}

const getStampNamesOfStep = (step) => {
	const stampNames = new Set()
	const sides = [step.left, step.right]
	for (const side of sides) {
		for (const diagramCell of side) {
			const stamp = diagramCell.content.stamp
			if (stamp === undefined) continue
			stampNames.add(stamp)
		}
	}
	return [...stampNames.values()]
}

const makeBehaveFunction = (rule) => {
	const stepFunctions = []
	for (const step of rule.steps) {

		const stampNames = getStampNamesOfStep(step)
		const conditionFunction = makeConditionFunction(step, stampNames, rule.chance)
		const resultFunction = makeResultFunction(step, stampNames)

		const stepFunction = (origin, redraw) => {
			const [neighbours, stamps] = conditionFunction(origin)
			if (neighbours === undefined) return
			return resultFunction(neighbours, redraw, stamps)
		}

		stepFunctions.push(stepFunction)

	}

	const behaveFunction = (origin, redraw) => {

		let count = 1
		for (const stepFunction of stepFunctions) {
			const drawn = stepFunction(origin, redraw)
			if (drawn !== undefined) return drawn
		}

		return undefined
	}

	return behaveFunction

}

// References at call time: cellGrid (top-level), edgeMode (top-level), oneIn (Habitat global)
const makeConditionFunction = (diagram, stampNames, chance = 6) => {

	const conditions = []

	for (const cell of diagram.left) {

		const splashes = getSplashesSetFromArray(cell.content)

		const condition = (origin) => {

			const width = cell.width * origin.width
			const height = cell.height * origin.height

			let x = origin.x + cell.x*origin.width
			let y = origin.y + cell.y*origin.height

			if (edgeMode === 1) {
				while (x >= 1) x -= 1
				while (y >= 1) y -= 1
				while (x <  0) x += 1
				while (y <  0) y += 1
			}

			const centerX = x + width/2
			const centerY = y + height/2

			const neighbour = cellGrid.pick(centerX, centerY)

			if (neighbour === undefined) return [undefined, undefined]
			if (neighbour.left+8 !== x+8) return [undefined, undefined]
			if (neighbour.top+8 !== y+8) return [undefined, undefined]
			if (neighbour.width+8 !== width+8) return [undefined, undefined]
			if (neighbour.height+8 !== height+8) return [undefined, undefined]
			if (!splashes.has(neighbour.colour)) return [undefined, undefined]

			return [neighbour, cell.content.stamp]
		}

		conditions.push(condition)
	}
	const chanceAmount = Math.round(10 ** (3-chance/2))
	const chanceCondition = () => oneIn(chanceAmount)

	const conditionFunction = (origin) => {

		if (chance !== undefined && !chanceCondition()) return [undefined, undefined]

		const neighbours = []
		const stamps = {}
		for (const stamp of stampNames) {
			stamps[stamp] = []
		}

		for (const condition of conditions) {
			const [neighbour, stamp] = condition(origin)
			if (neighbour === undefined) return [undefined, undefined]
			if (stamp !== undefined) {
				stamps[stamp].push(neighbour.colour)
			}
			neighbours.push(neighbour)
		}


		return [neighbours, stamps]
	}

	return conditionFunction
}

// TODO: also support Merging (with some funky backend syntax if needed)
// TODO: also support Splitting (with some funky backend syntax if needed)
// this funky syntax could include dummy cells on the right
const makeResultFunction = (diagram, stampNames) => {

	const results = []
	for (const cell of diagram.right) {
		const result = cell.instruction(cell)
		results.push(result)
	}

	const refillAllStampRemainers = (remainers, stamps, stampNames) => {
		for (const stampName of stampNames) {
			refillStampRemainer(remainers, stamps, stampName)
		}
	}

	const refillStampRemainer = (remainers, stamps, stampName) => {
		remainers[stampName] = [...stamps[stampName]]
	}

	return (neighbours, redraw, stamps) => {

		let drawn = 0
		let neighbourId = 0
		let skip = 0
		const bonusTargets = []

		const stampRemainers = {}
		refillAllStampRemainers(stampRemainers, stamps, stampNames)

		for (const instruction of results) {
			const target = bonusTargets.length > 0? bonusTargets.pop() : neighbours[neighbourId]

			const result = instruction(target, redraw, neighbours, neighbourId, stampRemainers)

			if (result.stampNameTakenFrom !== undefined) {
				if (stampRemainers[result.stampNameTakenFrom].length === 0) {
					refillStampRemainer(stampRemainers, stamps, result.stampNameTakenFrom)
				}
			}

			const {drawn: resultDrawn, bonusTargets: resultBonusTargets, skip: resultSkip} = result
			if (resultSkip !== undefined) skip += resultSkip
			drawn += resultDrawn
			if (resultBonusTargets !== undefined) {
				bonusTargets.push(...resultBonusTargets)
			}

			if (bonusTargets.length === 0) {
				neighbourId++
				if (skip > 0) {
					neighbourId+= skip
					skip = 0
				}
			}
		}

		return drawn
	}

	return undefined
}

const isDiagramCellFullyInside = (cell, target) => {

	const cleft = cell.x
	const ctop = cell.top
	const cright = cell.x + cell.width
	const cbottom = cell.top + cell.height

	const tleft = target.x
	const ttop = target.top
	const tright = target.x + target.width
	const tbottom = target.top + target.height

	if (cleft < tleft) return false
	if (ctop < ttop) return false
	if (cbottom > tbottom) return false
	if (cright > tright) return false

	return true

}

//=================//
// DRAGON - ORIGIN //
//=================//
// The origin is the cell at (0,0) of the first step of a rule
// It is the cell/colour that triggers the rule
const getOriginOfRule = (rule) => {
	const head = rule.steps[0]
	return getOriginOfDiagram(head)
}

const getOriginOfDiagram = (diagram) => {
	for (const cell of diagram.left) {
		if (cell.x === 0 && cell.y === 0) return cell
	}

}

//================//
// DRAGON - DEBUG //
//================//
const debugRegistry = (registry, {transforms = true, redundants = true} = {}) => {
	const {redundantRules, transformedRules} = registry
	print("")
	print("=================================================================")
	if (transforms) {
		print("")
		print("TRANSFORMED RULES")
		for (const rule of transformedRules) {
			debugRule(rule)
		}
	}
	if (redundants) {
		print("")
		print("REDUNDANT RULES")
		for (const rule of redundantRules) {
			debugRule(rule)
		}
	}
}

const debugRule = (rule) => {
	for (const step of rule.steps) {
		print("")
		print("=== LEFT ===")
		for (const cell of step.left) {
			debugDiagramCell(cell, {read: true})
		}
		print("=== RIGHT ===")
		for (const cell of step.right) {
			debugDiagramCell(cell)
		}
	}
}

const debugDiagramCell = (cell, {read = false} = {}) => {
	if (read) {
		print("CHECK", "at", cell.x, cell.y, "with size", cell.width, cell.height, "for", getSplashesArrayFromArray(cell.content))
	}
	else {
		if (cell.instruction.type === "NOTHING") {
			print(cell.instruction.type, "at", cell.x, cell.y, "with size", cell.width, cell.height)
		}
		else if (cell.instruction.type === "RECOLOUR") {
			print(cell.instruction.type, "at", cell.x, cell.y, "with size", cell.width, cell.height, "to", getSplashesArrayFromArray(cell.content))
		} else {
			print(cell.instruction.type, cell.splitX, cell.splitY, "at", cell.x, cell.y, "with size", cell.width, cell.height)
		}
	}
}
