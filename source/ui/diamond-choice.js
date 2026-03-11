//================//
// DIAMOND CHOICE //
//================//
class DiamondChoice extends Atom {
	hasBorder = true
	size = UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2
	height = UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2
	width = UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2

	draw(ctx) { drawDiamond(this, ctx) }
	offscreen() { return rectangleOffscreen(this) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	grab() { return this.parent }

	click() {
		if (this.value === this.parent.variable) return

		this.parent.variable = this.value
		this.parent.value.variable = this.value

		this.parent.winnerPin.x = this.x + this.parent.winnerPin.width/2
		this.parent.winnerPin.colour = this.borderColour
		this.parent.winnerPin.borderColour = this.borderColour

		this.parent.updateAppearance()

		const diamond = this.parent
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
		top.receiveNumber(topChannel.value, channelNumber, {expanded: topChannel.expanded, numberAtom: topChannel})
	}
}
