//==================//
// TALL RECTANGLE   //
//==================//
class TallRectangle extends Atom {
	constructor(element = {}) {
		super({
			behindChildren: true,
			highlighter: true,
			rightDraggable: true,
			rightDrag: (atom) => {
				const clone = new TallRectangle()
				UI.atomRegistry.register(clone)
				const {x, y} = atom.getPosition()
				UI.hand.offset.x -= atom.x - x
				UI.hand.offset.y -= atom.y - y
				clone.variable = atom.variable
				if (atom.expanded) {
					clone.expand(clone)
				}
				clone.updateAppearance(clone)
				return clone
			},
			drag: (atom) => {
				if (atom.parent.isSquare) {
					const square = atom.parent
					square[atom.channelSlot] = undefined
					const channelId = UI.CHANNEL_IDS[atom.channelSlot]
					square.receiveNumber(square, undefined, channelId)
					UI.freeChild(square, atom)
					atom.updateAppearance(atom)
					atom.attached = false
				} else if (atom.parent.isTallRectangle) {
					const diamond = atom.parent
					UI.freeChild(diamond, atom)
					diamond.operationAtoms[atom.highlightedSlot] = undefined
					const operationName = atom.highlightedSlot === "padTop"? "add" : "subtract"
					diamond.value[operationName] = undefined
					if (atom.expanded) {
						atom.unexpand(atom)
						atom.expand(atom)
					}
					atom.attached = false
					if (diamond.expanded) {
						diamond.unexpand(diamond)
						diamond.expand(diamond)
					} else {
						const handle = atom.highlightedSlot === "padTop"? "handleTop" : "handleBottom"
						UI.deleteChild(diamond, diamond[handle], {quiet: true})
						UI.deleteChild(diamond, diamond[atom.highlightedSlot], {quiet: true})
						diamond.expand(diamond)
						diamond.unexpand(diamond)
					}
				}
				return atom
			},
			hover: (atom) => {

				const {x, y} = atom.getPosition()
				const left = x
				const top = y
				const right = x + atom.width
				const bottom = y + atom.height

				let winningDistance = Infinity
				let winningSquare = undefined
				let winningSlot = undefined

				const atoms = UI.getAllBaseAtoms()
				for (const other of atoms) {
					if (other === atom) continue

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

							atom.highlightedSlot = slotName
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

						atom.highlight = UI.createChild(atom, new Highlight(), {bottom: true})
						atom.highlight.hasBorder = true
						atom.highlight.x = ax + winningSquare.size + UI.OPTION_MARGIN + slotId*(UI.OPTION_MARGIN+winningSquare.size)
						atom.highlight.y = ay
						atom.highlight.width = UI.OPTION_MARGIN*2+winningSquare.size
						atom.highlightedAtom = winningSquare
						atom.highlightedSlot = winningSlot
					}

					return
				}
			},
			place: (atom, highlightedAtom) => {

				atom.attached = true
				atom.dx = 0
				atom.dy = 0

				if (!highlightedAtom.isSquare) {
					const diamond = highlightedAtom.parent

					const operationName = atom.highlightedSlot === "padTop"? "add" : "subtract"
					diamond.value[operationName] = atom.value
					diamond.operationAtoms[atom.highlightedSlot] = atom
					atom.x = 0
					atom.y = highlightedAtom.y + highlightedAtom.height/2 - atom.height/2
					UI.giveChild(diamond, atom)

					if (atom.expanded) {
						atom.unexpand(atom)
						atom.expand(atom)
					}

					return
				}

				const square = atom.highlightedAtom
				const slotId = UI.CHANNEL_IDS[atom.highlightedSlot]
				square.receiveNumber(square, atom.value, slotId, {expanded: atom.expanded, numberAtom: atom})
				UI.atomRegistry.delete(atom)
			},
			draw: TallRectangle.drawFn,
			offscreen: Rectangle.offscreenFn,
			overlaps: Rectangle.overlapsFn,
			hasBorder: true,
			isTallRectangle: true,
			size: UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2,
			height: UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2,
			width: UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2,
			construct: (atom) => {
				atom.variable = CHANNEL_VARIABLES[Random.Uint8 % 3]
				atom.value = new DragonNumber({variable: atom.variable})
				atom.updateAppearance(atom)
				if (!atom.isTool) {
					atom.width += UI.BORDER_THICKNESS/2
					atom.height += UI.BORDER_THICKNESS/2
					atom.size += UI.BORDER_THICKNESS/2
				}
				atom.operationAtoms = {padTop: undefined, padBottom: undefined}

			},
			makeOperationAtoms: (atom) => {
				if (atom.value.add !== undefined) {

					if (atom.operationAtoms.padtop === undefined) {
						if (atom.value.add.variable === undefined) {
							const operationAtom = UI.createChild(atom, new PickerChannel())
							operationAtom.value = atom.value.add
							atom.operationAtoms.padTop = operationAtom
							operationAtom.x = atom.padTop.x + UI.OPTION_MARGIN
							operationAtom.y = atom.padTop.y + atom.padTop.height/2 - operationAtom.height/2
							operationAtom.highlightedSlot = "padTop"
						} else {
							const operationAtom = UI.createChild(atom, new TallRectangle())
							operationAtom.value = atom.value.add
							operationAtom.variable = atom.value.add.variable
							operationAtom.makeOperationAtoms(operationAtom)
							operationAtom.highlightedSlot = "padTop"
							operationAtom.x = 0
							operationAtom.y = atom.padTop.y + atom.padTop.height/2 - operationAtom.height/2
							operationAtom.updateAppearance(operationAtom)
							atom.operationAtoms.padTop = operationAtom
						}
					}
				}

				if (atom.value.subtract !== undefined) {

					if (atom.operationAtoms.padBottom === undefined) {
						if (atom.value.subtract.variable === undefined) {
							const operationAtom = UI.createChild(atom, new PickerChannel())
							operationAtom.value = atom.value.subtract
							atom.operationAtoms.padBottom = operationAtom
							operationAtom.x = atom.padBottom.x + UI.OPTION_MARGIN
							operationAtom.y = atom.padBottom.y + atom.padBottom.height/2 - operationAtom.height/2
							operationAtom.highlightedSlot = "padBottom"
						} else {

						}
					}
				}
			},
			updateAppearance: (atom) => {
				if (atom.variable === "red") {
					atom.colour = Colour.Red
				} else if (atom.variable === "green") {
					atom.colour = Colour.Green
				} else if (atom.variable === "blue") {
					atom.colour = Colour.Blue
				}

				atom.borderColour = UI.borderColours[atom.colour.splash]
			},
			expanded: false,
			click: (atom) => {
				if (!atom.expanded) {
					atom.expand(atom)
				} else {
					atom.unexpand(atom)
				}
			},
			expand: (atom) => {
				atom.expanded = true

				if (atom.value.add === undefined) {
					if (atom.y < 0 || !(atom.parent.isTallRectangle && atom.parent.operationAtoms.padBottom === atom)) {
						atom.handleTop = UI.createChild(atom, new SymmetryHandle())
						atom.handleTop.width = atom.handleTop.height
						atom.handleTop.height *= 2
						atom.handleTop.y = atom.height/2 - atom.handleTop.height
						atom.handleTop.x = atom.width/2 - atom.handleTop.width/2
						atom.handleTop.behindParent = true

						atom.padTop = UI.createChild(atom, new SymmetryPad())
						atom.padTop.height = PickerPad.HEIGHT
						atom.padTop.width = UI.SQUARE_SIZE + UI.OPTION_MARGIN*2
						atom.padTop.x = atom.width/2 - atom.padTop.width/2
						atom.padTop.y = -atom.padTop.height - UI.OPTION_MARGIN
					}
				}

				if (atom.value.subtract === undefined) {
					if (atom.y > 0 || !(atom.parent.isTallRectangle && atom.parent.operationAtoms.padTop === atom)) {
						atom.handleBottom = UI.createChild(atom, new SymmetryHandle())
						atom.handleBottom.width = atom.handleBottom.height
						atom.handleBottom.height *= 2
						atom.handleBottom.y = atom.height/2
						atom.handleBottom.x = atom.width/2 - atom.handleBottom.width/2
						atom.handleBottom.behindParent = true

						atom.padBottom = UI.createChild(atom, new SymmetryPad())
						atom.padBottom.height = PickerPad.HEIGHT
						atom.padBottom.width = UI.SQUARE_SIZE + UI.OPTION_MARGIN*2
						atom.padBottom.x = atom.width/2 - atom.padBottom.width/2
						atom.padBottom.y = atom.height + UI.OPTION_MARGIN
					}
				}

				atom.handleRight = UI.createChild(atom, new SymmetryHandle())
				atom.handleRight.y = atom.height/2 - atom.handleRight.height/2
				atom.handleRight.x = atom.width/2
				atom.handleRight.width *= 2.5
				atom.handleRight.behindParent = true

				atom.padRight = UI.createChild(atom, new SymmetryPad())
				atom.padRight.height = PickerPad.HEIGHT
				atom.padRight.width = UI.OPTION_MARGIN + (atom.width+UI.OPTION_MARGIN/1.5)*3
				atom.padRight.y = atom.height/2 - atom.padRight.height/2
				atom.padRight.x = atom.width/2 + (UI.SQUARE_SIZE + UI.OPTION_MARGIN*2)/2 + UI.OPTION_MARGIN



				atom.red = UI.createChild(atom, new DiamondChoice())
				atom.red.x = atom.padRight.x + UI.OPTION_MARGIN/Math.SQRT2
				atom.red.borderColour = Colour.Red
				atom.red.colour = Colour.Black
				atom.red.value = "red"

				atom.green = UI.createChild(atom, new DiamondChoice())
				atom.green.x = atom.padRight.x + UI.OPTION_MARGIN/Math.SQRT2 + (atom.green.width+UI.OPTION_MARGIN)*1
				atom.green.borderColour = Colour.Green
				atom.green.colour = Colour.Black
				atom.green.value = "green"

				atom.blue = UI.createChild(atom, new DiamondChoice())
				atom.blue.x = atom.padRight.x + UI.OPTION_MARGIN/Math.SQRT2 + (atom.blue.width+UI.OPTION_MARGIN)*2
				atom.blue.borderColour = Colour.Blue
				atom.blue.colour = Colour.Black
				atom.blue.value = "blue"

				atom.winnerPin = UI.createChild(atom, new DiamondPin())
				atom.winnerPin.x = atom[atom.variable].x + atom.winnerPin.width/2
				atom.winnerPin.y = atom.winnerPin.height/2
				atom.winnerPin.colour = atom[atom.variable].borderColour
				atom.winnerPin.borderColour = atom.winnerPin.colour

				for (const operation of ["padTop", "padBottom"]) {
					const operationAtom = atom.operationAtoms[operation]
					if (operationAtom === undefined) continue
					UI.atomRegistry.register(operationAtom)
					UI.giveChild(atom, operationAtom)
				}

				for (const child of atom.children) {
					if (!child.isTallRectangle) continue
					if (child.expanded) {
						child.unexpand(child)
						child.expand(child)
					}
				}

			},
			unexpand: (atom) => {
				atom.expanded = false

				UI.deleteChild(atom, atom.red)
				UI.deleteChild(atom, atom.green)
				UI.deleteChild(atom, atom.blue)

				UI.deleteChild(atom, atom.padRight)
				UI.deleteChild(atom, atom.handleRight)
				UI.deleteChild(atom, atom.winnerPin)

				if (atom.value.add === undefined) {
					UI.deleteChild(atom, atom.padTop, {quiet: true})
					UI.deleteChild(atom, atom.handleTop, {quiet: true})
				}

				if (atom.value.subtract === undefined) {
					UI.deleteChild(atom, atom.padBottom, {quiet: true})
					UI.deleteChild(atom, atom.handleBottom, {quiet: true})
				}

			},
			...element,
		})
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
