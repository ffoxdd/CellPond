//======================//
// COLOURTODE TRIANGLE  //
//======================//
class ColourtodeTriangle extends Atom {
	constructor(element = {}) {
		super({
			behindOtherChildren: true,
			expanded: false,
			draw: (atom, ctx) => {
				if (atom.direction === "right") TriangleRight.drawFn(atom, ctx)
				else if (atom.direction === "down") TriangleDown.drawFn(atom, ctx)
				else if (atom.direction === "up") TriangleUp.drawFn(atom, ctx)
				else if (atom.direction === "left") TriangleLeft.drawFn(atom, ctx)
				else TriangleRight.drawFn(atom, ctx)
			},
			colour: Colour.splash(999),
			overlaps: triangleOverlaps,
			offscreen: triangleOffscreen,
			size: UI.SQUARE_SIZE,
			width: TriangleRight.DEFAULT_WIDTH,
			direction: "right",
			click: (atom) => {

				if (atom.parent.isPaddle) {
					atom.parent.pinhole.locked = !atom.parent.pinhole.locked
					UI.updatePaddleRule(atom.parent)
					return
				}

				if (atom.expanded) {
					atom.unexpand(atom)
				}
				else {
					atom.expand(atom)
				}
			},

			expand: (atom) => {
				atom.pad = UI.createChild(atom, new TrianglePad())
				atom.handle = UI.createChild(atom, new TriangleHandle())
				atom.expanded = true

				atom.upPick = UI.createChild(atom, new TrianglePickUp())
				atom.downPick = UI.createChild(atom, new TrianglePickDown())

				if (atom.direction === "up") atom.upPick.value = true
				if (atom.direction === "down") atom.downPick.value = true
			},

			unexpand: (atom) => {
				UI.deleteChild(atom, atom.pad)
				UI.deleteChild(atom, atom.handle)
				UI.deleteChild(atom, atom.upPick)
				UI.deleteChild(atom, atom.downPick)
				atom.expanded = false
			},

			highlighter: true,

			hover: (atom) => {

				atom.highlightedSlot = undefined

				if (atom.direction === "right") {

					const {x, y} = atom.getPosition()
					const left = x
					const top = y
					const right = x + atom.width
					const bottom = y + atom.height

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

					const {x, y} = atom.getPosition()
					const left = x
					const top = y
					const right = x + atom.width
					const bottom = y + atom.height

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
						if (other === atom) continue
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

							if (atom.highlight !== undefined) {
								UI.deleteChild(atom, atom.highlight)
								atom.highlight = undefined
							}

							atom.highlight = UI.createChild(atom, new Highlight(), {bottom: true})
							atom.highlight.hasBorder = true
							atom.highlight.x = ax + winningSquare.size + UI.OPTION_MARGIN + slotId*(UI.OPTION_MARGIN+winningSquare.size)
							atom.highlight.y = ay
							atom.highlight.width = UI.OPTION_MARGIN*2+winningSquare.size
							atom.highlightedAtom = winningSquare
							atom.highlightedSlot = winningSlot
						}
					}

					return winningSquare

				}

				return undefined
			},

			updateValue: (atom) => {
				if (atom.direction === "up" || atom.direction === "down") {
					atom.variable = atom.highlightedSlot
				} else if (atom.direction === "left") {
					if (atom.highlightedSlot === "red") atom.variable = "blue"
					else if (atom.highlightedSlot === "green") atom.variable = "red"
					else if (atom.highlightedSlot === "blue") atom.variable = "green"
				} else if (atom.direction === "right") {
					if (atom.highlightedSlot === "red") atom.variable = "green"
					else if (atom.highlightedSlot === "green") atom.variable = "blue"
					else if (atom.highlightedSlot === "blue") atom.variable = "red"
				}
				const add = atom.direction === "up" ? DragonNumber.fromInt(1) : undefined
				const subtract = atom.direction === "down" ? DragonNumber.fromInt(1) : undefined
				const value = new DragonNumber({channel: atom.channelId, variable: atom.variable, add, subtract})
				atom.value = value
			},

			place: (atom, receiver) => {

				if (receiver.isSquare && atom.highlightedSlot !== undefined) {
					atom.channelId = UI.CHANNEL_IDS[atom.highlightedSlot]
					atom.updateValue(atom)

					const square = receiver
					square.receiveNumber(square, atom.value, atom.channelId, {expanded: atom.expanded, numberAtom: atom})
					UI.atomRegistry.delete(atom)
					atom.dx = 0
					atom.dy = 0
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

					UI.squareTool.toolbarNeedsColourUpdate = true
					UI.circleTool.toolbarNeedsColourUpdate = true
					UI.triangleTool.toolbarNeedsColourUpdate = true
					UI.tallRectangleTool.toolbarNeedsColourUpdate = true

					if (square.parent.isPaddle) {
						UI.updatePaddleRule(square.parent)
					}
					return
				}

				if (receiver.isPaddle) {
					const paddle = receiver
					UI.giveChild(paddle, atom)
					paddle.rightTriangle = atom
					atom.x = Paddle.WIDTH/2 - atom.width/2
					atom.y = Paddle.HEIGHT/2 - atom.height/2
					atom.dx = 0
					atom.dy = 0

					atom.hasBorder = false
					paddle.pinhole.locked = atom.colour === Colour.splash(999)

					for (const cellAtom of paddle.cellAtoms) {
						if (cellAtom.slotted !== undefined) {
							UI.atomRegistry.register(cellAtom.slotted)
							UI.giveChild(paddle, cellAtom.slotted)
						}
					}

					UI.updatePaddleSize(paddle)

					if (atom.expanded) {
						atom.unexpand(atom)
					}

					atom.attached = true

					UI.unlockMenuTool("circle")
				}

			},

			rightDraggable: true,
			rightDrag: (atom) => {
				const clone = new ColourtodeTriangle()
				clone.direction = atom.direction
				const {x, y} = atom.getPosition()
				UI.hand.offset.x -= atom.x - x
				UI.hand.offset.y -= atom.y - y
				clone.x = x
				clone.y = y
				UI.atomRegistry.register(clone)
				return clone
			},

			drag: (atom) => {

				if (atom.parent.isSquare) {
					const square = atom.parent
					atom.attached = false
					square[atom.highlightedSlot] = undefined
					UI.freeChild(square, atom)
					square.receiveNumber(square, undefined, atom.channelId)
					return atom
				}

				if (!atom.parent.isPaddle) return atom
				const paddle = atom.parent

				atom.attached = false
				UI.freeChild(paddle, atom)
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

				if (atom.colour !== Colour.splash(999)) {
					atom.hasBorder = true
					atom.borderColour = Colour.Grey
				}

				paddle.pinhole.locked = false

				UI.updatePaddleSize(paddle)
				return atom
			},

			...element,
		})
	}
}
