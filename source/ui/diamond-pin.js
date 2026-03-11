//==============//
// DIAMOND PIN  //
//==============//
class DiamondPin extends Atom {
	constructor(element = {}) {
		const pinSize = (UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2) / 2
		super({
			draw: (atom, ctx) => {
				COLOURTODE_TALL_RECTANGLE.draw(atom, ctx)
			},
			offscreen: Rectangle.offscreenFn,
			overlaps: Rectangle.overlapsFn,
			hasBorder: true,
			size: pinSize,
			height: pinSize,
			width: pinSize,
			grab: (atom) => atom.parent,
			touch: (atom) => atom.parent,
			...element,
		})
	}
}
