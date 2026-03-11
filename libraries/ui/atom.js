//======//
// ATOM //
//======//
// Interface for all UI elements. Concrete types extend this and
// override the interface methods (draw, overlaps, offscreen, etc.).
class Atom {

	// === Value defaults ===
	grabbable = true
	draggable = true
	highlighter = false
	hasInner = true
	x = 0
	y = 0
	dx = 0
	dy = 0
	maxX = Infinity
	minX = -Infinity
	maxY = Infinity
	minY = -Infinity
	size = 40
	colour = Colour.splash(999)
	children = []
	parent = UI.atomRegistry.baseParent

	get width() { return this._width !== undefined ? this._width : this.size }
	set width(v) { this._width = v }
	get height() { return this._height !== undefined ? this._height : this.size }
	set height(v) { this._height = v }

	constructor() {}

	// === Interface methods (override in concrete types) ===
	click() {}
	rightClick() {}
	drag() { return this }
	rightDrag() { return this }
	move() {}
	drop() {}
	draw() {}
	update() {}
	offscreen() { return false }
	overlaps() { return false }
	grab() { return this }
	touch() { return this }
	hover() {}
	place() {}
	construct() {}

	// === Shared behavior ===
	drawTree(ctx) {
		for (const child of this.children) {
			if (child.behindParent) child.drawTree(ctx)
		}
		if (this.behindChildren) this.draw(ctx)
		for (const child of this.children) {
			if (!child.behindParent) child.drawTree(ctx)
		}
		if (!this.behindChildren) this.draw(ctx)
	}

	isOffscreen() {
		for (const child of this.children) {
			if (!child.isOffscreen()) return false
		}
		return this.offscreen()
	}

	hitTest(x, y) {
		if (!this.behindChildren && this.overlaps(x, y)) return this

		for (let i = this.children.length-1; i >= 0; i--) {
			const child = this.children[i]
			if (child.behindParent) continue
			const result = child.hitTest(x, y)
			if (result) return result
		}

		if (this.behindChildren && this.overlaps(x, y)) return this

		for (let i = this.children.length-1; i >= 0; i--) {
			const child = this.children[i]
			if (!child.behindParent) continue
			const result = child.hitTest(x, y)
			if (result) return result
		}
	}

	getPosition({forceAbsolute = false} = {}) {
		const {x, y} = this
		if (forceAbsolute) return {x, y}
		if (this.parent === undefined) return {x, y}
		if (this.hasAbsolutePosition) return {x, y}
		const {x: px, y: py} = this.parent.getPosition()
		return {x: x+px, y: y+py}
	}
}
