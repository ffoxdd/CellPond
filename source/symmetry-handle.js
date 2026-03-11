//==================//
// SYMMETRY HANDLE  //
//==================//
class SymmetryHandle extends Atom {
	dragOnly = true
	colour = Colour.Grey

	constructor({x, y, width, height, behindParent} = {}) {
		super()
		this.x = x
		this.y = y
		this.width = width
		this.height = height
		this.behindParent = behindParent
	}

	draw(ctx) { drawRectangle(this, ctx) }
	offscreen() { return rectangleOffscreen(this) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	grab() { return this.parent }

	static get WIDTH() { return UI.SYMMETRY_CIRCLE_SIZE/2 }
	static get HEIGHT() { return UI.SYMMETRY_CIRCLE_SIZE / 3 }
}
