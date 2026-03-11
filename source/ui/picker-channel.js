//==================//
// PICKER CHANNEL   //
//==================//
class PickerChannel extends Atom {
	hasBorder = true
	rightDraggable = true

	constructor({width, y, height} = {}) {
		super()
		this.width = width
		this.y = y
		this.height = height
		this.construct()
	}

	draw(ctx) { drawRectangle(this, ctx) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	offscreen() { return rectangleOffscreen(this) }
	grab() { return this }

	rightDrag() {
		const clone = new PickerChannel(channelLayout())
		UI.atomRegistry.register(clone)
		const {x, y} = this.getPosition()
		UI.hand.offset.x -= this.x - x
		UI.hand.offset.y -= this.y - y
		clone.value = this.value.clone()
		if (this.expanded) {
			clone.createOptions()
			clone.expanded = true
		}
		return clone
	}

	drag() {
		if (this.parent.isSquare) {
			const square = this.parent
			square[this.channelSlot] = undefined
			const channelId = UI.CHANNEL_IDS[this.channelSlot]
			square.receiveNumber(undefined, channelId)
			UI.freeChild(square, this)
			this.channelSlot = UI.CHANNEL_NAMES[this.value.channel]
			this.updateColours()
			this.attached = false

			this.needsColoursUpdate = true
			this.colourTicker = Infinity
		}

		else if (this.parent.isTallRectangle) {
			const diamond = this.parent
			UI.freeChild(diamond, this)
			diamond.operationAtoms[this.highlightedSlot] = undefined
			const operationName = this.highlightedSlot === "padTop"? "add" : "subtract"
			diamond.value[operationName] = undefined
			this.attached = false
			if (diamond.expanded) {
				diamond.unexpand()
				diamond.expand()
			} else {
				const handle = this.highlightedSlot === "padTop"? "handleTop" : "handleBottom"
				UI.deleteChild(diamond, diamond[handle], {quiet: true})
				UI.deleteChild(diamond, diamond[this.highlightedSlot], {quiet: true})
				diamond.expand()
				diamond.unexpand()
			}
		}

		else if (this.parent.isPaddle) {
			const paddle = this.parent
			paddle.chance = undefined
			UI.freeChild(paddle, this)
			UI.emit("paddleSizeChanged",paddle)
		}

		return this
	}

	construct() {
		const values = [false, false, false, false, false, false, false, false, false, true]
		const channel = Random.Uint8 % 3
		this.value = new DragonNumber({values, channel})
		this.needsColoursUpdate = true
		this.colourId = 0
		this.dcolourId = 1
		this.colourTicker = Infinity

		this.selectionBack = UI.createChild(this, new ChannelSelectionSide(selectionSideLayout()))

		const sel = selectionEndLayout()

		const selectionTop = UI.createChild(this, new ChannelSelectionEnd(sel))
		this.selectionTop = selectionTop
		this.selectionTop.isTop = true
		selectionTop.dragOnly = false

		const selectionBottom = UI.createChild(this, new ChannelSelectionEnd(selectionEndLayout()))
		this.selectionBottom = selectionBottom
		this.selectionBottom.isTop = false
		selectionBottom.dragOnly = false

		this.positionSelection()
	}

	positionSelection(start, end, top, bottom) {
		if (!this.expanded) {
			this.selectionTop.y = -this.selectionTop.height
			this.selectionBottom.y = this.height
		}
		else {
			const optionSpacing = OPTION_SPACING

			this.selectionTop.y = end - this.selectionTop.height
			this.selectionBottom.y = start + optionSpacing - this.selectionBottom.height

			this.selectionTop.minY = top - this.selectionTop.height
			this.selectionTop.maxY = this.selectionBottom.y - optionSpacing

			this.selectionBottom.minY = this.selectionTop.y + optionSpacing
			this.selectionBottom.maxY = bottom - this.selectionBottom.height + optionSpacing
		}

		this.positionSelectionBack()

		const selectionTopId = this.children.indexOf(this.selectionTop)
		this.children.splice(selectionTopId, 1)
		this.children.push(this.selectionTop)

		const selectionBottomId = this.children.indexOf(this.selectionBottom)
		this.children.splice(selectionBottomId, 1)
		this.children.push(this.selectionBottom)

		if (this.parent.isTallRectangle) {
			const operationName = this.highlightedSlot === "padTop"? "add" : "subtract"
			this.parent.value[operationName] = this.value
		}
	}

	positionSelectionBack() {
		this.selectionBack.x = -ChannelSelectionEnd.HEIGHT
		this.selectionBack.y = this.selectionTop.y
		this.selectionBack.height = this.selectionBottom.y - this.selectionTop.y + this.selectionTop.height
		this.selectionBack.width = this.width + ChannelSelectionEnd.HEIGHT*2
	}

	update() {
		if (this.expanded) {
			if (this.needsColoursUpdate) {
				this.needsColoursUpdate = false
				this.isGradient = true
				this.gradient = UI.getGradientImageFromColours({
					colours: this.colours,
					width: this.width * UI.CT_SCALE,
					height: this.height * UI.CT_SCALE,
					gradient: this.gradient
				})
				this.updateColours()
			}
		}

		if (!this.expanded && this.needsColoursUpdate) {
			this.needsColoursUpdate = false

			if (this.parent.isSquare) {
				const channels = []

				for (let i = 0; i < 3; i++) {
					if (i === this.value.channel) {
						channels[i] = this.value
					}
					else {
						const values = [true, false, false, false, false, false, false, false, false, false]
						channels[i] = new DragonNumber({values, channel: i})
					}
				}

				const array = new DragonArray({channels})
				this.colours = array.getSplashes()
			}
			else {
				let array = undefined

				for (let i = 0; i < 10; i++) {
					const v = this.value.values[i]
					if (v === false) continue
					const join = DragonArray.fromSplash(`${i}${i}${i}`)
					if (array === undefined) {
						array = join
					} else {
						array.joins.push(join)
					}
				}

				this.colours = array.getSplashes()
			}

			this.isGradient = true
			this.gradient = UI.getGradientImageFromColours({
				colours: this.colours,
				width: this.width * UI.CT_SCALE,
				height: this.height * UI.CT_SCALE,
				gradient: this.gradient
			})
		}

		this.highlightedAtom = undefined
		if (UI.hand.content === this && UI.hand.state === UI.HAND.DRAGGING) {

			const {x, y} = this.getPosition()
			let left = x
			let top = y
			let right = x + this.width
			let bottom = y + this.height

			if (this.highlight !== undefined) {
				UI.deleteChild(this, this.highlight)
				this.highlight = undefined
			}

			let winningDistance = Infinity
			let winningSquare = undefined
			let winningSlot = undefined

			const atoms = UI.getAllBaseAtoms()
			for (const square of atoms) {

				const other = square
				if (other.isTallRectangle) {
					if (!other.expanded) continue
					const slotNames = ["padTop", "padBottom"]
					for (const slotName of slotNames) {

						let endAtom = other

						while (endAtom.isTallRectangle && endAtom.operationAtoms[slotName] !== undefined) {
							endAtom = endAtom.operationAtoms[slotName]
						}

						if (!endAtom.isTallRectangle) continue
						if (!endAtom.expanded) continue

						const slot = endAtom[slotName]
						const {x: px, y: py} = slot.getPosition()
						const pleft = px
						const pright = px + slot.width
						const ptop = py
						const pbottom = py + slot.height

						if (left > pright) continue
						if (right < pleft) continue
						if (bottom < ptop) continue
						if (top > pbottom) continue

						this.highlightedSlot = slotName
						this.highlightedAtom = slot
						break

					}
				} else {

					if (!square.isSquare) continue
					if (!square.expanded) continue

					const {x: px, y: py} = square.pickerPad.getPosition()

					const pleft = px
					const pright = px + square.pickerPad.width
					const ptop = py
					const pbottom = py + square.pickerPad.height

					if (left > pright) continue
					if (right < pleft) continue
					if (bottom < ptop) continue
					if (top > pbottom) continue

					const slots = ["red", "green", "blue"].filter(slot => square[slot] === undefined)
					if (slots.length === 0) continue

					const {x: ax, y: ay} = square.getPosition()

					for (const slot of slots) {
						const slotId = UI.CHANNEL_IDS[slot]
						const sx = ax + square.size + UI.OPTION_MARGIN*2 + slotId*(UI.SQUARE_SIZE + UI.OPTION_MARGIN)
						const sy = ay + UI.OPTION_MARGIN
						const distance = Math.hypot(x - sx, y - sy)
						if (distance < winningDistance) {
							winningDistance = distance
							winningSlot = slot
							winningSquare = square
						}
					}
				}

			}

			if (winningSquare !== undefined) {

				const {x: ax, y: ay} = winningSquare.getPosition()
				const slotId = UI.CHANNEL_IDS[winningSlot]

				this.highlight = UI.createChild(this, new Highlight(), {bottom: true})
				this.highlight.hasBorder = true
				this.highlight.x = ax + winningSquare.size + UI.OPTION_MARGIN + slotId*(UI.OPTION_MARGIN+winningSquare.size)
				this.highlight.y = ay
				this.highlight.width = UI.OPTION_MARGIN*2+winningSquare.size
				this.highlightedAtom = winningSquare
				this.highlightedSlot = winningSlot
			} else if (this.highlightedAtom) {
				const {x: ax, y: ay} = this.highlightedAtom.getPosition()

				this.highlight = UI.createChild(this, new Highlight(), {bottom: true})
				this.highlight.hasBorder = true
				this.highlight.x = ax
				this.highlight.y = ay
				this.highlight.width = this.highlightedAtom.width
				this.highlight.height = this.highlightedAtom.height
			}

		}

		if (this.highlightedAtom === undefined && this.highlight !== undefined) {
			UI.deleteChild(this, this.highlight)
			this.highlight = undefined
		}
	}

	drop() {
		if (this.highlight !== undefined) {

			if (this.highlightedAtom.isSquare) {
				const square = this.highlightedAtom
				const slotId = UI.CHANNEL_IDS[this.highlightedSlot]
				this.value.channel = slotId

				square.receiveNumber(this.value, slotId, {expanded: this.expanded})
				UI.atomRegistry.delete(this)
			} else {
				const diamond = this.highlightedAtom.parent

				const operationName = this.highlightedSlot === "padTop"? "add" : "subtract"
				diamond.value[operationName] = this.value
				diamond.operationAtoms[this.highlightedSlot] = this
				this.x = this.highlightedAtom.x + UI.OPTION_MARGIN
				this.y = this.highlightedAtom.y + this.highlightedAtom.height/2 - this.height/2
				this.dx = 0
				this.dy = 0
				UI.giveChild(diamond, this)

				this.attached = true

			}
		} else if (this.highlightPaddle !== undefined) {
			const paddle = this.highlightedPaddle
			this.attached = true
			UI.giveChild(paddle, this)

			paddle.chance = this
			UI.emit("paddleSizeChanged",paddle)

			this.dx = 0
			this.dy = 0
		}

		UI.emit("menuToolUnlock","triangle")
	}

	click() {
		if (!this.expanded) {
			this.expanded = true
			this.colourId = 0
			this.colourTicker = Infinity
			this.needsColoursUpdate = true
			this.createOptions()
		}
		else {
			this.expanded = false
			this.deleteOptions()
			this.needsColoursUpdate = true
		}
	}

	deleteOptions() {
		if (this.options !== undefined) {
			this.deletedOptions = this.options
		}

		for (const option of this.options) {
			if (this !== option) UI.deleteChild(this, option)
		}
		this.needsColoursUpdate = true
		this.colourTicker = Infinity
		this.positionSelection()
	}

	updateColours() {
		let parentR = undefined
		let parentG = undefined
		let parentB = undefined

		if (this.parent.isSquare) {
			let redNumber = this.parent.value.channels[0]
			let greenNumber = this.parent.value.channels[1]
			let blueNumber = this.parent.value.channels[2]

			if (redNumber === undefined) redNumber = new DragonNumber({channel: 0, values: [true, false, false, false, false, false, false, false, false, false]})
			if (greenNumber === undefined) greenNumber = new DragonNumber({channel: 1, values: [true, false, false, false, false, false, false, false, false, false]})
			if (blueNumber === undefined) blueNumber = new DragonNumber({channel: 2, values: [true, false, false, false, false, false, false, false, false, false]})

			parentR = new DragonNumber({values: [...redNumber.values], channel: redNumber.channel})
			parentG = new DragonNumber({values: [...greenNumber.values], channel: greenNumber.channel})
			parentB = new DragonNumber({values: [...blueNumber.values], channel: blueNumber.channel})
		}
		else {
			const values = [false, false, false, false, false, false, false, false, false, false]
			parentR = new DragonNumber({values: [...values], channel: 0})
			parentG = new DragonNumber({values: [...values], channel: 1})
			parentB = new DragonNumber({values: [...values], channel: 2})
		}

		const parentChannels = [parentR, parentG, parentB]
		const mainParentChannel = parentChannels[UI.CHANNEL_IDS[this.channelSlot]]
		if (mainParentChannel !== undefined) mainParentChannel.values = [false, false, false, false, false, false, false, false, false, false]

		if (this.options !== undefined && this.options.length > 0) {
			for (let i = 0; i < 10; i++) {

				const option = this.options[i]

				if (this.parent.isSquare) {
					mainParentChannel.values[9-i] = true
					if (i > 0) mainParentChannel.values[9-i+1] = false
				} else {
					for (const c of parentChannels) {
						c.values[9-i] = true
						if (i > 0) c.values[9-i+1] = false
					}
				}

				const baseArray = new DragonArray({channels: parentChannels})

				const colours = baseArray.getSplashes()

				option.colours = colours
				option.colourTicker = Infinity
				if (option !== this) {
					option.needsColoursUpdateCountdown = i
					option.needsColoursUpdate = false
				}
			}
		}
	}

	getCenterId() {
		let startId = undefined
		let endId = undefined

		for (let i = 0; i < this.value.values.length; i++) {
			const value = this.value.values[i]
			if (value) {
				if (startId === undefined) startId = i
				endId = i
			}
		}
		return Math.round((endId + startId) / 2)
	}

	getStartAndEndId() {
		let startId = undefined
		let endId = undefined

		for (let i = 0; i < this.value.values.length; i++) {
			const value = this.value.values[i]
			if (value) {
				if (startId === undefined) startId = i
				endId = i
			}
		}
		return [startId, endId]
	}

	createOptions() {
		const oldOptions = this.parent.isSquare ? this.deletedOptions : undefined
		this.options = []

		let startId = undefined
		let endId = undefined

		for (let i = 0; i < this.value.values.length; i++) {
			const value = this.value.values[i]
			if (value) {
				if (startId === undefined) startId = i
				endId = i
			}
		}

		if (startId === undefined) throw new Error("[ColourTode] Number cannot be NOTHING. Please let @TodePond know if you see this error!")
		const centerOptionId = this.getCenterId()

		const optionSpacing = OPTION_SPACING
		let top = (centerOptionId - 9) * optionSpacing
		let bottom = centerOptionId*optionSpacing

		const start = top + (9-startId) * optionSpacing
		const end = top + (9-endId) * optionSpacing

		for (let i = 0; i < 10; i++) {
			if (centerOptionId === 9-i) {
				if (oldOptions !== undefined) {
				}
				this.options.push(this)
				continue
			}

			const pityTop = i !== 9 - endId + 1
			const pityBottom = i !== 9 - startId - 1
			const option = UI.createChild(this, new PickerChannelOption({
				...channelOptionLayout(),
				pityTop,
				pityBottom,
			}))

			if (oldOptions !== undefined) {
				option.isGradient = oldOptions[i].isGradient
				option.gradient = oldOptions[i].gradient
			}

			option.y = top + i * optionSpacing
			option.value = 9 - i
			option.needsColoursUpdateCountdown = i
			option.needsColoursUpdate = true
			this.options.push(option)
		}

		this.positionSelection(start, end, top, bottom)

		this.updateColours()
	}
}
