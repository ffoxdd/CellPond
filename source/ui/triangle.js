//============//
// TRIANGLES  //
//============//
// Four directional triangle shapes. All share the same overlaps/offscreen logic.

function triangleOverlaps(atom, x, y) {
	const {x: ax, y: ay} = atom.getPosition()
	const height = atom.size
	const width = atom.size * Math.sqrt(3)/2
	const left = ax
	const right = left + width
	const top = ay
	const bottom = top + height
	if (x < left) return false
	if (y < top) return false
	if (x > right) return false
	if (y > bottom) return false
	return true
}

function triangleOffscreen(atom) {
	const {x, y} = atom.getPosition()
	const height = atom.size
	const width = atom.size * Math.sqrt(3)/2
	const left = x
	const right = left + width
	const top = y
	const bottom = top + height
	if (right < 0) return true
	if (bottom < 0) return true
	if (left > UI.canvas.width) return true
	if (top > UI.canvas.height) return true
	return false
}

class TriangleRight extends Atom {
	static get DEFAULT_WIDTH() { return UI.SQUARE_SIZE * Math.sqrt(3)/2 }

	size = UI.SQUARE_SIZE
	width = UI.SQUARE_SIZE * Math.sqrt(3)/2

	draw(atom, ctx) { TriangleRight.drawFn(this, ctx) }
	overlaps(atom, x, y) { return triangleOverlaps(this, x, y) }
	offscreen(atom) { return triangleOffscreen(this) }

	static drawFn(atom, ctx) {
		const {x, y} = atom.getPosition()

		let size = atom.size
		if (atom.isTool) size -= UI.BORDER_THICKNESS*2.5
		if (!atom.isTool) size -= 2

		const height = size
		const width = size * Math.sqrt(3)/2

		const left = x
		const right = left + width
		let top = y + 1
		if (atom.isTool) top += UI.BORDER_THICKNESS*1.25
		const bottom = top + height
		const middleY = top + height/2

		ctx.fillStyle = atom.colour
		const path = new Path2D()

		path.moveTo(left, top)
		path.lineTo(right, middleY)
		path.lineTo(left, bottom)
		path.closePath()
		ctx.fillStyle = atom.colour
		ctx.fill(path)
		if (atom.hasBorder) {
			ctx.lineWidth = UI.BORDER_THICKNESS*1.5
			ctx.strokeStyle = atom.borderColour

			if (atom.isTool) {
				ctx.strokeStyle = UI.toolBorderColours[atom.colour.splash]
			}
			ctx.stroke(path)
		}
	}
}

class TriangleUp extends Atom {
	size = UI.SQUARE_SIZE

	draw(atom, ctx) { TriangleUp.drawFn(this, ctx) }
	overlaps(atom, x, y) { return triangleOverlaps(this, x, y) }
	offscreen(atom) { return triangleOffscreen(this) }

	static drawFn(atom, ctx) {
		const {x, y} = atom.getPosition()

		const width = atom.size
		const height = atom.size * Math.sqrt(3)/2
		const diff = atom.size - height

		const left = x
		const right = left + width
		const top = y + diff/2
		const bottom = top + height
		const middleX = left + width/2

		ctx.fillStyle = atom.colour
		const path = new Path2D()

		path.moveTo(left, bottom)
		path.lineTo(middleX, top)
		path.lineTo(right, bottom)
		path.closePath()
		ctx.fillStyle = atom.colour
		ctx.fill(path)
		if (atom.hasBorder) {
			ctx.lineWidth = UI.BORDER_THICKNESS*1.5
			ctx.strokeStyle = atom.borderColour
			ctx.stroke(path)
		}
	}
}

class TriangleDown extends Atom {
	size = UI.SQUARE_SIZE

	draw(atom, ctx) { TriangleDown.drawFn(this, ctx) }
	overlaps(atom, x, y) { return triangleOverlaps(this, x, y) }
	offscreen(atom) { return triangleOffscreen(this) }

	static drawFn(atom, ctx) {
		const {x, y} = atom.getPosition()

		const width = atom.size
		const height = atom.size * Math.sqrt(3)/2
		const diff = atom.size - height

		const left = x
		const right = left + width
		const top = y + diff/2
		const bottom = top + height
		const middleX = left + width/2

		ctx.fillStyle = atom.colour
		const path = new Path2D()

		path.moveTo(left, top)
		path.lineTo(middleX, bottom)
		path.lineTo(right, top)
		path.closePath()
		ctx.fillStyle = atom.colour
		ctx.fill(path)
		if (atom.hasBorder) {
			ctx.lineWidth = UI.BORDER_THICKNESS*1.5
			ctx.strokeStyle = atom.borderColour
			ctx.stroke(path)
		}
	}
}

class TriangleLeft extends Atom {
	size = UI.SQUARE_SIZE
	width = UI.SQUARE_SIZE * Math.sqrt(3)/2

	draw(atom, ctx) { TriangleLeft.drawFn(this, ctx) }
	overlaps(atom, x, y) { return triangleOverlaps(this, x, y) }
	offscreen(atom) { return triangleOffscreen(this) }

	static drawFn(atom, ctx) {
		const {x, y} = atom.getPosition()

		let size = atom.size
		if (atom.isTool) size -= UI.BORDER_THICKNESS*2.5
		if (!atom.isTool) size -= 2

		const height = size
		const width = size * Math.sqrt(3)/2

		const left = x
		const right = left + width
		let top = y + 1
		if (atom.isTool) top += UI.BORDER_THICKNESS*1.25
		const bottom = top + height
		const middleY = top + height/2

		ctx.fillStyle = atom.colour
		const path = new Path2D()

		path.moveTo(right, top)
		path.lineTo(left, middleY)
		path.lineTo(right, bottom)
		path.closePath()
		ctx.fillStyle = atom.colour
		ctx.fill(path)
		if (atom.hasBorder) {
			ctx.lineWidth = UI.BORDER_THICKNESS*1.5
			ctx.strokeStyle = atom.borderColour

			if (atom.isTool) {
				ctx.strokeStyle = UI.toolBorderColours[atom.colour.splash]
			}
			ctx.stroke(path)
		}
	}
}
