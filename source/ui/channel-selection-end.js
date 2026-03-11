//========================//
// CHANNEL SELECTION END  //
//========================//
class ChannelSelectionEnd extends Atom {
	constructor(element = {}) {
		super({
			draw: (atom, ctx) => {
				const {x, y} = atom.getPosition()

				const X = Math.round(x)
				const Y = Math.round(y)
				const W = Math.round(atom.width)
				const H = Math.round(atom.height)

				ctx.fillStyle = Colour.Grey
				ctx.fillRect(X, Y, W, H)
			},
			overlaps: Rectangle.overlapsFn,
			offscreen: Rectangle.offscreenFn,
			height: UI.OPTION_SPACING - UI.CHANNEL_HEIGHT,
			width: UI.SQUARE_SIZE + UI.OPTION_MARGIN*2,
			x: -UI.OPTION_MARGIN,
			dragOnly: true,
			grab: (atom) => atom.parent.expanded? atom : atom.parent,
			touch: (atom) => atom.parent.expanded? atom : atom.parent,
			cursor: (atom) => {
				return atom.parent.expanded? "ns-resize" : "pointer"
			},
			move: (atom) => {
				atom.parent.positionSelectionBack(atom.parent)
			},
			drop: (atom) => {
				let distanceFromMiddle = Math.round((atom.y+UI.CHANNEL_HEIGHT/2) / UI.OPTION_SPACING)

				const oldNumber = atom.parent.value

				let [startId, endId] = atom.parent.getStartAndEndId(atom.parent)
				let centerId = atom.parent.getCenterId(atom.parent)

				if (atom.isTop) {
					endId = centerId - distanceFromMiddle
				}
				if (!atom.isTop) {
					startId = centerId - (distanceFromMiddle-1)
				}

				const values = [false, false, false, false, false, false, false, false, false, false]
				for (let i = startId; i <= endId; i++) {
					values[i] = true
				}

				const number = new DragonNumber({channel: oldNumber.channel, values})
				atom.parent.value = number
				atom.parent.deleteOptions(atom.parent)
				atom.parent.createOptions(atom.parent)

				atom.dx = 0
				atom.dy = 0

				if (atom.parent.parent.isSquare) {
					const square = atom.parent.parent
					const channel = UI.CHANNEL_IDS[atom.parent.channelSlot]
					square.receiveNumber(square, number, channel)
				}

				if (atom.parent.parent.isPaddle) {
					const paddle = atom.parent.parent
					UI.updatePaddleSize(paddle)
				}
			},
			dragLockX: true,
			...element,
		})
	}

	static get HEIGHT() { return UI.OPTION_SPACING - UI.CHANNEL_HEIGHT }
}
