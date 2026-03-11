//=========================//
// PICKER CHANNEL OPTION   //
//=========================//
class PickerChannelOption extends Atom {
	constructor(element = {}) {
		super({
			draw: Rectangle.drawFn,
			overlaps: Rectangle.overlapsFn,
			offscreen: Rectangle.offscreenFn,
			height: UI.CHANNEL_HEIGHT,
			width: UI.SQUARE_SIZE,
			grab: (atom) => atom.parent,
			hasBorder: true,

			colourTicker: Infinity,
			colours: [999],
			colourId: 0,
			dcolourId: 1,
			update: (atom) => {
				if (atom.needsColoursUpdateCountdown >= 0) {
					atom.needsColoursUpdateCountdown--
					if (atom.needsColoursUpdateCountdown < 0) {
						atom.needsColoursUpdate = true
					}
				}

				if (atom.needsColoursUpdate) {
					atom.updateColours(atom)
					atom.needsColoursUpdateCountdown = -1
					atom.needsColoursUpdate = false
				}
			},

			getId: (atom) => {
				const parent = atom.parent
				const centerId = parent.getCenterId(parent)
				const offset = atom.y / UI.OPTION_SPACING
				return centerId - offset
			},

			updateColours: (atom) => {
				atom.isGradient = true
				atom.gradient = UI.getGradientImageFromColours({
					colours: atom.colours,
					width: atom.width * UI.CT_SCALE,
					height: atom.height * UI.CT_SCALE,
					gradient: atom.gradient
				})
			},

			touch: (atom) => {
				const id = atom.getId(atom)
				if (atom.parent.value.values[id]) return atom.parent
				return atom
			},

			click: (atom) => {
				const values = [false, false, false, false, false, false, false, false, false, false]
				values[atom.value] = true
				const number = new DragonNumber({values, channel: atom.parent.value.channel})
				const parent = atom.parent
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
					UI.updatePaddleSize(paddle)
				}
			},

			construct: (atom) => {
				if (atom.pityTop) {
					const topPity = UI.createChild(atom, new OptionPadding())
					topPity.y = -topPity.height
				}

				if (atom.pityBottom) {
					const bottomPity = UI.createChild(atom, new OptionPadding())
					bottomPity.y = atom.height
				}
			},
			...element,
		})
	}
}
