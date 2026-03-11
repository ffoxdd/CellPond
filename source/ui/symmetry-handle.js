//==================//
// SYMMETRY HANDLE  //
//==================//
class SymmetryHandle extends Atom {
	dragOnly = true
	width = UI.SYMMETRY_CIRCLE_SIZE/2
	x = UI.SYMMETRY_CIRCLE_SIZE/2 + UI.SYMMETRY_CIRCLE_SIZE/4
	height = UI.SYMMETRY_CIRCLE_SIZE / 3
	y = UI.SYMMETRY_CIRCLE_SIZE/2 - (UI.SYMMETRY_CIRCLE_SIZE / 3)/2
	colour = Colour.Grey

	draw(atom, ctx) { Rectangle.drawFn(this, ctx) }
	offscreen(atom) { return Rectangle.offscreenFn(this) }
	overlaps(atom, x, y) { return Rectangle.overlapsFn(this, x, y) }
	grab(atom) { return this.parent }

	static get WIDTH() { return UI.SYMMETRY_CIRCLE_SIZE/2 }
	static get HEIGHT() { return UI.SYMMETRY_CIRCLE_SIZE / 3 }
}
