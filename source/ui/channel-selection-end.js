//========================//
// CHANNEL SELECTION END  //
//========================//
class ChannelSelectionEnd extends Atom {
	constructor(element = {}) {
		super({
			height: UI.OPTION_SPACING - UI.CHANNEL_HEIGHT,
			width: UI.SQUARE_SIZE + UI.OPTION_MARGIN*2,
			x: -UI.OPTION_MARGIN,
			dragOnly: true,
			dragLockX: true,
			...element,
		})
	}

	draw(atom, ctx) {
		const {x, y} = this.getPosition()
		const X = Math.round(x)
		const Y = Math.round(y)
		const W = Math.round(this.width)
		const H = Math.round(this.height)
		ctx.fillStyle = Colour.Grey
		ctx.fillRect(X, Y, W, H)
	}

	overlaps(atom, x, y) { return Rectangle.overlapsFn(this, x, y) }
	offscreen(atom) { return Rectangle.offscreenFn(this) }

	grab(atom) { return this.parent.expanded ? this : this.parent }
	touch(atom) { return this.parent.expanded ? this : this.parent }
	cursor(atom) { return this.parent.expanded ? "ns-resize" : "pointer" }

	move(atom) {
		this.parent.positionSelectionBack(this.parent)
	}

	drop(atom) {
		let distanceFromMiddle = Math.round((this.y+UI.CHANNEL_HEIGHT/2) / UI.OPTION_SPACING)

		const oldNumber = this.parent.value

		let [startId, endId] = this.parent.getStartAndEndId(this.parent)
		let centerId = this.parent.getCenterId(this.parent)

		if (this.isTop) {
			endId = centerId - distanceFromMiddle
		}
		if (!this.isTop) {
			startId = centerId - (distanceFromMiddle-1)
		}

		const values = [false, false, false, false, false, false, false, false, false, false]
		for (let i = startId; i <= endId; i++) {
			values[i] = true
		}

		const number = new DragonNumber({channel: oldNumber.channel, values})
		this.parent.value = number
		this.parent.deleteOptions(this.parent)
		this.parent.createOptions(this.parent)

		this.dx = 0
		this.dy = 0

		if (this.parent.parent.isSquare) {
			const square = this.parent.parent
			const channel = UI.CHANNEL_IDS[this.parent.channelSlot]
			square.receiveNumber(square, number, channel)
		}

		if (this.parent.parent.isPaddle) {
			const paddle = this.parent.parent
			UI.emit("paddleSizeChanged",paddle)
		}
	}

	static get HEIGHT() { return UI.OPTION_SPACING - UI.CHANNEL_HEIGHT }
}
