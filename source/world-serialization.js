//=======================//
// WORLD SERIALIZATION  //
//=======================//
window.packWorld = () => {
	const cells = UI.cellGrid.getAll().values()
	const packedCells = cells.map(cell => {
		const packedCell = {
			x: cell.x,
			y: cell.y,
			w: cell.width,
			h: cell.height,
			c: cell.colour,
		}
		return packedCell
	})
	const packedString = JSON.stringify([...packedCells])

	const compressedString = LZString.compress(packedString)
	return compressedString
}

window.unpackWorld = (compressedString) => {
	const packedString = LZString.decompress(compressedString)
	const packedCells = JSON.parse(packedString)
	const cells = packedCells.map(packedCell => {
		const {x, y, w, h, c} = packedCell
		const cell = new Cell({
			x,
			y,
			width: w,
			height: h,
			colour: c,
		})
		return cell
	})
	UI.overrideCells(cells)
}
