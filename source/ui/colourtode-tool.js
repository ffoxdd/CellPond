//====================//
// COLOURTODE TOOL    //
//====================//
class ColourtodeTool extends Atom {
	constructor(element = {}) {
		const defaults = {
			element: new ColourtodeSquare(),
			draw: (atom, ctx) => {
				if ((atom.previousBrushColour !== state.brush.colour) || atom.toolbarNeedsColourUpdate) {
					atom.update(atom)
				}
				if (atom.unlocked) {
					atom.element.draw(atom, ctx)
				}
			},
			overlaps: (atom, x, y) => atom.element.overlaps(atom, x, y),
			grab: (atom, x, y) => {
				return atom
			},
			drag: (atom) => {

				if (atom === UI.squareTool) {
					const newAtom = UI.makeSquareFromValue(atom.value)
					UI.atomRegistry.register(newAtom)
					return newAtom
				}

				const newAtom = new Atom({...atom.element, x: atom.x, y: atom.y})
				UI.atomRegistry.register(newAtom)

				if (newAtom.value !== undefined) {

				}

				return newAtom
			},
			cursor: () => "move",
		}

		super({ ...defaults, ...element })
	}
}
