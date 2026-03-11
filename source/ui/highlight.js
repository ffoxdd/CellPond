//=============//
// HIGHLIGHT   //
//=============//
class Highlight extends Atom {
	constructor(element = {}) {
		super({
			behindParent: true,
			draw: Rectangle.drawFn,
			offscreen: Rectangle.offscreenFn,
			overlaps: Rectangle.overlapsFn,
			draggable: false,
			grabbable: false,
			justVisual: true,
			colour: Colour.splash(999),
			borderColour: Colour.splash(999),
			hasAbsolutePosition: true,
			hasInner: false,
			...element,
		})
	}
}
