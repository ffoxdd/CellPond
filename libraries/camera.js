//========//
// CAMERA //
//========//
class Camera {
	constructor() {
		this.x = 0
		this.y = 0

		this.dx = 0
		this.dy = 0

		this.dxTarget = 0
		this.dyTarget = 0
		this.dsControl = 1
		this.dsTargetSpeed = 0.05

		this.underScale = 0.9
		this.scale = 0.9
		this.mscale = 1.0
		this.dmscale = 0.002

		this.mscaleTarget = 1.0
		this.mscaleTargetControl = 0.001
		this.mscaleTargetSpeed = 0.05
	}

	getNeatScale(underScale) {
		return underScale
	}

	zoom(dy, centerX, centerY) {
		centerX *= DPR
		centerY *= DPR

		const sign = -Math.sign(dy)
		const dd = Math.abs(dy)
		const ZOOM = 0.02

		for (let i = 0; i < dd; i++) {
			const zoom = ZOOM * this.underScale
			const szoom = zoom * sign
			this.underScale += szoom

			const oldScale = this.scale
			const newScale = this.getNeatScale(this.underScale)
			this.scale = newScale
			const scale = newScale / oldScale

			this.x += (1-scale) * centerX/newScale
			this.y += (1-scale) * centerY/newScale
		}
	}

	update(hand, canvas, updateImageSize) {
		if (this.mscale !== this.mscaleTarget) {
			const dd = this.mscaleTarget - this.mscale
			this.mscale += dd * this.mscaleTargetSpeed

			const sign = Math.sign(dd)
			const snap = this.mscaleTarget * this.mscaleTargetControl * this.mscaleTargetSpeed
			if (sign === 1 && this.mscale > this.mscaleTarget - snap) this.mscale = this.mscaleTarget
			if (sign === -1 && this.mscale < this.mscaleTarget + snap) this.mscale = this.mscaleTarget
		}

		if (this.dx !== this.dxTarget) {
			const dd = this.dxTarget - this.dx
			this.dx += dd * this.dsTargetSpeed

			const sign = Math.sign(dd)
			const snap = this.dxTarget * this.dsControl * this.dsTargetSpeed
			if (sign === 1 && this.dx > this.dxTarget - snap) this.dx = this.dxTarget
			if (sign === -1 && this.dx < this.dxTarget + snap) this.dx = this.dxTarget
		}

		if (this.dy !== this.dyTarget) {
			const dd = this.dyTarget - this.dy
			this.dy += dd * this.dsTargetSpeed

			const sign = Math.sign(dd)
			const snap = this.dyTarget * this.dsControl * this.dsTargetSpeed
			if (sign === 1 && this.dy > this.dyTarget - snap) this.dy = this.dyTarget
			if (sign === -1 && this.dy < this.dyTarget + snap) this.dy = this.dyTarget
		}

		if (this.dx !== 0.0 || this.dy !== 0.0) {
			this.x += this.dx
			this.y += this.dy
			updateImageSize()
			if (hand.state.camerapan) hand.state.camerapan()
		}

		if (this.mscale !== 1.0) {
			const oldScale = this.scale
			this.scale *= this.mscale
			const newScale = this.scale
			const scale = newScale / oldScale

			let centerX = Mouse.position[0]
			let centerY = Mouse.position[1]

			if (centerX === undefined) centerX = canvas.width/2
			if (centerY === undefined) centerY = canvas.height/2

			this.x += (1-scale) * centerX/newScale
			this.y += (1-scale) * centerY/newScale

			updateImageSize()
		}
	}
}
