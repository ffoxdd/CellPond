//==================//
// TRIANGLE HANDLE  //
//==================//
class TriangleHandle extends Atom {
	dragOnly = true
	width = UI.SYMMETRY_CIRCLE_SIZE/2 + UI.OPTION_MARGIN
	x = UI.SYMMETRY_CIRCLE_SIZE/2
	height = UI.SYMMETRY_CIRCLE_SIZE / 3
	y = UI.SYMMETRY_CIRCLE_SIZE/2 - (UI.SYMMETRY_CIRCLE_SIZE / 3)/2
	colour = Colour.Grey

	draw(ctx) { Rectangle.drawFn(this, ctx) }
	offscreen() { return Rectangle.offscreenFn(this) }
	overlaps(x, y) { return Rectangle.overlapsFn(this, x, y) }
	grab() { return this.parent }
}
