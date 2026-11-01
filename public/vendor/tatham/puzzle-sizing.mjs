/* Size the engine's backing canvas, preserving its own aspect ratio and input coordinates. */
export function fitPuzzleBoard(container, resize, pixelRatio = 1) {
  const width = container.clientWidth;
  const height = container.clientHeight;
  // Engine startup can precede visibility. Wait for the observer instead of saving a tiny size.
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return false;
  const ratio = Number.isFinite(pixelRatio) && pixelRatio > 0 ? pixelRatio : 1;
  resize(Math.max(1, Math.floor(width * ratio)), Math.max(1, Math.floor(height * ratio)));
  return true;
}
