//==============//
// DIAMOND PIN  //
//==============//
class DiamondPin extends Atom {
	constructor(element = {}) {
		const pinSize = (UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2) / 2
		super({
			hasBorder: true,
			size: pinSize,
			height: pinSize,
			width: pinSize,
			...element,
		})
	}

	draw(atom, ctx) { TallRectangle.drawFn(this, ctx) }
	offscreen(atom) { return Rectangle.offscreenFn(this) }
	overlaps(atom, x, y) { return Rectangle.overlapsFn(this, x, y) }
	grab(atom) { return this.parent }
	touch(atom) { return this.parent }
}
