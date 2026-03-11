//=============//
// GAME TICK   //
//=============//
const createGameTick = ({world, state, drawQueue, ruleRegistry, pickRandomCell}) => {

	const fireRandomSpotEvents = () => {
		let count = state.speed.dynamic? state.speed.aer * world.cellGrid.cellCount : state.speed.count
		count = Math.min(count, world.cellGrid.cellCount)
		count *= world.built? 1 : 0.1
		const redrawCount = count * state.speed.redraw
		let redraw = true
		if (!world.built) redraw = false
		let drawnCount = 0
		for (let i = 0; i < count; i++) {
			const cell = pickRandomCell()

			if (redraw && drawnCount >= redrawCount) redraw = false
			const drawn = fireCellEvent(cell, redraw)
			drawnCount += drawn
		}

		for (const cell of drawQueue.priority) {
			drawnCount += drawQueue.drawCell(cell)
			drawQueue.priority.delete(cell)
			if (drawnCount >= redrawCount) break
		}

		for (const cell of drawQueue.queue) {
			drawnCount += drawQueue.drawCell(cell)
			drawQueue.queue.delete(cell)
			if (drawnCount >= redrawCount) break
		}
	}

	const fireRandomSpotDrawEvents = () => {
		if (!state.view.visible) return
		const count = state.speed.dynamic? state.speed.aer * world.cellGrid.cellCount : state.speed.count
		let redrawCount = count * state.speed.redraw
		if (!world.built) redrawCount = 1

		let drawnCount = 0

		for (const cell of drawQueue.queue) {
			drawnCount += drawQueue.drawCell(cell)
			drawQueue.queue.delete(cell)
			if (drawnCount >= redrawCount) break
		}
	}

	// this function is currently full of debug code
	// Returns the number of cells it drew
	const fireCellEvent = (cell, redraw) => {

		if (BUILD_WORLD(cell, redraw) !== undefined) return 1

		ruleRegistry.behaveFunctions.shuffle()
		for (const behave of ruleRegistry.behaveFunctions) {
			const result = behave(cell, redraw)
			if (result === undefined) continue
			return result
		}
		return 0

	}

	// Behave functions must return how many cells got drawn
	const BUILD_WORLD = (cell, redraw) => {
		if (world.built) return undefined
		if (world.cellGrid.cellCount >= world.cellCount) {
			world.built = true
			return undefined
		}

		if (cell.colour < 111) {
			return 0
		}

		cell.colour -= 111
		const width = 2
		const height = 2
		const children = world.cellGrid.split(cell, width, height)
		for (const child of children) {
			drawQueue.drawCell(child)
		}

		return 1
	}

	return { fireRandomSpotEvents, fireRandomSpotDrawEvents }
}
