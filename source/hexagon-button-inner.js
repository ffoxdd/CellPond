//======================//
// HEXAGON BUTTON INNER //
//======================//
class HexagonButtonInner extends Atom {
	hasBorder = true
	borderColour = Colour.Black
	colour = Colour.Grey

	constructor({size} = {}) {
		super()
		this.size = size
	}

	draw(ctx) { drawCircle(this, ctx) }
	offscreen() { return rectangleOffscreen(this) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	grab() { return this.parent }
	touch() { return this.parent }
}
