//========//
// SLOT   //
//========//
class Slot extends Atom {
	constructor(element = {}) {
		super({
			visible: true,
			isSlot: true,
			behindChildren: true,
			draw: Slot.drawFn,
			offscreen: Rectangle.offscreenFn,
			overlaps: Rectangle.overlapsFn,
			colour: Colour.Black,
			size: UI.SQUARE_SIZE,
			grab: (atom) => atom.parent,
			dragOnly: true,
			...element,
		})
	}

	static drawFn(atom, ctx) {
		if (!atom.visible) return

		const {x, y} = atom.getPosition()

		ctx.fillStyle = atom.colour

		const w = atom.width/3
		const h = atom.width/3
		const X = x + atom.width/2 - w/2
		const Y = y + atom.height/2 - h/2
		ctx.fillRect(...[X, Y, w, h].map(n => Math.round(n)))
	}
}
