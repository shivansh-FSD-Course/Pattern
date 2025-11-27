import { renderDataRibbon } from "./renderDataRibbon";
import { renderGoldenSpiral } from "./renderGoldenSpiral";
import { renderCandleSpiral } from "./renderCandleSpiral";

export const RENDERERS = {
  data_ribbon: {
    key: "data_ribbon",
    renderer: renderDataRibbon
  },
  golden_spiral: {
    key: "golden_spiral",
    renderer: renderGoldenSpiral
  },
  candle_spiral: {
    key: "candle_spiral",
    renderer: renderCandleSpiral
  }
};

// Random selector
export function getRandomRenderer() {
  const keys = Object.keys(RENDERERS);
  const key = keys[Math.floor(Math.random() * keys.length)];
  return RENDERERS[key];
}
