//=============//
// PICKER PAD  //
//=============//
class PickerPad extends Atom {
	constructor(element = {}) {
		super({
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

	draw(atom, ctx) { Rectangle.drawFn(this, ctx) }
	overlaps(atom, x, y) { return Rectangle.overlapsFn(this, x, y) }
	offscreen(atom) { return Rectangle.offscreenFn(this) }
	grab(atom) { return this.parent }

	static get HEIGHT() {
		return UI.SQUARE_SIZE
	}
}
