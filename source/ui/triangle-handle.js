//==================//
// TRIANGLE HANDLE  //
//==================//
class TriangleHandle extends Atom {
	constructor(element = {}) {
		super({
			dragOnly: true,
			width: UI.SYMMETRY_CIRCLE_SIZE/2 + UI.OPTION_MARGIN,
			x: UI.SYMMETRY_CIRCLE_SIZE/2,
			height: UI.SYMMETRY_CIRCLE_SIZE / 3,
			y: UI.SYMMETRY_CIRCLE_SIZE/2 - (UI.SYMMETRY_CIRCLE_SIZE / 3)/2,
			colour: Colour.Grey,
			...element,
		})
	}

	draw(atom, ctx) { Rectangle.drawFn(this, ctx) }
	offscreen(atom) { return Rectangle.offscreenFn(this) }
	overlaps(atom, x, y) { return Rectangle.overlapsFn(this, x, y) }
	grab(atom) { return this.parent }
}
