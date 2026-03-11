//====================//
// COLOURTODE TOOL    //
//====================//
class ColourtodeTool extends Atom {
	constructor({width, height, size, x, y, element} = {}) {
		super()
		this.width = width
		this.height = height
		this.size = size
		this.x = x
		this.y = y
		this.element = element
	}

	draw(ctx) {
		if ((this.previousBrushColour !== state.brush.colour) || this.toolbarNeedsColourUpdate) {
			this.update()
		}
		if (this.unlocked) {
			this.element.draw.call(this, ctx)
		}
	}

	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	grab() { return this }
	cursor() { return "move" }

	drag() {
		if (this === UI.squareTool) {
			const newAtom = UI.makeSquareFromValue(this.value)
			UI.atomRegistry.register(newAtom)
			return newAtom
		}

		const ElementClass = this.element.constructor
		const newAtom = new ElementClass()
		newAtom.x = this.x
		newAtom.y = this.y
		UI.atomRegistry.register(newAtom)

		return newAtom
	}
}
