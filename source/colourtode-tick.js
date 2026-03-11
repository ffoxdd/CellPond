//===================//
// COLOURTODE - TICK //
//===================//
const colourTodeTick = () => {

	colourTodeUpdate()
	colourTodeDraw()
	requestAnimationFrame(colourTodeTick)
}

const updateHand = () => {
	if (hand.velocityHistory.length >= hand.velocityMemory) {
		hand.velocityHistory.shift()
	}

	if (Mouse.position !== undefined && Mouse.position[0] !== undefined && hand.previous.x !== undefined) {
		const [x, y] = Mouse.position.map(n => n / UI.CT_SCALE)
		const dx = (x - hand.previous.x) * DPR
		const dy = (y - hand.previous.y) * DPR
		const velocity = {x: dx, y: dy}
		hand.velocityHistory.push(velocity)
		const sum = hand.velocityHistory.reduce((a, b) => ({x: a.x+b.x, y: a.y+b.y}), {x:0, y:0})
		const average = {x: sum.x / hand.velocityHistory.length, y: sum.y / hand.velocityHistory.length}
		hand.velocity.x = average.x
		hand.velocity.y = average.y
		hand.previous.x = x
		hand.previous.y = y
	}
}

const COLOURTODE_FRICTION = 0.9
const colourTodeUpdate = () => {
	for (const atom of UI.atomRegistry.atoms) {
		updateAtom(atom)
	}
}

const updateAtom = (atom, checkOffscreen = true) => {

	for (const child of atom.children) {
		updateAtom(child, false)
	}

	// HIGHLIGHT
	if (atom.hover !== undefined) {
		updateAtomHighlight(atom)
	}

	atom.update()

	// MOVEMENT
	if (hand.content === atom) return
	if (atom.dx === 0 && atom.dy === 0) return

	atom.x += atom.dx
	atom.y += atom.dy

	atom.x = clamp(atom.x, atom.minX, atom.maxX)
	atom.y = clamp(atom.y, atom.minY, atom.maxY)

	atom.dx *= COLOURTODE_FRICTION
	atom.dy *= COLOURTODE_FRICTION

	if (checkOffscreen && atom.isOffscreen()) {
		UI.atomRegistry.delete(atom)
		return
	}

	const [mx, my] = Mouse.position.map(n => n / UI.CT_SCALE)
	if (hand.state.atommove) hand.state.atommove(atom, mx, my)
}

const updateAtomHighlight = (atom) => {
	// Remove the previous highlight
	atom.highlightedAtom = undefined

	// Only highlight if I'm being dragged
	if (hand.content !== atom) return
	if (hand.state !== HAND.DRAGGING) return

	if (atom.highlight !== undefined) {
		UI.deleteChild(atom, atom.highlight)
		atom.highlight = undefined
	}

	const highlightedAtom = atom.hover()

	// Create the highlight
	if (highlightedAtom === undefined) return

	if (atom.highlight === undefined) {
		const highlight = UI.createChild(atom, new Highlight(), {bottom: true})
		highlight.hasBorder = true
		highlight.colour = Colour.Grey
		const {x, y} = highlightedAtom.getPosition()
		highlight.x = x
		highlight.y = y
		highlight.width = highlightedAtom.width
		highlight.height = highlightedAtom.height
		atom.highlight = highlight
	}

	atom.highlightedAtom = highlightedAtom
}

const colourTodeDraw = () => {
	UI.colourTodeContext.clearRect(0, 0, UI.colourTodeCanvas.width, UI.colourTodeCanvas.height)
	UI.colourTodeContext.scale(UI.CT_SCALE, UI.CT_SCALE)
	for (const atom of UI.atomRegistry.atoms) {
		atom.drawTree(UI.colourTodeContext)
	}
	UI.colourTodeContext.scale(1/UI.CT_SCALE, 1/UI.CT_SCALE)
}
