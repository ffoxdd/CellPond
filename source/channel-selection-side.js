//============================//
// CHANNEL SELECTION SIDE     //
//============================//
class ChannelSelectionSide extends Atom {
	colour = Colour.Grey
	dragLockX = true

	constructor({width, height} = {}) {
		super()
		this.width = width
		this.height = height
	}

	draw(ctx) { drawRectangle(this, ctx) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	offscreen() { return rectangleOffscreen(this) }
	grab() { return this.parent }
	touch() { return this.parent }
}
