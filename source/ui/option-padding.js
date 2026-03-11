//==================//
// OPTION PADDING   //
//==================//
class OptionPadding extends Atom {
	colour = Colour.Grey

	constructor({width, height} = {}) {
		super()
		this.width = width
		this.height = height
	}

	draw() {}
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	offscreen() { return rectangleOffscreen(this) }
	grab() { return this.parent.parent }
	touch() { return this.parent }
}
