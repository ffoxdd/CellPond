//======================//
// HEXAGON BUTTON INNER //
//======================//
class HexagonButtonInner extends Atom {
	size = UI.SQUARE_SIZE * 2/3
	hasBorder = true
	borderColour = Colour.Black
	colour = Colour.Grey

	draw(atom, ctx) { Circle.drawFn(this, ctx) }
	offscreen(atom) { return Rectangle.offscreenFn(this) }
	overlaps(atom, x, y) { return Rectangle.overlapsFn(this, x, y) }
	grab(atom) { return this.parent }
	touch(atom) { return this.parent }
}
