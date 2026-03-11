//========//
// SLOT   //
//========//
class Slot extends Atom {
	visible = true
	isSlot = true
	behindChildren = true
	colour = Colour.Black
	size = UI.SQUARE_SIZE
	dragOnly = true

	draw(ctx) { Slot.drawFn(this, ctx) }
	offscreen() { return Rectangle.offscreenFn(this) }
	overlaps(x, y) { return Rectangle.overlapsFn(this, x, y) }
	grab() { return this.parent }

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
