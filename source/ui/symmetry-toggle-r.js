//====================//
// SYMMETRY TOGGLE R  //
//====================//
class SymmetryToggleR extends Atom {
	constructor(element = {}) {
		super({
			hasBorder: true,
			borderColour: Colour.Black,
			colour: Colour.Grey,
			draw: (atom, ctx) => {
				atom.colour = atom.value? Colour.Silver : Colour.Grey
				Circle.drawFn(atom, ctx)
				atom.drawR(atom, ctx)
			},
			drawR: SymmetryToggleR.drawR,
			offscreen: Rectangle.offscreenFn,
			overlaps: Rectangle.overlapsFn,
			expanded: false,
			click: (atom) => {
				atom.value = !atom.value
				let [x, y, r] = getRGB(atom.parent.value)
				r = atom.value? 1 : 0
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
			y: SymmetryPad.Y + SymmetryPad.HEIGHT - (UI.SQUARE_SIZE - UI.OPTION_MARGIN) - UI.OPTION_MARGIN/2,
			...element,
		})
	}

	static drawR(atom, ctx) {
		const {x, y} = atom.getPosition()
		let X = (x + atom.size/2)
		let Y = (y + atom.size/2)
		let R = atom.size/2 - (UI.BORDER_THICKNESS*1.5)*2

		ctx.fillStyle = atom.borderColour
		ctx.beginPath()
		ctx.arc(X, Y, R, 0, 2*Math.PI)
		ctx.fill()

		R -= UI.BORDER_THICKNESS
		ctx.fillStyle = atom.colour
		ctx.beginPath()
		ctx.arc(X, Y, R, 0, 2*Math.PI)
		ctx.fill()
	}
}
