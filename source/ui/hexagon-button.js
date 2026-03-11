//=================//
// HEXAGON BUTTON  //
//=================//
class HexagonButton extends Atom {
	colour = Colour.Grey
	behindChildren = true

	constructor({size} = {}) {
		super()
		this.size = size
		this.construct()
	}

	draw(ctx) { drawCircle(this, ctx) }
	offscreen() { return rectangleOffscreen(this) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	grab() { return this.parent }

	construct() {
		const innerSize = this.size * 2/3
		this.inner = UI.createChild(this, new HexagonButtonInner({size: innerSize}), {bottom: false})
		this.inner.x = this.width/2 - this.inner.width/2
		this.inner.y = this.height/2 - this.inner.height/2
	}

	click() {
		if (this.inner.selected) {
			this.inner.selected = false
			this.inner.colour = Colour.Grey
		} else {
			this.inner.selected = true
			this.inner.colour = Colour.Silver
		}

		const hexagon = this.parent
		hexagon.ons[this.id] = this.inner.selected

		if (hexagon.parent.isPaddle) {
			const paddle = hexagon.parent
			UI.emit("paddleSizeChanged",paddle)
		} else if (hexagon.parent.isSquare) {
			const square = hexagon.parent
			hexagon.updateValue()
			const slotId = UI.CHANNEL_IDS[hexagon.variable]
			square.receiveNumber(hexagon.value, slotId, {expanded: hexagon.expanded, numberAtom: hexagon})
		}

		UI.atomRegistry.bringToFront(this.parent)
	}

	static get SIZE() { return UI.SQUARE_SIZE }
}
