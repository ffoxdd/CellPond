//===================//
// COLOURTODE - HAND //
//===================//
const hand = {
	state: undefined,
	content: undefined,
	offset: {x: 0, y: 0},
	velocity: {x: 0, y: 0},
	velocityHistory: [],
	velocityMemory: 5,
	previous: {x: 0, y: 0},
}

const DRAG_PITY = 15
const DRAG_PITY_TIME = 100
const DRAG_UNPITY_SPEED = 10

const HAND = {}
HAND_RELEASE = 0.5

HAND.FREE = {
	cursor: "auto",

	mousemove: (e) => {
		const x = e.clientX / UI.CT_SCALE
		const y = e.clientY / UI.CT_SCALE
		const atom = UI.atomRegistry.getAt(x, y)
		if (atom !== undefined) {
			if (atom.grabbable) {
				if (!Mouse.Left) {
					if (atom.cursor !== undefined) changeHandState(HAND.HOVER, atom.cursor())
					else if (atom.dragOnly) changeHandState(HAND.HOVER, "move")
					else changeHandState(HAND.HOVER)
				}
				else {
					if (atom.grabbable && atom.draggable) {
						grabAtom(atom, x, y)
						hand.pityStartX = e.clientX
						hand.pityStartY = e.clientY
						hand.pityStartT = Date.now()
						changeHandState(HAND.TOUCHING)
						HAND.TOUCHING.mousemove(e)
					}
				}
			}
			return
		}

		let [mx, my] = Mouse.position
		mx *= UI.DPR
		my *= UI.DPR

		if (mx < UI.state.view.left || mx > UI.state.view.right || my < UI.state.view.top || my > UI.state.view.bottom) {
			return
		}
		if (Mouse.Left) changeHandState(HAND.BRUSHING)
		else if (Mouse.Middle) changeHandState(HAND.PENCILLING)
		else changeHandState(HAND.BRUSH)
	},

	mousedown: (e) => {
		if (!UI.state.worldBuilt) return
		hand.voidingStart = [e.clientX, e.clientY]
		changeHandState(HAND.VOIDING)
	},

	atommove: (atom, mx, my) => {
		if (!atom.grabbable) return
		if (!atom.hitTest(mx, my)) return
		if (Mouse.Left) {
			grabAtom(atom, mx, my)
			changeHandState(HAND.DRAGGING)
			hand.content = hand.content.drag(mx, my)
			return
		}
		if (atom.cursor !== undefined) changeHandState(HAND.HOVER, atom.cursor())
		else if (atom.dragOnly) changeHandState(HAND.HOVER, "move")
		else changeHandState(HAND.HOVER)
	},
	camerapan: () => {
		let [x, y] = Mouse.position
		x *= UI.DPR
		y *= UI.DPR
		if (x >= UI.state.view.left && x <= UI.state.view.right && y >= UI.state.view.top && y <= UI.state.view.bottom) {
			changeHandState(HAND.BRUSH)
			return
		}
	},
}

let voidingType = true
HAND.VOIDING = {
	cursor: "auto",
	mousemove: (e) => {
		const start = hand.voidingStart
		const [sx, sy] = start
		const displacement = [e.clientX - sx, e.clientY - sy]
		const distance = Math.hypot(...displacement)
		if (distance > 10) {
			changeHandState(HAND.FREE)
			HAND.FREE.mousemove(e)
		}
	},
	mouseup: (e) => {
		const oldWorldSize = WORLD_SIZE
		setWorldSize(0)
		if (voidingType) {
			UI.brush(0.5, 0.5)
		} else {
			const oldBrushColour = UI.state.brush.colour
			UI.state.brush.colour = oldWorldSize * 111
			UI.brush(0.5, 0.5)
			UI.state.brush.colour = oldBrushColour
			UI.state.worldBuilt = false
			UI.show.paused = false
			UI.canvas.style["background-color"] = Colour.Void
		}
		voidingType = !voidingType
		setWorldSize(oldWorldSize)
		changeHandState(HAND.FREE)
	},
}

HAND.BRUSH = {
	cursor: "crosshair",
	mousemove: (e) => {
		const x = e.clientX / UI.CT_SCALE
		const y = e.clientY / UI.CT_SCALE
		const atom = UI.atomRegistry.getAt(x, y)
		if (atom !== undefined) {
			if (atom.grabbable) {
				if (atom.cursor !== undefined) changeHandState(HAND.HOVER, atom.cursor())
				else if (atom.dragOnly) changeHandState(HAND.HOVER, "move")
				else changeHandState(HAND.HOVER)
			}
			else changeHandState(HAND.FREE)
			return
		}
		const mx = e.clientX * UI.DPR
		const my = e.clientY * UI.DPR
		if (mx >= UI.state.view.left && mx <= UI.state.view.right && my >= UI.state.view.top && my <= UI.state.view.bottom) {
			return
		}
		changeHandState(HAND.FREE)
	},
	mousedown: (e) => {
		changeHandState(HAND.BRUSHING)
	},
	middlemousedown: (e) => {
		changeHandState(HAND.PENCILLING)
	},
	atommove: (atom, mx, my) => {
		if (!atom.hitTest(mx, my)) return
		if (atom.grabbable) changeHandState(HAND.HOVER)
		else changeHandState(HAND.FREE)
	},
	camerapan: () => {
		let [x, y] = Mouse.position
		x *= UI.DPR
		y *= UI.DPR
		if (x >= UI.state.view.left && x <= UI.state.view.right && y >= UI.state.view.top && y <= UI.state.view.bottom) {
			return
		}
		changeHandState(HAND.FREE)
	},
}

HAND.BRUSHING = {
	cursor: "crosshair",
	mousemove: (e) => {
		const x = e.clientX * UI.DPR
		const y = e.clientY * UI.DPR
		if (x >= UI.state.view.left && x <= UI.state.view.right && y >= UI.state.view.top && y <= UI.state.view.bottom) {
			return
		}
		changeHandState(HAND.FREE)
	},
	mouseup: (e) => {
		changeHandState(HAND.BRUSH)
	},
	camerapan: () => {
		let [mx, my] = Mouse.position
		mx *= UI.DPR
		my *= UI.DPR
		if (mx >= UI.state.view.left && mx <= UI.state.view.right && my >= UI.state.view.top && my <= UI.state.view.bottom) {
			return
		}
		const [x, y] = Mouse.position.map(n => n / UI.CT_SCALE)
		const atom = UI.atomRegistry.getAt(x, y)
		if (atom !== undefined) {
			if (atom.grabbable) {
				if (atom.cursor !== undefined) changeHandState(HAND.HOVER, atom.cursor())
				else if (atom.dragOnly) changeHandState(HAND.HOVER, "move")
				else changeHandState(HAND.HOVER)
			}
			else changeHandState(HAND.FREE)
			return
		}
		changeHandState(HAND.FREE)
	},
}

HAND.PENCILLING = {
	cursor: "crosshair",
	mousemove: HAND.BRUSHING.mousemove,
	middlemouseup: HAND.BRUSHING.mouseup,
	camerapan: HAND.BRUSHING.camerapan,
}

HAND.HOVER = {
	cursor: "pointer",

	mousedown: (e) => {

		const atom = UI.atomRegistry.getAt(e.clientX / UI.CT_SCALE, e.clientY / UI.CT_SCALE)
		if (atom === undefined) return
		if (!atom.grabbable) return
		grabAtom(atom, e.clientX / UI.CT_SCALE, e.clientY / UI.CT_SCALE)

		if (atom.dragOnly) {

			hand.pityStartX = e.clientX
			hand.pityStartY = e.clientY
			hand.pityStartT = Date.now()
			hand.hasStartedDragging = false
			hand.touchButton = 0
			changeHandState(HAND.TOUCHING, "move")
		}
		else {
			hand.pityStartX = e.clientX
			hand.pityStartY = e.clientY
			hand.pityStartT = Date.now()
			hand.hasStartedDragging = false
			hand.touchButton = 0
			changeHandState(HAND.TOUCHING)
		}

	},

	mousemove: (e) => {
		const x = e.clientX / UI.CT_SCALE
		const y = e.clientY / UI.CT_SCALE
		const atom = UI.atomRegistry.getAt(x, y)
		if (atom !== undefined) {
			if (atom.grabbable) {
				if (atom.cursor !== undefined) changeHandState(HAND.HOVER, atom.cursor())
				else if (atom.dragOnly) changeHandState(HAND.HOVER, "move")
				else changeHandState(HAND.HOVER)
			}
			else changeHandState(HAND.FREE)
			return
		}
		const mx = e.clientX
		const my = e.clientY
		if (mx >= UI.state.view.left && mx <= UI.state.view.right && my >= UI.state.view.top && my <= UI.state.view.bottom) {
			changeHandState(HAND.BRUSH)
			return
		}
		changeHandState(HAND.FREE)
	},

	atommove: (atom, x, y) => {
		if (atom.hitTest(x, y)) return
		const newAtom = UI.atomRegistry.getAt(x, y)
		if (newAtom !== undefined) {
			return
		}
		let [mx, my] = Mouse.position
		mx *= UI.DPR
		my *= UI.DPR
		if (mx >= UI.state.view.left && mx <= UI.state.view.right && my >= UI.state.view.top && my <= UI.state.view.bottom) {
			changeHandState(HAND.BRUSH)
			return
		}
		changeHandState(HAND.FREE)
	},

	rightmousedown: (e) => {
		const atom = UI.atomRegistry.getAt(e.clientX / UI.CT_SCALE, e.clientY / UI.CT_SCALE)
		if (atom === undefined) return
		if (!atom.grabbable) return
		grabAtom(atom, e.clientX / UI.CT_SCALE, e.clientY / UI.CT_SCALE)

		if (atom.dragOnly) {

			hand.pityStartX = e.clientX
			hand.pityStartY = e.clientY
			hand.pityStartT = Date.now()
			hand.hasStartedDragging = false
			hand.touchButton = 2
			changeHandState(HAND.TOUCHING, "move")
		}
		else {
			hand.pityStartX = e.clientX
			hand.pityStartY = e.clientY
			hand.pityStartT = Date.now()
			hand.hasStartedDragging = false
			hand.touchButton = 2
			changeHandState(HAND.TOUCHING)
		}
	}
}

const dampen = (n, noReally) => {
	if (noReally) return n * 0.6
	return n
}

HAND.TOUCHING = {
	cursor: "pointer",
	mousemove: (e) => {
		if (e.movementX === 0 && e.movementY === 0) return
		if (hand.touchButton === 2 && !hand.content.rightDraggable) return

		const distanceFromPityStart = Math.hypot(e.clientX - hand.pityStartX, e.clientY - hand.pityStartY)
		const pity = DRAG_PITY

		const dx = e.clientX - hand.pityStartX
		const dy = e.clientY - hand.pityStartY

		if (!hand.content.dragLockX) hand.content.x = (hand.pityStartX + dampen(dx, hand.content.attached && !hand.content.noDampen)) / UI.CT_SCALE * UI.DPR + hand.offset.x
		if (!hand.content.dragLockY) hand.content.y = (hand.pityStartY + dampen(dy, hand.content.attached && !hand.content.noDampen)) / UI.CT_SCALE * UI.DPR + hand.offset.y

		hand.content.x = clamp(hand.content.x, hand.content.minX, hand.content.maxX)
		hand.content.y = clamp(hand.content.y, hand.content.minY, hand.content.maxY)

		if (distanceFromPityStart < pity) {
			return
		}

		const timeSincePityStart = Date.now() - hand.pityStartT
		if (timeSincePityStart < DRAG_PITY_TIME) {
			const handSpeed = Math.hypot(hand.velocity.x, hand.velocity.y)
			if (handSpeed <= DRAG_UNPITY_SPEED) return
		}

		if (!hand.content.dragLockX) hand.content.x = hand.pityStartX / UI.CT_SCALE * UI.DPR + hand.offset.x
		if (!hand.content.dragLockY) hand.content.y = hand.pityStartY / UI.CT_SCALE * UI.DPR + hand.offset.y

		hand.content.x = clamp(hand.content.x, hand.content.minX, hand.content.maxX)
		hand.content.y = clamp(hand.content.y, hand.content.minY, hand.content.maxY)

		const x = e.clientX / UI.CT_SCALE
		const y = e.clientY / UI.CT_SCALE
		if (hand.touchButton === 0 && hand.content.draggable) {
			changeHandState(HAND.DRAGGING)

			const attached = hand.content.attached && !hand.content.dragOnly && !hand.content.noDampen

			hand.content = hand.content.drag(x, y)

			if (!hand.content.dragLockX) hand.content.x = (hand.pityStartX + dampen(dx, attached)) / UI.CT_SCALE + hand.offset.x
			if (!hand.content.dragLockY) hand.content.y = (hand.pityStartY + dampen(dy, attached)) / UI.CT_SCALE + hand.offset.y

			hand.content.x = clamp(hand.content.x, hand.content.minX, hand.content.maxX)
			hand.content.y = clamp(hand.content.y, hand.content.minY, hand.content.maxY)

			HAND.DRAGGING.mousemove(e)
			return
		} else if (hand.touchButton === 2 && hand.content.rightDraggable) {
			changeHandState(HAND.DRAGGING)

			const attached = hand.content.attached && !hand.content.dragOnly && !hand.content.noDampen

			hand.content = hand.content.rightDrag(x, y)

			if (!hand.content.dragLockX) hand.content.x = (hand.pityStartX + dampen(dx, attached)) / UI.CT_SCALE + hand.offset.x
			if (!hand.content.dragLockY) hand.content.y = (hand.pityStartY + dampen(dy, attached)) / UI.CT_SCALE + hand.offset.y

			hand.content.x = clamp(hand.content.x, hand.content.minX, hand.content.maxX)
			hand.content.y = clamp(hand.content.y, hand.content.minY, hand.content.maxY)

			HAND.DRAGGING.mousemove(e)
			return
		}

		const atom = UI.atomRegistry.getAt(x, y)
		if (atom !== undefined) {
			if (atom.grabbable) {
				if (atom.cursor !== undefined) changeHandState(HAND.HOVER, atom.cursor())
				else if (atom.dragOnly) changeHandState(HAND.HOVER, "move")
				else changeHandState(HAND.HOVER)
			}
			else changeHandState(HAND.FREE)
			return
		}
		const mx = e.clientX * UI.DPR
		const my = e.clientY * UI.DPR
		if (mx >= UI.state.view.left && mx <= UI.state.view.right && my >= UI.state.view.top && my <= UI.state.view.bottom) {
			changeHandState(HAND.BRUSH)
			return
		}
		changeHandState(HAND.FREE)
	},
	mouseup: (e) => {
		if (hand.touchButton !== 0) return
		hand.clickContent.click()
		hand.clickContent.dx = 0
		hand.clickContent.dy = 0
		hand.clickContent = undefined

		if (hand.content.attached) {
			hand.content.x = hand.pityStartX / UI.CT_SCALE * UI.DPR + hand.offset.x
			hand.content.y = hand.pityStartY / UI.CT_SCALE * UI.DPR + hand.offset.y
		}

		hand.content.dx = 0
		hand.content.dy = 0
		hand.content = undefined

		const x = e.clientX / UI.CT_SCALE
		const y = e.clientY / UI.CT_SCALE
		const atom = UI.atomRegistry.getAt(x, y)
		if (atom !== undefined) {
			if (atom.cursor !== undefined) changeHandState(HAND.HOVER, atom.cursor())
			else if (atom.dragOnly) changeHandState(HAND.HOVER, "move")
			else changeHandState(HAND.HOVER)
		}
		else changeHandState(HAND.FREE)
	},
	rightmouseup: (e) => {
		if (hand.touchButton !== 2) return
		hand.clickContent.rightClick()
		hand.clickContent.dx = 0
		hand.clickContent.dy = 0
		hand.clickContent = undefined

		if (hand.content.attached) {
			hand.content.x = hand.pityStartX / UI.CT_SCALE * UI.DPR + hand.offset.x
			hand.content.y = hand.pityStartY / UI.CT_SCALE * UI.DPR + hand.offset.y
		}

		hand.content.dx = 0
		hand.content.dy = 0
		hand.content = undefined

		const x = e.clientX / UI.CT_SCALE
		const y = e.clientY / UI.CT_SCALE
		const atom = UI.atomRegistry.getAt(x, y)
		if (atom !== undefined) {
			if (atom.cursor !== undefined) changeHandState(HAND.HOVER, atom.cursor())
			else if (atom.dragOnly) changeHandState(HAND.HOVER, "move")
			else changeHandState(HAND.HOVER)
		}
		else changeHandState(HAND.FREE)
	}
}

HAND.DRAGGING = {
	cursor: "move",
	mousemove: (e) => {
		if (!hand.hasStartedDragging) {
			hand.hasStartedDragging = true
			hand.content = hand.content.drag(e.clientX / UI.CT_SCALE * UI.DPR, e.clientY / UI.CT_SCALE * UI.DPR)
		}

		const oldX = hand.content.x
		const oldY = hand.content.y

		if (!hand.content.dragLockX) hand.content.x = e.clientX / UI.CT_SCALE * UI.DPR + hand.offset.x
		if (!hand.content.dragLockY) hand.content.y = e.clientY / UI.CT_SCALE * UI.DPR + hand.offset.y

		hand.content.x = clamp(hand.content.x, hand.content.minX, hand.content.maxX)
		hand.content.y = clamp(hand.content.y, hand.content.minY, hand.content.maxY)

		const dx = hand.content.x - oldX
		const dy = hand.content.y - oldY
		hand.content.move(dx, dy)
	},
	mouseup: (e) => {
		if (hand.touchButton !== 0) return
		hand.hasStartedDragging = true
		if (!hand.content.dragLockX) hand.content.dx = hand.velocity.x * HAND_RELEASE
		if (!hand.content.dragLockY) hand.content.dy = hand.velocity.y * HAND_RELEASE
		hand.content.drop()
		if (hand.content.highlightedAtom !== undefined) {
			hand.content.place(hand.content.highlightedAtom)
			if (hand.content.highlight !== undefined) {
				UI.deleteChild(hand.content, hand.content.highlight)
				hand.content.highlight = undefined
			}
		}
		hand.content = undefined
		const x = e.clientX / UI.CT_SCALE
		const y = e.clientY / UI.CT_SCALE
		const atom = UI.atomRegistry.getAt(x, y)
		if (atom !== undefined) {
			if (atom.grabbable) {
				if (atom.cursor !== undefined) changeHandState(HAND.HOVER, atom.cursor())
				else if (atom.dragOnly) changeHandState(HAND.HOVER, "move")
				else changeHandState(HAND.HOVER)
			}
			else changeHandState(HAND.FREE)
			return
		}
		else changeHandState(HAND.FREE)
		return
	},
	rightmouseup: (e) => {
		if (hand.touchButton !== 2) return
		hand.hasStartedDragging = true
		if (!hand.content.dragLockX) hand.content.dx = hand.velocity.x * HAND_RELEASE
		if (!hand.content.dragLockY) hand.content.dy = hand.velocity.y * HAND_RELEASE
		hand.content.drop()
		if (hand.content.highlightedAtom !== undefined) {
			hand.content.place(hand.content.highlightedAtom)
			if (hand.content.highlight !== undefined) {
				UI.deleteChild(hand.content, hand.content.highlight)
				hand.content.highlight = undefined
			}
		}
		hand.content = undefined
		const x = e.clientX / UI.CT_SCALE
		const y = e.clientY / UI.CT_SCALE
		const atom = UI.atomRegistry.getAt(x, y)
		if (atom !== undefined) {
			if (atom.grabbable) {
				if (atom.cursor !== undefined) changeHandState(HAND.HOVER, atom.cursor())
				else if (atom.dragOnly) changeHandState(HAND.HOVER, "move")
				else changeHandState(HAND.HOVER)
			}
			else changeHandState(HAND.FREE)
			return
		}
		else changeHandState(HAND.FREE)
		return
	}
}

const changeHandState = (newState, cursor = newState.cursor) => {
	if (hand.content !== undefined && hand.content.cursor !== undefined) {
		cursor = hand.content.cursor()
	}
	UI.colourTodeCanvas.style["cursor"] = cursor
	hand.state = newState
}

const grabAtom = (atom, x, y) => {

	let previousTouched = atom
	let touched = atom.touch()
	if (touched !== previousTouched) {
		const newTouched = touched.touch(x, y, previousTouched)
		previousTouched = touched
		touched = newTouched
	}
	hand.clickContent = touched


	let previousGrabbed = atom
	let grabbed = atom.grab(x, y)

	if (grabbed === undefined) return
	if (grabbed !== previousGrabbed) {
		const newGrabbed = grabbed.grab(x, y, previousGrabbed)
		previousGrabbed = grabbed
		grabbed = newGrabbed
	}

	hand.content = grabbed
	const {x: grabbedX, y: grabbedY} = grabbed.getPosition({forceAbsolute: true})
	hand.offset.x = grabbedX - x * UI.DPR
	hand.offset.y = grabbedY - y * UI.DPR
	grabbed.dx = 0
	grabbed.dy = 0

	if (atom.stayAtBack) UI.atomRegistry.bringToBack(grabbed)
	else UI.atomRegistry.bringToFront(grabbed)

	return grabbed
}
