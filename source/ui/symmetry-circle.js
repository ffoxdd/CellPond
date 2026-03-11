//==================//
// SYMMETRY CIRCLE  //
//==================//
class SymmetryCircle extends Atom {
	constructor(element = {}) {
		super({
			hasBorder: true,
			draw: (atom, ctx) => {
				Circle.drawFn(atom, ctx)
				if (atom.value === undefined) return
				const [x, y, r] = getRGB(atom.value)
				if (x > 0) SymmetryToggleX.drawX(atom, ctx)
				if (y > 0) SymmetryToggleY.drawY(atom, ctx)
				if (r > 0) SymmetryToggleR.drawR(atom, ctx)
			},
			offscreen: Rectangle.offscreenFn,
			overlaps: Rectangle.overlapsFn,
			expanded: false,
			borderColour: Colour.Grey,
			colour: Colour.Black,
			value: 0,
			click: (atom) => {
				if (atom.expanded) {
					atom.unexpand(atom)
				} else {
					atom.expand(atom)
				}
			},

			expand: (atom) => {
				atom.pad = UI.createChild(atom, new SymmetryPad())
				atom.handle = UI.createChild(atom, new SymmetryHandle())
				atom.handle.width += UI.OPTION_MARGIN
				atom.expanded = true

				const [x, y, r] = getRGB(atom.value)
				atom.xToggle = UI.createChild(atom, new SymmetryToggleX())
				atom.yToggle = UI.createChild(atom, new SymmetryToggleY())
				atom.rToggle = UI.createChild(atom, new SymmetryToggleR())

				if (x > 0) atom.xToggle.value = true
				if (y > 0) atom.yToggle.value = true
				if (r > 0) atom.rToggle.value = true
			},

			unexpand: (atom) => {
				UI.deleteChild(atom, atom.pad)
				UI.deleteChild(atom, atom.handle)
				UI.deleteChild(atom, atom.xToggle)
				UI.deleteChild(atom, atom.yToggle)
				UI.deleteChild(atom, atom.rToggle)
				atom.expanded = false
			},

			size: UI.SQUARE_SIZE,
			update: (atom) => {
				const {x, y} = atom.getPosition()

				const id = UI.atomRegistry.atoms.indexOf(atom)
				const left = x
				const top = y
				const right = x + atom.width
				const bottom = y + atom.height

				if (UI.hand.content === atom) for (const paddle of UI.paddles) {
					const pid = UI.atomRegistry.atoms.indexOf(paddle)
					const {x: px, y: py} = paddle.getPosition()
					const pright = px + paddle.width
					const ptop = py
					const pbottom = py + paddle.height

					if (!paddle.hasSymmetry && paddle.expanded && id > pid && left <= pright && right >= pright && ((top < pbottom && top > ptop) || (bottom > ptop && bottom < pbottom))) {
						if (atom.highlightPaddle !== undefined) {
							UI.deleteChild(atom, atom.highlightPaddle)
						}

						atom.highlightPaddle = UI.createChild(atom, new Highlight(), {bottom: true})
						atom.highlightPaddle.width = UI.BORDER_THICKNESS
						atom.highlightPaddle.height = paddle.height
						atom.highlightPaddle.y = ptop
						atom.highlightPaddle.x = pright - UI.BORDER_THICKNESS/2
						atom.highlightedPaddle = paddle
						return
					}
				}

				if (atom.highlightPaddle !== undefined) {
					UI.deleteChild(atom, atom.highlightPaddle)
					atom.highlightPaddle = undefined
					atom.highlightedPaddle = undefined
				}
			},
			drop: (atom) => {
				if (!atom.attached) {
					if (atom.highlightedPaddle !== undefined) {
						const paddle = atom.highlightedPaddle
						atom.attached = true
						UI.giveChild(paddle, atom)

						paddle.hasSymmetry = true
						paddle.symmetryCircle = atom
						UI.updatePaddleSize(paddle)

						atom.dx = 0
						atom.dy = 0
					}
				}
			},

			drag: (atom) => {
				if (atom.attached) {
					const paddle = atom.parent

					atom.attached = false
					UI.freeChild(paddle, atom)
					paddle.hasSymmetry = false
					paddle.symmetryCircle = undefined
					UI.updatePaddleSize(paddle)
				}

				return atom
			},

			rightDraggable: true,
			rightDrag: (atom) => {
				const clone = new SymmetryCircle()
				clone.value = atom.value
				const {x, y} = atom.getPosition()
				UI.hand.offset.x -= atom.x - x
				UI.hand.offset.y -= atom.y - y
				clone.x = x
				clone.y = y
				UI.atomRegistry.register(clone)
				return clone
			},
			...element,
		})
	}

	static get SIZE() { return UI.SQUARE_SIZE }
}
