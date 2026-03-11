//============//
// UI CONFIG  //
//============//
// Shared runtime values for UI atom types.
// Populated during on.load, referenced at call time.
const UI = {
	BORDER_THICKNESS: 3,
	OPTION_MARGIN: 10,
	SQUARE_SIZE: 40,
	canvas: null,
	borderColours: null,
	toolBorderColours: null,
	CT_SCALE: 1,
	PADDLE_HANDLE_SIZE: 0,
	get CHANNEL_HEIGHT() { return this.SQUARE_SIZE - this.OPTION_MARGIN * 2 },
	SYMMETRY_CIRCLE_SIZE: 40,
	get PADDLE_X() { return Math.round(this.SQUARE_SIZE / 2) },
	get PADDLE_TOTAL_SIZE() { return this.SQUARE_SIZE + this.OPTION_MARGIN * 4 },
	paddleScroll: 0,
	MAGIC_NUMBER: 0.8660254,
	get MINUS_MAGIC_NUMBER() { return 1 - this.MAGIC_NUMBER },
	get HIGHLIGHT_THICKNESS() { return this.BORDER_THICKNESS },
	DPR: 1,
	events: new EventBus(),
	on(...args) { return this.events.on(...args) },
	emit(...args) { return this.events.emit(...args) },
}
