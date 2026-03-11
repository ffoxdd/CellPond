//=====================//
// TRIANGLE PICK DOWN  //
//=====================//
class TrianglePickDown extends Atom {
	constructor(element = {}) {
		super({
			hasBorder: true,
			colour: Colour.Black,
			borderColour: Colour.Black,
			draw: (atom, ctx) => {
				TriangleDown.drawFn(atom, ctx)
			},
			touch: (atom) => {
				atom.colour = Colour.Silver
				return atom
			},
			click: (atom) => {
				const triangle = atom.parent
				atom.colour = Colour.Black

				triangle.direction = UI.rotateTriangleRotation(triangle.direction, false)
				atom.value = true

				triangle.updateValue(triangle)
				const parent = triangle.parent
				if (parent.isSquare) {
					parent.receiveNumber(parent, triangle.value, triangle.channelId, {expanded: triangle.expanded, numberAtom: triangle})
				}
			},
			offscreen: triangleOffscreen,
			overlaps: triangleOverlaps,

			value: false,
			size: UI.SQUARE_SIZE - UI.OPTION_MARGIN*1.5,
			grab: (atom) => atom.parent,
			x: TrianglePad.X + TrianglePad.WIDTH/2 - (UI.SQUARE_SIZE - UI.OPTION_MARGIN*1.5)/2,
			y: TrianglePad.Y + TrianglePad.HEIGHT - (UI.SQUARE_SIZE - UI.OPTION_MARGIN*1.5) - UI.OPTION_MARGIN/2,
			...element,
		})
	}
}
