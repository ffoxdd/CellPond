//======================//
// HEXAGON BUTTON INNER //
//======================//
class HexagonButtonInner extends Atom {
	constructor(element = {}) {
		super({
			size: UI.SQUARE_SIZE * 2/3,
			offscreen: Rectangle.offscreenFn,
			overlaps: Rectangle.overlapsFn,
			grab: (atom) => atom.parent,
			touch: (atom) => atom.parent,
			draw: Circle.drawFn,
			hasBorder: true,
			borderColour: Colour.Black,
			colour: Colour.Grey,
			...element,
		})
	}
}
