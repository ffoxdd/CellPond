//====================//
// COLOURTODE TOOL    //
//====================//
class ColourtodeTool extends Atom {
	element = new ColourtodeSquare()

	draw(ctx) {
		if ((this.previousBrushColour !== state.brush.colour) || this.toolbarNeedsColourUpdate) {
			this.update()
		}
		if (this.unlocked) {
			this.element.draw(ctx)
		}
	}

	overlaps(x, y) { return this.element.overlaps(x, y) }
	grab() { return this }
	cursor() { return "move" }

	drag() {
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
