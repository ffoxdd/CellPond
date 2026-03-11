//======//
// ATOM //
//======//
class Atom {
	constructor(element = {}) {
		this.grabbable = true
		this.draggable = true
		this.click = () => {}
		this.rightClick = () => {}
		this.drag = (a) => a
		this.rightDrag = (a) => a
		this.move = () => {}
		this.drop = () => {}
		this.draw = () => {}
		this.update = () => {}
		this.offscreen = () => false
		this.overlaps = () => false
		this.grab = (a) => a
		this.touch = (a) => a
		this.highlighter = false
		this.hover = () => {}
		this.place = () => {}
		this.x = 0
		this.y = 0
		this.dx = 0
		this.dy = 0
		this.maxX = Infinity
		this.minX = -Infinity
		this.maxY = Infinity
		this.minY = -Infinity
		this.size = 40
		this.colour = Colour.splash(999)
		this.children = []
		this.parent = UI.atomRegistry.baseParent
		this.hasInner = true
		this.construct = () => {}

		Object.assign(this, element)

		// width/height default to size if not explicitly provided
		if (element.width === undefined) this.width = this.size
		if (element.height === undefined) this.height = this.size

		this.construct(this)
	}

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
