//=================//
// HEXAGON BUTTON  //
//=================//
class HexagonButton extends Atom {
	size = UI.SQUARE_SIZE
	colour = Colour.Grey
	behindChildren = true

	constructor() {
		super()
		this.construct(this)
	}

	draw(atom, ctx) { Circle.drawFn(this, ctx) }
	offscreen(atom) { return Rectangle.offscreenFn(this) }
	overlaps(atom, x, y) { return Rectangle.overlapsFn(this, x, y) }
	grab(atom) { return this.parent }

	construct(atom) {
		this.inner = UI.createChild(this, new HexagonButtonInner(), {bottom: false})
		this.inner.x = this.width/2 - this.inner.width/2
		this.inner.y = this.height/2 - this.inner.height/2
	}

	click(atom) {
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
			hexagon.updateValue(hexagon)
			const slotId = UI.CHANNEL_IDS[hexagon.variable]
			square.receiveNumber(square, hexagon.value, slotId, {expanded: hexagon.expanded, numberAtom: hexagon})
		}

		UI.atomRegistry.bringToFront(this.parent)
	}

	static get SIZE() { return UI.SQUARE_SIZE }
}
