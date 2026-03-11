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

	draw(ctx) {
		if (!this.visible) return

		const {x, y} = this.getPosition()

		ctx.fillStyle = this.colour

		const w = this.width/3
		const h = this.width/3
		const X = x + this.width/2 - w/2
		const Y = y + this.height/2 - h/2
		ctx.fillRect(...[X, Y, w, h].map(n => Math.round(n)))
	}

	offscreen() { return rectangleOffscreen(this) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	grab() { return this.parent }
}
