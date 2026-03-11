# CellPond Design Notes

Notes preserved from commented-out code in the monolith.
These document alternative approaches and design decisions.

## Alternative speed configuration

An earlier speed config that was replaced with the current values:

```js
speed: {
    count: 100,
    dynamic: false,
    aer: 2.0,
    redraw: 300.0,
    redrawRepeatScore: 1.0,
    redrawRepeatPenalty: 0.0,
},
```

## Border colour generation

Two approaches for generating border colours were tried.
Both precompute 1000 colours (one per splash value).

### Approach 1: Simple darkening
```js
const borderColours = []
for (let i = 0; i < 1000; i++) {
    const colour = Colour.splash(i)
    const darkness = 70 - colour.lightness
    borderColour = Colour.add(colour, {lightness: -20})
    borderColours.push(borderColour)
}
```

### Approach 2: Tool border colours (lighten dark colours)
```js
const toolBorderColours = []
for (let i = 0; i < 1000; i++) {
    const colour = Colour.splash(i)
    let borderColour = Colour.add(colour, {lightness: -20})
    if (colour.lightness <= 35) {
        borderColour = Colour.add(colour, {lightness: 15})
    }
    toolBorderColours.push(borderColour)
}
toolBorderColours[000] = Colour.Grey
```

## Gradient colours (for hexagon element)

Gradient colour order that was experimented with:
```js
makeGradientColour(0, 1, 0),
makeGradientColour(0, 1, 1),
makeGradientColour(0, 0, 1),
makeGradientColour(1, 0, 1),
makeGradientColour(1, 0, 0),
makeGradientColour(1, 1, 0),
makeGradientColour(0, 1, 0),
```

## Stripe pattern for diamond element

A decorative stripe pattern that was tried on the diamond:
```js
const swidth = atom.width/10
const sheight = atom.height/10
const stripes = [
    [[left, top], [left + swidth, top], [left, top + sheight]],
    [[left + swidth*2, top], [left + swidth*4, top], [left, top + sheight*4], [left, top + sheight*2]],
    [[left + swidth*5, top], [left + swidth*7, top], [left, top + sheight*7], [left, top + sheight*5]],
    [[left + swidth*8, top], [left + swidth*10, top], [left, top + sheight*10], [left, top + sheight*8]],
    [[left + swidth*10, top + sheight], [left + swidth*10, top + sheight*3], [left + swidth*3, top + sheight*10], [left + swidth, top + sheight*10]],
    [[left + swidth*10, top + sheight*4], [left + swidth*10, top + sheight*6], [left + swidth*6, top + sheight*10], [left + swidth*4, top + sheight*10]],
    [[left + swidth*10, top + sheight*7], [left + swidth*10, top + sheight*9], [left + swidth*9, top + sheight*10], [left + swidth*7, top + sheight*10]],
    [[left + swidth*10, top + sheight*10], [left + swidth*10, top + sheight*10]],
]
for (const stripe of stripes) {
    fillPoints(Colour.Black, stripe)
}
```

## Symmetry handle positioning

Symmetry handles were originally positioned with dedicated left/right handles:
```js
atom.handleLeft = createChild(atom, SYMMETRY_HANDLE)
atom.handleLeft.y = atom.height/2 - atom.handleLeft.height/2
atom.handleLeft.x = -atom.width/2 - atom.handleLeft.width

atom.padLeft = createChild(atom, SYMMETRY_PAD)
atom.padLeft.y = atom.height/2 - atom.padLeft.height/2
atom.padLeft.x = -atom.padLeft.width - OPTION_MARGIN
```

## Paddle right triangle slot finding

An alternative approach for finding slots when dragging to the right triangle area of a paddle:
```js
else if (paddle.rightTriangle !== undefined && left > pleft + paddle.rightTriangle.x) {
    let winningDistance = Infinity
    let winningSlot = undefined
    for (const cellAtom of paddle.cellAtoms) {
        if (cellAtom.slotted !== undefined) continue
        const {x: cx, y: cy} = getAtomPosition(cellAtom.slot)
        const distance = Math.hypot(x - cx, y - cy)
        if (distance < winningDistance) {
            winningDistance = distance
            winningSlot = cellAtom.slot
        }
    }
    if (winningSlot === undefined) break
    const {x: cx, y: cy} = getAtomPosition(winningSlot)
    atom.highlight = createChild(atom, HIGHLIGHT, {bottom: true})
    atom.highlight.x = cx
    atom.highlight.y = cy
    atom.highlight.hasBorder = true
    atom.highlight.colour = Colour.Grey
    atom.highlightedAtom = winningSlot
    break
}
```
