//==================//
// OPTION PADDING   //
//==================//
class OptionPadding extends Atom {
	colour = Colour.Grey
	width = UI.SQUARE_SIZE
	height = UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN - UI.CHANNEL_HEIGHT

	draw() {}
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	offscreen() { return rectangleOffscreen(this) }
	grab() { return this.parent.parent }
	touch() { return this.parent }
}
