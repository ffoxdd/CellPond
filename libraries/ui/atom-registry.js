//=================//
// ATOM REGISTRY   //
//=================//
class AtomRegistry {
	constructor() {
		this.atoms = []
		this.baseParent = {
			x: 0,
			y: 0,
			getPosition() { return {x: this.x, y: this.y} },
			grab: (atom, x, y, child = atom) => child,
			touch: (atom, child = atom) => child,
		}
	}

	register(atom) {
		this.atoms.push(atom)
	}

	delete(atom) {
		const id = this.atoms.indexOf(atom)
		this.atoms.splice(id, 1)
	}

	getAt(x, y) {
		x *= UI.DPR
		y *= UI.DPR
		for (let i = this.atoms.length-1; i >= 0; i--) {
			const atom = this.atoms[i]
			if (atom.justVisual) continue
			const result = atom.hitTest(x, y)
			if (result !== undefined) return result
		}
	}

	bringToFront(atom) {
		if (atom.parent === this.baseParent) {
			this.delete(atom)
			this.register(atom)
		}
		else {
			const childId = atom.parent.children.indexOf(atom)
			atom.parent.children.splice(childId, 1)
			atom.parent.children.push(atom)
			if (atom.parent.stayAtBack) this.bringToBack(atom.parent)
			else this.bringToFront(atom.parent)
		}
	}

	bringToBack(atom) {
		if (atom.parent === this.baseParent) {
			const id = this.atoms.indexOf(atom)
			this.atoms.splice(id, 1)
			this.atoms.unshift(atom)
		}
		else {
			const childId = atom.parent.children.indexOf(atom)
			atom.parent.children.splice(childId, 1)
			atom.parent.children.unshift(atom)
			if (atom.parent.stayAtBack) this.bringToBack(atom.parent)
			else this.bringToFront(atom.parent)
		}
	}

	// === Child management ===
	createChild(parent, element, {bottom = false} = {}) {
		const child = element instanceof Atom ? element : new Atom(element)
		if (!bottom) parent.children.push(child)
		else parent.children.unshift(child)
		child.parent = parent
		return child
	}

	deleteChild(parent, child, {quiet = false} = {}) {
		const id = parent.children.indexOf(child)
		if (id === -1) {
			if (quiet) return
			else throw new Error(`Can't delete child of atom because I can't find it!`)
		}
		parent.children.splice(id, 1)
		child.parent = this.baseParent
	}

	giveChild(parent, atom) {
		if (atom === undefined) {
			throw new Error(`Can't give child because child is undefined`)
		}
		if (parent === undefined) {
			throw new Error(`Can't give child because parent is undefined`)
		}
		this.delete(atom)
		if (atom.stayAtBack || atom.behindOtherChildren) parent.children.unshift(atom)
		else parent.children.push(atom)
		atom.parent = parent
	}

	freeChild(parent, child) {
		if (UI.hand.content === child) {
			const {x, y} = parent.getPosition()
			UI.hand.offset.x += x
			UI.hand.offset.y += y
		}
		this.deleteChild(parent, child)
		this.register(child)
	}
}
