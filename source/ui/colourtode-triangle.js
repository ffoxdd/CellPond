//======================//
// COLOURTODE TRIANGLE  //
//======================//
class ColourtodeTriangle extends Atom {
	behindOtherChildren = true
	expanded = false
	colour = Colour.splash(999)
	size = UI.SQUARE_SIZE
	width = TriangleRight.DEFAULT_WIDTH
	direction = "right"
	highlighter = true
	rightDraggable = true

	draw(ctx) {
		if (this.direction === "right") drawTriangleRight(this, ctx)
		else if (this.direction === "down") drawTriangleDown(this, ctx)
		else if (this.direction === "up") drawTriangleUp(this, ctx)
		else if (this.direction === "left") drawTriangleLeft(this, ctx)
		else drawTriangleRight(this, ctx)
	}

	overlaps(x, y) { return triangleOverlaps(this, x, y) }
	offscreen() { return triangleOffscreen(this) }

	click() {
		if (this.parent.isPaddle) {
			this.parent.pinhole.locked = !this.parent.pinhole.locked
			UI.emit("paddleRuleChanged",this.parent)
			return
		}

		if (this.expanded) {
			this.unexpand()
		}
		else {
			this.expand()
		}
	}

	expand() {
		const layout = triangleLayout()
		this.pad = UI.createChild(this, new TrianglePad(layout.pad))
		this.handle = UI.createChild(this, new TriangleHandle(layout.handle))
		this.expanded = true

		this.upPick = UI.createChild(this, new TrianglePickUp(layout.pickUp))
		this.downPick = UI.createChild(this, new TrianglePickDown(layout.pickDown))

		if (this.direction === "up") this.upPick.value = true
		if (this.direction === "down") this.downPick.value = true
	}

	unexpand() {
		UI.deleteChild(this, this.pad)
		UI.deleteChild(this, this.handle)
		UI.deleteChild(this, this.upPick)
		UI.deleteChild(this, this.downPick)
		this.expanded = false
	}

	hover() {
		this.highlightedSlot = undefined

		if (this.direction === "right") {
			const {x, y} = this.getPosition()
			const left = x
			const top = y
			const right = x + this.width
			const bottom = y + this.height

			for (const paddle of UI.paddles) {
				if (!paddle.expanded) continue
				if (paddle.pinhole.locked) continue
				if (paddle.rightTriangle !== undefined) continue

				const {x: px, y: py} = paddle.getPosition()
				const pleft = px
				const pright = px + paddle.width
				const ptop = py
				const pbottom = py + paddle.height

				if (left > pright) continue
				if (right < pleft) continue
				if (top > pbottom) continue
				if (bottom < ptop) continue

				return paddle
			}
		}

		if (true) {
			const {x, y} = this.getPosition()
			const left = x
			const top = y
			const right = x + this.width
			const bottom = y + this.height

			const others = UI.getAllBaseAtoms()
			for (const other of others) {
				if (!other.isSquare) continue

				const {x: px, y: py} = other.getPosition()
				const pleft = px
				const pright = px + other.width
				const ptop = py
				const pbottom = py + other.height

				if (left > pright) continue
				if (right < pleft) continue
				if (top > pbottom) continue
				if (bottom < ptop) continue

				return other
			}

			let winningDistance = Infinity
			let winningSquare = undefined
			let winningSlot = undefined

			const atoms = UI.getAllBaseAtoms()
			for (const other of atoms) {
				if (other === this) continue
				if (!other.isSquare) continue
				if (!other.expanded) continue

				const {x: px, y: py} = other.pickerPad.getPosition()
				const pleft = px
				const pright = px + other.pickerPad.width
				const ptop = py
				const pbottom = py + other.pickerPad.height

				if (left > pright) continue
				if (right < pleft) continue
				if (bottom < ptop) continue
				if (top > pbottom) continue

				const slots = ["red", "green", "blue"].filter(slot => other[slot] === undefined)
				if (slots.length === 0) continue
				const {x: ax, y: ay} = other.getPosition()

				for (const slot of slots) {
					const slotId = UI.CHANNEL_IDS[slot]
					const sx = ax + other.size + UI.OPTION_MARGIN*2 + slotId*(UI.SQUARE_SIZE + UI.OPTION_MARGIN)
					const sy = ay + UI.OPTION_MARGIN
					const distance = Math.hypot(x - sx, y - sy)
					if (distance < winningDistance) {
						winningDistance = distance
						winningSlot = slot
						winningSquare = other
					}
				}

				if (winningSquare !== undefined) {
					const {x: ax, y: ay} = winningSquare.getPosition()
					const slotId = UI.CHANNEL_IDS[winningSlot]

					if (this.highlight !== undefined) {
						UI.deleteChild(this, this.highlight)
						this.highlight = undefined
					}

					this.highlight = UI.createChild(this, new Highlight(), {bottom: true})
					this.highlight.hasBorder = true
					this.highlight.x = ax + winningSquare.size + UI.OPTION_MARGIN + slotId*(UI.OPTION_MARGIN+winningSquare.size)
					this.highlight.y = ay
					this.highlight.width = UI.OPTION_MARGIN*2+winningSquare.size
					this.highlightedAtom = winningSquare
					this.highlightedSlot = winningSlot
				}
			}

			return winningSquare
		}

		return undefined
	}

	updateValue() {
		if (this.direction === "up" || this.direction === "down") {
			this.variable = this.highlightedSlot
		} else if (this.direction === "left") {
			if (this.highlightedSlot === "red") this.variable = "blue"
			else if (this.highlightedSlot === "green") this.variable = "red"
			else if (this.highlightedSlot === "blue") this.variable = "green"
		} else if (this.direction === "right") {
			if (this.highlightedSlot === "red") this.variable = "green"
			else if (this.highlightedSlot === "green") this.variable = "blue"
			else if (this.highlightedSlot === "blue") this.variable = "red"
		}
		const add = this.direction === "up" ? DragonNumber.fromInt(1) : undefined
		const subtract = this.direction === "down" ? DragonNumber.fromInt(1) : undefined
		const value = new DragonNumber({channel: this.channelId, variable: this.variable, add, subtract})
		this.value = value
	}

	place(receiver) {
		if (receiver.isSquare && this.highlightedSlot !== undefined) {
			this.channelId = UI.CHANNEL_IDS[this.highlightedSlot]
			this.updateValue()

			const square = receiver
			square.receiveNumber(this.value, this.channelId, {expanded: this.expanded, numberAtom: this})
			UI.atomRegistry.delete(this)
			this.dx = 0
			this.dy = 0
			return
		}

		if (receiver.isSquare) {
			const square = receiver

			if (square.stamp === undefined) {
				square.stamp = "circle"
				square.value.stamp = "circle"
				square.needsColoursUpdate = true
			} else {
				square.stamp = undefined
				square.value.stamp = undefined
				square.needsColoursUpdate = true
			}

			const diagramCell = new DiagramCell({content: square.value})
			state.brush.colour = new Diagram({left: [diagramCell]})

			UI.emit("toolbarColourChanged")

			if (square.parent.isPaddle) {
				UI.emit("paddleRuleChanged",square.parent)
			}
			return
		}

		if (receiver.isPaddle) {
			const paddle = receiver
			UI.giveChild(paddle, this)
			paddle.rightTriangle = this
			this.x = Paddle.WIDTH/2 - this.width/2
			this.y = Paddle.HEIGHT/2 - this.height/2
			this.dx = 0
			this.dy = 0

			this.hasBorder = false
			paddle.pinhole.locked = this.colour === Colour.splash(999)

			for (const cellAtom of paddle.cellAtoms) {
				if (cellAtom.slotted !== undefined) {
					UI.atomRegistry.register(cellAtom.slotted)
					UI.giveChild(paddle, cellAtom.slotted)
				}
			}

			UI.emit("paddleSizeChanged",paddle)

			if (this.expanded) {
				this.unexpand()
			}

			this.attached = true

			UI.emit("menuToolUnlock","circle")
		}
	}

	rightDrag() {
		const clone = new ColourtodeTriangle()
		clone.direction = this.direction
		const {x, y} = this.getPosition()
		UI.hand.offset.x -= this.x - x
		UI.hand.offset.y -= this.y - y
		clone.x = x
		clone.y = y
		UI.atomRegistry.register(clone)
		return clone
	}

	drag() {
		if (this.parent.isSquare) {
			const square = this.parent
			this.attached = false
			square[this.highlightedSlot] = undefined
			UI.freeChild(square, this)
			square.receiveNumber(undefined, this.channelId)
			return this
		}

		if (!this.parent.isPaddle) return this
		const paddle = this.parent

		this.attached = false
		UI.freeChild(paddle, this)
		paddle.rightTriangle = undefined

		for (const cellAtom of paddle.cellAtoms) {
			if (cellAtom.slotted !== undefined) {
				const {x, y} = cellAtom.slotted.getPosition()
				UI.freeChild(paddle, cellAtom.slotted)
				cellAtom.slotted.cellAtom = undefined
				cellAtom.slotted.attached = false
				cellAtom.slotted.x = x
				cellAtom.slotted.y = y
				cellAtom.slotted.slottee = false
				cellAtom.slotted = undefined
			}
		}

		if (this.colour !== Colour.splash(999)) {
			this.hasBorder = true
			this.borderColour = Colour.Grey
		}

		paddle.pinhole.locked = false

		UI.emit("paddleSizeChanged",paddle)
		return this
	}
}
