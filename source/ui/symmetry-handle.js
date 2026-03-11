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

	draw(ctx) { drawRectangle(this, ctx) }
	offscreen() { return rectangleOffscreen(this) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	grab() { return this.parent }

	static get WIDTH() { return UI.SYMMETRY_CIRCLE_SIZE/2 }
	static get HEIGHT() { return UI.SYMMETRY_CIRCLE_SIZE / 3 }
}
