//============//
// GRADIENT   //
//============//
const Gradient = {

	getWarpedPoints(width, height) {
		const maxWidth = 1.0
		const maxHeight = 1.0

		const midWidth = maxWidth/2
		const midHeight = maxHeight/2

		return [
			[maxWidth, 0.0], [maxWidth, midHeight], [maxWidth, maxHeight],
			[midWidth, 0.0], [midWidth, midHeight], [midWidth, maxHeight],
			[0.0, 0.0],      [0.0, midHeight],      [0.0, maxHeight],
		]
	},

	getDistancesFromPoints(x, y, points) {
		const distances = []
		for (const [px, py] of points) {
			const displacement = [px-x, py-y]
			const distance = Math.hypot(...displacement)
			distances.push(distance)
		}
		return distances
	},

	getPointScoresFromDistances(distances) {
		const scores = []
		for (const distance of distances) {
			scores.push(distance**2)
		}
		return scores
	},

	lerp(distance, line) {
		const [a, b] = line
		const [ax, ay] = a
		const [bx, by] = b

		const x = ax + (bx - ax) * distance
		const y = ay + (by - ay) * distance

		const point = [x, y]
		return point
	},

	getMergedGradient({gradients, width, height, mergedGradient = new ImageData(width, height), stamp}) {

		;[width, height] = [width, height].map(dimension => Math.round(dimension))
		const newLength = width * height * 4
		if (mergedGradient.data.length !== newLength) {
			mergedGradient = new ImageData(width, height)
		}

		const count = gradients.length
		const step = 2*Math.PI / count
		let offset = -step/2 - Math.PI/2
		if (count === 2) offset -= Math.PI/4
		const limits = gradients.map((gradient, i) => {
			let angle = i*step+step

			return angle
		})

		let i = 0
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const dx = x - width/2
				const dy = y - height/2
				let angle = Math.atan2(dy, dx) - offset
				while (angle < 0) angle += 2*Math.PI
				while (angle > 2*Math.PI) angle -= 2*Math.PI
				let id = 0

				let blend = false
				let blendScore = 0
				while (angle > limits[id]) {
					id++
					if (id >= gradients.length) {
						id = 0
						break
					}
				}

				const diff = limits[id] - angle
				const prevId = (id-1 < 0)? limits.length-1 : id-1
				const prevLimit = limits[prevId]
				const prefDiff = prevLimit - angle
				const nextId = (id+1 >= limits.length)? 0 : id+1
				let blendId = undefined

				const pity = 0.05
				if (Math.abs(prefDiff) < pity) {
					blend = true
					blendScore = (-prefDiff) / pity / 2 + 0.5
					blendId = prevId
				} else if (Math.abs(diff) < pity) {
					blend = true
					blendScore = (diff) / pity / 2 + 0.5
					blendId = nextId
				} else if (angle < pity) {
					blend = true
					blendScore = angle / pity / 2 + 0.5
					blendId = prevId
				}
				if (blend) {
					mergedGradient.data[i] = (gradients[id].data[i]*(blendScore) + gradients[blendId].data[i]*((1-blendScore)))
					mergedGradient.data[i+1] = (gradients[id].data[i+1]*(blendScore) + gradients[blendId].data[i+1]*((1-blendScore)))
					mergedGradient.data[i+2] = (gradients[id].data[i+2]*(blendScore) + gradients[blendId].data[i+2]*((1-blendScore)))
					mergedGradient.data[i+3] = (gradients[id].data[i+3]*(blendScore) + gradients[blendId].data[i+3]*((1-blendScore)))
				} else {
					mergedGradient.data[i] = gradients[id].data[i]
					mergedGradient.data[i+1] = gradients[id].data[i+1]
					mergedGradient.data[i+2] = gradients[id].data[i+2]
					mergedGradient.data[i+3] = gradients[id].data[i+3]
				}

				i += 4
			}
		}

		return mergedGradient
	},

	getImageFromColours({colours, width, height, gradient = new ImageData(width, height), stamp}) {

		;[width, height] = [width, height].map(dimension => Math.round(dimension))
		const newLength = width * height * 4
		if (gradient.data.length !== newLength) {
			gradient = new ImageData(width, height)
		}
		let minRed = Infinity
		let maxRed = -Infinity
		let minGreen = Infinity
		let maxGreen = -Infinity
		let minBlue = Infinity
		let maxBlue = -Infinity

		for (const colour of colours) {
			const [r, g, b] = getRGB(colour)
			if (r < minRed) minRed = r
			if (r > maxRed) maxRed = r
			if (g < minGreen) minGreen = g
			if (g > maxGreen) maxGreen = g
			if (b < minBlue) minBlue = b
			if (b > maxBlue) maxBlue = b
		}


		const makeGradientColour = (red, green, blue) => {
			return Colour.splash(((red === 1? maxRed : minRed) + (green === 1? maxGreen : minGreen) + (blue === 1? maxBlue : minBlue)))
		}

		const gradientColours = [

			makeGradientColour(0, 0, 1),
			makeGradientColour(0, 0, 1),
			makeGradientColour(0, 0, 1),

			makeGradientColour(0, 1, 1),
			makeGradientColour(1, 0, 0),
			makeGradientColour(1, 0, 0),

			makeGradientColour(0, 1, 0),
			makeGradientColour(0, 1, 0),
			makeGradientColour(1, 0, 0),

		]

		const points = Gradient.getWarpedPoints(width, height)
		let i = 0
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {

				const distances = Gradient.getDistancesFromPoints(x / width, y / height, points)
				const scores = Gradient.getPointScoresFromDistances(distances)
				const sumValues = [0, 0, 0]
				const sumScore = scores.reduce((a, b) => a + b)
				for (let j = 0; j < 9; j++) {
					const score = scores[j]
					const colour = gradientColours[j]
					;[0, 1, 2].forEach(channel => sumValues[channel] += score * colour[channel])
				}
				const values = sumValues.map(value => value / sumScore)
				if (stamp === "circle" && x >= width/4 && x < width*3/4 && y >= height/4 && y < height*3/4) {

					gradient.data[i+3] = 0
				} else {
					gradient.data[i] = values[0]
					gradient.data[i+1] = values[1]
					gradient.data[i+2] = values[2]
					gradient.data[i+3] = 255
				}

				i += 4
				if (i >= gradient.data.length) break
			}
		}
		return gradient
	},

}
