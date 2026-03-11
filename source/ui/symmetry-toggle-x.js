//====================//
// SYMMETRY TOGGLE X  //
//====================//
class SymmetryToggleX extends Atom {
	constructor(element = {}) {
		super({
			hasBorder: true,
			borderColour: Colour.Black,
			colour: Colour.Grey,
			draw: (atom, ctx) => {
				atom.colour = atom.value? Colour.Silver : Colour.Grey
				Circle.drawFn(atom, ctx)
				atom.drawX(atom, ctx)
			},
			drawX: SymmetryToggleX.drawX,
			offscreen: Rectangle.offscreenFn,
			overlaps: Rectangle.overlapsFn,
			expanded: false,
			click: (atom) => {
				atom.value = !atom.value
				let [x, y, r] = getRGB(atom.parent.value)
				x = atom.value? 100 : 0
				atom.parent.value = x+y+r
				const circle = atom.parent
				if (circle.parent !== UI.atomRegistry.baseParent) {
					const paddle = circle.parent
					UI.updatePaddleRule(paddle)
				}
			},
			value: false,
			size: UI.SQUARE_SIZE - UI.OPTION_MARGIN,
			grab: (atom) => atom.parent,
			x: SymmetryPad.X + SymmetryPad.WIDTH/2 - (UI.SQUARE_SIZE - UI.OPTION_MARGIN)/2,
			y: SymmetryPad.Y + UI.OPTION_MARGIN/2,
			...element,
		})
	}

	static drawX(atom, ctx) {
		const {x, y} = atom.getPosition()
		const W = (atom.size)
		const H = (UI.BORDER_THICKNESS*1.0)
		const X = (x)
		const Y = (y + atom.size/2 - UI.BORDER_THICKNESS*1.0/2)
		ctx.fillStyle = atom.borderColour
		ctx.fillRect(X, Y, W, H)
	}
}
