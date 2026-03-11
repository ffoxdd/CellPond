//==========//
// LAYOUT   //
//==========//
// Derived layout constants and layout functions, computed from
// the base theme values on UI (config.js).

const CHANNEL_HEIGHT = UI.SQUARE_SIZE - UI.OPTION_MARGIN * 2
const OPTION_SPACING = CHANNEL_HEIGHT + UI.OPTION_MARGIN
const PADDLE_X = Math.round(UI.SQUARE_SIZE / 2)
const PADDLE_TOTAL_SIZE = UI.SQUARE_SIZE + UI.OPTION_MARGIN * 4
const PADDLE_HANDLE_SIZE = PADDLE_X
const HIGHLIGHT_THICKNESS = UI.BORDER_THICKNESS
const MAGIC_NUMBER = 0.8660254
const MINUS_MAGIC_NUMBER = 1 - MAGIC_NUMBER

//=== Symmetry panel ===//
function symmetryLayout() {
	const S = UI.SYMMETRY_CIRCLE_SIZE
	const M = UI.OPTION_MARGIN
	const toggleSize = UI.SQUARE_SIZE - M

	const pad = {
		width: S,
		x: S + M,
		height: (S * 3) - M,
		y: -(S * 3)/3 + M/2,
	}

	const toggleX = pad.x + pad.width/2 - toggleSize/2

	return {
		pad,
		handle: {
			width: S/2 + M,
			x: S/2 + S/4,
			height: S / 3,
			y: S/2 - (S / 3)/2,
		},
		toggleX: { size: toggleSize, x: toggleX, y: pad.y + M/2 },
		toggleY: { size: toggleSize, x: toggleX, y: M/2 },
		toggleR: { size: toggleSize, x: toggleX, y: pad.y + pad.height - toggleSize - M/2 },
	}
}

//=== Triangle panel ===//
function triangleLayout() {
	const S = UI.SYMMETRY_CIRCLE_SIZE
	const M = UI.OPTION_MARGIN
	const pickSize = UI.SQUARE_SIZE - M * 1.5

	const pad = {
		width: S,
		x: S * Math.sqrt(3)/2 + M,
		height: (S * 2) - M,
		y: -S/2 + M/2,
	}

	const pickX = pad.x + pad.width/2 - pickSize/2

	return {
		pad,
		handle: {
			width: S/2 + M,
			x: S/2,
			height: S / 3,
			y: S/2 - (S / 3)/2,
		},
		pickUp: { size: pickSize, x: pickX, y: pad.y + M * 1.5/2 },
		pickDown: { size: pickSize, x: pickX, y: pad.y + pad.height - pickSize - M/2 },
	}
}

//=== Picker / channel ===//
function pickerPadLayout() {
	return {
		width: UI.OPTION_MARGIN + 3*(UI.SQUARE_SIZE + UI.OPTION_MARGIN),
		height: UI.SQUARE_SIZE,
		x: UI.SQUARE_SIZE + UI.OPTION_MARGIN,
	}
}

function pickerHandleLayout() {
	const S = UI.SYMMETRY_CIRCLE_SIZE
	return {
		width: S/2 + UI.OPTION_MARGIN,
		height: S / 3,
		x: S/2 + S/4,
		y: S/2 - (S / 3)/2,
		behindParent: true,
	}
}

function channelLayout() {
	return {
		width: UI.SQUARE_SIZE,
		y: (UI.SQUARE_SIZE - CHANNEL_HEIGHT)/2,
		height: CHANNEL_HEIGHT,
	}
}

function channelOptionLayout() {
	return {
		width: UI.SQUARE_SIZE,
		height: CHANNEL_HEIGHT,
	}
}

function selectionSideLayout() {
	return {
		width: (UI.SQUARE_SIZE - CHANNEL_HEIGHT)/2,
		height: UI.SQUARE_SIZE,
	}
}

function selectionEndLayout() {
	return {
		width: UI.SQUARE_SIZE + UI.OPTION_MARGIN*2,
		height: OPTION_SPACING - CHANNEL_HEIGHT,
		x: -UI.OPTION_MARGIN,
	}
}

function optionPaddingLayout() {
	return {
		width: UI.SQUARE_SIZE,
		height: UI.OPTION_MARGIN,
	}
}

//=== Diamond / tall rectangle ===//
function diamondLayout() {
	const size = CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2
	const pinSize = size / 2
	return {
		choice: { size, width: size, height: size },
		pin: { size: pinSize, width: pinSize, height: pinSize },
		tallRectangle: { size, width: size, height: size },
	}
}

//=== Paddle ===//
function paddleLayout() {
	const ps = PADDLE_TOTAL_SIZE
	return { size: ps, width: ps, height: ps }
}

function paddleHandleLayout() {
	return {
		size: PADDLE_X,
		x: -PADDLE_X,
		y: PADDLE_TOTAL_SIZE/2 - PADDLE_X/2,
	}
}

function pinHoleLayout() {
	return {
		size: PADDLE_HANDLE_SIZE - UI.OPTION_MARGIN/2,
		x: UI.OPTION_MARGIN/2/2,
		y: UI.OPTION_MARGIN/2/2,
	}
}
