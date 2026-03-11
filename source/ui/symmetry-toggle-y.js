//====================//
// SYMMETRY TOGGLE Y  //
//====================//
class SymmetryToggleY extends Atom {
	constructor(element = {}) {
		super({
			hasBorder: true,
			borderColour: Colour.Black,
			colour: Colour.Grey,
			expanded: false,
			value: false,
			size: UI.SQUARE_SIZE - UI.OPTION_MARGIN,
			x: SymmetryPad.X + SymmetryPad.WIDTH/2 - (UI.SQUARE_SIZE - UI.OPTION_MARGIN)/2,
			y: UI.OPTION_MARGIN/2,
			...element,
		})
	}

	draw(atom, ctx) {
		this.colour = this.value ? Colour.Silver : Colour.Grey
		Circle.drawFn(this, ctx)
		SymmetryToggleY.drawY(this, ctx)
	}

	offscreen(atom) { return Rectangle.offscreenFn(this) }
	overlaps(atom, x, y) { return Rectangle.overlapsFn(this, x, y) }
	grab(atom) { return this.parent }

	click(atom) {
		this.value = !this.value
		let [x, y, r] = getRGB(this.parent.value)
		y = this.value ? 10 : 0
		this.parent.value = x+y+r
		const circle = this.parent
		if (circle.parent !== UI.atomRegistry.baseParent) {
			const paddle = circle.parent
			UI.emit("paddleRuleChanged",paddle)
		}
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
