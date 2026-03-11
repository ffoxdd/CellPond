//===================//
// TRIANGLE PICK UP  //
//===================//
class TrianglePickUp extends Atom {
	hasBorder = true
	colour = Colour.Black
	borderColour = Colour.Black
	value = false

	constructor({x, y, size} = {}) {
		super()
		this.x = x
		this.y = y
		this.size = size
	}

	draw(ctx) { drawTriangleUp(this, ctx) }
	offscreen() { return triangleOffscreen(this) }
	overlaps(x, y) { return triangleOverlaps(this, x, y) }
	grab() { return this.parent }

	touch() {
		this.colour = Colour.Silver
		return this
	}

	click() {
		const triangle = this.parent
		this.colour = Colour.Black

		triangle.direction = UI.rotateTriangleRotation(triangle.direction, true)
		this.value = true

		triangle.updateValue()
		const parent = triangle.parent
		if (parent.isSquare) {
			parent.receiveNumber(triangle.value, triangle.channelId, {expanded: triangle.expanded, numberAtom: triangle})
		}
	}
}
