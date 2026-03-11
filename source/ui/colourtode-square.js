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

	constructor(element = {}) {
		const defaults = {
			isSquare: true,
			hasBorder: true,
			draw: (atom, ctx) => {
				if (atom.value.isDiagram) return
				else Rectangle.drawFn(atom, ctx)
			},
			overlaps: Rectangle.overlapsFn,
			offscreen: Rectangle.offscreenFn,
			touch: (atom) => {
				UI.emit("brushColourChanged",atom.value)
				return atom
			},
			click: (atom) => {

				if (atom.joins.length > 0) {
					if (atom.parent === UI.atomRegistry.baseParent || !atom.parent.isPaddle) {
						if (atom.joinExpanded) {
							atom.joinUnepxand(atom)
						} else {
							atom.joinExpand(atom)
						}
					}
				}

				else if (atom.value.isDiagram) {

				}

				else if (!atom.expanded) {

					if (atom.parent === UI.atomRegistry.baseParent || !atom.parent.isPaddle) {
						atom.expand(atom)
					}

				}
				else {
					atom.unexpand(atom)
				}

				UI.emit("brushColourChanged",atom.value)
			},

			expand: (atom) => {
				atom.expanded = true
				atom.createPicker(atom)
				if (atom.value.channels.some(v => v === undefined)) {
					// UI.emit("menuToolUnlock","hexagon")
					// UI.emit("menuToolUnlock","wide_rectangle")
					UI.emit("menuToolUnlock","triangle")
				}
			},

			unexpand: (atom) => {
				atom.expanded = false
				atom.redExpanded = atom.red && atom.red.expanded
				atom.greenExpanded = atom.green && atom.green.expanded
				atom.blueExpanded = atom.blue && atom.blue.expanded
				atom.deletePicker(atom)
			},

			createPicker: (atom) => {
				const pickerHandle = UI.createChild(atom, new SymmetryHandle())
				pickerHandle.width += UI.OPTION_MARGIN
				atom.pickerHandle = pickerHandle
				atom.pickerHandle.behindParent = true

				const pickerPad = UI.createChild(atom, new PickerPad())
				atom.pickerPad = pickerPad

				if (atom.value.channels[2] !== undefined) {
					if (atom.value.channels[2].variable === undefined) {
						const blue = UI.createChild(atom, new PickerChannel())
						blue.channelSlot = "blue" //note: a colour doesn't necessarily have to be in its own channel slot
						blue.x += UI.OPTION_MARGIN + 3 * (UI.SQUARE_SIZE + UI.OPTION_MARGIN)
						blue.value = atom.value.channels[2]
						blue.needsColoursUpdate = true
						atom.blue = blue
						blue.deletedOptions = atom.deletedBlueOptions
						if (atom.blueExpanded) atom.blue.click(atom.blue)
						atom.blue.attached = true
					} else {
						// alert('no')
						const hexagon = atom.variableAtoms[2]
						hexagon.behindOtherChildren = false
						UI.atomRegistry.register(hexagon)
						UI.giveChild(atom, hexagon)
						hexagon.variable = "blue"
						hexagon.x = (UI.OPTION_MARGIN + UI.SQUARE_SIZE)*3 + (UI.SQUARE_SIZE + UI.OPTION_MARGIN)/2 - hexagon.width/3
						hexagon.y = atom.height/2 - hexagon.height/2
						hexagon.attached = true

						atom.blue = hexagon
					}
				}

				if (atom.value.channels[1] !== undefined) {
					if (atom.value.channels[1].variable === undefined) {
						const green = UI.createChild(atom, new PickerChannel())
						green.channelSlot = "green" //note: a colour doesn't necessarily have to be in its own channel slot
						green.x += UI.OPTION_MARGIN + 2 * (UI.SQUARE_SIZE + UI.OPTION_MARGIN)
						green.value = atom.value.channels[1]
						green.needsColoursUpdate = true
						atom.green = green
						green.deletedOptions = atom.deletedGreenOptions
						if (atom.greenExpanded) atom.green.click(atom.green)
						atom.green.attached = true
					} else {
						// alert('noo')
						const hexagon = atom.variableAtoms[1]
						hexagon.behindOtherChildren = false
						UI.atomRegistry.register(hexagon)
						UI.giveChild(atom, hexagon)
						hexagon.variable = "green"
						hexagon.x = (UI.OPTION_MARGIN + UI.SQUARE_SIZE)*2 + (UI.SQUARE_SIZE + UI.OPTION_MARGIN)/2 - hexagon.width/3
						hexagon.y = atom.height/2 - hexagon.height/2
						hexagon.attached = true

						atom.green = hexagon
					}
				}

				if (atom.value.channels[0] !== undefined) {
					if (atom.value.channels[0].variable === undefined) {
						const red = UI.createChild(atom, new PickerChannel())
						red.channelSlot = "red" //note: a colour doesn't necessarily have to be in its own channel slot
						red.x += UI.OPTION_MARGIN + UI.SQUARE_SIZE + UI.OPTION_MARGIN
						red.value = atom.value.channels[0]
						red.needsColoursUpdate = true
						atom.red = red
						red.deletedOptions = atom.deletedRedOptions
						if (atom.redExpanded) atom.red.click(atom.red)
						atom.red.attached = true
					} else {
						const triangle = atom.variableAtoms[0]
						triangle.behindOtherChildren = false
						UI.atomRegistry.register(triangle)
						UI.giveChild(atom, triangle)
						triangle.x = (UI.OPTION_MARGIN + UI.SQUARE_SIZE) + (UI.SQUARE_SIZE + UI.OPTION_MARGIN)/2 - triangle.width/3
						triangle.y = atom.height/2 - triangle.height/2
						triangle.attached = true

						atom.red = triangle
					}
				}
			},

			deletePicker: (atom) => {
				UI.deleteChild(atom, atom.pickerPad)
				UI.deleteChild(atom, atom.pickerHandle)
				if (atom.red) {
					atom.deletedRedOptions = atom.red.options
					UI.deleteChild(atom, atom.red)
				}
				if (atom.green) {
					atom.deletedGreenOptions = atom.green.options
					UI.deleteChild(atom, atom.green)
				}
				if (atom.blue) {
					atom.deletedBlueOptions = atom.blue.options
					UI.deleteChild(atom, atom.blue)
				}
			},

			receiveNumber: (atom, number, channel = number.channel, {expanded, numberAtom} = {}) => {

				atom.redExpanded = atom.red && atom.red.expanded
				atom.greenExpanded = atom.green && atom.green.expanded
				atom.blueExpanded = atom.blue && atom.blue.expanded

				if (atom.variableAtoms === undefined) {
					atom.variableAtoms = [undefined, undefined, undefined]
				}

				if (number !== undefined && number.variable !== undefined) {
					atom.variableAtoms[channel] = numberAtom
				} else {
					atom.variableAtoms[channel] = undefined
				}

				if (expanded !== undefined) {
					const channelName = UI.CHANNEL_NAMES[channel]
					atom[`${channelName}Expanded`] = expanded
				}

				atom.value.channels[channel] = number

				atom.deletePicker(atom)
				atom.createPicker(atom)
				atom.needsColoursUpdate = true
				atom.colourTicker = Infinity

				if (atom.parent !== UI.atomRegistry.baseParent) {
					const paddle = atom.parent
					UI.emit("paddleRuleChanged",paddle)
				}

				const brushDiagramCell = new DiagramCell({content: atom.value})
				state.brush.colour = new Diagram({left: [brushDiagramCell]})

				UI.emit("toolbarColourChanged")

			},

			construct: (atom) => {
				atom.needsColoursUpdate = true
				if (typeof state.brush.colour === "number") {
					atom.value = DragonArray.fromSplash(state.brush.colour)
				} else {
					atom.value = DragonArray.cloneContent(state.brush.colour.left[0].content)
				}

				atom.colourId = 0
				atom.dcolourId = 1
				atom.colourTicker = Infinity
				atom.joins = []
				atom.joinColourIds = []
				atom.variableAtoms = []

				atom.gradient = new ImageData(atom.width * UI.CT_SCALE, atom.height * UI.CT_SCALE)
				atom.headGradient = new ImageData(atom.width * UI.CT_SCALE, atom.height * UI.CT_SCALE)

			},

			updateGradient: (atom) => {
				const valueClone = DragonArray.cloneContent(atom.value)
				valueClone.joins = []
				atom.colours = valueClone.getSplashes()

				// Create pixel values for gradient
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
			},

			// Ctrl+F: sqwww
			update: (atom) => {

				if (atom.value.isDiagram) {
					if (atom.multiAtoms === undefined || atom.multiAtoms.length === 0) {
						atom.multiAtoms = []
						const diagram = atom.value
						const [diagramWidth, diagramHeight] = diagram.getDimensions()
						const cellAtomWidth = atom.width / diagramWidth
						const cellAtomHeight = atom.height / diagramHeight
						for (const diagramCell of diagram.left) {
							const multiAtom = UI.createChild(atom, new ColourtodeSquare())
							multiAtom.x = diagramCell.x * cellAtomWidth
							multiAtom.y = diagramCell.y * cellAtomHeight
							multiAtom.width = diagramCell.width * cellAtomWidth
							multiAtom.height = diagramCell.height * cellAtomHeight
							multiAtom.value = diagramCell.content
							atom.multiAtoms.push(multiAtom)
						}
					}

				} else {

					if (atom.needsColoursUpdate) {
						atom.updateGradient(atom)
						atom.needsColoursUpdate = false
					}
				}

				const {x, y} = atom.getPosition()

				atom.highlightedAtom = undefined

				if (UI.hand.content === atom && UI.hand.state === UI.HAND.DRAGGING) {

					const left = x
					const top = y
					const right = x + atom.width
					const bottom = y + atom.height

					if (atom.highlight !== undefined) {
						UI.deleteChild(atom, atom.highlight)
						atom.highlight = undefined
					}

					if (atom.highlightedAtom === undefined) {
						const atoms = UI.getAllBaseAtoms()
						for (let other of atoms) {
							if (other === atom) continue
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
								atom.highlightedAtom = other.parent
							} else {
								if (other.parent !== UI.atomRegistry.baseParent) continue
								atom.highlightedAtom = other
							}

							atom.highlight = UI.createChild(atom, new Highlight(), {bottom: true})
							atom.highlight.hasBorder = true
							atom.highlight.hasInner = false
							atom.highlight.width = other.width
							atom.highlight.height = other.height
							atom.highlight.x = ox
							atom.highlight.y = oy

							break

						}
					}

					if (atom.highlightedAtom === undefined) for (const paddle of UI.paddles) {

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
								atom.highlight = UI.createChild(atom, new Highlight(), {bottom: true})
								atom.highlight.hasBorder = true
								atom.highlight.colour = Colour.Grey
								atom.highlight.x = dummyLeftX
								atom.highlight.y = dummyLeftY
								atom.highlight.width = paddle.dummyLeft.width
								atom.highlight.height = paddle.dummyLeft.height
								atom.highlightedSide = "left"

								atom.highlightedAtom = paddle
							} else if (left > pleft + paddle.rightTriangle.x) {
								atom.highlight = UI.createChild(atom, new Highlight(), {bottom: true})
								atom.highlight.hasBorder = true
								atom.highlight.colour = Colour.Grey
								atom.highlight.x = dummyRightX
								atom.highlight.y = dummyRightY
								atom.highlight.width = paddle.dummyRight.width
								atom.highlight.height = paddle.dummyRight.height
								atom.highlightedSide = "right"
								atom.highlightedAtom = paddle
							} else {
								atom.highlight = UI.createChild(atom, new Highlight(), {bottom: true})
								atom.highlight.hasBorder = true
								atom.highlight.colour = Colour.Grey
								atom.highlight.x = dummyLeftX
								atom.highlight.y = dummyLeftY
								atom.highlight.width = paddle.dummyLeft.width
								atom.highlight.height = paddle.dummyLeft.height
								atom.highlightedSide = "left"
								atom.highlightedAtom = paddle
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

							atom.highlight = UI.createChild(atom, new Highlight(), {bottom: true})
							if (winningSide === "left" || winningSide === "right") {
								atom.highlight.width = UI.HIGHLIGHT_THICKNESS
								atom.highlight.height = winningCellAtom.height
							}
							else if (winningSide === "above" || winningSide === "below") {
								atom.highlight.width = winningCellAtom.width
								atom.highlight.height = UI.HIGHLIGHT_THICKNESS
							}

							if (winningSide === "left") {
								atom.highlight.x = cx - UI.HIGHLIGHT_THICKNESS/2
								atom.highlight.y = cy
							}
							else if (winningSide === "right") {
								atom.highlight.x = cx - UI.HIGHLIGHT_THICKNESS/2 + winningCellAtom.width
								atom.highlight.y = cy
							}
							else if (winningSide === "above") {
								atom.highlight.x = cx
								atom.highlight.y = cy - UI.HIGHLIGHT_THICKNESS/2
							}
							else if (winningSide === "below") {
								atom.highlight.x = cx
								atom.highlight.y = cy - UI.HIGHLIGHT_THICKNESS/2 + winningCellAtom.height
							}

							if (winningSide === "slot") {
								atom.highlight.width = UI.SQUARE_SIZE
								atom.highlight.height = UI.SQUARE_SIZE
								const {x: cx, y: cy} = winningCellAtom.getPosition()
								atom.highlight.x = cx
								atom.highlight.y = cy
								atom.highlight.hasBorder = true
								atom.highlight.colour = Colour.Grey
							}

							atom.highlightedAtom = winningCellAtom
							atom.highlightedSide = winningSide

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

							atom.highlight = UI.createChild(atom, new Highlight(), {bottom: true})
							if (winningSide === "left" || winningSide === "right") {
								atom.highlight.width = UI.HIGHLIGHT_THICKNESS
								atom.highlight.height = winningCellAtom.height
							}
							else if (winningSide === "above" || winningSide === "below") {
								atom.highlight.width = winningCellAtom.width
								atom.highlight.height = UI.HIGHLIGHT_THICKNESS
							}

							if (winningSide === "left") {
								atom.highlight.x = cx - UI.HIGHLIGHT_THICKNESS/2
								atom.highlight.y = cy
							}
							else if (winningSide === "right") {
								atom.highlight.x = cx - UI.HIGHLIGHT_THICKNESS/2 + winningCellAtom.width
								atom.highlight.y = cy
							}
							else if (winningSide === "above") {
								atom.highlight.x = cx
								atom.highlight.y = cy - UI.HIGHLIGHT_THICKNESS/2
							}
							else if (winningSide === "below") {
								atom.highlight.x = cx
								atom.highlight.y = cy - UI.HIGHLIGHT_THICKNESS/2 + winningCellAtom.height
							}

							if (winningSide === "slot") {
								atom.highlight.width = UI.SQUARE_SIZE
								atom.highlight.height = UI.SQUARE_SIZE
								const {x: cx, y: cy} = winningCellAtom.getPosition()
								atom.highlight.x = cx
								atom.highlight.y = cy
								atom.highlight.hasBorder = true
								atom.highlight.colour = Colour.Grey
							}

							atom.highlightedAtom = winningCellAtom
							atom.highlightedSide = winningSide

							break

						}

					}


				}

				if (atom.highlightedAtom === undefined && atom.highlight !== undefined) {
					UI.deleteChild(atom, atom.highlight)
					atom.highlight = undefined
				}

			},

			drop: (atom) => {
				if (atom.highlight !== undefined) {

					if (atom.highlightedAtom.isPaddle) {
						const paddle = atom.highlightedAtom
						atom.attached = true

						atom.dx = 0
						atom.dy = 0

						if (atom.highlightedSide === "right") {

							const dummy = UI.createChild(paddle, new Slot(), {bottom: true})
							dummy.x = Paddle.WIDTH/2 - atom.width/2
							dummy.y = Paddle.HEIGHT/2 - atom.height/2
							dummy.isLeftSlot = true
							dummy.isSlot = false
							paddle.cellAtoms.push(dummy)

							dummy.slotted = atom
							atom.cellAtom = dummy
							atom.x = atom.highlightedAtom.x
							atom.y = atom.highlightedAtom.y
							atom.slottee = true
							UI.giveChild(paddle, atom)

						} else {
							paddle.cellAtoms.push(atom)
							atom.x = atom.highlightedAtom.x
							atom.y = atom.highlightedAtom.y

							UI.giveChild(paddle, atom)
						}

						UI.emit("paddleSizeChanged",paddle)
					}
					else if (atom.highlightedAtom.isSlot && atom.highlightedSide === "slot") {
						const slot = atom.highlightedAtom
						const paddle = slot.parent
						atom.attached = true
						UI.giveChild(paddle, atom)
						atom.x = slot.x
						atom.y = slot.y
						atom.dx = 0
						atom.dy = 0
						slot.cellAtom.slotted = atom
						atom.cellAtom = slot.cellAtom
						atom.slottee = true

						UI.emit("paddleSizeChanged",slot.parent)
					}
					else if (atom.highlightedAtom.isLeftSlot && atom.highlightedSide === "slot") {
						const slot = atom.highlightedAtom
						const paddle = slot.parent
						const id = paddle.cellAtoms.indexOf(slot)
						paddle.cellAtoms.splice(id, 1)
						atom.x = slot.x
						atom.y = slot.y
						atom.dx = 0
						atom.dy = 0

						atom.attached = true
						paddle.cellAtoms.push(atom)
						atom.slotted = slot.slotted
						atom.slot = slot.slot
						if (slot.slotted !== undefined) {
							slot.slotted.cellAtom = atom
						}
						UI.giveChild(paddle, atom)
						UI.emit("paddleRuleChanged",paddle)
						UI.deleteChild(paddle, slot)

					}
					else if (atom.highlightedAtom.isSlot && atom.highlightedSide !== "slot") {
						const slot = atom.highlightedAtom
						const paddle = slot.parent
						atom.attached = true
						UI.giveChild(paddle, atom)

						const dummy = UI.createChild(paddle, new Slot(), {bottom: true})
						dummy.isLeftSlot = true
						paddle.cellAtoms.push(dummy)
						dummy.isSlot = false
						dummy.slotted = atom
						dummy.slotted.cellAtom = dummy
						dummy.slot = slot
						atom.slotted = undefined

						if (atom.expanded) {
							atom.unexpand(atom)
						}

						if (atom.highlightedSide === "left") {
							atom.x = slot.x - atom.width
							atom.y = slot.y
						} else if (atom.highlightedSide === "right") {
							atom.x = slot.x + slot.width
							atom.y = slot.y
						} else if (atom.highlightedSide === "above") {
							atom.x = slot.x
							atom.y = slot.y - atom.height
						} else if (atom.highlightedSide === "below") {
							atom.x = slot.x
							atom.y = slot.y + slot.height
						}

						dummy.x = atom.x - paddle.offset
						dummy.y = atom.y

						atom.cellAtom = dummy
						atom.slottee = true
						atom.dx = 0
						atom.dy = 0
						UI.emit("paddleSizeChanged",paddle)
					}
					else if ((atom.highlightedAtom.isLeftSlot || atom.highlightedAtom.isSquare) && atom.highlightedAtom.parent.isPaddle) {
						const square = atom.highlightedAtom
						const paddle = square.parent
						atom.attached = true
						UI.giveChild(paddle, atom)
						paddle.cellAtoms.push(atom)
						if (atom.expanded) {
							atom.unexpand(atom)
						}

						if (atom.highlightedSide === "left") {
							atom.x = square.x - atom.width
							atom.y = square.y
						} else if (atom.highlightedSide === "right") {
							atom.x = square.x + square.width
							atom.y = square.y
						} else if (atom.highlightedSide === "above") {
							atom.x = square.x
							atom.y = square.y - atom.height
						} else if (atom.highlightedSide === "below") {
							atom.x = square.x
							atom.y = square.y + square.height
						}

						if (paddle.rightTriangle !== undefined && atom.slotted !== undefined) {
							UI.atomRegistry.register(atom.slotted)
							UI.giveChild(paddle, atom.slotted)
						}

						atom.dx = 0
						atom.dy = 0
						UI.emit("paddleSizeChanged",paddle)

					}
					else {
						const joinee = atom.highlightedAtom
						const joiner = atom

						if (joinee.expanded) {
							joinee.unexpand(joinee)
						}

						if (joiner.expanded) {
							joiner.unexpand(joiner)
						}

						if (joinee.joinExpanded) {
							joinee.joinUnepxand(joinee)
						}

						joinee.joins.push(joiner)
						UI.atomRegistry.delete(joiner)

						joinee.joinExpand(joinee)


						joinee.value.joins.push(joiner.value)
						joinee.needsColoursUpdate = true
						joinee.colourTicker = Infinity

						UI.emit("brushColourChanged",joinee.value)

					}

					if (atom.expanded) {
						atom.unexpand(atom)
					}

					if (atom.joinExpanded) {
						atom.joinUnepxand(atom)
					}

				}
			},

			joinExpand: (atom) => {
				atom.joinExpanded = true

				const pickerPad = UI.createChild(atom, new PickerPad())
				atom.pickerPad = pickerPad
				pickerPad.width = atom.width + UI.OPTION_MARGIN*2
				pickerPad.x = -UI.OPTION_MARGIN
				pickerPad.height = (atom.joins.length) * (atom.height + UI.OPTION_MARGIN) + UI.OPTION_MARGIN
				pickerPad.y = atom.height + UI.OPTION_MARGIN
				pickerPad.touch = (atom) => atom
				pickerPad.grab = (atom) => atom.parent
				pickerPad.dragOnly = true

				const pickerHandle = UI.createChild(atom, new PickerPad())
				atom.pickerHandle = pickerHandle
				pickerHandle.width = SymmetryHandle.HEIGHT
				pickerHandle.x = atom.width/2 - pickerHandle.width/2
				pickerHandle.height = SymmetryHandle.WIDTH
				pickerHandle.y = atom.height
				pickerHandle.touch = (atom) => atom
				pickerHandle.grab = (atom) => atom.parent
				pickerHandle.dragOnly = true

				for (let i = 0; i < atom.joins.length; i++) {
					const joiner = atom.joins[i]
					UI.atomRegistry.register(joiner)
					UI.giveChild(atom, joiner)
					joiner.x = 0
					joiner.y = (i+1) * (atom.height + UI.OPTION_MARGIN) + UI.OPTION_MARGIN
					joiner.dx = 0
					joiner.dy = 0
					joiner.isJoiner = true
					joiner.touch = (atom) => atom.parent
				}

				atom.needsColoursUpdate = true
				atom.colourTicker = Infinity

				if (atom.multiAtoms !== undefined) {
					for (const multiAtom of atom.multiAtoms) {
						UI.atomRegistry.bringToFront(multiAtom)
					}
				}

				atom.attached = false

			},

			joinUnepxand: (atom) => {
				atom.joinExpanded = false
				UI.deleteChild(atom, atom.pickerPad)
				UI.deleteChild(atom, atom.pickerHandle)

				for (let i = 0; i < atom.joins.length; i++) {
					const joiner = atom.joins[i]
					UI.deleteChild(atom, joiner)
				}

				atom.needsColoursUpdate = true
				atom.colourTicker = Infinity

			},

			// ONLY USE .value NOT ANYTHING ELSE
			clone: (atom) => {
				const newAtom = UI.makeSquareFromValue(atom.value)

				const {x, y} = atom.getPosition()
				newAtom.x = x
				newAtom.y = y

				return newAtom
			},

			rightDraggable: true,
			rightDrag: (atom) => {
				const newAtom = atom.clone(atom)

				UI.hand.offset.x -= atom.x - newAtom.x
				UI.hand.offset.y -= atom.y - newAtom.y

				UI.atomRegistry.register(newAtom)
				UI.emit("brushColourChanged",newAtom.value)

				return newAtom
			},

			// Ctrl+f: sqdra
			drag: (atom) => {

				if (atom.joins.length > 0 && atom.joinExpanded) {
					return atom
				}

				if (atom.isJoiner) {
					const id = atom.parent.joins.indexOf(atom)
					atom.parent.joins.splice(id, 1)
					atom.parent.value.joins.splice(id, 1)
					atom.parent.joinUnepxand(atom.parent)
					if (atom.parent.joins.length > 0) {
						atom.parent.joinExpand(atom.parent)
					}
					UI.freeChild(atom.parent, atom)
					atom.isJoiner = false
					atom.touch = ColourtodeSquare.touchFn
				}

				if (atom.attached) {

					const paddle = atom.parent

					if (atom.slottee) {
						atom.attached = false
						atom.slottee = false
						UI.freeChild(paddle, atom)
						atom.cellAtom.slotted = undefined
						if (atom.cellAtom.isLeftSlot) {
							UI.deleteChild(paddle, atom.cellAtom)
							const id = paddle.cellAtoms.indexOf(atom.cellAtom)
							paddle.cellAtoms.splice(id, 1)
						}
						atom.cellAtom = undefined
						UI.emit("paddleSizeChanged",paddle)
						return atom
					}

					const {x, y} = atom
					atom.attached = false
					UI.freeChild(paddle, atom)

					const id = paddle.cellAtoms.indexOf(atom)
					paddle.cellAtoms.splice(id, 1)

					atom.slot = undefined
					if (paddle.rightTriangle !== undefined && atom.slotted !== undefined) {
						const dummy = UI.createChild(paddle, new Slot(), {bottom: true})
						dummy.x = x
						dummy.y = y
						dummy.isLeftSlot = true
						paddle.cellAtoms.push(dummy)
						dummy.isSlot = false
						dummy.slotted = atom.slotted
						dummy.slotted.cellAtom = dummy
						atom.slotted = undefined
					}
					UI.emit("paddleSizeChanged",paddle)

				}

				return atom
			},

			size: 40,
			expanded: false,
		}

		super({ ...defaults, ...element })
	}
}
