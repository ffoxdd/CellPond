//===========//
// HEXAGON   //
//===========//
class Hexagon extends Atom {
	constructor(element = {}) {
		super({
			colour: Colour.Black,
			hasBorder: true,
			borderColour: Colour.Grey,
			width: UI.SQUARE_SIZE,
			height: UI.SQUARE_SIZE,
			overlaps: Rectangle.overlapsFn,
			offscreen: Rectangle.offscreenFn,
			draw: (atom, ctx) => {
				const {x, y} = atom.getPosition()
				const {width, height} = atom
				let points = [
					[x + width*UI.MINUS_MAGIC_NUMBER*2, y],
					[x + width*(UI.MAGIC_NUMBER-UI.MINUS_MAGIC_NUMBER), y],
					[x + width, y + height*UI.MAGIC_NUMBER/2],
					[x + width*(UI.MAGIC_NUMBER-UI.MINUS_MAGIC_NUMBER), y + height*UI.MAGIC_NUMBER],
					[x + width*UI.MINUS_MAGIC_NUMBER*2, y + height*UI.MAGIC_NUMBER],
					[x, y + height*UI.MAGIC_NUMBER/2],
				]

				points = points.map(([x, y]) => [x, y + UI.MINUS_MAGIC_NUMBER/2*height])

				const extraSegmentCorners = []
				for (let i = 0; i < 6; i++) {
					const nextId = wrap(i+1, 0, 5)
					const point = points[i]
					const next = points[nextId]
					const mid = [0, 1].map(axis => (point[axis] + next[axis])/2)
					extraSegmentCorners.push(mid)
				}

				const center = [x+width/2, y+height/2]
				const segmentPoints = points.map((p, i) => {
					const offset = 1
					const id = wrap(i+offset, 0, 5)
					const point = points[wrap(i+offset+1, 0, 5)]
					const nextId = wrap(i+offset+1, 0, 5)
					const nextMid = extraSegmentCorners[nextId]
					const mid = extraSegmentCorners[id]
					return [center, mid, point, nextMid]
				})

				const [head, ...tail] = points

				const path = new Path2D()
				path.moveTo(...head)
				for (const point of tail) {
					path.lineTo(...point)
				}
				path.closePath()

				ctx.fillStyle = atom.colour
				ctx.fill(path)

				if (atom.ons !== undefined) {
					for (let i = 0; i < 6; i++) {
						if (!atom.ons[i]) continue
						const [shead, ...stail] = segmentPoints[i]
						const spath = new Path2D()
						spath.moveTo(...shead)
						for (const point of stail) {
							spath.lineTo(...point)
						}
						spath.closePath()
						ctx.fillStyle = Colour.Silver
						ctx.fill(spath)
						ctx.lineWidth = 1 / UI.CT_SCALE
						ctx.strokeStyle = Colour.Silver
						ctx.stroke(spath)
					}
				}

				if (atom.hasBorder) {
					ctx.lineWidth = UI.BORDER_THICKNESS*1.5
					ctx.strokeStyle = atom.borderColour
					ctx.stroke(path)

					if (atom.parent.isSquare) {
						SymmetryToggleY.drawY(atom, ctx, atom.size - 8, 4)
					}
				}
			},
			getValue: (atom) => {
				let score = 0
				for (const on of atom.ons) {
					if (on) score++
				}
				return score
			},
			click: (atom) => {
				if (atom.expanded) {
					atom.unexpand(atom)
				} else {
					atom.expand(atom)
				}
			},
			unexpand: (atom) => {
				atom.expanded = false
				for (const thing of atom.handles) {
					UI.deleteChild(atom, thing)
				}
				for (const thing of atom.buttons) {
					UI.deleteChild(atom, thing)
				}

				atom.handles = []
				atom.buttons = []
			},
			expand: (atom) => {
				atom.expanded = true
				atom.handles = []
				atom.buttons = []


				const {width, height} = atom

				const edge = width*UI.MINUS_MAGIC_NUMBER*1.67
				const handlePositions = [
					[width, height/2 - HexagonHandle.HEIGHT/2],
					[width - edge, height  - HexagonHandle.HEIGHT/2],
					[edge, height  - HexagonHandle.HEIGHT/2],
					[0, height/2  - HexagonHandle.HEIGHT/2],
					[edge, 0 - HexagonHandle.HEIGHT/2],
					[width - edge, 0 - HexagonHandle.HEIGHT/2],
				]

				let buttonPositions = [
					[width, height/2],
					[width - edge, height],
					[edge, height],
					[0, height/2],
					[edge, 0],
					[width - edge, 0],
				]

				buttonPositions = buttonPositions.map(([x, y], i) => {
					const [tx, ty] = [x - atom.width/2, y - atom.height/2]
					let [sx, sy] = []
					if (i % 3 === 0) {
						;[sx, sy] = [tx * 2.2, ty * 2.2]
					} else {
						;[sx, sy] = [tx * 2, ty * 2]
					}
					return [sx + atom.width/2, sy + atom.height/2]
				})

				for (let i = 0; i < 6; i++) {
					const handle = UI.createChild(atom, new HexagonHandle())
					handle.rotation = i
					handle.x = handlePositions[i][0] - HexagonHandle.WIDTH/2
					handle.y = handlePositions[i][1]
					atom.handles.push(handle)

					const button = UI.createChild(atom, new HexagonButton())
					button.x = buttonPositions[i][0] - HexagonButton.SIZE/2
					button.y = buttonPositions[i][1] - HexagonButton.SIZE/2
					atom.buttons.push(button)
					button.id = i

					if (atom.ons[i]) {
						button.inner.selected = true
						button.inner.colour = Colour.Silver
					}

				}
			},
			construct: (atom) => {
				atom.ons = [false, false, false, false, false, false]
			},
			updateValue: (atom) => {
				const channel = UI.CHANNEL_IDS[atom.variable]
				const addZero = !atom.ons[1] && !atom.ons[0] && !atom.ons[5]
				const subtractZero = !atom.ons[2] && !atom.ons[3] && !atom.ons[4]
				const bothZero = !addZero && !subtractZero
				const addValues = [addZero || bothZero, atom.ons[1], atom.ons[0], atom.ons[5], false, false, false, false, false, false]
				const subtractValues = [subtractZero || bothZero, atom.ons[2], atom.ons[3], atom.ons[4], false, false, false, false, false, false]
				const add = new DragonNumber({values: addValues})
				const subtract = new DragonNumber({values: subtractValues})

				const value = new DragonNumber({channel, variable: atom.variable, add, subtract})
				atom.value = value
			},
			hover: (atom) => {

				const {x, y} = atom.getPosition()
				let left = x
				let top = y
				let right = x + atom.width
				let bottom = y + atom.height

				for (const paddle of UI.paddles) {
					const {x: px, y: py} = paddle.getPosition()
					const pright = px + paddle.width
					const ptop = py
					const pbottom = py + paddle.height

					if (paddle.chance === undefined && paddle.expanded && left <= pright && right >= pright && ((top < pbottom && top > ptop) || (bottom > ptop && bottom < pbottom))) {
						if (atom.highlightPaddle !== undefined) {
							UI.deleteChild(atom, atom.highlightPaddle)
						}

						atom.highlight = UI.createChild(atom, new Highlight(), {bottom: true})
						atom.highlight.width = UI.HIGHLIGHT_THICKNESS
						atom.highlight.height = paddle.height
						atom.highlight.y = ptop
						atom.highlight.x = pright - UI.HIGHLIGHT_THICKNESS/2
						return paddle
					}
				}

			},
			place: (atom, paddle) => {
				if (paddle.isPaddle) {
					atom.attached = true
					UI.giveChild(paddle, atom)

					paddle.chance = atom
					UI.updatePaddleSize(paddle)

					atom.dx = 0
					atom.dy = 0
				}
			},
			drag: (atom) => {
				if (atom.parent.isPaddle) {
					const paddle = atom.parent
					UI.freeChild(paddle, atom)
					paddle.chance = undefined
					UI.updatePaddleSize(paddle)
				} else if (atom.parent.isSquare) {
					const square = atom.parent
					square[atom.variable] = undefined
					const channelId = UI.CHANNEL_IDS[atom.variable]
					square.receiveNumber(square, undefined, channelId)
					UI.freeChild(square, atom)
					atom.attached = false
				}

				return atom
			},
			rightDraggable: true,
			rightDrag: (atom) => {
				const clone = atom.clone(atom)
				UI.atomRegistry.register(clone)
				UI.hand.offset.x -= atom.x - clone.x
				UI.hand.offset.y -= atom.y - clone.y
				return clone
			},
			clone: (atom) => {
				const clone = new Hexagon()
				for (let i = 0; i < 6; i++) {
					clone.ons[i] = atom.ons[i]
				}
				if (atom.expanded) {
					clone.expand(clone)
				}
				const {x, y} = atom.getPosition()
				clone.x = x
				clone.y = y
				return clone
			},
			...element,
		})
	}
}
