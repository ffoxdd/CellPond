//=============//
// HIGHLIGHT   //
//=============//
class Highlight extends Atom {
	constructor(element = {}) {
		super({
			behindParent: true,
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

	draw(atom, ctx) { Rectangle.drawFn(this, ctx) }
	offscreen(atom) { return Rectangle.offscreenFn(this) }
	overlaps(atom, x, y) { return Rectangle.overlapsFn(this, x, y) }
}
