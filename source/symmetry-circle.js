//==================//
// SYMMETRY CIRCLE  //
//==================//
class SymmetryCircle extends Atom {
	hasBorder = true
	expanded = false
	borderColour = Colour.Grey
	colour = Colour.Black
	value = 0
	size = UI.SQUARE_SIZE
	rightDraggable = true

	draw(ctx) {
		drawCircle(this, ctx)
		if (this.value === undefined) return
		const [x, y, r] = getRGB(this.value)
		if (x > 0) SymmetryToggleX.drawX(this, ctx)
		if (y > 0) SymmetryToggleY.drawY(this, ctx)
		if (r > 0) SymmetryToggleR.drawR(this, ctx)
	}

	offscreen() { return rectangleOffscreen(this) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }

	click() {
		if (this.expanded) {
			this.unexpand()
		} else {
			this.expand()
		}
	}

	expand() {
		const layout = symmetryLayout()
		this.pad = UI.createChild(this, new SymmetryPad(layout.pad))
		this.handle = UI.createChild(this, new SymmetryHandle(layout.handle))
		this.expanded = true

		const [x, y, r] = getRGB(this.value)
		this.xToggle = UI.createChild(this, new SymmetryToggleX(layout.toggleX))
		this.yToggle = UI.createChild(this, new SymmetryToggleY(layout.toggleY))
		this.rToggle = UI.createChild(this, new SymmetryToggleR(layout.toggleR))

		if (x > 0) this.xToggle.value = true
		if (y > 0) this.yToggle.value = true
		if (r > 0) this.rToggle.value = true
	}

	unexpand() {
		UI.deleteChild(this, this.pad)
		UI.deleteChild(this, this.handle)
		UI.deleteChild(this, this.xToggle)
		UI.deleteChild(this, this.yToggle)
		UI.deleteChild(this, this.rToggle)
		this.expanded = false
	}

	update() {
		const {x, y} = this.getPosition()

		const id = UI.atomRegistry.atoms.indexOf(this)
		const left = x
		const top = y
		const right = x + this.width
		const bottom = y + this.height

		if (UI.hand.content === this) for (const paddle of UI.paddles) {
			const pid = UI.atomRegistry.atoms.indexOf(paddle)
			const {x: px, y: py} = paddle.getPosition()
			const pright = px + paddle.width
			const ptop = py
			const pbottom = py + paddle.height

			if (!paddle.hasSymmetry && paddle.expanded && id > pid && left <= pright && right >= pright && ((top < pbottom && top > ptop) || (bottom > ptop && bottom < pbottom))) {
				if (this.highlightPaddle !== undefined) {
					UI.deleteChild(this, this.highlightPaddle)
				}

				this.highlightPaddle = UI.createChild(this, new Highlight(), {bottom: true})
				this.highlightPaddle.width = UI.BORDER_THICKNESS
				this.highlightPaddle.height = paddle.height
				this.highlightPaddle.y = ptop
				this.highlightPaddle.x = pright - UI.BORDER_THICKNESS/2
				this.highlightedPaddle = paddle
				return
			}
		}

		if (this.highlightPaddle !== undefined) {
			UI.deleteChild(this, this.highlightPaddle)
			this.highlightPaddle = undefined
			this.highlightedPaddle = undefined
		}
	}

	drop() {
		if (!this.attached) {
			if (this.highlightedPaddle !== undefined) {
				const paddle = this.highlightedPaddle
				this.attached = true
				UI.giveChild(paddle, this)

				paddle.hasSymmetry = true
				paddle.symmetryCircle = this
				UI.emit("paddleSizeChanged",paddle)

				this.dx = 0
				this.dy = 0
			}
		}
	}

	drag() {
		if (this.attached) {
			const paddle = this.parent

			this.attached = false
			UI.freeChild(paddle, this)
			paddle.hasSymmetry = false
			paddle.symmetryCircle = undefined
			UI.emit("paddleSizeChanged",paddle)
		}

		return this
	}

	rightDrag() {
		const clone = new SymmetryCircle()
		clone.value = this.value
		const {x, y} = this.getPosition()
		UI.hand.offset.x -= this.x - x
		UI.hand.offset.y -= this.y - y
		clone.x = x
		clone.y = y
		UI.atomRegistry.register(clone)
		return clone
	}

	static get SIZE() { return UI.SQUARE_SIZE }
}
