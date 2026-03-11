//==================//
// OPTION PADDING   //
//==================//
class OptionPadding extends Atom {
	constructor(element = {}) {
		super({
			colour: Colour.Grey,
			width: UI.SQUARE_SIZE,
			height: UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN - UI.CHANNEL_HEIGHT,
			y: 0,
			x: 0,
			...element,
		})
	}

	draw() {}
	overlaps(atom, x, y) { return Rectangle.overlapsFn(this, x, y) }
	offscreen(atom) { return Rectangle.offscreenFn(this) }
	grab(atom) { return this.parent.parent }
	touch(atom) { return this.parent }
}
