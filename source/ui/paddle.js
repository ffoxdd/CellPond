//=========//
// PADDLE  //
//=========//
class Paddle extends Atom {
	stayAtBack = true
	attached = true
	noDampen = true
	isPaddle = true
	behindChildren = true
	colour = Colour.Grey
	dragOnly = true
	dragLockY = true
	scroll = 0
	rightTriangle = undefined
	rightDraggable = true

	constructor({size, width, height} = {}) {
		super()
		this.size = size
		this.width = width
		this.height = height
		this.construct()
	}

	draw(ctx) { drawRectangle(this, ctx) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	offscreen() { return rectangleOffscreen(this) }

	construct() {
		this.cellAtoms = []
		this.slots = []

		const handle = UI.createChild(this, new PaddleHandle({
			size: UI.PADDLE_X,
			x: -UI.PADDLE_X,
			y: UI.PADDLE_TOTAL_SIZE/2 - UI.PADDLE_X/2,
		}))
		this.handle = handle
		this.setLimits()
		this.x = this.minX
		this.expanded = false

		this.pinhole = UI.createChild(handle, new PinHole({
			size: UI.PADDLE_HANDLE_SIZE - UI.OPTION_MARGIN/2,
			x: UI.OPTION_MARGIN/2/2,
			y: UI.OPTION_MARGIN/2/2,
		}))

		this.dummyLeft = UI.createChild(this, new Slot())
		this.dummyLeft.visible = false

		this.dummyRight = UI.createChild(this, new Slot())
		this.dummyRight.visible = false

		UI.emit("paddleSizeChanged",this)
	}

	setLimits() {
		this.maxX = this.handle.width
		this.minX = this.handle.width - this.width
	}

	drop() {
		const distanceFromMax = this.maxX - this.x
		const distanceFromMin = this.x - this.minX

		if (distanceFromMax < distanceFromMin) {
			this.x = this.maxX
			this.expanded = true
			UI.emit("paddleRuleChanged",this)

			if (UI.paddles.last === this) {
				UI.emit("paddleCreate")
			}

		} else {
			this.x = this.minX
			this.expanded = false
			UI.emit("paddleRuleChanged",this)

			if (UI.paddles.last !== this) {
				UI.emit("paddleDelete", this)
			}
		}
		this.dx = 0
	}

	click() {
		const cells = UI.makeDiagramCellsFromCellAtoms(this.cellAtoms)
		const diagram = new Diagram({left: cells})
		UI.emit("brushColourChanged",diagram)
	}

	drag(x, y) {
		if (false && this.pinhole.locked) {
			const square = new ColourtodeSquare()
			UI.hand.offset.x = -square.width/2
			UI.hand.offset.y = -square.height/2
			const cells = UI.makeDiagramCellsFromCellAtoms(this.cellAtoms)
			const diagram = new Diagram({left: cells})
			diagram.normalise()

			square.value = diagram
			UI.atomRegistry.register(square)
			state.brush.colour = new Diagram({left: [new DiagramCell({content: diagram})]})
			square.update()
			return square
		}
		return this
	}

	getColour() {
		let cellAtoms = this.cellAtoms
		if (cellAtoms.length === 0) {
			const leftClone = new DragonArray({channels: [undefined, undefined, undefined]})
			return leftClone
		} else if (cellAtoms.length === 1) {
			const leftClone = DragonArray.cloneContent(cellAtoms[0].value)
			return leftClone
		}
		const cells = UI.makeDiagramCellsFromCellAtoms(cellAtoms)
		const diagram = new Diagram({left: cells})
		diagram.normalise()
		return diagram
	}

	rightDrag() {
		let cellAtoms = this.cellAtoms
		if (cellAtoms.length === 0) {
			const square = new ColourtodeSquare()
			UI.hand.offset.x = -square.width/2
			UI.hand.offset.y = -square.height/2
			const leftClone = new DragonArray({channels: [undefined, undefined, undefined]})
			UI.emit("brushColourChanged",leftClone)
			UI.atomRegistry.register(square)
			square.value = leftClone
			square.update()
			return square
		} else if (cellAtoms.length === 1) {
			const leftClone = DragonArray.cloneContent(cellAtoms[0].value)
			const square = cellAtoms[0].clone()
			UI.hand.offset.x = -square.width/2
			UI.hand.offset.y = -square.height/2
			UI.emit("brushColourChanged",leftClone)
			UI.atomRegistry.register(square)
			square.value = leftClone
			square.update()
			return square
		}
		const square = new ColourtodeSquare()
		UI.hand.offset.x = -square.width/2
		UI.hand.offset.y = -square.height/2
		const cells = UI.makeDiagramCellsFromCellAtoms(cellAtoms)
		const diagram = new Diagram({left: cells})
		diagram.normalise()

		square.value = diagram
		UI.atomRegistry.register(square)
		UI.emit("brushColourChanged",diagram)
		square.update()
		return square
	}

	static get WIDTH() { return UI.PADDLE_TOTAL_SIZE }
	static get HEIGHT() { return UI.PADDLE_TOTAL_SIZE }
	static get SIZE() { return UI.PADDLE_TOTAL_SIZE }
	static get MARGIN() { return UI.SQUARE_SIZE / 2 }
	static get Y() { return UI.SQUARE_SIZE + UI.OPTION_MARGIN + Paddle.MARGIN }
}
