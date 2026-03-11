//===============//
// TRIANGLE PAD  //
//===============//
class TrianglePad extends Atom {
	dragOnly = true
	width = UI.SYMMETRY_CIRCLE_SIZE
	x = UI.SYMMETRY_CIRCLE_SIZE*Math.sqrt(3)/2 + UI.OPTION_MARGIN
	height = (UI.SYMMETRY_CIRCLE_SIZE * 2) - UI.OPTION_MARGIN
	y = -UI.SYMMETRY_CIRCLE_SIZE/2 + UI.OPTION_MARGIN/2
	colour = Colour.Grey

	draw(ctx) { Rectangle.drawFn(this, ctx) }
	offscreen() { return Rectangle.offscreenFn(this) }
	overlaps(x, y) { return Rectangle.overlapsFn(this, x, y) }
	grab() { return this.parent }

	static get X() { return UI.SYMMETRY_CIRCLE_SIZE*Math.sqrt(3)/2 + UI.OPTION_MARGIN }
	static get WIDTH() { return UI.SYMMETRY_CIRCLE_SIZE }
	static get Y() { return -UI.SYMMETRY_CIRCLE_SIZE/2 + UI.OPTION_MARGIN/2 }
	static get HEIGHT() { return (UI.SYMMETRY_CIRCLE_SIZE * 2) - UI.OPTION_MARGIN }
}
