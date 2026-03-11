//=============//
// PICKER PAD  //
//=============//
class PickerPad extends Atom {
	constructor(element = {}) {
		super({
			draw: Rectangle.drawFn,
			overlaps: Rectangle.overlapsFn,
			offscreen: Rectangle.offscreenFn,
			grab: (atom) => atom.parent,
			colour: Colour.Grey,
			width: UI.OPTION_MARGIN + 3*(UI.SQUARE_SIZE + UI.OPTION_MARGIN),
			height: UI.SQUARE_SIZE,
			y: 0,
			x: UI.SQUARE_SIZE + UI.OPTION_MARGIN,
			dragOnly: true,
			isPicker: true,
			...element,
		})
	}

	static get HEIGHT() {
		return UI.SQUARE_SIZE
	}
}
