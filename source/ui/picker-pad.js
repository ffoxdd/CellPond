//=============//
// PICKER PAD  //
//=============//
class PickerPad extends Atom {
	colour = Colour.Grey
	width = UI.OPTION_MARGIN + 3*(UI.SQUARE_SIZE + UI.OPTION_MARGIN)
	height = UI.SQUARE_SIZE
	x = UI.SQUARE_SIZE + UI.OPTION_MARGIN
	dragOnly = true
	isPicker = true

	draw(ctx) { drawRectangle(this, ctx) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	offscreen() { return rectangleOffscreen(this) }
	grab() { return this.parent }

	static get HEIGHT() {
		return UI.SQUARE_SIZE
	}
}
