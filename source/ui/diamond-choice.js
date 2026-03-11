//================//
// DIAMOND CHOICE //
//================//
class DiamondChoice extends Atom {
	constructor(element = {}) {
		super({
			draw: (atom, ctx) => {
				COLOURTODE_TALL_RECTANGLE.draw(atom, ctx)
			},
			offscreen: Rectangle.offscreenFn,
			overlaps: Rectangle.overlapsFn,
			hasBorder: true,
			size: UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2,
			height: UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2,
			width: UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2,
			grab: (atom) => atom.parent,
			click: (atom) => {
				if (atom.value === atom.parent.variable) return

				atom.parent.variable = atom.value
				atom.parent.value.variable = atom.value

				atom.parent.winnerPin.x = atom.x + atom.parent.winnerPin.width/2
				atom.parent.winnerPin.colour = atom.borderColour
				atom.parent.winnerPin.borderColour = atom.borderColour

				atom.parent.updateAppearance(atom.parent)

				const diamond = atom.parent
				let topDiamond = diamond
				let top = diamond.parent
				while (!top.isSquare) {
					if (top === UI.atomRegistry.baseParent) return
					topDiamond = top
					top = top.parent
				}

				let channelNumber = 0
				if (topDiamond.channelSlot === "green") channelNumber = 1
				if (topDiamond.channelSlot === "blue") channelNumber = 2

				const topChannel = top.variableAtoms[channelNumber]
				top.receiveNumber(top, topChannel.value, channelNumber, {expanded: topChannel.expanded, numberAtom: topChannel})
			},
			...element,
		})
	}
}
