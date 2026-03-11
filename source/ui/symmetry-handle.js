//==================//
// SYMMETRY HANDLE  //
//==================//
class SymmetryHandle extends Atom {
	constructor(element = {}) {
		super({
			draw: Rectangle.drawFn,
			offscreen: Rectangle.offscreenFn,
			overlaps: Rectangle.overlapsFn,
			dragOnly: true,
			width: UI.SYMMETRY_CIRCLE_SIZE/2,
			x: UI.SYMMETRY_CIRCLE_SIZE/2 + UI.SYMMETRY_CIRCLE_SIZE/4,
			height: UI.SYMMETRY_CIRCLE_SIZE / 3,
			y: UI.SYMMETRY_CIRCLE_SIZE/2 - (UI.SYMMETRY_CIRCLE_SIZE / 3)/2,
			colour: Colour.Grey,
			grab: (atom) => atom.parent,
			...element,
		})
	}

	static get WIDTH() { return UI.SYMMETRY_CIRCLE_SIZE/2 }
	static get HEIGHT() { return UI.SYMMETRY_CIRCLE_SIZE / 3 }
}
