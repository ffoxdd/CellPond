//==============//
// DIAMOND PIN  //
//==============//
class DiamondPin extends Atom {
	hasBorder = true
	size = (UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2) / 2
	height = (UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2) / 2
	width = (UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2) / 2

	draw(ctx) { TallRectangle.drawFn(this, ctx) }
	offscreen() { return Rectangle.offscreenFn(this) }
	overlaps(x, y) { return Rectangle.overlapsFn(this, x, y) }
	grab() { return this.parent }
	touch() { return this.parent }
}
