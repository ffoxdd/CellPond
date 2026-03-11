//==================//
// TRIANGLE HANDLE  //
//==================//
class TriangleHandle extends Atom {
	constructor(element = {}) {
		super({
			draw: Rectangle.drawFn,
			offscreen: Rectangle.offscreenFn,
			overlaps: Rectangle.overlapsFn,
			dragOnly: true,
			width: UI.SYMMETRY_CIRCLE_SIZE/2 + UI.OPTION_MARGIN,
			x: UI.SYMMETRY_CIRCLE_SIZE/2,
			height: UI.SYMMETRY_CIRCLE_SIZE / 3,
			y: UI.SYMMETRY_CIRCLE_SIZE/2 - (UI.SYMMETRY_CIRCLE_SIZE / 3)/2,
			colour: Colour.Grey,
			grab: (atom) => atom.parent,
			...element,
		})
	}
}
