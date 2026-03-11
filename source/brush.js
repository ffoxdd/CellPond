//=========//
// BRUSH   //
//=========//
class Brush {
	constructor() {
		this.colour = 999
		this.size = 3
		this.hoverColour = undefined

		this.colourCycleIndex = 0
		this.colourCycle = [
			999,

			Colour.Green.splash,
			Colour.Blue.splash,
			Colour.Red.splash,
			Colour.Yellow.splash,

			Colour.Black.splash,

			Colour.Rose.splash,
			Colour.Cyan.splash,
			Colour.Orange.splash,
			Colour.Purple.splash,
			Colour.Pink.splash,

			Colour.Grey.splash,
			Colour.Silver.splash,
		]
	}

	cycleColour() {
		this.colourCycleIndex++
		if (this.colourCycleIndex >= this.colourCycle.length) {
			this.colourCycleIndex = 0
		}
		return this.colourCycle[this.colourCycleIndex]
	}
}
