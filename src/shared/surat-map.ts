// Surat, drawn for the homepage "About" map: the projection the branch pins
// use, and the course of the Tapi through the city.
//
// River geometry: OpenStreetMap (© OpenStreetMap contributors, ODbL), the
// "Tapi" waterway ways, projected into this viewBox and thinned to ~5-unit
// steps. Regenerate if the bounds change.

export const SURAT_BOUNDS = { south: 21.125, north: 21.27, west: 72.735, east: 72.9 };

/** viewBox size: width 1000, height from the bounds at Surat's latitude. */
export const SURAT_VIEW = { w: 1000, h: 943 };

/** Map position (viewBox units) of a lat/lng. */
export function suratXY(lat: number, lng: number) {
  const b = SURAT_BOUNDS;
  return {
    x: ((lng - b.west) / (b.east - b.west)) * SURAT_VIEW.w,
    y: ((b.north - lat) / (b.north - b.south)) * SURAT_VIEW.h,
  };
}

export function inSurat(lat: number, lng: number) {
  const b = SURAT_BOUNDS;
  return lat > b.south && lat < b.north && lng > b.west && lng < b.east;
}

/** The Tapi, east to west (it leaves the frame towards the sea at the bottom left). */
export const TAPI_PATH =
  "M1233 -92 L1219 -90 L1205 -85 L1156 -63 L1121 -46 L1112 -40 L1107 -35 L1089 -5 L1057 56 L1055 65 L1056 78 L1056 92 L1051 116 L1044 134 L1038 147 L1031 158 L1012 177 L986 194 L971 203 L956 214 L912 252 L891 267 L874 277 L845 289 L824 295 L806 298 L793 300 L773 299 L763 297 L752 295 L740 289 L718 278 L703 268 L694 262 L688 256 L656 213 L635 186 L599 160 L577 144 L551 127 L536 111 L530 102 L522 93 L516 89 L509 86 L502 85 L495 86 L485 89 L475 92 L461 100 L447 109 L432 124 L418 139 L380 172 L367 181 L355 194 L349 209 L345 225 L348 241 L354 258 L374 285 L405 340 L407 345 L411 354 L414 358 L423 364 L437 363 L448 368 L451 373 L458 378 L464 380 L476 386 L485 393 L492 401 L503 416 L507 422 L510 430 L509 439 L508 448 L502 461 L498 471 L485 491 L479 499 L475 503 L452 519 L433 534 L390 566 L381 572 L369 578 L361 581 L294 588 L264 597 L257 605 L245 613 L233 625 L221 642 L191 693 L179 708 L97 775 L25 824 L7 833 L-8 838 L-24 841 L-40 841 L-114 829 L-143 819 L-143 819";
