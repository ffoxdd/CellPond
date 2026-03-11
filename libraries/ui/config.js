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
	SYMMETRY_CIRCLE_SIZE: 40,
	paddleScroll: 0,
	DPR: 1,
	events: new EventBus(),
	on(...args) { return this.events.on(...args) },
	emit(...args) { return this.events.emit(...args) },
}
