import { renderDataRibbon } from "./renderDataRibbon";
import { renderGoldenSpiral } from "./renderGoldenSpiral";
import { renderCandleSpiral } from "./renderCandleSpiral";

export const RENDERERS = {
  data_ribbon: renderDataRibbon,
  golden_spiral: renderGoldenSpiral,
  candle_spiral: renderCandleSpiral
};

export function getRandomRenderer() {
  const keys = Object.keys(RENDERERS);
  const key = keys[Math.floor(Math.random() * keys.length)];
  return { key, renderer: RENDERERS[key] };
}
