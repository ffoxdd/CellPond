//============================//
// CHANNEL SELECTION SIDE     //
//============================//
class ChannelSelectionSide extends Atom {
	width = (UI.SQUARE_SIZE - UI.CHANNEL_HEIGHT)/2
	height = UI.SQUARE_SIZE
	colour = Colour.Grey
	dragLockX = true

	draw(ctx) { Rectangle.drawFn(this, ctx) }
	overlaps(x, y) { return Rectangle.overlapsFn(this, x, y) }
	offscreen() { return Rectangle.offscreenFn(this) }
	grab() { return this.parent }
	touch() { return this.parent }
}
