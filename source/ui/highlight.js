//=============//
// HIGHLIGHT   //
//=============//
class Highlight extends Atom {
	behindParent = true
	draggable = false
	grabbable = false
	justVisual = true
	colour = Colour.splash(999)
	borderColour = Colour.splash(999)
	hasAbsolutePosition = true
	hasInner = false

	draw(ctx) { drawRectangle(this, ctx) }
	offscreen() { return rectangleOffscreen(this) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
}
