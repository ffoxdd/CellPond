//=================//
// HEXAGON HANDLE  //
//=================//
class HexagonHandle extends Atom {
	colour = Colour.Grey
	rotation = 0
	x = 50
	width = UI.SQUARE_SIZE/2 + UI.SQUARE_SIZE/4
	height = UI.SQUARE_SIZE / 3

	offscreen() { return rectangleOffscreen(this) }
	touch() { return this.parent }
	grab() { return this.parent }

	overlaps(x, y) {
		this.y -= this.height/2
		this.height *= 2
		const result = rectangleOverlaps(this, x, y)
		this.height /= 2
		this.y += this.height/2
		return result
	}

	draw(ctx) {
		const {x, y} = this.getPosition()
		const {width, height} = this

		const path = new Path2D()
		let points = [
			[x, y],
			[x+width, y],
			[x+width, y+height],
			[x, y+height],
		]

		if (this.rotation > 0) {
			points = points.map(point => UI.rotate(point, [x+width/2, y+height/2], this.rotation * Math.PI/3))
		}

		const [head, ...tail] = points

		path.moveTo(...head)
		for (const point of tail) {
			path.lineTo(...point)
		}

		ctx.fillStyle = this.colour
		ctx.fill(path)
	}

	static get WIDTH() { return UI.SQUARE_SIZE/2 + UI.SQUARE_SIZE/4 }
	static get HEIGHT() { return UI.SQUARE_SIZE / 3 }
}
