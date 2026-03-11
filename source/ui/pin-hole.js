//==========//
// PIN HOLE //
//==========//
class PinHole extends Atom {
	constructor(element = {}) {
		super({
			isPinhole: true,
			attached: true,
			locked: false,
			borderScale: 1/2,
			borderColour: Colour.Black,
			draw: (atom, ctx) => {
				return
				if (atom.locked) {
					atom.hasBorder = true
					atom.colour = Colour.Grey
				}
				else {
					atom.hasBorder = false
					atom.colour = Colour.Black
				}
				Circle.drawFn(atom, ctx)
			},
			overlaps: Rectangle.overlapsFn,
			offscreen: Rectangle.offscreenFn,
			colour: Colour.Black,
			size: UI.PADDLE_HANDLE_SIZE - UI.OPTION_MARGIN/2,
			y: UI.OPTION_MARGIN/2/2,
			x: UI.OPTION_MARGIN/2/2,
			click: (atom) => {
				return
				const handle = atom.parent
				const paddle = handle.parent
				if (atom.locked) {
					atom.locked = false
					paddle.grabbable = true
					handle.draggable = true
					paddle.draggable = true
					atom.draggable = true
					UI.emit("paddleRuleChanged",paddle)
				}

				else {
					atom.locked = true
					handle.draggable = false
					atom.draggable = false

					for (const cellAtom of paddle.cellAtoms) {
						if (cellAtom.expanded) {
							cellAtom.unexpand(cellAtom)
						}
						if (cellAtom.slotted !== undefined) {
							const slotted = cellAtom.slotted
							if (slotted.expanded) {
								slotted.unexpand(slotted)
							}
						}
						if (cellAtom.joins.length > 0 && cellAtom.joinExpanded) {
							cellAtom.joinUnepxand(cellAtom)
						}
					}

					if (paddle.cellAtoms.length === 0) {
						paddle.grabbable = false
						paddle.draggable = false
					}
					UI.emit("paddleRuleChanged",paddle)
				}
			},
			grab: (atom) => atom.parent.parent,
			...element,
		})
	}
}
