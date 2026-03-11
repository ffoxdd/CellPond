//=========================//
// PICKER CHANNEL OPTION   //
//=========================//
class PickerChannelOption extends Atom {
	height = UI.CHANNEL_HEIGHT
	width = UI.SQUARE_SIZE
	hasBorder = true
	colourTicker = Infinity
	colours = [999]
	colourId = 0
	dcolourId = 1

	constructor(element = {}) {
		super()
		Object.assign(this, element)
		this.construct(this)
	}

	draw(atom, ctx) { Rectangle.drawFn(this, ctx) }
	overlaps(atom, x, y) { return Rectangle.overlapsFn(this, x, y) }
	offscreen(atom) { return Rectangle.offscreenFn(this) }
	grab(atom) { return this.parent }

	update(atom) {
		if (this.needsColoursUpdateCountdown >= 0) {
			this.needsColoursUpdateCountdown--
			if (this.needsColoursUpdateCountdown < 0) {
				this.needsColoursUpdate = true
			}
		}

		if (this.needsColoursUpdate) {
			this.updateColours(this)
			this.needsColoursUpdateCountdown = -1
			this.needsColoursUpdate = false
		}
	}

	getId(atom) {
		const parent = this.parent
		const centerId = parent.getCenterId(parent)
		const offset = this.y / UI.OPTION_SPACING
		return centerId - offset
	}

	updateColours(atom) {
		this.isGradient = true
		this.gradient = UI.getGradientImageFromColours({
			colours: this.colours,
			width: this.width * UI.CT_SCALE,
			height: this.height * UI.CT_SCALE,
			gradient: this.gradient
		})
	}

	touch(atom) {
		const id = this.getId(this)
		if (this.parent.value.values[id]) return this.parent
		return this
	}

	click(atom) {
		const values = [false, false, false, false, false, false, false, false, false, false]
		values[this.value] = true
		const number = new DragonNumber({values, channel: this.parent.value.channel})
		const parent = this.parent
		parent.value = number
		parent.deleteOptions(parent)
		parent.createOptions(parent)
		parent.needsColoursUpdate = true

		if (parent.parent.isSquare) {
			const square = parent.parent
			const channel = UI.CHANNEL_IDS[parent.channelSlot]
			square.receiveNumber(square, number, channel)
		}

		if (parent.parent.isPaddle) {
			const paddle = parent.parent
			UI.emit("paddleSizeChanged",paddle)
		}
	}

	construct(atom) {
		if (this.pityTop) {
			const topPity = UI.createChild(this, new OptionPadding())
			topPity.y = -topPity.height
		}

		if (this.pityBottom) {
			const bottomPity = UI.createChild(this, new OptionPadding())
			bottomPity.y = this.height
		}
	}
}
