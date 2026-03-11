//=============//
// PICKER PAD  //
//=============//
class PickerPad extends Atom {
	colour = Colour.Grey
	dragOnly = true
	isPicker = true

	constructor({x, y, width, height} = {}) {
		super()
		this.x = x
		this.y = y
		this.width = width
		this.height = height
	}

	draw(ctx) { drawRectangle(this, ctx) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	offscreen() { return rectangleOffscreen(this) }
	grab() { return this.parent }

	static get HEIGHT() {
		return UI.SQUARE_SIZE
	}
}
