//=================//
// HEXAGON HANDLE  //
//=================//
class HexagonHandle extends Atom {
	constructor(element = {}) {
		super({
			offscreen: Rectangle.offscreenFn,
			overlaps: (atom, x, y) => {
				atom.y -= atom.height/2
				atom.height *= 2
				const result = Rectangle.overlapsFn(atom, x, y)
				atom.height /= 2
				atom.y += atom.height/2
				return result
			},
			colour: Colour.Grey,
			rotation: 0,
			touch: (atom) => atom.parent,
			grab: (atom) => atom.parent,
			x: 50,
			width: UI.SQUARE_SIZE/2 + UI.SQUARE_SIZE/4,
			height: UI.SQUARE_SIZE / 3,
			draw: (atom, ctx) => {
				const {x, y} = atom.getPosition()
				const {width, height} = atom

				const path = new Path2D()
				let points = [
					[x, y],
					[x+width, y],
					[x+width, y+height],
					[x, y+height],
				]

				if (atom.rotation > 0) {
					points = points.map(point => UI.rotate(point, [x+width/2, y+height/2], atom.rotation * Math.PI/3))
				}

				const [head, ...tail] = points

				path.moveTo(...head)
				for (const point of tail) {
					path.lineTo(...point)
				}

				ctx.fillStyle = atom.colour
				ctx.fill(path)
			},
			...element,
		})
	}

	static get WIDTH() { return UI.SQUARE_SIZE/2 + UI.SQUARE_SIZE/4 }
	static get HEIGHT() { return UI.SQUARE_SIZE / 3 }
}
