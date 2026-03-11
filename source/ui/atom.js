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

	constructor(element) {
		if (element !== undefined) Object.assign(this, element)
		if (this.width === undefined) this.width = this.size
		if (this.height === undefined) this.height = this.size
	}

	// === Interface methods (override in concrete types) ===
	click() {}
	rightClick() {}
	drag(a) { return a }
	rightDrag(a) { return a }
	move() {}
	drop() {}
	draw() {}
	update() {}
	offscreen() { return false }
	overlaps() { return false }
	grab(a) { return a }
	touch(a) { return a }
	hover() {}
	place() {}
	construct() {}

	// === Shared behavior ===
	drawTree(ctx) {
		for (const child of this.children) {
			if (child.behindParent) child.drawTree(ctx)
		}
		if (this.behindChildren) this.draw(this, ctx)
		for (const child of this.children) {
			if (!child.behindParent) child.drawTree(ctx)
		}
		if (!this.behindChildren) this.draw(this, ctx)
	}

	isOffscreen() {
		for (const child of this.children) {
			if (!child.isOffscreen()) return false
		}
		return this.offscreen(this)
	}

	hitTest(x, y) {
		if (!this.behindChildren && this.overlaps(this, x, y)) return this

		for (let i = this.children.length-1; i >= 0; i--) {
			const child = this.children[i]
			if (child.behindParent) continue
			const result = child.hitTest(x, y)
			if (result) return result
		}

		if (this.behindChildren && this.overlaps(this, x, y)) return this

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
