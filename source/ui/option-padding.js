//==================//
// OPTION PADDING   //
//==================//
class OptionPadding extends Atom {
	colour = Colour.Grey
	width = UI.SQUARE_SIZE
	height = UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN - UI.CHANNEL_HEIGHT

	draw() {}
	overlaps(atom, x, y) { return Rectangle.overlapsFn(this, x, y) }
	offscreen(atom) { return Rectangle.offscreenFn(this) }
	grab(atom) { return this.parent.parent }
	touch(atom) { return this.parent }
}
