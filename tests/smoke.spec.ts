import { test, expect, Page } from "@playwright/test";
import { PNG } from "pngjs";

type Rect = { x: number; y: number; width: number; height: number };
type Color = { r: number; g: number; b: number; a: number };
type ColorPredicate = (c: Color) => boolean;

/**
 * Take a screenshot of a region and decode it into raw RGBA pixel data.
 */
async function screenshotPixels(page: Page, region: Rect) {
  const buffer = await page.screenshot({ clip: region });
  const png = PNG.sync.read(buffer);
  return { data: png.data, width: png.width, height: png.height };
}

/**
 * Find the center of all pixels matching a predicate in a screenshot region.
 * Returns page-absolute coordinates, or null if no matching pixels found.
 */
async function findColor(
  page: Page,
  region: Rect,
  predicate: ColorPredicate
): Promise<{ x: number; y: number } | null> {
  const { data, width, height } = await screenshotPixels(page, region);
  let sumX = 0,
    sumY = 0,
    count = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (predicate({ r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] })) {
        sumX += x;
        sumY += y;
        count++;
      }
    }
  }
  if (count === 0) return null;
  return { x: region.x + sumX / count, y: region.y + sumY / count };
}

/**
 * Assert that the canvas color changes in a given region after performing an action.
 */
async function expectCanvasColorChange(
  page: Page,
  region: Rect,
  action: () => Promise<void>
) {
  const before = await page.screenshot({ clip: region });
  await action();
  const after = await page.screenshot({ clip: region });
  expect(Buffer.compare(before, after)).not.toBe(0);
}

/**
 * Drag from one point to another, pausing before release to kill momentum.
 */
async function drag(
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
  { steps = 20, settleMs = 500 } = {}
) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps });
  await page.waitForTimeout(settleMs);
  await page.mouse.up();
  await page.waitForTimeout(300);
}

/**
 * Wait for the grid to settle (it starts with a random pattern that decays to black).
 */
async function waitForGridToSettle(page: Page) {
  let prev = await page.screenshot();
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(500);
    const curr = await page.screenshot();
    if (Buffer.compare(prev, curr) === 0) break;
    prev = curr;
  }
}

const isWhite: ColorPredicate = (c) => c.r > 240 && c.g > 240 && c.b > 240 && c.a > 240;

test("end-to-end smoke test", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible({ timeout: 10000 });

  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas has no bounding box");

  // --- Grid renders ---
  const uniqueColors = await page.evaluate(() => {
    const el = document.querySelector("canvas")!;
    const ctx = el.getContext("2d")!;
    const { width, height } = el;
    const imageData = ctx.getImageData(0, 0, width, height);
    const colors = new Set<string>();
    for (let i = 0; i < imageData.data.length; i += 4) {
      colors.add(
        `${imageData.data[i]},${imageData.data[i + 1]},${imageData.data[i + 2]}`
      );
      if (colors.size > 1) return colors.size;
    }
    return colors.size;
  });
  expect(uniqueColors).toBeGreaterThan(1);

  // --- Wait for grid to settle ---
  await waitForGridToSettle(page);

  // --- Paint the grid center with the default white brush ---
  const gridCenter = {
    x: box.x + box.width * 0.5,
    y: box.y + box.height * 0.5,
  };
  const paintRegion: Rect = {
    x: Math.floor(gridCenter.x - 30),
    y: Math.floor(gridCenter.y - 30),
    width: 60,
    height: 60,
  };
  await expectCanvasColorChange(page, paintRegion, async () => {
    await page.mouse.move(gridCenter.x, gridCenter.y);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.up();
    await page.waitForTimeout(300);
  });
  const paintedWhite = await findColor(page, paintRegion, isWhite);
  expect(paintedWhite).not.toBeNull();

  // --- Open a paddle by dragging the handle ---
  const handleX = box.x + 10;
  const handleY = box.y + box.height * 0.15;
  const paddleRegion: Rect = {
    x: Math.floor(box.x),
    y: Math.floor(handleY - 40),
    width: 250,
    height: 80,
  };
  await expectCanvasColorChange(page, paddleRegion, async () => {
    await drag(page, { x: handleX, y: handleY }, { x: handleX + 400, y: handleY });
  });

  // --- Drag the triangle onto the paddle first ---
  const isGray: ColorPredicate = (c) =>
    c.r > 50 && c.r < 120 && c.g > 50 && c.g < 120 && c.b > 60 && c.b < 140 && c.a > 200;
  const paddleHandleRegion: Rect = {
    x: Math.floor(box.x),
    y: Math.floor(box.y + box.height * 0.05),
    width: Math.floor(box.width * 0.5),
    height: Math.floor(box.height * 0.25),
  };
  const grayCenter = await findColor(page, paddleHandleRegion, isGray);
  expect(grayCenter).not.toBeNull();

  // Find the exact bounds of the gray paddle rectangle
  const grayBounds = await (async () => {
    const { data, width, height } = await screenshotPixels(page, paddleHandleRegion);
    let minX = width, maxX = 0, minY = height, maxY = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        if (isGray({ r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] })) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    return {
      x: paddleHandleRegion.x + (minX + maxX) / 2,
      y: paddleHandleRegion.y + (minY + maxY) / 2,
      width: maxX - minX,
      height: maxY - minY,
    };
  })();

  // Drop the triangle at the geometric center of the gray rectangle
  const triangleToolPos = { x: box.x + 65, y: box.y + 30 };
  const grayCenterExact = { x: grayBounds.x, y: grayBounds.y };
  await expectCanvasColorChange(page, paddleHandleRegion, async () => {
    await drag(page, triangleToolPos, grayCenterExact, { settleMs: 1000 });
  });

  // Drop squares at the center of each third of the gray area.
  // The gray area is divided: [left square zone] [triangle zone] [right square zone]
  const grayLeft = grayBounds.x - grayBounds.width / 2;
  const grayRight = grayBounds.x + grayBounds.width / 2;
  const thirdWidth = grayBounds.width / 3;
  const leftTarget = { x: grayLeft + thirdWidth / 2, y: grayBounds.y };
  const rightTarget = { x: grayRight - thirdWidth / 2, y: grayBounds.y };

  // --- Drag a white square from the toolbar onto the left (0,0) position ---
  const toolPos = { x: box.x + 25, y: box.y + 30 };
  await expectCanvasColorChange(page, paddleHandleRegion, async () => {
    await drag(page, toolPos, leftTarget, { settleMs: 1000 });
  });

  // --- Drag a second white square to a different spot ---
  const dropPos2 = { x: box.x + box.width * 0.12, y: box.y + box.height * 0.7 };
  const dropRegion2: Rect = {
    x: Math.floor(box.x),
    y: Math.floor(box.y + box.height * 0.5),
    width: Math.floor(box.width * 0.25),
    height: Math.floor(box.height * 0.4),
  };
  await expectCanvasColorChange(page, dropRegion2, async () => {
    await drag(page, toolPos, dropPos2);
  });

  // --- Click the second square to open its color picker ---
  const tightSearchRegion: Rect = {
    x: Math.floor(dropPos2.x - 50),
    y: Math.floor(dropPos2.y - 50),
    width: 100,
    height: 100,
  };
  const squarePos = await findColor(page, tightSearchRegion, isWhite);
  expect(squarePos).not.toBeNull();

  const pickerRegion: Rect = {
    x: Math.floor(squarePos!.x - 30),
    y: Math.floor(squarePos!.y - 60),
    width: 400,
    height: 120,
  };
  await expectCanvasColorChange(page, pickerRegion, async () => {
    await page.mouse.click(squarePos!.x, squarePos!.y);
    await page.waitForTimeout(300);
  });

  // --- Click the red channel and select the bottom value (cyan) ---
  const isRed: ColorPredicate = (c) => c.r > 180 && c.g < 80 && c.b < 80 && c.a > 200;
  const redSearchRegion: Rect = {
    x: Math.floor(squarePos!.x),
    y: Math.floor(squarePos!.y - 60),
    width: 400,
    height: 120,
  };
  const redPos = await findColor(page, redSearchRegion, isRed);
  expect(redPos).not.toBeNull();

  await expectCanvasColorChange(page, redSearchRegion, async () => {
    await page.mouse.click(redPos!.x, redPos!.y);
    await page.waitForTimeout(300);
  });

  const isCyan: ColorPredicate = (c) => c.r < 100 && c.g > 200 && c.b > 230 && c.a > 200;
  const channelSearchRegion: Rect = {
    x: Math.floor(redPos!.x - 40),
    y: Math.floor(redPos!.y),
    width: 80,
    height: Math.floor(box.height * 0.8),
  };
  const cyanPos = await (async () => {
    const { data, width, height } = await screenshotPixels(page, channelSearchRegion);
    for (let y = height - 1; y >= 0; y--) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        if (isCyan({ r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] })) {
          return { x: channelSearchRegion.x + x, y: channelSearchRegion.y + y };
        }
      }
    }
    return null;
  })();
  expect(cyanPos).not.toBeNull();

  await expectCanvasColorChange(page, channelSearchRegion, async () => {
    await page.mouse.click(cyanPos!.x, cyanPos!.y);
    await page.waitForTimeout(300);
  });

  // --- Zero the green channel to turn cyan into blue ---
  const isGreen: ColorPredicate = (c) => c.g > 150 && c.r < 100 && c.b < 100 && c.a > 200;
  const pickerSearchRegion: Rect = {
    x: Math.floor(squarePos!.x + 10),
    y: Math.floor(squarePos!.y - 40),
    width: 300,
    height: 80,
  };

  // Find and click the green channel button, now visible since the square is cyan
  const greenPos = await findColor(page, pickerSearchRegion, isGreen);
  expect(greenPos).not.toBeNull();

  await expectCanvasColorChange(page, pickerSearchRegion, async () => {
    await page.mouse.click(greenPos!.x, greenPos!.y);
    await page.waitForTimeout(300);
  });

  // Click the bottom value in the expanded green column to zero it
  const chColumnRegion: Rect = {
    x: Math.floor(greenPos!.x - 40),
    y: Math.floor(greenPos!.y + 10),
    width: 80,
    height: Math.floor(box.height * 0.6),
  };
  const isNotBackground: ColorPredicate = (c) =>
    c.a > 200 && !(c.r < 35 && c.g < 35 && c.b < 45);

  const bottomPos = await (async () => {
    const { data, width, height } = await screenshotPixels(page, chColumnRegion);
    let lastY = -1, lastX = width / 2;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        if (isNotBackground({ r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] })) {
          lastY = y;
          lastX = x;
        }
      }
    }
    if (lastY < 0) return null;
    return { x: chColumnRegion.x + lastX, y: chColumnRegion.y + lastY };
  })();
  expect(bottomPos).not.toBeNull();

  await expectCanvasColorChange(page, chColumnRegion, async () => {
    await page.mouse.click(bottomPos!.x, bottomPos!.y);
    await page.waitForTimeout(300);
  });

  // --- Close the picker ---
  await page.mouse.click(squarePos!.x, squarePos!.y);
  await page.waitForTimeout(300);

  // --- Drag the blue square onto the small black square on the paddle ---
  const isBlue: ColorPredicate = (c) => c.b > 150 && c.r < 100 && c.g < 100 && c.a > 200;
  const blueSearchRegion: Rect = {
    x: Math.floor(dropPos2.x - 50),
    y: Math.floor(dropPos2.y - 50),
    width: 100,
    height: 100,
  };
  const bluePos = await findColor(page, blueSearchRegion, isBlue);
  expect(bluePos).not.toBeNull();

  // Drop the blue square onto the right (0,0) position on the paddle
  await expectCanvasColorChange(page, paddleHandleRegion, async () => {
    await drag(page, bluePos!, rightTarget, { settleMs: 1000 });
  });

  // --- Add a blue square to the left of the existing white square on the paddle ---
  // The toolbar square is now blue (from the color change), so dragging from it gives blue.
  await expectCanvasColorChange(page, paddleHandleRegion, async () => {
    await drag(page, toolPos, leftTarget, { settleMs: 1000 });
  });

  // --- Drag the white square off the paddle, below ---
  // Search only the left portion of the paddle (before the triangle) for white
  const trianglePos = await findColor(page, paddleHandleRegion, isWhite);
  const whiteSearchOnPaddle: Rect = {
    x: Math.floor(paddleHandleRegion.x),
    y: Math.floor(grayBounds.y - grayBounds.height / 2),
    width: Math.floor(trianglePos!.x - paddleHandleRegion.x),
    height: Math.floor(grayBounds.height),
  };
  const whiteOnPaddle = await findColor(page, whiteSearchOnPaddle, isWhite);
  expect(whiteOnPaddle).not.toBeNull();
  const belowPaddle = { x: whiteOnPaddle!.x, y: grayBounds.y + grayBounds.height + 80 };
  await drag(page, whiteOnPaddle!, belowPaddle, { settleMs: 1000 });

  // --- Drag a circle from the toolbar onto the right edge of the paddle ---
  // The paddle body is a medium blue-gray rectangle that extends beyond the inner gray area.
  // Scan rightward from the gray area center to find where the paddle body ends.
  // The paddle body color is ~r40-70, g45-75, b60-110 (between gray inner and dark background).
  const isPaddleBody: ColorPredicate = (c) =>
    c.r > 30 && c.r < 80 && c.g > 35 && c.g < 85 && c.b > 50 && c.b < 120 && c.a > 200;
  const paddleEdgeScanRegion: Rect = {
    x: Math.floor(grayBounds.x + grayBounds.width / 2),
    y: Math.floor(grayBounds.y - 2),
    width: 200,
    height: 4,
  };
  const paddleEdgePx = await screenshotPixels(page, paddleEdgeScanRegion);
  // Find the RIGHTMOST paddle body pixel (scan entire row, skip items on the paddle)
  let paddleRightEdgeX = grayBounds.x + grayBounds.width / 2 + 20; // fallback
  for (let x = paddleEdgePx.width - 1; x >= 0; x--) {
    const i = (2 * paddleEdgePx.width + x) * 4; // middle row
    const c = { r: paddleEdgePx.data[i], g: paddleEdgePx.data[i+1], b: paddleEdgePx.data[i+2], a: paddleEdgePx.data[i+3] };
    if (isPaddleBody(c)) {
      paddleRightEdgeX = paddleEdgeScanRegion.x + x;
      break;
    }
  }

  const circleToolPos = { x: box.x + 120, y: box.y + 30 };
  // Drop the circle exactly at the right edge of the paddle body (slightly past it to straddle)
  const paddleFarRight = { x: paddleRightEdgeX + 5, y: grayBounds.y };
  await drag(page, circleToolPos, paddleFarRight, { settleMs: 1000 });

  // --- Click the circle to open its options ---
  // Take a before screenshot to diff against
  const buttonsRegion: Rect = {
    x: Math.floor(paddleFarRight.x + 20),
    y: Math.floor(paddleFarRight.y - 50),
    width: 60,
    height: 120,
  };
  const beforeClickPx = await screenshotPixels(page, buttonsRegion);

  await page.mouse.click(paddleFarRight.x, paddleFarRight.y);
  await page.waitForTimeout(500);

  const afterClickPx = await screenshotPixels(page, buttonsRegion);

  // Find pixels that changed (the buttons that appeared)
  // Group changed pixels by Y to find 3 button clusters
  const changedRows: Map<number, number[]> = new Map();
  for (let y = 0; y < afterClickPx.height; y++) {
    for (let x = 0; x < afterClickPx.width; x++) {
      const i = (y * afterClickPx.width + x) * 4;
      const dr = Math.abs(afterClickPx.data[i] - beforeClickPx.data[i]);
      const dg = Math.abs(afterClickPx.data[i + 1] - beforeClickPx.data[i + 1]);
      const db = Math.abs(afterClickPx.data[i + 2] - beforeClickPx.data[i + 2]);
      if (dr + dg + db > 30) {
        const absY = buttonsRegion.y + y;
        const absX = buttonsRegion.x + x;
        if (!changedRows.has(absY)) changedRows.set(absY, []);
        changedRows.get(absY)!.push(absX);
      }
    }
  }

  // Group changed rows into clusters (gaps > 5px separate clusters)
  const sortedYs = [...changedRows.keys()].sort((a, b) => a - b);
  const btnClusters: { ys: number[]; xs: number[] }[] = [];
  for (const y of sortedYs) {
    const last = btnClusters[btnClusters.length - 1];
    if (last && y - last.ys[last.ys.length - 1] < 3) {
      last.ys.push(y);
      last.xs.push(...changedRows.get(y)!);
    } else {
      btnClusters.push({ ys: [y], xs: [...changedRows.get(y)!] });
    }
  }


  // The 3 buttons span the changed area. Divide into thirds and click center of middle third.
  const allChangedYs = btnClusters.flatMap(c => c.ys);
  const allChangedXs = btnClusters.flatMap(c => c.xs);
  const minChangedY = Math.min(...allChangedYs);
  const maxChangedY = Math.max(...allChangedYs);
  const thirdH = (maxChangedY - minChangedY) / 3;
  const midThirdMinY = minChangedY + thirdH;
  const midThirdMaxY = minChangedY + thirdH * 2;
  // Get x centroid of pixels in the middle third
  const midXs: number[] = [];
  for (let i = 0; i < allChangedYs.length; i++) {
    if (allChangedYs[i] >= midThirdMinY && allChangedYs[i] <= midThirdMaxY) {
      midXs.push(allChangedXs[i]);
    }
  }
  const midBtnX = midXs.reduce((a, b) => a + b, 0) / midXs.length;
  const midBtnY = (midThirdMinY + midThirdMaxY) / 2;
  await page.mouse.click(midBtnX, midBtnY);
  await page.waitForTimeout(500);


  // --- Assert that the blue band spreads to the far right edge of the grid ---
  // Check at 90%+ of grid width — the circle should make the rule spread further
  const gridFarRight: Rect = {
    x: Math.floor(box.x + box.width * 0.7),
    y: Math.floor(gridCenter.y - 30),
    width: Math.floor(box.width * 0.1),
    height: 60,
  };
  let reachedEdge = false;
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(500);
    const blueAtEdge = await findColor(page, gridFarRight, isBlue);
    if (blueAtEdge) {
      reachedEdge = true;
      break;
    }
  }
  expect(reachedEdge).toBe(true);

  // --- Assert that the far left of the grid also gets blue ---
  // The circle's middle button should enable the rule to spread in all directions
  const gridFarLeft: Rect = {
    x: Math.floor(box.x + box.width * 0.25),
    y: Math.floor(gridCenter.y - 30),
    width: Math.floor(box.width * 0.1),
    height: 60,
  };
  let reachedLeft = false;
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(500);
    const blueAtLeft = await findColor(page, gridFarLeft, isBlue);
    if (blueAtLeft) {
      reachedLeft = true;
      break;
    }
  }
  expect(reachedLeft).toBe(true);

});
