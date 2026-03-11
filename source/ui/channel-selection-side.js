//============================//
// CHANNEL SELECTION SIDE     //
//============================//
class ChannelSelectionSide extends Atom {
	constructor(element = {}) {
		super({
			width: (UI.SQUARE_SIZE - UI.CHANNEL_HEIGHT)/2,
			height: UI.SQUARE_SIZE,
			colour: Colour.Grey,
			dragLockX: true,
			...element,
		})
	}

	draw(atom, ctx) { Rectangle.drawFn(this, ctx) }
	overlaps(atom, x, y) { return Rectangle.overlapsFn(this, x, y) }
	offscreen(atom) { return Rectangle.offscreenFn(this) }
	grab(atom) { return this.parent }
	touch(atom) { return this.parent }
}
