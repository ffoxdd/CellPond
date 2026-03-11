//===============//
// SYMMETRY PAD  //
//===============//
class SymmetryPad extends Atom {
	constructor(element = {}) {
		super({
			dragOnly: true,
			width: UI.SYMMETRY_CIRCLE_SIZE,
			x: UI.SYMMETRY_CIRCLE_SIZE + UI.OPTION_MARGIN,
			height: (UI.SYMMETRY_CIRCLE_SIZE * 3) - UI.OPTION_MARGIN,
			y: -(UI.SYMMETRY_CIRCLE_SIZE * 3)/3 + UI.OPTION_MARGIN/2,
			colour: Colour.Grey,
			...element,
		})
	}

	draw(atom, ctx) { Rectangle.drawFn(this, ctx) }
	offscreen(atom) { return Rectangle.offscreenFn(this) }
	overlaps(atom, x, y) { return Rectangle.overlapsFn(this, x, y) }
	grab(atom) { return this.parent }

	static get X() { return UI.SYMMETRY_CIRCLE_SIZE + UI.OPTION_MARGIN }
	static get WIDTH() { return UI.SYMMETRY_CIRCLE_SIZE }
	static get Y() { return -(UI.SYMMETRY_CIRCLE_SIZE * 3)/3 + UI.OPTION_MARGIN/2 }
	static get HEIGHT() { return (UI.SYMMETRY_CIRCLE_SIZE * 3) - UI.OPTION_MARGIN }
}
