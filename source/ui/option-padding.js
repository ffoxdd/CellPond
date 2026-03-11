//==================//
// OPTION PADDING   //
//==================//
class OptionPadding extends Atom {
	constructor(element = {}) {
		super({
			draw: () => {},
			overlaps: Rectangle.overlapsFn,
			offscreen: Rectangle.offscreenFn,
			grab: (atom) => atom.parent.parent,
			touch: (atom) => atom.parent,
			colour: Colour.Grey,
			width: UI.SQUARE_SIZE,
			height: UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN - UI.CHANNEL_HEIGHT,
			y: 0,
			x: 0,
			...element,
		})
	}
}
