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

	draw(atom, ctx) { Rectangle.drawFn(this, ctx) }
	overlaps(atom, x, y) { return Rectangle.overlapsFn(this, x, y) }
	offscreen(atom) { return Rectangle.offscreenFn(this) }
	touch(atom) { return this.parent.pinhole }
	grab(atom) { return this.parent.pinhole }
}
