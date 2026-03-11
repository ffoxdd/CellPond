//===================//
// TRIANGLE PICK UP  //
//===================//
class TrianglePickUp extends Atom {
	hasBorder = true
	colour = Colour.Black
	borderColour = Colour.Black
	value = false
	size = UI.SQUARE_SIZE - UI.OPTION_MARGIN*1.5
	x = TrianglePad.X + TrianglePad.WIDTH/2 - (UI.SQUARE_SIZE - UI.OPTION_MARGIN*1.5)/2
	y = TrianglePad.Y + UI.OPTION_MARGIN*1.5/2

	draw(ctx) { TriangleUp.drawFn(this, ctx) }
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
