import type { BgLayers, Plane, SkylineCity } from '@repo/types';
import { BG, SKYLINE_CITIES } from './config.js';
import { maxOf } from './math.js';
import { generateSkylineSegment } from './skyline.js';

export function createEmptyLayers(): BgLayers {
  return {
    farClouds: [],
    skyline: [],
    midClouds: [],
    buildings: [],
    trees: [],
    groundDeco: [],
    maxRightSkyline: 0,
    maxRightBuildings: 0,
    maxRightTrees: 0,
    maxRightGroundDeco: 0,
  };
}

export function createPlanePool(): Plane[] {
  const pool: Plane[] = [];
  for (let i = 0; i < 3; i++) {
    pool[i] = { x: 0, y: 0, dir: 1, bannerText: '', bannerW: 0, wobble: 0, speed: 0 };
  }
  return pool;
}

export function populateFarClouds(layers: BgLayers, width: number): void {
  for (let i = 0; i < 3; i++) {
    layers.farClouds.push({
      x: Math.random() * width * 1.5,
      y: 15 + Math.random() * 60,
      w: 70 + Math.random() * 80,
      speed: BG.farSpeed,
      _canvas: null,
      _pad: 0,
      _logW: 0,
      _logH: 0,
    });
  }
}

export function populateSkyline(layers: BgLayers, width: number, groundY: number): void {
  let sx = -50;
  while (sx < width + BG.skylineSegW) {
    const city = SKYLINE_CITIES[Math.floor(Math.random() * SKYLINE_CITIES.length)] as SkylineCity;
    const seg = generateSkylineSegment(city, sx, groundY);
    layers.skyline.push(seg);
    sx += seg.totalW;
  }
}

export function populateMidClouds(layers: BgLayers, width: number): void {
  for (let i = 0; i < 3; i++) {
    layers.midClouds.push({
      x: Math.random() * width * 1.3,
      y: 60 + Math.random() * 100,
      w: 35 + Math.random() * 45,
      speed: BG.midSpeed,
      _canvas: null,
      _pad: 0,
      _logW: 0,
      _logH: 0,
    });
  }
}

export function populateBuildings(layers: BgLayers, width: number, groundY: number): void {
  let bx = -30;
  while (bx < width + 80) {
    const w = BG.buildingMinW + Math.random() * (BG.buildingMaxW - BG.buildingMinW);
    const h = 30 + Math.random() * 60;
    const rand = Math.random();
    layers.buildings.push({
      x: bx,
      y: groundY - h,
      w,
      h,
      type: rand < 0.4 ? 'house' : rand < 0.7 ? 'apartment' : 'office',
      windows: Math.floor(Math.random() * 4) + 1,
      speed: BG.midSpeed,
      _cacheOffX: 0,
      _cacheOffY: 0,
      _cacheW: 0,
      _cacheH: 0,
    });
    bx += w + 15 + Math.random() * 40;
  }
}

export function populateTrees(layers: BgLayers, width: number, groundY: number): void {
  let tx = 10;
  while (tx < width + 40) {
    const w = BG.treeMinW + Math.random() * (BG.treeMaxW - BG.treeMinW);
    layers.trees.push({
      x: tx,
      y: groundY,
      w,
      h: w * (1.5 + Math.random()),
      type: Math.random() < 0.3 ? 'pine' : 'round',
      speed: BG.nearSpeed,
    });
    tx += w + 20 + Math.random() * 50;
  }
}

export function populateGroundDeco(layers: BgLayers, width: number): void {
  let gx = 0;
  while (gx < width + 30) {
    layers.groundDeco.push({
      x: gx,
      type: Math.random() < 0.5 ? 'dash' : 'dot',
      speed: BG.nearSpeed,
    });
    gx += 25 + Math.random() * 35;
  }
}

export function computeMaxRight(layers: BgLayers): void {
  layers.maxRightSkyline = maxOf(layers.skyline, (s) => s.x + s.totalW);
  layers.maxRightBuildings = maxOf(layers.buildings, (b) => b.x + b.w);
  layers.maxRightTrees = maxOf(layers.trees, (t) => t.x + t.w);
  layers.maxRightGroundDeco = maxOf(layers.groundDeco, (g) => g.x);
}
