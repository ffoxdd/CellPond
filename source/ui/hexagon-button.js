//=================//
// HEXAGON BUTTON  //
//=================//
class HexagonButton extends Atom {
	constructor(element = {}) {
		super({
			size: UI.SQUARE_SIZE,
			offscreen: Rectangle.offscreenFn,
			overlaps: Rectangle.overlapsFn,
			colour: Colour.Grey,
			grab: (atom) => atom.parent,
			behindChildren: true,
			draw: (atom, ctx) => {
				Circle.drawFn(atom, ctx)
			},
			construct: (atom) => {
				atom.inner = UI.createChild(atom, new HexagonButtonInner(), {bottom: false})
				atom.inner.x = atom.width/2 - atom.inner.width/2
				atom.inner.y = atom.height/2 - atom.inner.height/2
			},
			click: (atom) => {
				if (atom.inner.selected) {
					atom.inner.selected = false
					atom.inner.colour = Colour.Grey
				} else {
					atom.inner.selected = true
					atom.inner.colour = Colour.Silver
				}

				const hexagon = atom.parent
				hexagon.ons[atom.id] = atom.inner.selected

				if (hexagon.parent.isPaddle) {
					const paddle = hexagon.parent
					UI.updatePaddleSize(paddle)
				} else if (hexagon.parent.isSquare) {
					const square = hexagon.parent
					hexagon.updateValue(hexagon)
					const slotId = UI.CHANNEL_IDS[hexagon.variable]
					square.receiveNumber(square, hexagon.value, slotId, {expanded: hexagon.expanded, numberAtom: hexagon})
				}

				UI.atomRegistry.bringToFront(atom.parent)
			},
			...element,
		})
	}

	static get SIZE() { return UI.SQUARE_SIZE }
}
