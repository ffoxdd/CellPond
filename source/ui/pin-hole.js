//==========//
// PIN HOLE //
//==========//
class PinHole extends Atom {
	isPinhole = true
	attached = true
	locked = false
	borderScale = 1/2
	borderColour = Colour.Black
	colour = Colour.Black
	size = UI.PADDLE_HANDLE_SIZE - UI.OPTION_MARGIN/2
	y = UI.OPTION_MARGIN/2/2
	x = UI.OPTION_MARGIN/2/2

	draw(ctx) {
		return
		if (this.locked) {
			this.hasBorder = true
			this.colour = Colour.Grey
		}
		else {
			this.hasBorder = false
			this.colour = Colour.Black
		}
		drawCircle(this, ctx)
	}

	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	offscreen() { return rectangleOffscreen(this) }
	grab() { return this.parent.parent }

	click() {
		return
		const handle = this.parent
		const paddle = handle.parent
		if (this.locked) {
			this.locked = false
			paddle.grabbable = true
			handle.draggable = true
			paddle.draggable = true
			this.draggable = true
			UI.emit("paddleRuleChanged",paddle)
		}

		else {
			this.locked = true
			handle.draggable = false
			this.draggable = false

			for (const cellAtom of paddle.cellAtoms) {
				if (cellAtom.expanded) {
					cellAtom.unexpand()
				}
				if (cellAtom.slotted !== undefined) {
					const slotted = cellAtom.slotted
					if (slotted.expanded) {
						slotted.unexpand()
					}
				}
				if (cellAtom.joins.length > 0 && cellAtom.joinExpanded) {
					cellAtom.joinUnepxand()
				}
			}

			if (paddle.cellAtoms.length === 0) {
				paddle.grabbable = false
				paddle.draggable = false
			}
			UI.emit("paddleRuleChanged",paddle)
		}
	}
}
