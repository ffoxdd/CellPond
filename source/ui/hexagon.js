//===========//
// HEXAGON   //
//===========//
class Hexagon extends Atom {
	colour = Colour.Black
	hasBorder = true
	borderColour = Colour.Grey
	width = UI.SQUARE_SIZE
	height = UI.SQUARE_SIZE
	rightDraggable = true

	constructor() {
		super()
		this.construct()
	}

	overlaps(x, y) { return Rectangle.overlapsFn(this, x, y) }
	offscreen() { return Rectangle.offscreenFn(this) }

	draw(ctx) {
		const {x, y} = this.getPosition()
		const {width, height} = this
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

		ctx.fillStyle = this.colour
		ctx.fill(path)

		if (this.ons !== undefined) {
			for (let i = 0; i < 6; i++) {
				if (!this.ons[i]) continue
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

		if (this.hasBorder) {
			ctx.lineWidth = UI.BORDER_THICKNESS*1.5
			ctx.strokeStyle = this.borderColour
			ctx.stroke(path)

			if (this.parent.isSquare) {
				SymmetryToggleY.drawY(this, ctx, this.size - 8, 4)
			}
		}
	}

	getValue() {
		let score = 0
		for (const on of this.ons) {
			if (on) score++
		}
		return score
	}

	click() {
		if (this.expanded) {
			this.unexpand()
		} else {
			this.expand()
		}
	}

	unexpand() {
		this.expanded = false
		for (const thing of this.handles) {
			UI.deleteChild(this, thing)
		}
		for (const thing of this.buttons) {
			UI.deleteChild(this, thing)
		}
		this.handles = []
		this.buttons = []
	}

	expand() {
		this.expanded = true
		this.handles = []
		this.buttons = []

		const {width, height} = this

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
			const [tx, ty] = [x - this.width/2, y - this.height/2]
			let [sx, sy] = []
			if (i % 3 === 0) {
				;[sx, sy] = [tx * 2.2, ty * 2.2]
			} else {
				;[sx, sy] = [tx * 2, ty * 2]
			}
			return [sx + this.width/2, sy + this.height/2]
		})

		for (let i = 0; i < 6; i++) {
			const handle = UI.createChild(this, new HexagonHandle())
			handle.rotation = i
			handle.x = handlePositions[i][0] - HexagonHandle.WIDTH/2
			handle.y = handlePositions[i][1]
			this.handles.push(handle)

			const button = UI.createChild(this, new HexagonButton())
			button.x = buttonPositions[i][0] - HexagonButton.SIZE/2
			button.y = buttonPositions[i][1] - HexagonButton.SIZE/2
			this.buttons.push(button)
			button.id = i

			if (this.ons[i]) {
				button.inner.selected = true
				button.inner.colour = Colour.Silver
			}
		}
	}

	construct() {
		this.ons = [false, false, false, false, false, false]
	}

	updateValue() {
		const channel = UI.CHANNEL_IDS[this.variable]
		const addZero = !this.ons[1] && !this.ons[0] && !this.ons[5]
		const subtractZero = !this.ons[2] && !this.ons[3] && !this.ons[4]
		const bothZero = !addZero && !subtractZero
		const addValues = [addZero || bothZero, this.ons[1], this.ons[0], this.ons[5], false, false, false, false, false, false]
		const subtractValues = [subtractZero || bothZero, this.ons[2], this.ons[3], this.ons[4], false, false, false, false, false, false]
		const add = new DragonNumber({values: addValues})
		const subtract = new DragonNumber({values: subtractValues})

		const value = new DragonNumber({channel, variable: this.variable, add, subtract})
		this.value = value
	}

	hover() {
		const {x, y} = this.getPosition()
		let left = x
		let top = y
		let right = x + this.width
		let bottom = y + this.height

		for (const paddle of UI.paddles) {
			const {x: px, y: py} = paddle.getPosition()
			const pright = px + paddle.width
			const ptop = py
			const pbottom = py + paddle.height

			if (paddle.chance === undefined && paddle.expanded && left <= pright && right >= pright && ((top < pbottom && top > ptop) || (bottom > ptop && bottom < pbottom))) {
				if (this.highlightPaddle !== undefined) {
					UI.deleteChild(this, this.highlightPaddle)
				}

				this.highlight = UI.createChild(this, new Highlight(), {bottom: true})
				this.highlight.width = UI.HIGHLIGHT_THICKNESS
				this.highlight.height = paddle.height
				this.highlight.y = ptop
				this.highlight.x = pright - UI.HIGHLIGHT_THICKNESS/2
				return paddle
			}
		}
	}

	place(paddle) {
		if (paddle.isPaddle) {
			this.attached = true
			UI.giveChild(paddle, this)

			paddle.chance = this
			UI.emit("paddleSizeChanged",paddle)

			this.dx = 0
			this.dy = 0
		}
	}

	drag() {
		if (this.parent.isPaddle) {
			const paddle = this.parent
			UI.freeChild(paddle, this)
			paddle.chance = undefined
			UI.emit("paddleSizeChanged",paddle)
		} else if (this.parent.isSquare) {
			const square = this.parent
			square[this.variable] = undefined
			const channelId = UI.CHANNEL_IDS[this.variable]
			square.receiveNumber(undefined, channelId)
			UI.freeChild(square, this)
			this.attached = false
		}

		return this
	}

	rightDrag() {
		const clone = this.clone()
		UI.atomRegistry.register(clone)
		UI.hand.offset.x -= this.x - clone.x
		UI.hand.offset.y -= this.y - clone.y
		return clone
	}

	clone() {
		const clone = new Hexagon()
		for (let i = 0; i < 6; i++) {
			clone.ons[i] = this.ons[i]
		}
		if (this.expanded) {
			clone.expand()
		}
		const {x, y} = this.getPosition()
		clone.x = x
		clone.y = y
		return clone
	}
}
