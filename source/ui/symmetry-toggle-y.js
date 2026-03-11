//====================//
// SYMMETRY TOGGLE Y  //
//====================//
class SymmetryToggleY extends Atom {
	constructor(element = {}) {
		super({
			hasBorder: true,
			borderColour: Colour.Black,
			colour: Colour.Grey,
			draw: (atom, ctx) => {
				atom.colour = atom.value? Colour.Silver : Colour.Grey
				Circle.drawFn(atom, ctx)
				atom.drawY(atom, ctx)
			},
			drawY: SymmetryToggleY.drawY,
			offscreen: Rectangle.offscreenFn,
			overlaps: Rectangle.overlapsFn,
			expanded: false,
			click: (atom) => {
				atom.value = !atom.value
				let [x, y, r] = getRGB(atom.parent.value)
				y = atom.value? 10 : 0
				atom.parent.value = x+y+r
				const circle = atom.parent
				if (circle.parent !== UI.atomRegistry.baseParent) {
					const paddle = circle.parent
					UI.emit("paddleRuleChanged",paddle)
				}
			},
			value: false,
			size: UI.SQUARE_SIZE - UI.OPTION_MARGIN,
			grab: (atom) => atom.parent,
			x: SymmetryPad.X + SymmetryPad.WIDTH/2 - (UI.SQUARE_SIZE - UI.OPTION_MARGIN)/2,
			y: UI.OPTION_MARGIN/2,
			...element,
		})
	}

	static drawY(atom, ctx, height = atom.size, offset = 0) {
		const {x, y} = atom.getPosition()
		const W = (UI.BORDER_THICKNESS*1.0)
		const H = (height)
		const X = (x + atom.size/2 - UI.BORDER_THICKNESS*1.0/2)
		const Y = (y) + offset
		ctx.fillStyle = atom.borderColour
		ctx.fillRect(X, Y, W, H)
	}
}
