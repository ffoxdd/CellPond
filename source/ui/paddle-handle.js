//================//
// PADDLE HANDLE  //
//================//
class PaddleHandle extends Atom {
	constructor(element = {}) {
		super({
			isPaddleHandle: true,
			attached: true,
			behindChildren: true,
			draw: Rectangle.drawFn,
			overlaps: Rectangle.overlapsFn,
			offscreen: Rectangle.offscreenFn,
			colour: Colour.Grey,
			size: UI.PADDLE_X,
			x: -UI.PADDLE_X,
			y: UI.PADDLE_TOTAL_SIZE/2 - UI.PADDLE_X/2,
			touch: (atom) => atom.parent.pinhole,
			grab: (atom) => {
				return atom.parent.pinhole
			},
			...element,
		})
	}
}
