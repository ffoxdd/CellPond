//================//
// PADDLE HANDLE  //
//================//
class PaddleHandle extends Atom {
	isPaddleHandle = true
	attached = true
	behindChildren = true
	colour = Colour.Grey

	constructor({x, y, size} = {}) {
		super()
		this.x = x
		this.y = y
		this.size = size
	}

	draw(ctx) { drawRectangle(this, ctx) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	offscreen() { return rectangleOffscreen(this) }
	touch() { return this.parent.pinhole }
	grab() { return this.parent.pinhole }
}
