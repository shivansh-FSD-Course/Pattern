// src/components/renderers/utils.js

/**
 * Safely extract points from vizData with flexible validation.
 * 
 * @param {Object} vizData - Object from backend containing points
 * @param {Array<string>} required - Fields that THIS renderer requires
 * @returns {Array|null}
 */
export function requirePoints(vizData, required = ["x", "y", "z"]) {
  if (!vizData || !Array.isArray(vizData.points)) {
    console.warn("[Renderer] No points array found in vizData");
    return null;
  }

  const pts = vizData.points;

  // Only validate fields the renderer explicitly requests
  const missing = pts.some((p) =>
    required.some((key) => typeof p[key] !== "number")
  );

  if (missing) {
    console.warn(
      `[Renderer] Some points are missing required fields: ${required.join(", ")}`
    );
  }

  return pts;
}


/**
 * Ensures renderer returns a valid empty structure
 */
export function makeSafeReturn() {
  return {
    group: null,
    update: () => {}
  };
}


/**
 * Helper to register disposables (materials, geometries, curves, etc.)
 */
export function addDisposable(disposables, ...items) {
  items.forEach((obj) => {
    if (obj) disposables.push(obj);
  });
}
