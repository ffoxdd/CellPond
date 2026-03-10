// Example diagram definitions for CellPond's Dragon rule engine.
// These demonstrate how to build rules using the Dragon classes.
// Not loaded by default — kept as reference.
//
// To use: load this script after dragon.js and DRAGON_INSTRUCTION are defined.

//=================//
// COLOUR SHORTHAND //
//=================//
const GREY = DragonArray.fromSplash(Colour.Grey.splash)
const BLACK = DragonArray.fromSplash(Colour.Black.splash)
const CYAN = DragonArray.fromSplash(Colour.Cyan.splash)
const BLUE = DragonArray.fromSplash(Colour.Blue.splash)
const YELLOW = DragonArray.fromSplash(Colour.Yellow.splash)
const PURPLE = DragonArray.fromSplash(Colour.Cyan.splash - 111)
const RED = DragonArray.fromSplash(Colour.Red.splash)

//==============//
// ROCK FALLING //
//==============//
const ROCK_FALL_DIAGRAM = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, content: GREY}),
		new DiagramCell({x: 0, y: 1, content: BLACK}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, content: BLACK}),
		new DiagramCell({x: 0, y: 1, content: GREY}),
	],
})

//==============//
// SAND FALLING //
//==============//
const SAND_FALL_DIAGRAM = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, content: YELLOW}),
		new DiagramCell({x: 0, y: 1, content: BLACK}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, content: BLACK}),
		new DiagramCell({x: 0, y: 1, content: YELLOW}),
	],
})

const SAND_SLIDE_DIAGRAM = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, content: YELLOW}),
		new DiagramCell({x: 1, y: 1, content: BLACK}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, content: BLACK}),
		new DiagramCell({x: 1, y: 1, content: YELLOW}),
	],
})

//===============//
// WATER PHYSICS //
//===============//
const WATER_RIGHT = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, content: CYAN}),
		new DiagramCell({x: 1, y: 0, content: BLUE}),
	],
})

const WATER_RIGHT_FALL = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, content: BLUE}),
		new DiagramCell({x: 0, y: 1, content: BLACK}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, content: BLACK}),
		new DiagramCell({x: 0, y: 1, content: BLUE}),
	],
})

const WATER_RIGHT_FLIP = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, content: PURPLE}),
		new DiagramCell({x: 1, y: 0, content: CYAN}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, content: CYAN}),
		new DiagramCell({x: 1, y: 0, content: PURPLE}),
	],
})

const WATER_RIGHT_SLIP = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, width: 1, content: BLUE}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, width: 0.5, content: PURPLE, instruction: DRAGON_INSTRUCTION.split, splitX: 2, splitY: 1}),
		new DiagramCell({x: 0.5, y: 0, width: 0.5, content: CYAN}),
	],
})

const WATER_RIGHT_UNSLIP = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, width: 1, content: PURPLE}),
		new DiagramCell({x: 1, y: 0, width: 1, content: CYAN}),
		new DiagramCell({x: 0, y: 1, width: 2, content: BLACK}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, width: 2, content: BLUE, instruction: DRAGON_INSTRUCTION.merge, splitX: 2, splitY: 1}),
		new DiagramCell({x: 0, y: 1, width: 2, content: BLACK}),
	],
})

const WATER_RIGHT_UNSLIPP = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, width: 1, content: PURPLE}),
		new DiagramCell({x: 1, y: 0, width: 1, content: PURPLE}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, width: 2, content: BLUE, instruction: DRAGON_INSTRUCTION.merge, splitX: 2, splitY: 1}),
	],
})

const WATER_RIGHT_UNSLIPC = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, width: 1, content: CYAN}),
		new DiagramCell({x: 1, y: 0, width: 1, content: CYAN}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, width: 2, content: BLUE, instruction: DRAGON_INSTRUCTION.merge, splitX: 2, splitY: 1}),
	],
})

const WATER_RIGHT_SLIDE = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, width: 1, content: PURPLE}),
		new DiagramCell({x: 1, y: 0, width: 1, content: CYAN}),
		new DiagramCell({x: 2, y: 0, width: 2, content: BLACK}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, width: 2, content: BLACK, instruction: DRAGON_INSTRUCTION.merge, splitX: 2, splitY: 1}),
		new DiagramCell({x: 2, y: 0, width: 1, content: PURPLE, instruction: DRAGON_INSTRUCTION.split, splitX: 2, splitY: 1}),
		new DiagramCell({x: 3, y: 0, width: 1, content: CYAN}),
	],
})

const WATER_RIGHT_FALL_BLUE = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, width: 0.5, content: BLUE}),
		new DiagramCell({x: 0.5, y: 0, width: 0.5, content: BLUE}),
		new DiagramCell({x: 0, y: 1, content: BLACK}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, width: 1.0, content: BLACK, instruction: DRAGON_INSTRUCTION.merge, splitX: 2, splitY: 1}),
		new DiagramCell({x: 0, y: 1, width: 0.5, content: BLUE, instruction: DRAGON_INSTRUCTION.split, splitX: 2, splitY: 1}),
		new DiagramCell({x: 0.5, y: 1, width: 0.5, content: BLUE}),
	],
})

const WATER_RIGHT_FALL_CYAN = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, width: 0.5, content: CYAN}),
		new DiagramCell({x: 0.5, y: 0, width: 0.5, content: CYAN}),
		new DiagramCell({x: 0, y: 1, content: BLACK}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, width: 1.0, content: BLACK, instruction: DRAGON_INSTRUCTION.merge, splitX: 2, splitY: 1}),
		new DiagramCell({x: 0, y: 1, width: 0.5, content: CYAN, instruction: DRAGON_INSTRUCTION.split, splitX: 2, splitY: 1}),
		new DiagramCell({x: 0.5, y: 1, width: 0.5, content: CYAN}),
	],
})

const WATER_RIGHT_SPIN = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, content: BLUE}),
		new DiagramCell({x: 1, y: 0, content: CYAN}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, content: CYAN}),
		new DiagramCell({x: 1, y: 0, content: BLUE}),
	],
})

const WATER_RIGHT_SPAWN_DIAGRAM = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, content: PURPLE}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, width: 0.5, content: BLUE, instruction: DRAGON_INSTRUCTION.split, splitX: 2, splitY: 1}),
		new DiagramCell({x: 0.5, y: 0, width: 0.5, content: CYAN, instruction: DRAGON_INSTRUCTION.recolour}),
	],
})

const WATER_RIGHT_RESPAWN_BLUE = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, width: 1, content: BLUE}),
		new DiagramCell({x: 1, y: 0, width: 1, content: BLUE}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, width: 1, content: BLUE}),
		new DiagramCell({x: 1, y: 0, width: 1, content: CYAN}),
	],
})

const WATER_RIGHT_RESPAWN_CYAN = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, width: 1, content: CYAN}),
		new DiagramCell({x: 1, y: 0, width: 1, content: CYAN}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, width: 1, content: BLUE}),
		new DiagramCell({x: 1, y: 0, width: 1, content: CYAN}),
	],
})

//=============//
// DARK WATER  //
//=============//
const WATER_DARK_FALL = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, width: 1, content: GREY}),
		new DiagramCell({x: 0, y: 1, width: 1, content: BLACK}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, width: 1, content: BLACK}),
		new DiagramCell({x: 0, y: 1, width: 1, content: GREY}),
	],
})

const WATER_DARK_SLIP = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, width: 1, content: GREY}),
		new DiagramCell({x: 1, y: 0, width: 1, content: BLACK}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, width: 1, content: BLACK}),
		new DiagramCell({x: 1, y: 0, width: 1, content: GREY}),
	],
})

//=========//
// RAINBOW //
//=========//
const RAINBOW = new DragonArray()
RAINBOW.channels = [new DragonNumber(), new DragonNumber(), new DragonNumber()]
for (let c = 0; c < 3; c++) {
	const channel = RAINBOW.channels[c]
	for (let i = 0; i < 10; i++) {
		if (c === 0 & i > 0) continue
		channel.values[i] = true
	}
}

const RAINBOW_DIAGRAM = new Diagram({
	left: [
		new DiagramCell({content: RAINBOW})
	]
})

const RAINBOW2 = new DragonArray()
RAINBOW2.channels = [new DragonNumber(), new DragonNumber(), new DragonNumber()]
for (let c = 0; c < 3; c++) {
	const channel = RAINBOW2.channels[c]
	for (let i = 0; i < 10; i++) {
		if (c === 1 & i > 0) continue
		channel.values[i] = true
	}
}

const RAINBOW_DIAGRAM_2 = new Diagram({
	left: [
		new DiagramCell({content: RAINBOW2})
	]
})

//=================//
// SIMPLE SPAWNING //
//=================//
const WATER_SPAWN_DIAGRAM_CYAN = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, content: PURPLE}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, content: CYAN}),
	],
})

const WATER_SPAWN_DIAGRAM_BLUE = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, content: PURPLE}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, content: BLUE}),
	],
})

const WATER_FALL_CYAN = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, content: CYAN}),
		new DiagramCell({x: 0, y: 1, content: BLACK}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, content: BLACK}),
		new DiagramCell({x: 0, y: 1, content: CYAN}),
	],
})

const WATER_FALL_BLUE = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, content: BLUE}),
		new DiagramCell({x: 0, y: 1, content: BLACK}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, content: BLACK}),
		new DiagramCell({x: 0, y: 1, content: BLUE}),
	],
})

const WATER_SLIDE_BLUE = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, content: BLUE}),
		new DiagramCell({x: 1, y: 0, content: BLACK}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, content: BLACK}),
		new DiagramCell({x: 1, y: 0, content: BLUE}),
	],
})

const WATER_SLIDE_CYAN = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, content: CYAN}),
		new DiagramCell({x: -1, y: 0, content: BLACK}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, content: BLACK}),
		new DiagramCell({x: -1, y: 0, content: CYAN}),
	],
})

const WATER_SWAP_BLUE = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, content: BLUE}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, content: CYAN}),
	],
})

const WATER_SWAP_CYAN = new Diagram({
	left: [
		new DiagramCell({x: 0, y: 0, content: CYAN}),
	],
	right: [
		new DiagramCell({x: 0, y: 0, content: BLUE}),
	],
})

//=======================//
// EXAMPLE REGISTRATIONS //
//=======================//
// Uncomment any of these to register rules on load:
//
// ruleRegistry.register(new Rule({steps: [ROCK_FALL_DIAGRAM], transformations: DRAGON_TRANSFORMATIONS.NONE}))
//
// ruleRegistry.register(new Rule({steps: [SAND_FALL_DIAGRAM], transformations: DRAGON_TRANSFORMATIONS.NONE}))
// ruleRegistry.register(new Rule({steps: [SAND_SLIDE_DIAGRAM], transformations: DRAGON_TRANSFORMATIONS.X}))
//
// ruleRegistry.register(new Rule({steps: [WATER_DARK_FALL], transformations: DRAGON_TRANSFORMATIONS.NONE}))
// ruleRegistry.register(new Rule({steps: [WATER_DARK_SLIP], transformations: DRAGON_TRANSFORMATIONS.X}))
//
// ruleRegistry.register(new Rule({steps: [WATER_RIGHT_SPAWN_DIAGRAM], transformations: DRAGON_TRANSFORMATIONS.X}))
// ruleRegistry.register(new Rule({steps: [WATER_RIGHT_FALL], transformations: DRAGON_TRANSFORMATIONS.X}))
// ruleRegistry.register(new Rule({steps: [WATER_RIGHT_SLIP], transformations: DRAGON_TRANSFORMATIONS.X}))
// ruleRegistry.register(new Rule({steps: [WATER_RIGHT_SLIDE, WATER_RIGHT_FLIP], transformations: DRAGON_TRANSFORMATIONS.X}))
//
// ruleRegistry.register(new Rule({steps: [WATER_SPAWN_DIAGRAM_CYAN]}))
// ruleRegistry.register(new Rule({steps: [WATER_SPAWN_DIAGRAM_BLUE]}))
// ruleRegistry.register(new Rule({steps: [WATER_FALL_BLUE]}))
// ruleRegistry.register(new Rule({steps: [WATER_FALL_CYAN]}))
// ruleRegistry.register(new Rule({steps: [WATER_SLIDE_BLUE, WATER_SWAP_BLUE]}))
// ruleRegistry.register(new Rule({steps: [WATER_SLIDE_CYAN, WATER_SWAP_CYAN]}))
