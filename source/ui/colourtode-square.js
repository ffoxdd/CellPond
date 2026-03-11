//====================//
// COLOURTODE SQUARE  //
//====================//
class ColourtodeSquare extends Atom {
	static touchFn(atom) {
		UI.emit("brushColourChanged",atom.value)
		return atom
	}

	static updateGradientFn(atom) {
		const valueClone = DragonArray.cloneContent(atom.value)
		valueClone.joins = []
		atom.colours = valueClone.getSplashes()

		atom.isGradient = true

		if (atom.joins.length > 0 && !atom.joinExpanded) {
			const joinGradients = []
			for (const join of atom.joins) {
				join.updateGradient(join)
				joinGradients.push(join.gradient)
			}
			atom.headGradient = UI.getGradientImageFromColours({
				colours: atom.colours,
				width: atom.width * UI.CT_SCALE,
				height: atom.height * UI.CT_SCALE,
				stamp: atom.value.stamp,
				gradient: atom.headGradient,
			})

			const gradients = [atom.headGradient, ...joinGradients]
			atom.gradient = UI.getMergedGradient({
				gradients,
				width: atom.width * UI.CT_SCALE,
				height: atom.height * UI.CT_SCALE,
				stamp: atom.value.stamp,
				mergedGradient: atom.gradient,
			})

		} else {
			atom.gradient = UI.getGradientImageFromColours({
				colours: atom.colours,
				width: atom.width * UI.CT_SCALE,
				height: atom.height * UI.CT_SCALE,
				gradient: atom.gradient,
				stamp: atom.value.stamp,
			})
		}
	}

	isSquare = true
	hasBorder = true
	size = 40
	expanded = false
	rightDraggable = true

	constructor() {
		super()
		this.construct()
	}

	draw(ctx) {
		if (this.value !== undefined && this.value.isDiagram) return
		drawRectangle(this, ctx)
	}

	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	offscreen() { return rectangleOffscreen(this) }

	touch() {
		UI.emit("brushColourChanged",this.value)
		return this
	}

	click() {
		if (this.joins.length > 0) {
			if (this.parent === UI.atomRegistry.baseParent || !this.parent.isPaddle) {
				if (this.joinExpanded) {
					this.joinUnepxand()
				} else {
					this.joinExpand()
				}
			}
		}

		else if (this.value.isDiagram) {

		}

		else if (!this.expanded) {
			if (this.parent === UI.atomRegistry.baseParent || !this.parent.isPaddle) {
				this.expand()
			}
		}
		else {
			this.unexpand()
		}

		UI.emit("brushColourChanged",this.value)
	}

	expand() {
		this.expanded = true
		this.createPicker()
		if (this.value.channels.some(v => v === undefined)) {
			// UI.emit("menuToolUnlock","hexagon")
			// UI.emit("menuToolUnlock","wide_rectangle")
			UI.emit("menuToolUnlock","triangle")
		}
	}

	unexpand() {
		this.expanded = false
		this.redExpanded = this.red && this.red.expanded
		this.greenExpanded = this.green && this.green.expanded
		this.blueExpanded = this.blue && this.blue.expanded
		this.deletePicker()
	}

	createPicker() {
		const S = UI.SYMMETRY_CIRCLE_SIZE
		const pickerHandle = UI.createChild(this, new SymmetryHandle({
			width: S/2 + UI.OPTION_MARGIN,
			height: S / 3,
			x: S/2 + S/4,
			y: S/2 - (S / 3)/2,
			behindParent: true,
		}))
		this.pickerHandle = pickerHandle

		const pickerPad = UI.createChild(this, new PickerPad({
			width: UI.OPTION_MARGIN + 3*(UI.SQUARE_SIZE + UI.OPTION_MARGIN),
			height: UI.SQUARE_SIZE,
			x: UI.SQUARE_SIZE + UI.OPTION_MARGIN,
		}))
		this.pickerPad = pickerPad

		const channelLayout = {width: UI.SQUARE_SIZE, y: (UI.SQUARE_SIZE - UI.CHANNEL_HEIGHT)/2, height: UI.CHANNEL_HEIGHT}

		if (this.value.channels[2] !== undefined) {
			if (this.value.channels[2].variable === undefined) {
				const blue = UI.createChild(this, new PickerChannel(channelLayout))
				blue.channelSlot = "blue"
				blue.x += UI.OPTION_MARGIN + 3 * (UI.SQUARE_SIZE + UI.OPTION_MARGIN)
				blue.value = this.value.channels[2]
				blue.needsColoursUpdate = true
				this.blue = blue
				blue.deletedOptions = this.deletedBlueOptions
				if (this.blueExpanded) this.blue.click(this.blue)
				this.blue.attached = true
			} else {
				const hexagon = this.variableAtoms[2]
				hexagon.behindOtherChildren = false
				UI.atomRegistry.register(hexagon)
				UI.giveChild(this, hexagon)
				hexagon.variable = "blue"
				hexagon.x = (UI.OPTION_MARGIN + UI.SQUARE_SIZE)*3 + (UI.SQUARE_SIZE + UI.OPTION_MARGIN)/2 - hexagon.width/3
				hexagon.y = this.height/2 - hexagon.height/2
				hexagon.attached = true

				this.blue = hexagon
			}
		}

		if (this.value.channels[1] !== undefined) {
			if (this.value.channels[1].variable === undefined) {
				const green = UI.createChild(this, new PickerChannel(channelLayout))
				green.channelSlot = "green"
				green.x += UI.OPTION_MARGIN + 2 * (UI.SQUARE_SIZE + UI.OPTION_MARGIN)
				green.value = this.value.channels[1]
				green.needsColoursUpdate = true
				this.green = green
				green.deletedOptions = this.deletedGreenOptions
				if (this.greenExpanded) this.green.click(this.green)
				this.green.attached = true
			} else {
				const hexagon = this.variableAtoms[1]
				hexagon.behindOtherChildren = false
				UI.atomRegistry.register(hexagon)
				UI.giveChild(this, hexagon)
				hexagon.variable = "green"
				hexagon.x = (UI.OPTION_MARGIN + UI.SQUARE_SIZE)*2 + (UI.SQUARE_SIZE + UI.OPTION_MARGIN)/2 - hexagon.width/3
				hexagon.y = this.height/2 - hexagon.height/2
				hexagon.attached = true

				this.green = hexagon
			}
		}

		if (this.value.channels[0] !== undefined) {
			if (this.value.channels[0].variable === undefined) {
				const red = UI.createChild(this, new PickerChannel(channelLayout))
				red.channelSlot = "red"
				red.x += UI.OPTION_MARGIN + UI.SQUARE_SIZE + UI.OPTION_MARGIN
				red.value = this.value.channels[0]
				red.needsColoursUpdate = true
				this.red = red
				red.deletedOptions = this.deletedRedOptions
				if (this.redExpanded) this.red.click(this.red)
				this.red.attached = true
			} else {
				const triangle = this.variableAtoms[0]
				triangle.behindOtherChildren = false
				UI.atomRegistry.register(triangle)
				UI.giveChild(this, triangle)
				triangle.x = (UI.OPTION_MARGIN + UI.SQUARE_SIZE) + (UI.SQUARE_SIZE + UI.OPTION_MARGIN)/2 - triangle.width/3
				triangle.y = this.height/2 - triangle.height/2
				triangle.attached = true

				this.red = triangle
			}
		}
	}

	deletePicker(atom) {
		UI.deleteChild(this, this.pickerPad)
		UI.deleteChild(this, this.pickerHandle)
		if (this.red) {
			this.deletedRedOptions = this.red.options
			UI.deleteChild(this, this.red)
		}
		if (this.green) {
			this.deletedGreenOptions = this.green.options
			UI.deleteChild(this, this.green)
		}
		if (this.blue) {
			this.deletedBlueOptions = this.blue.options
			UI.deleteChild(this, this.blue)
		}
	}

	receiveNumber(number, channel = number.channel, {expanded, numberAtom} = {}) {
		this.redExpanded = this.red && this.red.expanded
		this.greenExpanded = this.green && this.green.expanded
		this.blueExpanded = this.blue && this.blue.expanded

		if (this.variableAtoms === undefined) {
			this.variableAtoms = [undefined, undefined, undefined]
		}

		if (number !== undefined && number.variable !== undefined) {
			this.variableAtoms[channel] = numberAtom
		} else {
			this.variableAtoms[channel] = undefined
		}

		if (expanded !== undefined) {
			const channelName = UI.CHANNEL_NAMES[channel]
			this[`${channelName}Expanded`] = expanded
		}

		this.value.channels[channel] = number

		this.deletePicker()
		this.createPicker()
		this.needsColoursUpdate = true
		this.colourTicker = Infinity

		if (this.parent !== UI.atomRegistry.baseParent) {
			const paddle = this.parent
			UI.emit("paddleRuleChanged",paddle)
		}

		const brushDiagramCell = new DiagramCell({content: this.value})
		state.brush.colour = new Diagram({left: [brushDiagramCell]})

		UI.emit("toolbarColourChanged")
	}

	construct() {
		this.needsColoursUpdate = true
		if (typeof state.brush.colour === "number") {
			this.value = DragonArray.fromSplash(state.brush.colour)
		} else {
			this.value = DragonArray.cloneContent(state.brush.colour.left[0].content)
		}

		this.colourId = 0
		this.dcolourId = 1
		this.colourTicker = Infinity
		this.joins = []
		this.joinColourIds = []
		this.variableAtoms = []

		this.gradient = new ImageData(this.width * UI.CT_SCALE, this.height * UI.CT_SCALE)
		this.headGradient = new ImageData(this.width * UI.CT_SCALE, this.height * UI.CT_SCALE)
	}

	updateGradient() {
		const valueClone = DragonArray.cloneContent(this.value)
		valueClone.joins = []
		this.colours = valueClone.getSplashes()

		// Create pixel values for gradient
		this.isGradient = true

		if (this.joins.length > 0 && !this.joinExpanded) {
			const joinGradients = []
			for (const join of this.joins) {
				join.updateGradient()
				joinGradients.push(join.gradient)
			}
			this.headGradient = UI.getGradientImageFromColours({
				colours: this.colours,
				width: this.width * UI.CT_SCALE,
				height: this.height * UI.CT_SCALE,
				stamp: this.value.stamp,
				gradient: this.headGradient,
			})

			const gradients = [this.headGradient, ...joinGradients]
			this.gradient = UI.getMergedGradient({
				gradients,
				width: this.width * UI.CT_SCALE,
				height: this.height * UI.CT_SCALE,
				stamp: this.value.stamp,
				mergedGradient: this.gradient,
			})

		} else {
			this.gradient = UI.getGradientImageFromColours({
				colours: this.colours,
				width: this.width * UI.CT_SCALE,
				height: this.height * UI.CT_SCALE,
				gradient: this.gradient,
				stamp: this.value.stamp,
			})
		}
	}

	// Ctrl+F: sqwww
	update() {
		if (this.value.isDiagram) {
			if (this.multiAtoms === undefined || this.multiAtoms.length === 0) {
				this.multiAtoms = []
				const diagram = this.value
				const [diagramWidth, diagramHeight] = diagram.getDimensions()
				const cellAtomWidth = this.width / diagramWidth
				const cellAtomHeight = this.height / diagramHeight
				for (const diagramCell of diagram.left) {
					const multiAtom = UI.createChild(this, new ColourtodeSquare())
					multiAtom.x = diagramCell.x * cellAtomWidth
					multiAtom.y = diagramCell.y * cellAtomHeight
					multiAtom.width = diagramCell.width * cellAtomWidth
					multiAtom.height = diagramCell.height * cellAtomHeight
					multiAtom.value = diagramCell.content
					this.multiAtoms.push(multiAtom)
				}
			}

		} else {
			if (this.needsColoursUpdate) {
				this.updateGradient()
				this.needsColoursUpdate = false
			}
		}

		const {x, y} = this.getPosition()

		this.highlightedAtom = undefined

		if (UI.hand.content === this && UI.hand.state === UI.HAND.DRAGGING) {

			const left = x
			const top = y
			const right = x + this.width
			const bottom = y + this.height

			if (this.highlight !== undefined) {
				UI.deleteChild(this, this.highlight)
				this.highlight = undefined
			}

			if (this.highlightedAtom === undefined) {
				const atoms = UI.getAllBaseAtoms()
				for (let other of atoms) {
					if (other === this) continue
					if (!other.isSquare) continue
					if (other.joins.length > 0 && other.joinExpanded) {
						other = other.pickerPad
					}

					const {x: ox, y: oy} = other.getPosition()
					const oleft = ox
					const oright = ox + other.width
					const otop = oy
					const obottom = oy + other.height

					if (left > oright) continue
					if (right < oleft) continue
					if (bottom < otop) continue
					if (top > obottom) continue

					if (other.isPicker) {
						this.highlightedAtom = other.parent
					} else {
						if (other.parent !== UI.atomRegistry.baseParent) continue
						this.highlightedAtom = other
					}

					this.highlight = UI.createChild(this, new Highlight(), {bottom: true})
					this.highlight.hasBorder = true
					this.highlight.hasInner = false
					this.highlight.width = other.width
					this.highlight.height = other.height
					this.highlight.x = ox
					this.highlight.y = oy

					break

				}
			}

			if (this.highlightedAtom === undefined) for (const paddle of UI.paddles) {

				if (!paddle.expanded) continue

				const {x: px, y: py} = paddle.getPosition()
				const pleft = px
				const pright = px + paddle.width
				const ptop = py
				const pbottom = py + paddle.height

				if (left > pright) continue
				if (right < pleft) continue
				if (top > pbottom) continue
				if (bottom < ptop) continue

				if (paddle.cellAtoms.length === 0) {

					const {x: dummyLeftX, y: dummyLeftY} = paddle.dummyLeft.getPosition()
					const {x: dummyRightX, y: dummyRightY} = paddle.dummyRight.getPosition()

					if (paddle.rightTriangle === undefined) {
						this.highlight = UI.createChild(this, new Highlight(), {bottom: true})
						this.highlight.hasBorder = true
						this.highlight.colour = Colour.Grey
						this.highlight.x = dummyLeftX
						this.highlight.y = dummyLeftY
						this.highlight.width = paddle.dummyLeft.width
						this.highlight.height = paddle.dummyLeft.height
						this.highlightedSide = "left"

						this.highlightedAtom = paddle
					} else if (left > pleft + paddle.rightTriangle.x) {
						this.highlight = UI.createChild(this, new Highlight(), {bottom: true})
						this.highlight.hasBorder = true
						this.highlight.colour = Colour.Grey
						this.highlight.x = dummyRightX
						this.highlight.y = dummyRightY
						this.highlight.width = paddle.dummyRight.width
						this.highlight.height = paddle.dummyRight.height
						this.highlightedSide = "right"
						this.highlightedAtom = paddle
					} else {
						this.highlight = UI.createChild(this, new Highlight(), {bottom: true})
						this.highlight.hasBorder = true
						this.highlight.colour = Colour.Grey
						this.highlight.x = dummyLeftX
						this.highlight.y = dummyLeftY
						this.highlight.width = paddle.dummyLeft.width
						this.highlight.height = paddle.dummyLeft.height
						this.highlightedSide = "left"
						this.highlightedAtom = paddle
					}
					break

				}

				else if (paddle.rightTriangle !== undefined && left > pleft + paddle.rightTriangle.x) {

					let winningDistance = Infinity
					let winningSide = undefined
					let winningCellAtom = undefined

					for (const catom of paddle.cellAtoms) {
						const cellAtom = catom.slot
						const {x: cx, y: cy} = cellAtom.getPosition()
						const cleft = cx
						const cright = cx + cellAtom.width
						const ctop = cy
						const cbottom = cy + cellAtom.height

						const spotCenter = [cleft, ctop]
						const spotLeft = [cleft - cellAtom.width, ctop]
						const spotAbove = [cleft, ctop - cellAtom.height]
						const spotRight = [cright, ctop]
						const spotBelow = [cleft, cbottom]

						const dspotCenter = Math.hypot(x - spotCenter[0], y - spotCenter[1])
						if (catom.slotted === undefined && UI.isCellAtomSlotFree(paddle, spotCenter, true) && dspotCenter < winningDistance) {
							winningDistance = dspotCenter
							winningCellAtom = cellAtom
							winningSide = "slot"
						}

						const dspotLeft = Math.hypot(x - spotLeft[0], y - spotLeft[1])
						if (!UI.isCellAtomSpotFilled(paddle, spotLeft, true) && dspotLeft < winningDistance) {
							winningDistance = dspotLeft
							winningCellAtom = cellAtom
							winningSide = "left"
						}

						const dspotAbove = Math.hypot(x - spotAbove[0], y - spotAbove[1])
						if (!UI.isCellAtomSpotFilled(paddle, spotAbove, true) && dspotAbove < winningDistance) {
							winningDistance = dspotAbove
							winningCellAtom = cellAtom
							winningSide = "above"
						}

						const dspotRight = Math.hypot(x - spotRight[0], y - spotRight[1])
						if (!UI.isCellAtomSpotFilled(paddle, spotRight, true) && dspotRight < winningDistance) {
							winningDistance = dspotRight
							winningCellAtom = cellAtom
							winningSide = "right"
						}

						const dspotBelow = Math.hypot(x - spotBelow[0], y - spotBelow[1])
						if (!UI.isCellAtomSpotFilled(paddle, spotBelow, true) && dspotBelow < winningDistance) {
							winningDistance = dspotBelow
							winningCellAtom = cellAtom
							winningSide = "below"
						}
					}

					const {x: cx, y: cy} = winningCellAtom.getPosition()

					this.highlight = UI.createChild(this, new Highlight(), {bottom: true})
					if (winningSide === "left" || winningSide === "right") {
						this.highlight.width = UI.HIGHLIGHT_THICKNESS
						this.highlight.height = winningCellAtom.height
					}
					else if (winningSide === "above" || winningSide === "below") {
						this.highlight.width = winningCellAtom.width
						this.highlight.height = UI.HIGHLIGHT_THICKNESS
					}

					if (winningSide === "left") {
						this.highlight.x = cx - UI.HIGHLIGHT_THICKNESS/2
						this.highlight.y = cy
					}
					else if (winningSide === "right") {
						this.highlight.x = cx - UI.HIGHLIGHT_THICKNESS/2 + winningCellAtom.width
						this.highlight.y = cy
					}
					else if (winningSide === "above") {
						this.highlight.x = cx
						this.highlight.y = cy - UI.HIGHLIGHT_THICKNESS/2
					}
					else if (winningSide === "below") {
						this.highlight.x = cx
						this.highlight.y = cy - UI.HIGHLIGHT_THICKNESS/2 + winningCellAtom.height
					}

					if (winningSide === "slot") {
						this.highlight.width = UI.SQUARE_SIZE
						this.highlight.height = UI.SQUARE_SIZE
						const {x: cx, y: cy} = winningCellAtom.getPosition()
						this.highlight.x = cx
						this.highlight.y = cy
						this.highlight.hasBorder = true
						this.highlight.colour = Colour.Grey
					}

					this.highlightedAtom = winningCellAtom
					this.highlightedSide = winningSide

					break

				}

				else {
					let winningDistance = Infinity
					let winningSide = undefined
					let winningCellAtom = undefined

					for (const cellAtom of paddle.cellAtoms) {
						const {x: cx, y: cy} = cellAtom.getPosition()
						const cleft = cx
						const cright = cx + cellAtom.width
						const ctop = cy
						const cbottom = cy + cellAtom.height

						const spotCenter = [cleft, ctop]
						const spotLeft = [cleft - cellAtom.width, ctop]
						const spotAbove = [cleft, ctop - cellAtom.height]
						const spotRight = [cright, ctop]
						const spotBelow = [cleft, cbottom]

						const dspotCenter = Math.hypot(x - spotCenter[0], y - spotCenter[1])
						if (UI.isCellAtomSlotFree(paddle, spotCenter) && dspotCenter < winningDistance) {
							winningDistance = dspotCenter
							winningCellAtom = cellAtom
							winningSide = "slot"
						}

						const dspotLeft = Math.hypot(x - spotLeft[0], y - spotLeft[1])
						if (!UI.isCellAtomSpotFilled(paddle, spotLeft) && dspotLeft < winningDistance) {
							winningDistance = dspotLeft
							winningCellAtom = cellAtom
							winningSide = "left"
						}

						const dspotAbove = Math.hypot(x - spotAbove[0], y - spotAbove[1])
						if (!UI.isCellAtomSpotFilled(paddle, spotAbove) && dspotAbove < winningDistance) {
							winningDistance = dspotAbove
							winningCellAtom = cellAtom
							winningSide = "above"
						}

						const dspotRight = Math.hypot(x - spotRight[0], y - spotRight[1])
						if (!UI.isCellAtomSpotFilled(paddle, spotRight) && dspotRight < winningDistance) {
							winningDistance = dspotRight
							winningCellAtom = cellAtom
							winningSide = "right"
						}

						const dspotBelow = Math.hypot(x - spotBelow[0], y - spotBelow[1])
						if (!UI.isCellAtomSpotFilled(paddle, spotBelow) && dspotBelow < winningDistance) {
							winningDistance = dspotBelow
							winningCellAtom = cellAtom
							winningSide = "below"
						}
					}

					const {x: cx, y: cy} = winningCellAtom.getPosition()

					this.highlight = UI.createChild(this, new Highlight(), {bottom: true})
					if (winningSide === "left" || winningSide === "right") {
						this.highlight.width = UI.HIGHLIGHT_THICKNESS
						this.highlight.height = winningCellAtom.height
					}
					else if (winningSide === "above" || winningSide === "below") {
						this.highlight.width = winningCellAtom.width
						this.highlight.height = UI.HIGHLIGHT_THICKNESS
					}

					if (winningSide === "left") {
						this.highlight.x = cx - UI.HIGHLIGHT_THICKNESS/2
						this.highlight.y = cy
					}
					else if (winningSide === "right") {
						this.highlight.x = cx - UI.HIGHLIGHT_THICKNESS/2 + winningCellAtom.width
						this.highlight.y = cy
					}
					else if (winningSide === "above") {
						this.highlight.x = cx
						this.highlight.y = cy - UI.HIGHLIGHT_THICKNESS/2
					}
					else if (winningSide === "below") {
						this.highlight.x = cx
						this.highlight.y = cy - UI.HIGHLIGHT_THICKNESS/2 + winningCellAtom.height
					}

					if (winningSide === "slot") {
						this.highlight.width = UI.SQUARE_SIZE
						this.highlight.height = UI.SQUARE_SIZE
						const {x: cx, y: cy} = winningCellAtom.getPosition()
						this.highlight.x = cx
						this.highlight.y = cy
						this.highlight.hasBorder = true
						this.highlight.colour = Colour.Grey
					}

					this.highlightedAtom = winningCellAtom
					this.highlightedSide = winningSide

					break

				}

			}


		}

		if (this.highlightedAtom === undefined && this.highlight !== undefined) {
			UI.deleteChild(this, this.highlight)
			this.highlight = undefined
		}

	}

	drop() {
		if (this.highlight !== undefined) {

			if (this.highlightedAtom.isPaddle) {
				const paddle = this.highlightedAtom
				this.attached = true

				this.dx = 0
				this.dy = 0

				if (this.highlightedSide === "right") {

					const dummy = UI.createChild(paddle, new Slot(), {bottom: true})
					dummy.x = Paddle.WIDTH/2 - this.width/2
					dummy.y = Paddle.HEIGHT/2 - this.height/2
					dummy.isLeftSlot = true
					dummy.isSlot = false
					paddle.cellAtoms.push(dummy)

					dummy.slotted = this
					this.cellAtom = dummy
					this.x = this.highlightedAtom.x
					this.y = this.highlightedAtom.y
					this.slottee = true
					UI.giveChild(paddle, this)

				} else {
					paddle.cellAtoms.push(this)
					this.x = this.highlightedAtom.x
					this.y = this.highlightedAtom.y

					UI.giveChild(paddle, this)
				}

				UI.emit("paddleSizeChanged",paddle)
			}
			else if (this.highlightedAtom.isSlot && this.highlightedSide === "slot") {
				const slot = this.highlightedAtom
				const paddle = slot.parent
				this.attached = true
				UI.giveChild(paddle, this)
				this.x = slot.x
				this.y = slot.y
				this.dx = 0
				this.dy = 0
				slot.cellAtom.slotted = this
				this.cellAtom = slot.cellAtom
				this.slottee = true

				UI.emit("paddleSizeChanged",slot.parent)
			}
			else if (this.highlightedAtom.isLeftSlot && this.highlightedSide === "slot") {
				const slot = this.highlightedAtom
				const paddle = slot.parent
				const id = paddle.cellAtoms.indexOf(slot)
				paddle.cellAtoms.splice(id, 1)
				this.x = slot.x
				this.y = slot.y
				this.dx = 0
				this.dy = 0

				this.attached = true
				paddle.cellAtoms.push(this)
				this.slotted = slot.slotted
				this.slot = slot.slot
				if (slot.slotted !== undefined) {
					slot.slotted.cellAtom = this
				}
				UI.giveChild(paddle, this)
				UI.emit("paddleRuleChanged",paddle)
				UI.deleteChild(paddle, slot)

			}
			else if (this.highlightedAtom.isSlot && this.highlightedSide !== "slot") {
				const slot = this.highlightedAtom
				const paddle = slot.parent
				this.attached = true
				UI.giveChild(paddle, this)

				const dummy = UI.createChild(paddle, new Slot(), {bottom: true})
				dummy.isLeftSlot = true
				paddle.cellAtoms.push(dummy)
				dummy.isSlot = false
				dummy.slotted = this
				dummy.slotted.cellAtom = dummy
				dummy.slot = slot
				this.slotted = undefined

				if (this.expanded) {
					this.unexpand()
				}

				if (this.highlightedSide === "left") {
					this.x = slot.x - this.width
					this.y = slot.y
				} else if (this.highlightedSide === "right") {
					this.x = slot.x + slot.width
					this.y = slot.y
				} else if (this.highlightedSide === "above") {
					this.x = slot.x
					this.y = slot.y - this.height
				} else if (this.highlightedSide === "below") {
					this.x = slot.x
					this.y = slot.y + slot.height
				}

				dummy.x = this.x - paddle.offset
				dummy.y = this.y

				this.cellAtom = dummy
				this.slottee = true
				this.dx = 0
				this.dy = 0
				UI.emit("paddleSizeChanged",paddle)
			}
			else if ((this.highlightedAtom.isLeftSlot || this.highlightedAtom.isSquare) && this.highlightedAtom.parent.isPaddle) {
				const square = this.highlightedAtom
				const paddle = square.parent
				this.attached = true
				UI.giveChild(paddle, this)
				paddle.cellAtoms.push(this)
				if (this.expanded) {
					this.unexpand()
				}

				if (this.highlightedSide === "left") {
					this.x = square.x - this.width
					this.y = square.y
				} else if (this.highlightedSide === "right") {
					this.x = square.x + square.width
					this.y = square.y
				} else if (this.highlightedSide === "above") {
					this.x = square.x
					this.y = square.y - this.height
				} else if (this.highlightedSide === "below") {
					this.x = square.x
					this.y = square.y + square.height
				}

				if (paddle.rightTriangle !== undefined && this.slotted !== undefined) {
					UI.atomRegistry.register(this.slotted)
					UI.giveChild(paddle, this.slotted)
				}

				this.dx = 0
				this.dy = 0
				UI.emit("paddleSizeChanged",paddle)

			}
			else {
				const joinee = this.highlightedAtom
				const joiner = this

				if (joinee.expanded) {
					joinee.unexpand()
				}

				if (joiner.expanded) {
					joiner.unexpand()
				}

				if (joinee.joinExpanded) {
					joinee.joinUnepxand()
				}

				joinee.joins.push(joiner)
				UI.atomRegistry.delete(joiner)

				joinee.joinExpand()


				joinee.value.joins.push(joiner.value)
				joinee.needsColoursUpdate = true
				joinee.colourTicker = Infinity

				UI.emit("brushColourChanged",joinee.value)

			}

			if (this.expanded) {
				this.unexpand()
			}

			if (this.joinExpanded) {
				this.joinUnepxand()
			}

		}
	}

	joinExpand() {
		this.joinExpanded = true

		const pickerPad = UI.createChild(this, new PickerPad({
			width: this.width + UI.OPTION_MARGIN*2,
			height: (this.joins.length) * (this.height + UI.OPTION_MARGIN) + UI.OPTION_MARGIN,
			x: -UI.OPTION_MARGIN,
			y: this.height + UI.OPTION_MARGIN,
		}))
		this.pickerPad = pickerPad
		pickerPad.touch = function() { return this }
		pickerPad.grab = function() { return this.parent }
		pickerPad.dragOnly = true

		const handleW = SymmetryHandle.HEIGHT
		const pickerHandle = UI.createChild(this, new PickerPad({
			width: handleW,
			height: SymmetryHandle.WIDTH,
			x: this.width/2 - handleW/2,
			y: this.height,
		}))
		this.pickerHandle = pickerHandle
		pickerHandle.touch = function() { return this }
		pickerHandle.grab = function() { return this.parent }
		pickerHandle.dragOnly = true

		for (let i = 0; i < this.joins.length; i++) {
			const joiner = this.joins[i]
			UI.atomRegistry.register(joiner)
			UI.giveChild(this, joiner)
			joiner.x = 0
			joiner.y = (i+1) * (this.height + UI.OPTION_MARGIN) + UI.OPTION_MARGIN
			joiner.dx = 0
			joiner.dy = 0
			joiner.isJoiner = true
			joiner.touch = function() { return this.parent }
		}

		this.needsColoursUpdate = true
		this.colourTicker = Infinity

		if (this.multiAtoms !== undefined) {
			for (const multiAtom of this.multiAtoms) {
				UI.atomRegistry.bringToFront(multiAtom)
			}
		}

		this.attached = false
	}

	joinUnepxand() {
		this.joinExpanded = false
		UI.deleteChild(this, this.pickerPad)
		UI.deleteChild(this, this.pickerHandle)

		for (let i = 0; i < this.joins.length; i++) {
			const joiner = this.joins[i]
			UI.deleteChild(this, joiner)
		}

		this.needsColoursUpdate = true
		this.colourTicker = Infinity
	}

	// ONLY USE .value NOT ANYTHING ELSE
	clone() {
		const newAtom = UI.makeSquareFromValue(this.value)

		const {x, y} = this.getPosition()
		newAtom.x = x
		newAtom.y = y

		return newAtom
	}

	rightDrag() {
		const newAtom = this.clone()

		UI.hand.offset.x -= this.x - newAtom.x
		UI.hand.offset.y -= this.y - newAtom.y

		UI.atomRegistry.register(newAtom)
		UI.emit("brushColourChanged",newAtom.value)

		return newAtom
	}

	// Ctrl+f: sqdra
	drag() {
		if (this.joins.length > 0 && this.joinExpanded) {
			return this
		}

		if (this.isJoiner) {
			const id = this.parent.joins.indexOf(this)
			this.parent.joins.splice(id, 1)
			this.parent.value.joins.splice(id, 1)
			this.parent.joinUnepxand()
			if (this.parent.joins.length > 0) {
				this.parent.joinExpand()
			}
			UI.freeChild(this.parent, this)
			this.isJoiner = false
			this.touch = ColourtodeSquare.touchFn
		}

		if (this.attached) {

			const paddle = this.parent

			if (this.slottee) {
				this.attached = false
				this.slottee = false
				UI.freeChild(paddle, this)
				this.cellAtom.slotted = undefined
				if (this.cellAtom.isLeftSlot) {
					UI.deleteChild(paddle, this.cellAtom)
					const id = paddle.cellAtoms.indexOf(this.cellAtom)
					paddle.cellAtoms.splice(id, 1)
				}
				this.cellAtom = undefined
				UI.emit("paddleSizeChanged",paddle)
				return this
			}

			const {x, y} = this
			this.attached = false
			UI.freeChild(paddle, this)

			const id = paddle.cellAtoms.indexOf(this)
			paddle.cellAtoms.splice(id, 1)

			this.slot = undefined
			if (paddle.rightTriangle !== undefined && this.slotted !== undefined) {
				const dummy = UI.createChild(paddle, new Slot(), {bottom: true})
				dummy.x = x
				dummy.y = y
				dummy.isLeftSlot = true
				paddle.cellAtoms.push(dummy)
				dummy.isSlot = false
				dummy.slotted = this.slotted
				dummy.slotted.cellAtom = dummy
				this.slotted = undefined
			}
			UI.emit("paddleSizeChanged",paddle)

		}

		return this
	}
}
