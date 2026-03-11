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

	draw(ctx) { Rectangle.drawFn(this, ctx) }
	offscreen() { return Rectangle.offscreenFn(this) }
	overlaps(x, y) { return Rectangle.overlapsFn(this, x, y) }
}
