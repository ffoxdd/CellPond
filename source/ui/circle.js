//==========//
// CIRCLE   //
//==========//
function drawCircle(atom, ctx) {
	const {x, y} = atom.getPosition()

	const X = x + atom.width/2
	const Y = y + atom.height/2
	let R = (atom.width/2)

	if (atom.hasBorder) {
		if (atom.isTool) {
			atom.borderColour = UI.toolBorderColours[atom.colour.splash]
		}
		ctx.fillStyle = atom.borderColour !== undefined? atom.borderColour : Colour.Void
		ctx.beginPath()
		ctx.arc(X, Y, R, 0, 2*Math.PI)
		ctx.fill()
		let borderScale = atom.borderScale !== undefined? atom.borderScale : 1.0
		R = (atom.width/2 - UI.BORDER_THICKNESS*1.5 * borderScale)
	}

	ctx.fillStyle = atom.colour
	ctx.beginPath()
	ctx.arc(X, Y, R, 0, 2*Math.PI)
	ctx.fill()
}

class Circle extends Atom {
	draw(ctx) { drawCircle(this, ctx) }
	overlaps(x, y) { return rectangleOverlaps(this, x, y) }
	offscreen() { return rectangleOffscreen(this) }
}
