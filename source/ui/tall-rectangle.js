//==================//
// TALL RECTANGLE   //
//==================//
class TallRectangle extends Atom {
	behindChildren = true
	highlighter = true
	rightDraggable = true
	hasBorder = true
	isTallRectangle = true
	expanded = false

	constructor({size, width, height} = {}) {
		super()
		this.size = size
		this.width = width
		this.height = height
		this.construct()
	}

	draw(ctx) { drawDiamond(this, ctx) }
	offscreen() { return rectangleOffscreen(this) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }

	rightDrag() {
		const ds = UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2
		const clone = new TallRectangle({size: ds, width: ds, height: ds})
		UI.atomRegistry.register(clone)
		const {x, y} = this.getPosition()
		UI.hand.offset.x -= this.x - x
		UI.hand.offset.y -= this.y - y
		clone.variable = this.variable
		if (this.expanded) {
			clone.expand()
		}
		clone.updateAppearance()
		return clone
	}

	drag() {
		if (this.parent.isSquare) {
			const square = this.parent
			square[this.channelSlot] = undefined
			const channelId = UI.CHANNEL_IDS[this.channelSlot]
			square.receiveNumber(undefined, channelId)
			UI.freeChild(square, this)
			this.updateAppearance()
			this.attached = false
		} else if (this.parent.isTallRectangle) {
			const diamond = this.parent
			UI.freeChild(diamond, this)
			diamond.operationAtoms[this.highlightedSlot] = undefined
			const operationName = this.highlightedSlot === "padTop"? "add" : "subtract"
			diamond.value[operationName] = undefined
			if (this.expanded) {
				this.unexpand()
				this.expand()
			}
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
		return this
	}

	hover() {

		const {x, y} = this.getPosition()
		const left = x
		const top = y
		const right = x + this.width
		const bottom = y + this.height

		let winningDistance = Infinity
		let winningSquare = undefined
		let winningSlot = undefined

		const atoms = UI.getAllBaseAtoms()
		for (const other of atoms) {
			if (other === this) continue

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
					return slot

				}
				continue
			}

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

				this.highlight = UI.createChild(this, new Highlight(), {bottom: true})
				this.highlight.hasBorder = true
				this.highlight.x = ax + winningSquare.size + UI.OPTION_MARGIN + slotId*(UI.OPTION_MARGIN+winningSquare.size)
				this.highlight.y = ay
				this.highlight.width = UI.OPTION_MARGIN*2+winningSquare.size
				this.highlightedAtom = winningSquare
				this.highlightedSlot = winningSlot
			}

			return
		}
	}

	place(highlightedAtom) {

		this.attached = true
		this.dx = 0
		this.dy = 0

		if (!highlightedAtom.isSquare) {
			const diamond = highlightedAtom.parent

			const operationName = this.highlightedSlot === "padTop"? "add" : "subtract"
			diamond.value[operationName] = this.value
			diamond.operationAtoms[this.highlightedSlot] = this
			this.x = 0
			this.y = highlightedAtom.y + highlightedAtom.height/2 - this.height/2
			UI.giveChild(diamond, this)

			if (this.expanded) {
				this.unexpand()
				this.expand()
			}

			return
		}

		const square = this.highlightedAtom
		const slotId = UI.CHANNEL_IDS[this.highlightedSlot]
		square.receiveNumber(this.value, slotId, {expanded: this.expanded, numberAtom: this})
		UI.atomRegistry.delete(this)
	}

	click() {
		if (!this.expanded) {
			this.expand()
		} else {
			this.unexpand()
		}
	}

	construct() {
		this.variable = CHANNEL_VARIABLES[Random.Uint8 % 3]
		this.value = new DragonNumber({variable: this.variable})
		this.updateAppearance()
		if (!this.isTool) {
			this.width += UI.BORDER_THICKNESS/2
			this.height += UI.BORDER_THICKNESS/2
			this.size += UI.BORDER_THICKNESS/2
		}
		this.operationAtoms = {padTop: undefined, padBottom: undefined}
	}

	makeOperationAtoms() {
		if (this.value.add !== undefined) {

			if (this.operationAtoms.padtop === undefined) {
				if (this.value.add.variable === undefined) {
					const channelLayout = {width: UI.SQUARE_SIZE, y: (UI.SQUARE_SIZE - UI.CHANNEL_HEIGHT)/2, height: UI.CHANNEL_HEIGHT}
					const operationAtom = UI.createChild(this, new PickerChannel(channelLayout))
					operationAtom.value = this.value.add
					this.operationAtoms.padTop = operationAtom
					operationAtom.x = this.padTop.x + UI.OPTION_MARGIN
					operationAtom.y = this.padTop.y + this.padTop.height/2 - operationAtom.height/2
					operationAtom.highlightedSlot = "padTop"
				} else {
					const ds3 = UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2
					const operationAtom = UI.createChild(this, new TallRectangle({size: ds3, width: ds3, height: ds3}))
					operationAtom.value = this.value.add
					operationAtom.variable = this.value.add.variable
					operationAtom.makeOperationAtoms()
					operationAtom.highlightedSlot = "padTop"
					operationAtom.x = 0
					operationAtom.y = this.padTop.y + this.padTop.height/2 - operationAtom.height/2
					operationAtom.updateAppearance()
					this.operationAtoms.padTop = operationAtom
				}
			}
		}

		if (this.value.subtract !== undefined) {

			if (this.operationAtoms.padBottom === undefined) {
				if (this.value.subtract.variable === undefined) {
					const channelLayout2 = {width: UI.SQUARE_SIZE, y: (UI.SQUARE_SIZE - UI.CHANNEL_HEIGHT)/2, height: UI.CHANNEL_HEIGHT}
					const operationAtom = UI.createChild(this, new PickerChannel(channelLayout2))
					operationAtom.value = this.value.subtract
					this.operationAtoms.padBottom = operationAtom
					operationAtom.x = this.padBottom.x + UI.OPTION_MARGIN
					operationAtom.y = this.padBottom.y + this.padBottom.height/2 - operationAtom.height/2
					operationAtom.highlightedSlot = "padBottom"
				} else {

				}
			}
		}
	}

	updateAppearance() {
		if (this.variable === "red") {
			this.colour = Colour.Red
		} else if (this.variable === "green") {
			this.colour = Colour.Green
		} else if (this.variable === "blue") {
			this.colour = Colour.Blue
		}

		this.borderColour = UI.borderColours[this.colour.splash]
	}

	expand() {
		this.expanded = true

		if (this.value.add === undefined) {
			if (this.y < 0 || !(this.parent.isTallRectangle && this.parent.operationAtoms.padBottom === this)) {
				const handleH = SymmetryHandle.HEIGHT
				const padW = UI.SQUARE_SIZE + UI.OPTION_MARGIN*2
				this.handleTop = UI.createChild(this, new SymmetryHandle({
					width: handleH,
					height: handleH * 2,
					y: this.height/2 - handleH * 2,
					x: this.width/2 - handleH/2,
					behindParent: true,
				}))

				this.padTop = UI.createChild(this, new SymmetryPad({
					height: PickerPad.HEIGHT,
					width: padW,
					x: this.width/2 - padW/2,
					y: -PickerPad.HEIGHT - UI.OPTION_MARGIN,
				}))
			}
		}

		if (this.value.subtract === undefined) {
			if (this.y > 0 || !(this.parent.isTallRectangle && this.parent.operationAtoms.padTop === this)) {
				const handleH2 = SymmetryHandle.HEIGHT
				const padW2 = UI.SQUARE_SIZE + UI.OPTION_MARGIN*2
				this.handleBottom = UI.createChild(this, new SymmetryHandle({
					width: handleH2,
					height: handleH2 * 2,
					y: this.height/2,
					x: this.width/2 - handleH2/2,
					behindParent: true,
				}))

				this.padBottom = UI.createChild(this, new SymmetryPad({
					height: PickerPad.HEIGHT,
					width: padW2,
					x: this.width/2 - padW2/2,
					y: this.height + UI.OPTION_MARGIN,
				}))
			}
		}

		const handleW = SymmetryHandle.WIDTH * 2.5
		this.handleRight = UI.createChild(this, new SymmetryHandle({
			width: handleW,
			height: SymmetryHandle.HEIGHT,
			y: this.height/2 - SymmetryHandle.HEIGHT/2,
			x: this.width/2,
			behindParent: true,
		}))

		const padRightW = UI.OPTION_MARGIN + (this.width+UI.OPTION_MARGIN/1.5)*3
		this.padRight = UI.createChild(this, new SymmetryPad({
			height: PickerPad.HEIGHT,
			width: padRightW,
			y: this.height/2 - PickerPad.HEIGHT/2,
			x: this.width/2 + (UI.SQUARE_SIZE + UI.OPTION_MARGIN*2)/2 + UI.OPTION_MARGIN,
		}))



		const choiceSize = UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2
		const choiceLayout = {size: choiceSize, width: choiceSize, height: choiceSize}
		const pinSize = choiceSize / 2
		const pinLayout = {size: pinSize, width: pinSize, height: pinSize}

		this.red = UI.createChild(this, new DiamondChoice(choiceLayout))
		this.red.x = this.padRight.x + UI.OPTION_MARGIN/Math.SQRT2
		this.red.borderColour = Colour.Red
		this.red.colour = Colour.Black
		this.red.value = "red"

		this.green = UI.createChild(this, new DiamondChoice(choiceLayout))
		this.green.x = this.padRight.x + UI.OPTION_MARGIN/Math.SQRT2 + (choiceSize+UI.OPTION_MARGIN)*1
		this.green.borderColour = Colour.Green
		this.green.colour = Colour.Black
		this.green.value = "green"

		this.blue = UI.createChild(this, new DiamondChoice(choiceLayout))
		this.blue.x = this.padRight.x + UI.OPTION_MARGIN/Math.SQRT2 + (choiceSize+UI.OPTION_MARGIN)*2
		this.blue.borderColour = Colour.Blue
		this.blue.colour = Colour.Black
		this.blue.value = "blue"

		this.winnerPin = UI.createChild(this, new DiamondPin(pinLayout))
		this.winnerPin.x = this[this.variable].x + pinSize/2
		this.winnerPin.y = pinSize/2
		this.winnerPin.colour = this[this.variable].borderColour
		this.winnerPin.borderColour = this.winnerPin.colour

		for (const operation of ["padTop", "padBottom"]) {
			const operationAtom = this.operationAtoms[operation]
			if (operationAtom === undefined) continue
			UI.atomRegistry.register(operationAtom)
			UI.giveChild(this, operationAtom)
		}

		for (const child of this.children) {
			if (!child.isTallRectangle) continue
			if (child.expanded) {
				child.unexpand()
				child.expand()
			}
		}
	}

	unexpand() {
		this.expanded = false

		UI.deleteChild(this, this.red)
		UI.deleteChild(this, this.green)
		UI.deleteChild(this, this.blue)

		UI.deleteChild(this, this.padRight)
		UI.deleteChild(this, this.handleRight)
		UI.deleteChild(this, this.winnerPin)

		if (this.value.add === undefined) {
			UI.deleteChild(this, this.padTop, {quiet: true})
			UI.deleteChild(this, this.handleTop, {quiet: true})
		}

		if (this.value.subtract === undefined) {
			UI.deleteChild(this, this.padBottom, {quiet: true})
			UI.deleteChild(this, this.handleBottom, {quiet: true})
		}
	}

}

function drawDiamond(atom, ctx) {
	const {x, y} = atom.getPosition()

	let size = atom.size

	const height = size
	const width = size

	const left = (x)
	let right = left + (width)
	let top = (y)
	let bottom = top + (height)
	const middleY = top + (height/2)
	const middleX = left + (width/2)

	ctx.fillStyle = atom.colour
	const path = new Path2D()

	path.moveTo(...[middleX, top].map(n => (n)))
	path.lineTo(...[right, middleY].map(n => (n)))
	path.lineTo(...[middleX, bottom].map(n => (n)))
	path.lineTo(...[left, middleY].map(n => (n)))

	path.closePath()
	ctx.fillStyle = atom.colour
	ctx.fill(path)
	if (atom.hasBorder) {
		ctx.lineWidth = UI.BORDER_THICKNESS
		ctx.strokeStyle = atom.borderColour

		if (atom.isTool) {
			ctx.lineWidth = UI.BORDER_THICKNESS*1.5
			ctx.strokeStyle = UI.toolBorderColours[atom.colour.splash]
		}
		ctx.stroke(path)
	}
}
