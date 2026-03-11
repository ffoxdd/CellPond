//==================//
// TALL RECTANGLE   //
//==================//
class TallRectangle extends Atom {
	behindChildren = true
	highlighter = true
	rightDraggable = true
	hasBorder = true
	isTallRectangle = true
	size = UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2
	height = UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2
	width = UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2
	expanded = false

	constructor() {
		super()
		this.construct(this)
	}

	draw(atom, ctx) { TallRectangle.drawFn(this, ctx) }
	offscreen(atom) { return Rectangle.offscreenFn(this) }
	overlaps(atom, x, y) { return Rectangle.overlapsFn(this, x, y) }

	rightDrag(atom) {
		const clone = new TallRectangle()
		UI.atomRegistry.register(clone)
		const {x, y} = this.getPosition()
		UI.hand.offset.x -= this.x - x
		UI.hand.offset.y -= this.y - y
		clone.variable = this.variable
		if (this.expanded) {
			clone.expand(clone)
		}
		clone.updateAppearance(clone)
		return clone
	}

	drag(atom) {
		if (this.parent.isSquare) {
			const square = this.parent
			square[this.channelSlot] = undefined
			const channelId = UI.CHANNEL_IDS[this.channelSlot]
			square.receiveNumber(square, undefined, channelId)
			UI.freeChild(square, this)
			this.updateAppearance(this)
			this.attached = false
		} else if (this.parent.isTallRectangle) {
			const diamond = this.parent
			UI.freeChild(diamond, this)
			diamond.operationAtoms[this.highlightedSlot] = undefined
			const operationName = this.highlightedSlot === "padTop"? "add" : "subtract"
			diamond.value[operationName] = undefined
			if (this.expanded) {
				this.unexpand(this)
				this.expand(this)
			}
			this.attached = false
			if (diamond.expanded) {
				diamond.unexpand(diamond)
				diamond.expand(diamond)
			} else {
				const handle = this.highlightedSlot === "padTop"? "handleTop" : "handleBottom"
				UI.deleteChild(diamond, diamond[handle], {quiet: true})
				UI.deleteChild(diamond, diamond[this.highlightedSlot], {quiet: true})
				diamond.expand(diamond)
				diamond.unexpand(diamond)
			}
		}
		return this
	}

	hover(atom) {

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

	place(atom, highlightedAtom) {

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
				this.unexpand(this)
				this.expand(this)
			}

			return
		}

		const square = this.highlightedAtom
		const slotId = UI.CHANNEL_IDS[this.highlightedSlot]
		square.receiveNumber(square, this.value, slotId, {expanded: this.expanded, numberAtom: this})
		UI.atomRegistry.delete(this)
	}

	click(atom) {
		if (!this.expanded) {
			this.expand(this)
		} else {
			this.unexpand(this)
		}
	}

	construct(atom) {
		this.variable = CHANNEL_VARIABLES[Random.Uint8 % 3]
		this.value = new DragonNumber({variable: this.variable})
		this.updateAppearance(this)
		if (!this.isTool) {
			this.width += UI.BORDER_THICKNESS/2
			this.height += UI.BORDER_THICKNESS/2
			this.size += UI.BORDER_THICKNESS/2
		}
		this.operationAtoms = {padTop: undefined, padBottom: undefined}
	}

	makeOperationAtoms(atom) {
		if (this.value.add !== undefined) {

			if (this.operationAtoms.padtop === undefined) {
				if (this.value.add.variable === undefined) {
					const operationAtom = UI.createChild(this, new PickerChannel())
					operationAtom.value = this.value.add
					this.operationAtoms.padTop = operationAtom
					operationAtom.x = this.padTop.x + UI.OPTION_MARGIN
					operationAtom.y = this.padTop.y + this.padTop.height/2 - operationAtom.height/2
					operationAtom.highlightedSlot = "padTop"
				} else {
					const operationAtom = UI.createChild(this, new TallRectangle())
					operationAtom.value = this.value.add
					operationAtom.variable = this.value.add.variable
					operationAtom.makeOperationAtoms(operationAtom)
					operationAtom.highlightedSlot = "padTop"
					operationAtom.x = 0
					operationAtom.y = this.padTop.y + this.padTop.height/2 - operationAtom.height/2
					operationAtom.updateAppearance(operationAtom)
					this.operationAtoms.padTop = operationAtom
				}
			}
		}

		if (this.value.subtract !== undefined) {

			if (this.operationAtoms.padBottom === undefined) {
				if (this.value.subtract.variable === undefined) {
					const operationAtom = UI.createChild(this, new PickerChannel())
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

	updateAppearance(atom) {
		if (this.variable === "red") {
			this.colour = Colour.Red
		} else if (this.variable === "green") {
			this.colour = Colour.Green
		} else if (this.variable === "blue") {
			this.colour = Colour.Blue
		}

		this.borderColour = UI.borderColours[this.colour.splash]
	}

	expand(atom) {
		this.expanded = true

		if (this.value.add === undefined) {
			if (this.y < 0 || !(this.parent.isTallRectangle && this.parent.operationAtoms.padBottom === this)) {
				this.handleTop = UI.createChild(this, new SymmetryHandle())
				this.handleTop.width = this.handleTop.height
				this.handleTop.height *= 2
				this.handleTop.y = this.height/2 - this.handleTop.height
				this.handleTop.x = this.width/2 - this.handleTop.width/2
				this.handleTop.behindParent = true

				this.padTop = UI.createChild(this, new SymmetryPad())
				this.padTop.height = PickerPad.HEIGHT
				this.padTop.width = UI.SQUARE_SIZE + UI.OPTION_MARGIN*2
				this.padTop.x = this.width/2 - this.padTop.width/2
				this.padTop.y = -this.padTop.height - UI.OPTION_MARGIN
			}
		}

		if (this.value.subtract === undefined) {
			if (this.y > 0 || !(this.parent.isTallRectangle && this.parent.operationAtoms.padTop === this)) {
				this.handleBottom = UI.createChild(this, new SymmetryHandle())
				this.handleBottom.width = this.handleBottom.height
				this.handleBottom.height *= 2
				this.handleBottom.y = this.height/2
				this.handleBottom.x = this.width/2 - this.handleBottom.width/2
				this.handleBottom.behindParent = true

				this.padBottom = UI.createChild(this, new SymmetryPad())
				this.padBottom.height = PickerPad.HEIGHT
				this.padBottom.width = UI.SQUARE_SIZE + UI.OPTION_MARGIN*2
				this.padBottom.x = this.width/2 - this.padBottom.width/2
				this.padBottom.y = this.height + UI.OPTION_MARGIN
			}
		}

		this.handleRight = UI.createChild(this, new SymmetryHandle())
		this.handleRight.y = this.height/2 - this.handleRight.height/2
		this.handleRight.x = this.width/2
		this.handleRight.width *= 2.5
		this.handleRight.behindParent = true

		this.padRight = UI.createChild(this, new SymmetryPad())
		this.padRight.height = PickerPad.HEIGHT
		this.padRight.width = UI.OPTION_MARGIN + (this.width+UI.OPTION_MARGIN/1.5)*3
		this.padRight.y = this.height/2 - this.padRight.height/2
		this.padRight.x = this.width/2 + (UI.SQUARE_SIZE + UI.OPTION_MARGIN*2)/2 + UI.OPTION_MARGIN



		this.red = UI.createChild(this, new DiamondChoice())
		this.red.x = this.padRight.x + UI.OPTION_MARGIN/Math.SQRT2
		this.red.borderColour = Colour.Red
		this.red.colour = Colour.Black
		this.red.value = "red"

		this.green = UI.createChild(this, new DiamondChoice())
		this.green.x = this.padRight.x + UI.OPTION_MARGIN/Math.SQRT2 + (this.green.width+UI.OPTION_MARGIN)*1
		this.green.borderColour = Colour.Green
		this.green.colour = Colour.Black
		this.green.value = "green"

		this.blue = UI.createChild(this, new DiamondChoice())
		this.blue.x = this.padRight.x + UI.OPTION_MARGIN/Math.SQRT2 + (this.blue.width+UI.OPTION_MARGIN)*2
		this.blue.borderColour = Colour.Blue
		this.blue.colour = Colour.Black
		this.blue.value = "blue"

		this.winnerPin = UI.createChild(this, new DiamondPin())
		this.winnerPin.x = this[this.variable].x + this.winnerPin.width/2
		this.winnerPin.y = this.winnerPin.height/2
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
				child.unexpand(child)
				child.expand(child)
			}
		}
	}

	unexpand(atom) {
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

	static drawFn(atom, ctx) {
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
}
