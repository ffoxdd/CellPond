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

	draw(atom, ctx) { Rectangle.drawFn(this, ctx) }
	overlaps(atom, x, y) { return Rectangle.overlapsFn(this, x, y) }
	offscreen(atom) { return Rectangle.offscreenFn(this) }
	grab(atom) { return this.parent }

	static get HEIGHT() {
		return UI.SQUARE_SIZE
	}
}
