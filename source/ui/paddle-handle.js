//================//
// PADDLE HANDLE  //
//================//
class PaddleHandle extends Atom {
	isPaddleHandle = true
	attached = true
	behindChildren = true
	colour = Colour.Grey
	size = UI.PADDLE_X
	x = -UI.PADDLE_X
	y = UI.PADDLE_TOTAL_SIZE/2 - UI.PADDLE_X/2

	draw(ctx) { drawRectangle(this, ctx) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	offscreen() { return rectangleOffscreen(this) }
	touch() { return this.parent.pinhole }
	grab() { return this.parent.pinhole }
}
