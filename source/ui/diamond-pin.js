//==============//
// DIAMOND PIN  //
//==============//
class DiamondPin extends Atom {
	hasBorder = true

	constructor({size, width, height} = {}) {
		super()
		this.size = size
		this.width = width
		this.height = height
	}

	draw(ctx) { drawDiamond(this, ctx) }
	offscreen() { return rectangleOffscreen(this) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	grab() { return this.parent }
	touch() { return this.parent }
}
