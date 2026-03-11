//======================//
// HEXAGON BUTTON INNER //
//======================//
class HexagonButtonInner extends Atom {
	size = UI.SQUARE_SIZE * 2/3
	hasBorder = true
	borderColour = Colour.Black
	colour = Colour.Grey

	draw(ctx) { Circle.drawFn(this, ctx) }
	offscreen() { return Rectangle.offscreenFn(this) }
	overlaps(x, y) { return Rectangle.overlapsFn(this, x, y) }
	grab() { return this.parent }
	touch() { return this.parent }
}
