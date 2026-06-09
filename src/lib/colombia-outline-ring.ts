/** Anillo exterior del contorno de Colombia (lng, lat) para máscaras en pantalla. */
export const COLOMBIA_OUTLINE_RING: [number, number][] = [
  [-75.373223, -0.152032],
  [-75.801466, 0.084801],
  [-76.292314, 0.416047],
  [-76.57638, 0.256936],
  [-77.424984, 0.395687],
  [-77.668613, 0.825893],
  [-77.855061, 0.809925],
  [-78.855259, 1.380924],
  [-78.990935, 1.69137],
  [-78.617831, 1.766404],
  [-78.662118, 2.267355],
  [-78.42761, 2.629556],
  [-77.931543, 2.696606],
  [-77.510431, 3.325017],
  [-77.12769, 3.849636],
  [-77.496272, 4.087606],
  [-77.307601, 4.667984],
  [-77.533221, 5.582812],
  [-77.318815, 5.845354],
  [-77.476661, 6.691116],
  [-77.881571, 7.223771],
  [-77.753414, 7.70984],
  [-77.431108, 7.638061],
  [-77.242566, 7.935278],
  [-77.474723, 8.524286],
  [-77.353361, 8.670505],
  [-76.836674, 8.638749],
  [-76.086384, 9.336821],
  [-75.6746, 9.443248],
  [-75.664704, 9.774003],
  [-75.480426, 10.61899],
  [-74.906895, 11.083045],
  [-74.276753, 11.102036],
  [-74.197223, 11.310473],
  [-73.414764, 11.227015],
  [-72.627835, 11.731972],
  [-72.238195, 11.95555],
  [-71.75409, 12.437303],
  [-71.399822, 12.376041],
  [-71.137461, 12.112982],
  [-71.331584, 11.776284],
  [-71.973922, 11.608672],
  [-72.227575, 11.108702],
  [-72.614658, 10.821975],
  [-72.905286, 10.450344],
  [-73.027604, 9.73677],
  [-73.304952, 9.152],
  [-72.78873, 9.085027],
  [-72.660495, 8.625288],
  [-72.439862, 8.405275],
  [-72.360901, 8.002638],
  [-72.479679, 7.632506],
  [-72.444487, 7.423785],
  [-72.198352, 7.340431],
  [-71.960176, 6.991615],
  [-70.674234, 7.087785],
  [-70.093313, 6.960376],
  [-69.38948, 6.099861],
  [-68.985319, 6.206805],
  [-68.265052, 6.153268],
  [-67.695087, 6.267318],
  [-67.34144, 6.095468],
  [-67.521532, 5.55687],
  [-67.744697, 5.221129],
  [-67.823012, 4.503937],
  [-67.621836, 3.839482],
  [-67.337564, 3.542342],
  [-67.303173, 3.318454],
  [-67.809938, 2.820655],
  [-67.447092, 2.600281],
  [-67.181294, 2.250638],
  [-66.876326, 1.253361],
  [-67.065048, 1.130112],
  [-67.259998, 1.719999],
  [-67.53781, 2.037163],
  [-67.868565, 1.692455],
  [-69.816973, 1.714805],
  [-69.804597, 1.089081],
  [-69.218638, 0.985677],
  [-69.252434, 0.602651],
  [-69.452396, 0.706159],
  [-70.015566, 0.541414],
  [-70.020656, -0.185156],
  [-69.577065, -0.549992],
  [-69.420486, -1.122619],
  [-69.444102, -1.556287],
  [-69.893635, -4.298187],
  [-70.394044, -3.766591],
  [-70.692682, -3.742872],
  [-70.047709, -2.725156],
  [-70.813476, -2.256865],
  [-71.413646, -2.342802],
  [-71.774761, -2.16979],
  [-72.325787, -2.434218],
  [-73.070392, -2.308954],
  [-73.659504, -1.260491],
  [-74.122395, -1.002833],
  [-74.441601, -0.53082],
  [-75.106625, -0.057205],
  [-75.373223, -0.152032],
];

function ringToScreenPoints(map: import("mapbox-gl").Map, ring: [number, number][]) {
  const points: { x: number; y: number }[] = [];
  for (const [lng, lat] of ring) {
    const { x, y } = map.project([lng, lat]);
    if (Number.isFinite(x) && Number.isFinite(y)) points.push({ x, y });
  }
  return points;
}

export function colombiaOutlineToScreenPath(
  map: import("mapbox-gl").Map,
  ring: [number, number][]
): string {
  const points = ringToScreenPoints(map, ring);
  if (points.length < 3) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ")
    .concat(" Z");
}

/** Recorte CSS para mostrar solo Colombia en color. */
export function colombiaOutlineToClipPath(
  map: import("mapbox-gl").Map,
  ring: [number, number][]
): string {
  const points = ringToScreenPoints(map, ring);
  if (points.length < 3) return "none";
  return `polygon(${points.map((p) => `${p.x}px ${p.y}px`).join(", ")})`;
}

/**
 * Máscara CSS (modo luminance): blanco = capa gris visible, negro = hueco (Colombia a color).
 */
export function buildOutsideColombiaMaskUrl(
  width: number,
  height: number,
  pathD: string
): string {
  const inner = pathD.trim().endsWith("Z") ? pathD.trim() : `${pathD.trim()} Z`;
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="100%" height="100%" fill="white"/>`,
    `<path d="${inner}" fill="black"/>`,
    `</svg>`,
  ].join("");
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Actualiza la máscara en el DOM sin pasar por React (fluido al hacer zoom). */
export function applyOutsideColombiaMaskToElement(
  element: HTMLElement | null,
  width: number,
  height: number,
  pathD: string
): boolean {
  if (!element || !pathD || width < 1 || height < 1) return false;
  const mask = buildOutsideColombiaMaskUrl(width, height, pathD);
  const style = element.style;
  style.maskImage = mask;
  style.webkitMaskImage = mask;
  style.maskSize = "100% 100%";
  style.webkitMaskSize = "100% 100%";
  style.maskRepeat = "no-repeat";
  style.webkitMaskRepeat = "no-repeat";
  style.maskMode = "luminance";
  style.setProperty("-webkit-mask-mode", "luminance");
  return true;
}

/** Tamaño real del contenedor del mapa (puede diferir del layout React). */
export function getMapContainerMaskSize(element: HTMLElement | null) {
  if (!element) return { width: 0, height: 0 };
  const w = Math.round(element.clientWidth);
  const h = Math.round(element.clientHeight);
  return { width: w, height: h };
}

/**
 * Recorte evenodd: visible solo fuera de Colombia (más rápido que mask-image en cada frame).
 */
export function applyOutsideColombiaClipToElement(
  element: HTMLElement | null,
  width: number,
  height: number,
  map: import("mapbox-gl").Map,
  ring: [number, number][]
): boolean {
  if (!element || width < 1 || height < 1 || !map.isStyleLoaded()) return false;

  const points = ringToScreenPoints(map, ring);
  if (points.length < 3) return false;

  const inner = [...points]
    .reverse()
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ")
    .concat(" Z");

  const outer = `M 0 0 H ${width} V ${height} H 0 Z`;
  const clip = `path(evenodd, "${outer} ${inner}")`;
  element.style.clipPath = clip;
  element.style.setProperty("-webkit-clip-path", clip);
  return true;
}
