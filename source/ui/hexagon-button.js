//=================//
// HEXAGON BUTTON  //
//=================//
class HexagonButton extends Atom {
	size = UI.SQUARE_SIZE
	colour = Colour.Grey
	behindChildren = true

	constructor() {
		super()
		this.construct()
	}

	draw(ctx) { Circle.drawFn(this, ctx) }
	offscreen() { return Rectangle.offscreenFn(this) }
	overlaps(x, y) { return Rectangle.overlapsFn(this, x, y) }
	grab() { return this.parent }

	construct() {
		this.inner = UI.createChild(this, new HexagonButtonInner(), {bottom: false})
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
