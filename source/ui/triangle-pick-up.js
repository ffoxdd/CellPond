//===================//
// TRIANGLE PICK UP  //
//===================//
class TrianglePickUp extends Atom {
	constructor(element = {}) {
		super({
			hasBorder: true,
			colour: Colour.Black,
			borderColour: Colour.Black,
			value: false,
			size: UI.SQUARE_SIZE - UI.OPTION_MARGIN*1.5,
			x: TrianglePad.X + TrianglePad.WIDTH/2 - (UI.SQUARE_SIZE - UI.OPTION_MARGIN*1.5)/2,
			y: TrianglePad.Y + UI.OPTION_MARGIN*1.5/2,
			...element,
		})
	}

	draw(atom, ctx) { TriangleUp.drawFn(this, ctx) }
	offscreen(atom) { return triangleOffscreen(this) }
	overlaps(atom, x, y) { return triangleOverlaps(this, x, y) }
	grab(atom) { return this.parent }

	touch(atom) {
		this.colour = Colour.Silver
		return this
	}

	click(atom) {
		const triangle = this.parent
		this.colour = Colour.Black

		triangle.direction = UI.rotateTriangleRotation(triangle.direction, true)
		this.value = true

		triangle.updateValue(triangle)
		const parent = triangle.parent
		if (parent.isSquare) {
			parent.receiveNumber(parent, triangle.value, triangle.channelId, {expanded: triangle.expanded, numberAtom: triangle})
		}
	}
}
