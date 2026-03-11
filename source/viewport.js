//============//
// VIEWPORT   //
//============//
class Viewport {
	constructor(camera) {
		this.camera = camera

		this.image = {
			data: undefined,
			size: undefined,
			baseSize: undefined,
			left: undefined,
			top: undefined,
			right: undefined,
			bottom: undefined,
		}

		this.view = {
			height: undefined,
			width: undefined,
			iheight: undefined,
			iwidth: undefined,
			left: undefined,
			right: undefined,
			top: undefined,
			bottom: undefined,
			visible: true,
			fullyVisible: true,
		}

		this.region = {
			left: 0.0,
			right: 1.0,
			top: 0.0,
			bottom: 1.0,
			width: 1.0,
			height: 1.0,
		}
	}

	updateSize(canvas, drawQueue) {
		this.image.baseSize = Math.min(canvas.width, canvas.height)
		this.image.size = this.image.baseSize * this.camera.scale

		this.image.left = this.camera.x * this.camera.scale
		this.image.top = this.camera.y * this.camera.scale
		this.image.right = this.image.left + this.image.size
		this.image.bottom = this.image.top + this.image.size

		this.view.left = clamp(this.image.left, 0, canvas.width)
		this.view.top = clamp(this.image.top, 0, canvas.height)
		this.view.right = clamp(this.image.right, 0, canvas.width)
		this.view.bottom = clamp(this.image.bottom, 0, canvas.height)

		this.view.width = this.view.right - this.view.left
		this.view.height = this.view.bottom - this.view.top

		this.view.visible = this.view.width > 0 && this.view.height > 0
		this.view.fullyVisible = this.view.left === this.image.left && this.view.right === this.image.right && this.view.top === this.image.top && this.view.bottom === this.image.bottom

		this.view.iwidth = Math.ceil(this.view.width)
		this.view.iheight = Math.ceil(this.view.height)

		this.region.left = (this.view.left - this.image.left) / this.image.size
		this.region.right = 1.0 + (this.view.right - this.image.right) / this.image.size
		this.region.top = (this.view.top - this.image.top) / this.image.size
		this.region.bottom = 1.0 + (this.view.bottom - this.image.bottom) / this.image.size

		this.region.width = this.region.right - this.region.left
		this.region.height = this.region.bottom - this.region.top

		drawQueue.requestReset()
	}

	updateData(context, canvas) {
		this.image.data = context.getImageData(0, 0, canvas.width, canvas.height)
	}
}
