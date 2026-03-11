//====================//
// SYMMETRY TOGGLE X  //
//====================//
class SymmetryToggleX extends Atom {
	hasBorder = true
	borderColour = Colour.Black
	colour = Colour.Grey
	expanded = false
	value = false

	constructor({x, y, size} = {}) {
		super()
		this.x = x
		this.y = y
		this.size = size
	}

	draw(ctx) {
		this.colour = this.value ? Colour.Silver : Colour.Grey
		drawCircle(this, ctx)
		SymmetryToggleX.drawX(this, ctx)
	}

	offscreen() { return rectangleOffscreen(this) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	grab() { return this.parent }

	click() {
		this.value = !this.value
		let [x, y, r] = getRGB(this.parent.value)
		x = this.value ? 100 : 0
		this.parent.value = x+y+r
		const circle = this.parent
		if (circle.parent !== UI.atomRegistry.baseParent) {
			const paddle = circle.parent
			UI.emit("paddleRuleChanged",paddle)
		}
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
