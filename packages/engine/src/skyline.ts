import type { SkylineBuilding, SkylineCity, SkylineSegment } from '@repo/types';
import { BG } from './config';

export function generateSkylineSegment(
  city: SkylineCity,
  startX: number,
  groundY: number,
): SkylineSegment {
  const buildings: SkylineBuilding[] = [];
  let cx = 0;
  const count = 3 + Math.floor(Math.random() * 4);
  for (let i = 0; i < count; i++) {
    const w = 12 + Math.random() * 22;
    const h = getSkylineHeight(city);
    buildings.push({
      ox: cx,
      w,
      h,
      hasSpire: Math.random() < 0.2,
      hasDome: city === 'montreal' && Math.random() < 0.15,
      hasCactus: city === 'phoenix' && Math.random() < 0.25,
    });
    cx += w + 2 + Math.random() * 6;
  }
  return { x: startX, groundY, city, buildings, totalW: cx, speed: BG.farSpeed };
}

function getSkylineHeight(city: SkylineCity): number {
  switch (city) {
    case 'phoenix':
      return 25 + Math.random() * 35;
    case 'neworleans':
      return 20 + Math.random() * 30;
    case 'montreal':
      return 35 + Math.random() * 50;
    case 'dallas':
      return 40 + Math.random() * 55;
    case 'nashville':
      return 30 + Math.random() * 40;
  }
}
