//======================//
// HEXAGON BUTTON INNER //
//======================//
class HexagonButtonInner extends Atom {
	size = UI.SQUARE_SIZE * 2/3
	hasBorder = true
	borderColour = Colour.Black
	colour = Colour.Grey

	draw(ctx) { drawCircle(this, ctx) }
	offscreen() { return rectangleOffscreen(this) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	grab() { return this.parent }
	touch() { return this.parent }
}
