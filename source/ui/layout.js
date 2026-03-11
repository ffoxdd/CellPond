//==========//
// LAYOUT   //
//==========//
// Layout functions compute positions and sizes from UI theme constants.
// Components accept these as constructor params, keeping them focused
// on shape, drawing, and behavior.

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
		y: (UI.SQUARE_SIZE - UI.CHANNEL_HEIGHT)/2,
		height: UI.CHANNEL_HEIGHT,
	}
}

function channelOptionLayout() {
	return {
		width: UI.SQUARE_SIZE,
		height: UI.CHANNEL_HEIGHT,
	}
}

function selectionSideLayout() {
	return {
		width: (UI.SQUARE_SIZE - UI.CHANNEL_HEIGHT)/2,
		height: UI.SQUARE_SIZE,
	}
}

function selectionEndLayout() {
	return {
		width: UI.SQUARE_SIZE + UI.OPTION_MARGIN*2,
		height: UI.OPTION_SPACING - UI.CHANNEL_HEIGHT,
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
	const size = UI.CHANNEL_HEIGHT + UI.OPTION_MARGIN/3*2
	const pinSize = size / 2
	return {
		choice: { size, width: size, height: size },
		pin: { size: pinSize, width: pinSize, height: pinSize },
		tallRectangle: { size, width: size, height: size },
	}
}

//=== Paddle ===//
function paddleLayout() {
	const ps = UI.PADDLE_TOTAL_SIZE
	return { size: ps, width: ps, height: ps }
}

function paddleHandleLayout() {
	return {
		size: UI.PADDLE_X,
		x: -UI.PADDLE_X,
		y: UI.PADDLE_TOTAL_SIZE/2 - UI.PADDLE_X/2,
	}
}

function pinHoleLayout() {
	return {
		size: UI.PADDLE_HANDLE_SIZE - UI.OPTION_MARGIN/2,
		x: UI.OPTION_MARGIN/2/2,
		y: UI.OPTION_MARGIN/2/2,
	}
}
