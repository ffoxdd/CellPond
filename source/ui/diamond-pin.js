//==============//
// DIAMOND PIN  //
//==============//
class DiamondPin extends Atom {
	hasBorder = true
	size = (UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2) / 2
	height = (UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2) / 2
	width = (UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2) / 2

	draw(atom, ctx) { TallRectangle.drawFn(this, ctx) }
	offscreen(atom) { return Rectangle.offscreenFn(this) }
	overlaps(atom, x, y) { return Rectangle.overlapsFn(this, x, y) }
	grab(atom) { return this.parent }
	touch(atom) { return this.parent }
}
