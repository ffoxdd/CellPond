//==================//
// PICKER CHANNEL   //
//==================//
class PickerChannel extends Atom {
	constructor(element = {}) {
		super({

			//behindChildren: true,
			hasBorder: true,
			draw: Rectangle.drawFn,
			overlaps: Rectangle.overlapsFn,
			offscreen: Rectangle.offscreenFn,
			width: UI.SQUARE_SIZE,
			y: (UI.SQUARE_SIZE - UI.CHANNEL_HEIGHT)/2,
			height: UI.CHANNEL_HEIGHT,

			grab: (atom) => {
				return atom
			},

			rightDraggable: true,
			rightDrag: (atom) => {
				const clone = new PickerChannel()
				UI.atomRegistry.register(clone)
				const {x, y} = atom.getPosition()
				UI.hand.offset.x -= atom.x - x
				UI.hand.offset.y -= atom.y - y
				clone.value = atom.value.clone()
				if (atom.expanded) {
					clone.createOptions(clone)
					clone.expanded = true
				}
				return clone
			},

			drag: (atom) => {
				if (atom.parent.isSquare) {
					const square = atom.parent
					square[atom.channelSlot] = undefined
					const channelId = UI.CHANNEL_IDS[atom.channelSlot]
					square.receiveNumber(square, undefined, channelId)
					UI.freeChild(square, atom)
					atom.channelSlot = UI.CHANNEL_NAMES[atom.value.channel]
					atom.updateColours(atom)
					atom.attached = false


					atom.needsColoursUpdate = true
					atom.colourTicker = Infinity

				}

				else if (atom.parent.isTallRectangle) {
					const diamond = atom.parent
					UI.freeChild(diamond, atom)
					diamond.operationAtoms[atom.highlightedSlot] = undefined
					const operationName = atom.highlightedSlot === "padTop"? "add" : "subtract"
					diamond.value[operationName] = undefined
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

				else if (atom.parent.isPaddle) {
					const paddle = atom.parent
					paddle.chance = undefined
					UI.freeChild(paddle, atom)
					UI.emit("paddleSizeChanged",paddle)
				}

				return atom
			},

			construct: (atom) => {
				const values = [false, false, false, false, false, false, false, false, false, true]
				const channel = Random.Uint8 % 3
				atom.value = new DragonNumber({values, channel})
				atom.needsColoursUpdate = true
				atom.colourId = 0
				atom.dcolourId = 1
				atom.colourTicker = Infinity

				atom.selectionBack = UI.createChild(atom, new ChannelSelectionSide())

				const selectionTop = UI.createChild(atom, new ChannelSelectionEnd())
				atom.selectionTop = selectionTop
				atom.selectionTop.isTop = true
				selectionTop.dragOnly = false

				const selectionBottom = UI.createChild(atom, new ChannelSelectionEnd())
				atom.selectionBottom = selectionBottom
				atom.selectionBottom.isTop = false
				selectionBottom.dragOnly = false

				atom.positionSelection(atom)
			},

			positionSelection: (atom, start, end, top, bottom) => {

				if (!atom.expanded) {

					atom.selectionTop.y = -atom.selectionTop.height

					atom.selectionBottom.y = atom.height

				}

				else {
					const optionSpacing = UI.OPTION_SPACING

					atom.selectionTop.y = end - atom.selectionTop.height
					atom.selectionBottom.y = start + optionSpacing - atom.selectionBottom.height

					atom.selectionTop.minY = top - atom.selectionTop.height
					atom.selectionTop.maxY = atom.selectionBottom.y - optionSpacing

					atom.selectionBottom.minY = atom.selectionTop.y + optionSpacing
					atom.selectionBottom.maxY = bottom - atom.selectionBottom.height + optionSpacing
				}

				atom.positionSelectionBack(atom)

				const selectionTopId = atom.children.indexOf(atom.selectionTop)
				atom.children.splice(selectionTopId, 1)
				atom.children.push(atom.selectionTop)

				const selectionBottomId = atom.children.indexOf(atom.selectionBottom)
				atom.children.splice(selectionBottomId, 1)
				atom.children.push(atom.selectionBottom)

				if (atom.parent.isTallRectangle) {
					const operationName = atom.highlightedSlot === "padTop"? "add" : "subtract"
					atom.parent.value[operationName] = atom.value
				}

			},

			positionSelectionBack: (atom) => {
				atom.selectionBack.x = -ChannelSelectionEnd.HEIGHT
				atom.selectionBack.y = atom.selectionTop.y
				atom.selectionBack.height = atom.selectionBottom.y - atom.selectionTop.y + atom.selectionTop.height
				atom.selectionBack.width = atom.width + ChannelSelectionEnd.HEIGHT*2
			},

			update: (atom) => {

				if (atom.expanded) {
					if (atom.needsColoursUpdate) {
						atom.needsColoursUpdate = false
						atom.isGradient = true
						atom.gradient = UI.getGradientImageFromColours({
							colours: atom.colours,
							width: atom.width * UI.CT_SCALE,
							height: atom.height * UI.CT_SCALE,
							gradient: atom.gradient
						})
						atom.updateColours(atom)
					}
				}

				if (!atom.expanded && atom.needsColoursUpdate) {
					atom.needsColoursUpdate = false

					if (atom.parent.isSquare) {

						const channels = []

						for (let i = 0; i < 3; i++) {
							if (i === atom.value.channel) {
								channels[i] = atom.value
							}
							else {
								const values = [true, false, false, false, false, false, false, false, false, false]
								channels[i] = new DragonNumber({values, channel: i})
							}
						}

						const array = new DragonArray({channels})
						atom.colours = array.getSplashes()

					}
					else {

						let array = undefined

						for (let i = 0; i < 10; i++) {
							const v = atom.value.values[i]
							if (v === false) continue
							const join = DragonArray.fromSplash(`${i}${i}${i}`)
							if (array === undefined) {
								array = join
							} else {
								array.joins.push(join)
							}
						}

						atom.colours = array.getSplashes()
					}

					atom.isGradient = true
					atom.gradient = UI.getGradientImageFromColours({
						colours: atom.colours,
						width: atom.width * UI.CT_SCALE,
						height: atom.height * UI.CT_SCALE,
						gradient: atom.gradient
					})
				}

				atom.highlightedAtom = undefined
				if (UI.hand.content === atom && UI.hand.state === UI.HAND.DRAGGING) {

					const {x, y} = atom.getPosition()
					let left = x
					let top = y
					let right = x + atom.width
					let bottom = y + atom.height

					if (atom.highlight !== undefined) {
						UI.deleteChild(atom, atom.highlight)
						atom.highlight = undefined
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

								atom.highlightedSlot = slotName
								atom.highlightedAtom = slot
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

						atom.highlight = UI.createChild(atom, new Highlight(), {bottom: true})
						atom.highlight.hasBorder = true
						atom.highlight.x = ax + winningSquare.size + UI.OPTION_MARGIN + slotId*(UI.OPTION_MARGIN+winningSquare.size)
						atom.highlight.y = ay
						atom.highlight.width = UI.OPTION_MARGIN*2+winningSquare.size
						atom.highlightedAtom = winningSquare
						atom.highlightedSlot = winningSlot
					} else if (atom.highlightedAtom) {
						const {x: ax, y: ay} = atom.highlightedAtom.getPosition()

						atom.highlight = UI.createChild(atom, new Highlight(), {bottom: true})
						atom.highlight.hasBorder = true
						atom.highlight.x = ax
						atom.highlight.y = ay
						atom.highlight.width = atom.highlightedAtom.width
						atom.highlight.height = atom.highlightedAtom.height
					} else {


					}

				}

				if (atom.highlightedAtom === undefined && atom.highlight !== undefined) {
					UI.deleteChild(atom, atom.highlight)
					atom.highlight = undefined
				}



			},

			drop: (atom) => {
				if (atom.highlight !== undefined) {

					if (atom.highlightedAtom.isSquare) {
						const square = atom.highlightedAtom
						const slotId = UI.CHANNEL_IDS[atom.highlightedSlot]
						atom.value.channel = slotId

						square.receiveNumber(square, atom.value, slotId, {expanded: atom.expanded})
						UI.atomRegistry.delete(atom)
					} else {
						const diamond = atom.highlightedAtom.parent

						const operationName = atom.highlightedSlot === "padTop"? "add" : "subtract"
						diamond.value[operationName] = atom.value
						diamond.operationAtoms[atom.highlightedSlot] = atom
						atom.x = atom.highlightedAtom.x + UI.OPTION_MARGIN
						atom.y = atom.highlightedAtom.y + atom.highlightedAtom.height/2 - atom.height/2
						atom.dx = 0
						atom.dy = 0
						UI.giveChild(diamond, atom)

						atom.attached = true

					}
				} else if (atom.highlightPaddle !== undefined) {
					const paddle = atom.highlightedPaddle
					atom.attached = true
					UI.giveChild(paddle, atom)

					paddle.chance = atom
					UI.emit("paddleSizeChanged",paddle)

					atom.dx = 0
					atom.dy = 0
				}

				UI.emit("menuToolUnlock","triangle")
			},

			click: (atom) => {
				if (!atom.expanded) {
					atom.expanded = true
					atom.colourId = 0
					atom.colourTicker = Infinity
					atom.needsColoursUpdate = true
					atom.createOptions(atom)
				}
				else {
					atom.expanded = false
					atom.deleteOptions(atom)
					atom.needsColoursUpdate = true
				}
			},

			deleteOptions: (atom) => {

				if (atom.options !== undefined) {
					atom.deletedOptions = atom.options
				}

				for (const option of atom.options) {
					if (atom !== option) UI.deleteChild(atom, option)
				}
				atom.needsColoursUpdate = true
				atom.colourTicker = Infinity
				atom.positionSelection(atom)
			},

			updateColours: (atom) => {
				let parentR = undefined
				let parentG = undefined
				let parentB = undefined

				if (atom.parent.isSquare) {

					let redNumber = atom.parent.value.channels[0]
					let greenNumber = atom.parent.value.channels[1]
					let blueNumber = atom.parent.value.channels[2]

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
				const mainParentChannel = parentChannels[UI.CHANNEL_IDS[atom.channelSlot]]
				if (mainParentChannel !== undefined) mainParentChannel.values = [false, false, false, false, false, false, false, false, false, false]

				if (atom.options !== undefined && atom.options.length > 0) {
					for (let i = 0; i < 10; i++) {

						const option = atom.options[i]

						if (atom.parent.isSquare) {
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
						if (option !== atom) {
							option.needsColoursUpdateCountdown = i
							option.needsColoursUpdate = false
						}
					}
				}
			},

			getCenterId: (atom) => {
				let startId = undefined
				let endId = undefined

				for (let i = 0; i < atom.value.values.length; i++) {
					const value = atom.value.values[i]
					if (value) {
						if (startId === undefined) startId = i
						endId = i
					}
				}
				return Math.round((endId + startId) / 2)
			},

			getStartAndEndId: (atom) => {
				let startId = undefined
				let endId = undefined

				for (let i = 0; i < atom.value.values.length; i++) {
					const value = atom.value.values[i]
					if (value) {
						if (startId === undefined) startId = i
						endId = i
					}
				}
				return [startId, endId]
			},

			createOptions: (atom) => {

				const oldOptions = atom.parent.isSquare ? atom.deletedOptions : undefined
				atom.options = []

				let startId = undefined
				let endId = undefined

				for (let i = 0; i < atom.value.values.length; i++) {
					const value = atom.value.values[i]
					if (value) {
						if (startId === undefined) startId = i
						endId = i
					}
				}

				if (startId === undefined) throw new Error("[ColourTode] Number cannot be NOTHING. Please let @TodePond know if you see this error!")
				const centerOptionId = atom.getCenterId(atom)

				const optionSpacing = UI.OPTION_SPACING
				let top = (centerOptionId - 9) * optionSpacing
				let bottom = centerOptionId*optionSpacing


				const start = top + (9-startId) * optionSpacing
				const end = top + (9-endId) * optionSpacing

				for (let i = 0; i < 10; i++) {
					if (centerOptionId === 9-i) {
						if (oldOptions !== undefined) {
						}
						atom.options.push(atom)
						continue
					}

					const pityTop = i !== 9 - endId + 1
					const pityBottom = i !== 9 - startId - 1
					const option = UI.createChild(atom, new PickerChannelOption({pityTop, pityBottom}))

					if (oldOptions !== undefined) {
						option.isGradient = oldOptions[i].isGradient
						option.gradient = oldOptions[i].gradient
					}

					option.y = top + i * optionSpacing
					option.value = 9 - i
					option.needsColoursUpdateCountdown = i
					option.needsColoursUpdate = true
					atom.options.push(option)
				}


				atom.positionSelection(atom, start, end, top, bottom)

				atom.updateColours(atom)
			},
			...element,
		})
	}
}
