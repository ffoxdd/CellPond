//=========//
// PADDLE  //
//=========//
class Paddle extends Atom {
	constructor(element = {}) {
		super({
			stayAtBack: true,
			attached: true,
			noDampen: true,
			isPaddle: true,
			behindChildren: true,
			draw: Rectangle.drawFn,
			overlaps: Rectangle.overlapsFn,
			offscreen: Rectangle.offscreenFn,
			colour: Colour.Grey,
			size: UI.PADDLE_TOTAL_SIZE, //for legacy
			width: UI.PADDLE_TOTAL_SIZE,
			height: UI.PADDLE_TOTAL_SIZE,
			dragOnly: true,
			dragLockY: true,
			scroll: 0,
			rightTriangle: undefined,
			x: Math.round(Paddle.MARGIN), //needed for handle creation
			y: UI.SQUARE_SIZE + UI.OPTION_MARGIN + Paddle.MARGIN,
			construct: (paddle) => {

				paddle.cellAtoms = []
				paddle.slots = []

				const handle = UI.createChild(paddle, new PaddleHandle())
				paddle.handle = handle
				paddle.setLimits(paddle)
				paddle.x = paddle.minX
				paddle.expanded = false

				paddle.pinhole = UI.createChild(handle, new PinHole())

				paddle.dummyLeft = UI.createChild(paddle, new Slot())
				paddle.dummyLeft.visible = false

				paddle.dummyRight = UI.createChild(paddle, new Slot())
				paddle.dummyRight.visible = false

				UI.emit("paddleSizeChanged",paddle)

			},

			setLimits: (paddle) => {
				paddle.maxX = paddle.handle.width
				paddle.minX = paddle.handle.width - paddle.width
			},

			drop: (paddle) => {

				const distanceFromMax = paddle.maxX - paddle.x
				const distanceFromMin = paddle.x - paddle.minX

				if (distanceFromMax < distanceFromMin) {
					paddle.x = paddle.maxX
					paddle.expanded = true
					UI.emit("paddleRuleChanged",paddle)

					if (UI.paddles.last === paddle) {
						UI.emit("paddleCreate")
					}

				} else {
					paddle.x = paddle.minX
					paddle.expanded = false
					UI.emit("paddleRuleChanged",paddle)

					if (UI.paddles.last !== paddle) {
						UI.emit("paddleDelete", paddle)
					}
				}
				paddle.dx = 0
			},

			click: (paddle) => {
				const cells = UI.makeDiagramCellsFromCellAtoms(paddle.cellAtoms)
				const diagram = new Diagram({left: cells})
				UI.emit("brushColourChanged",diagram)
			},

			drag: (paddle, x, y) => {
				if (false && paddle.pinhole.locked) {
					const square = new ColourtodeSquare()
					UI.hand.offset.x = -square.width/2
					UI.hand.offset.y = -square.height/2
					const cells = UI.makeDiagramCellsFromCellAtoms(paddle.cellAtoms)
					const diagram = new Diagram({left: cells})
					diagram.normalise()

					square.value = diagram
					UI.atomRegistry.register(square)
					state.brush.colour = new Diagram({left: [new DiagramCell({content: diagram})]})
					square.update(square)
					return square
				}
				return paddle
			},

			rightDraggable: true,
			getColour: (paddle) => {
				let cellAtoms = paddle.cellAtoms
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
			},
			rightDrag: (paddle) => {
				let cellAtoms = paddle.cellAtoms
				if (cellAtoms.length === 0) {

					const square = new ColourtodeSquare()
					UI.hand.offset.x = -square.width/2
					UI.hand.offset.y = -square.height/2
					const leftClone = new DragonArray({channels: [undefined, undefined, undefined]})
					UI.emit("brushColourChanged",leftClone)
					UI.atomRegistry.register(square)
					square.value = leftClone
					square.update(square)
					return square

				} else if (cellAtoms.length === 1) {
					const leftClone = DragonArray.cloneContent(cellAtoms[0].value)
					const square = cellAtoms[0].clone(cellAtoms[0])
					UI.hand.offset.x = -square.width/2
					UI.hand.offset.y = -square.height/2
					UI.emit("brushColourChanged",leftClone)
					UI.atomRegistry.register(square)
					square.value = leftClone
					square.update(square)
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
				square.update(square)
				return square
			},
			...element,
		})
	}

	static get WIDTH() { return UI.PADDLE_TOTAL_SIZE }
	static get HEIGHT() { return UI.PADDLE_TOTAL_SIZE }
	static get SIZE() { return UI.PADDLE_TOTAL_SIZE }
	static get MARGIN() { return UI.SQUARE_SIZE / 2 }
	static get Y() { return UI.SQUARE_SIZE + UI.OPTION_MARGIN + Paddle.MARGIN }
}
