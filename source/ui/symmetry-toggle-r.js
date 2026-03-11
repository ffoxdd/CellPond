//====================//
// SYMMETRY TOGGLE R  //
//====================//
class SymmetryToggleR extends Atom {
	hasBorder = true
	borderColour = Colour.Black
	colour = Colour.Grey
	expanded = false
	value = false
	size = UI.SQUARE_SIZE - UI.OPTION_MARGIN
	x = SymmetryPad.X + SymmetryPad.WIDTH/2 - (UI.SQUARE_SIZE - UI.OPTION_MARGIN)/2
	y = SymmetryPad.Y + SymmetryPad.HEIGHT - (UI.SQUARE_SIZE - UI.OPTION_MARGIN) - UI.OPTION_MARGIN/2

	draw(ctx) {
		this.colour = this.value ? Colour.Silver : Colour.Grey
		drawCircle(this, ctx)
		SymmetryToggleR.drawR(this, ctx)
	}

	offscreen() { return rectangleOffscreen(this) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	grab() { return this.parent }

	click() {
		this.value = !this.value
		let [x, y, r] = getRGB(this.parent.value)
		r = this.value ? 1 : 0
		this.parent.value = x+y+r
		const circle = this.parent
		if (circle.parent !== UI.atomRegistry.baseParent) {
			const paddle = circle.parent
			UI.emit("paddleRuleChanged",paddle)
		}
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
