//=============//
// RECTANGLE   //
//=============//
function drawRectangle(atom, ctx) {
	let {x, y} = atom.getPosition()

	let X = Math.round(x)
	let Y = Math.round(y)
	let W = Math.round(atom.width)
	let H = Math.round(atom.height)
	let R = Math.round(atom.width/2)

	if (atom.hasBorder) {

		if (atom.hasInner) {

			let border = UI.BORDER_THICKNESS
			if (atom.borderColour === undefined) {
				ctx.fillStyle = Colour.splash(atom.colour.splash)
				if (atom.isTool) {
					ctx.fillStyle = Colour.splash(atom.colour.splash)
					border *= 1.5
				} else if (atom.width === atom.height) {
					border *= 1.5
				}
			}
			else {
				ctx.fillStyle = atom.borderColour
			}

			ctx.beginPath()
			ctx.rect(X, Y, W, H)
			if (atom.stamp !== undefined) {
				ctx.arc(X+R, Y+R, Math.round((UI.PADDLE_HANDLE_SIZE - UI.OPTION_MARGIN/2)/2), 0, 2*Math.PI)
			}


			if (atom.isGradient) {
				ctx.putImageData(atom.gradient, X * UI.CT_SCALE, Y * UI.CT_SCALE)
			} else {

				ctx.fill("evenodd")

				ctx.beginPath()
				ctx.fillStyle = atom.colour
				ctx.rect(X+border, Y+border, W-border*2, H-border*2)
				if (atom.stamp !== undefined) {
					ctx.arc(X+R, Y+R, Math.round((UI.PADDLE_HANDLE_SIZE - UI.OPTION_MARGIN/2)/2)+border, 0, 2*Math.PI)
				}
				ctx.fill("evenodd")
			}
		}

		else {
			if (atom.borderColour === undefined) {
				ctx.strokeStyle = UI.borderColours[atom.colour.splash]
			}
			else {
				ctx.strokeStyle = atom.borderColour
			}

			X = Math.round(x + 0.5) - 0.5
			Y = Math.round(y + 0.5) - 0.5

			ctx.lineWidth = UI.BORDER_THICKNESS
			ctx.strokeRect(X, Y, W, H)
		}
	}

	else {
		ctx.fillStyle = atom.colour
		ctx.fillRect(X, Y, W, H)
	}

}

function rectangleOffscreen(atom) {
	const {x, y} = atom.getPosition()
	const left = x
	const right = x + atom.width
	const top = y
	const bottom = y + atom.height
	if (right < 0) return true
	if (bottom < 0) return true
	if (left > UI.canvas.width) return true
	if (top > UI.canvas.height) return true
	return false
}

function rectangleOverlaps(atom, mx, my) {
	const {x, y} = atom.getPosition()
	let border = UI.BORDER_THICKNESS
	if (atom.isTool || atom.isSquare || atom.isTallRectangle) {
		border *= 1.5
	}
	const left = x
	const right = x + atom.width
	const top = y
	const bottom = y + atom.height

	if (mx < left) return false
	if (my < top) return false
	if (mx > right) return false
	if (my > bottom) return false

	return true
}

class Rectangle extends Atom {
	draw(ctx) { drawRectangle(this, ctx) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	offscreen() { return rectangleOffscreen(this) }
}
