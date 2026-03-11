//============================//
// CHANNEL SELECTION SIDE     //
//============================//
class ChannelSelectionSide extends Atom {
	constructor(element = {}) {
		super({
			overlaps: Rectangle.overlapsFn,
			offscreen: Rectangle.offscreenFn,
			width: (UI.SQUARE_SIZE - UI.CHANNEL_HEIGHT)/2,
			height: UI.SQUARE_SIZE,
			grab: (atom) => atom.parent,
			touch: (atom) => atom.parent,
			dragLockX: true,
			draw: Rectangle.drawFn,
			colour: Colour.Grey,
			...element,
		})
	}
}
