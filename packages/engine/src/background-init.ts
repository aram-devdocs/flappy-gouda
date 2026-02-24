import type { BgLayers, BuildingType, Plane } from '@repo/types';
import { atIndex } from './assert.js';
import { BG, CLOUD_PARAMS, SKYLINE_CITIES } from './config.js';
import { maxOf } from './math.js';
import { generateSkylineSegment } from './skyline.js';

/** Return a random building type with consistent probability thresholds. */
export function randomBuildingType(): BuildingType {
  const rand = Math.random();
  return rand < 0.4 ? 'house' : rand < 0.7 ? 'apartment' : 'office';
}

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
      x: Math.random() * width * CLOUD_PARAMS.far.spreadX,
      y: CLOUD_PARAMS.far.minY + Math.random() * CLOUD_PARAMS.far.rangeY,
      w: CLOUD_PARAMS.far.minW + Math.random() * CLOUD_PARAMS.far.rangeW,
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
    const city = atIndex(SKYLINE_CITIES, Math.floor(Math.random() * SKYLINE_CITIES.length));
    const seg = generateSkylineSegment(city, sx, groundY);
    layers.skyline.push(seg);
    sx += seg.totalW;
  }
}

export function populateMidClouds(layers: BgLayers, width: number): void {
  for (let i = 0; i < 3; i++) {
    layers.midClouds.push({
      x: Math.random() * width * CLOUD_PARAMS.mid.spreadX,
      y: CLOUD_PARAMS.mid.minY + Math.random() * CLOUD_PARAMS.mid.rangeY,
      w: CLOUD_PARAMS.mid.minW + Math.random() * CLOUD_PARAMS.mid.rangeW,
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
    layers.buildings.push({
      x: bx,
      y: groundY - h,
      w,
      h,
      type: randomBuildingType(),
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
