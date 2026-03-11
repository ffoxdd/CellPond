//====================//
// COLOURTODE TOOL    //
//====================//
class ColourtodeTool extends Atom {
	constructor(element = {}) {
		super({
			element: new ColourtodeSquare(),
			...element,
		})
	}

	draw(atom, ctx) {
		if ((this.previousBrushColour !== state.brush.colour) || this.toolbarNeedsColourUpdate) {
			this.update(this)
		}
		if (this.unlocked) {
			this.element.draw(this, ctx)
		}
	}

	overlaps(atom, x, y) { return this.element.overlaps(this, x, y) }
	grab(atom) { return this }
	cursor() { return "move" }

	drag(atom) {
		if (this === UI.squareTool) {
			const newAtom = UI.makeSquareFromValue(this.value)
			UI.atomRegistry.register(newAtom)
			return newAtom
		}

		const newAtom = new Atom({...this.element, x: this.x, y: this.y})
		UI.atomRegistry.register(newAtom)

		return newAtom
	}
}
