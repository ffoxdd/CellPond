//==================//
// TRIANGLE HANDLE  //
//==================//
class TriangleHandle extends Atom {
	dragOnly = true
	colour = Colour.Grey

	constructor({x, y, width, height} = {}) {
		super()
		this.x = x
		this.y = y
		this.width = width
		this.height = height
	}

	draw(ctx) { drawRectangle(this, ctx) }
	offscreen() { return rectangleOffscreen(this) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	grab() { return this.parent }
}
