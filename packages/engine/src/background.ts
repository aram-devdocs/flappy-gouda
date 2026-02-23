import type { BgLayers, Plane, SkylineBuilding, SkylineCity, SkylineSegment } from '@repo/types';
import { BG, SKYLINE_CITIES } from './config.js';
import { maxOf } from './math.js';

interface BackgroundDeps {
  width: number;
  height: number;
  groundH: number;
  pipeSpeed: number;
  bannerTexts: string[];
}

const PLANE_ALT_MIN = 12;
const PLANE_ALT_MAX = 160;
const PLANE_ALT_SEP = 45;

export class BackgroundSystem {
  layers: BgLayers | null = null;
  planePool: Plane[] = [];
  planeActiveCount = 0;
  private nextPlaneTime = 0;
  private deps: BackgroundDeps;

  constructor(deps: BackgroundDeps) {
    this.deps = deps;
  }

  init(): void {
    const { width, height, groundH } = this.deps;
    const groundY = height - groundH;

    this.layers = {
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

    // Plane pool
    this.planePool = [];
    for (let i = 0; i < 3; i++) {
      this.planePool[i] = { x: 0, y: 0, dir: 1, bannerText: '', bannerW: 0, wobble: 0, speed: 0 };
    }
    this.planeActiveCount = 0;

    // Far clouds
    for (let i = 0; i < 3; i++) {
      this.layers.farClouds.push({
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

    // Skyline
    let sx = -50;
    while (sx < width + BG.skylineSegW) {
      const city = SKYLINE_CITIES[Math.floor(Math.random() * SKYLINE_CITIES.length)] as SkylineCity;
      const seg = generateSkylineSegment(city, sx, groundY);
      this.layers.skyline.push(seg);
      sx += seg.totalW;
    }

    // Mid clouds
    for (let i = 0; i < 3; i++) {
      this.layers.midClouds.push({
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

    // Buildings
    let bx = -30;
    while (bx < width + 80) {
      const w = BG.buildingMinW + Math.random() * (BG.buildingMaxW - BG.buildingMinW);
      const h = 30 + Math.random() * 60;
      const rand = Math.random();
      this.layers.buildings.push({
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

    // Trees
    let tx = 10;
    while (tx < width + 40) {
      const w = BG.treeMinW + Math.random() * (BG.treeMaxW - BG.treeMinW);
      this.layers.trees.push({
        x: tx,
        y: groundY,
        w,
        h: w * (1.5 + Math.random()),
        type: Math.random() < 0.3 ? 'pine' : 'round',
        speed: BG.nearSpeed,
      });
      tx += w + 20 + Math.random() * 50;
    }

    // Ground deco
    let gx = 0;
    while (gx < width + 30) {
      this.layers.groundDeco.push({
        x: gx,
        type: Math.random() < 0.5 ? 'dash' : 'dot',
        speed: BG.nearSpeed,
      });
      gx += 25 + Math.random() * 35;
    }

    // Spawn first plane
    this.spawnPlane(performance.now());

    // Pre-compute maxRight trackers
    this.layers.maxRightSkyline = maxOf(this.layers.skyline, (s) => s.x + s.totalW);
    this.layers.maxRightBuildings = maxOf(this.layers.buildings, (b) => b.x + b.w);
    this.layers.maxRightTrees = maxOf(this.layers.trees, (t) => t.x + t.w);
    this.layers.maxRightGroundDeco = maxOf(this.layers.groundDeco, (g) => g.x);
  }

  spawnPlane(now: number): void {
    if (this.planeActiveCount >= this.planePool.length) return;

    const bannerText =
      this.deps.bannerTexts[Math.floor(Math.random() * this.deps.bannerTexts.length)] ??
      'Second Nature';
    let y: number;
    let attempts = 0;
    do {
      y = PLANE_ALT_MIN + Math.random() * (PLANE_ALT_MAX - PLANE_ALT_MIN);
      attempts++;
    } while (attempts < 20 && this.planeAltConflict(y));

    const goingRight = Math.random() < 0.5;
    const p = this.planePool[this.planeActiveCount++] as Plane;
    p.x = goingRight ? -180 : this.deps.width + 180;
    p.y = y;
    p.dir = goingRight ? 1 : -1;
    p.bannerText = bannerText;
    p.bannerW = bannerText.length * 6.5 + 24;
    p.wobble = Math.random() * 1000;
    p.speed = BG.planeSpeed;
    this.nextPlaneTime = now + 8000 + Math.random() * 15000;
  }

  private planeAltConflict(y: number): boolean {
    for (let i = 0; i < this.planeActiveCount; i++) {
      if (Math.abs((this.planePool[i] as Plane).y - y) < PLANE_ALT_SEP) return true;
    }
    return false;
  }

  update(dt: number, now: number, isPlaying: boolean): void {
    if (!this.layers) return;
    const W = this.deps.width;
    const ambientMul = isPlaying ? 1 : 0.35;

    // Far clouds
    for (const c of this.layers.farClouds) {
      c.x -= c.speed * this.deps.pipeSpeed * dt * ambientMul;
      if (c.x + c.w < -20) {
        c.x = W + 20 + Math.random() * 60;
        c.y = 15 + Math.random() * 60;
      }
    }

    // Mid clouds
    for (const c of this.layers.midClouds) {
      c.x -= c.speed * this.deps.pipeSpeed * dt * ambientMul;
      if (c.x + c.w < -20) {
        c.x = W + 20 + Math.random() * 40;
        c.y = 60 + Math.random() * 100;
      }
    }

    // Planes
    for (let i = this.planeActiveCount - 1; i >= 0; i--) {
      const p = this.planePool[i] as Plane;
      p.x += p.dir * p.speed * this.deps.pipeSpeed * dt * ambientMul;
      if ((p.dir > 0 && p.x > W + 250 + p.bannerW) || (p.dir < 0 && p.x < -250 - p.bannerW)) {
        const last = this.planeActiveCount - 1;
        if (i !== last) {
          const tmp = this.planePool[i] as Plane;
          this.planePool[i] = this.planePool[last] as Plane;
          this.planePool[last] = tmp;
        }
        this.planeActiveCount--;
      }
    }
    if (now > this.nextPlaneTime && this.planeActiveCount < 2) {
      this.spawnPlane(now);
    }

    if (!isPlaying) return;

    const skyShift = BG.farSpeed * this.deps.pipeSpeed * dt;
    const midShift = BG.midSpeed * this.deps.pipeSpeed * dt;
    const nearShift = BG.nearSpeed * this.deps.pipeSpeed * dt;
    this.layers.maxRightSkyline -= skyShift;
    this.layers.maxRightBuildings -= midShift;
    this.layers.maxRightTrees -= nearShift;
    this.layers.maxRightGroundDeco -= nearShift;

    // Skyline
    for (const seg of this.layers.skyline) {
      seg.x -= skyShift;
      if (seg.x + seg.totalW < -20) {
        const gap = 5;
        seg.x = this.layers.maxRightSkyline + gap;
        this.layers.maxRightSkyline = seg.x + seg.totalW;
        seg.city = SKYLINE_CITIES[Math.floor(Math.random() * SKYLINE_CITIES.length)] as SkylineCity;
      }
    }

    // Buildings
    for (const b of this.layers.buildings) {
      b.x -= midShift;
      if (b.x + b.w < -20) {
        const gap = 15 + Math.random() * 40;
        b.x = this.layers.maxRightBuildings + gap;
        b.h = 30 + Math.random() * 60;
        b.y = this.deps.height - this.deps.groundH - b.h;
        const rand = Math.random();
        b.type = rand < 0.4 ? 'house' : rand < 0.65 ? 'apartment' : 'office';
        b.windows = Math.floor(Math.random() * 4) + 1;
        this.layers.maxRightBuildings = b.x + b.w;
      }
    }

    // Trees
    for (const t of this.layers.trees) {
      t.x -= nearShift;
      if (t.x + t.w < -20) {
        const gap = 20 + Math.random() * 50;
        t.x = this.layers.maxRightTrees + gap;
        t.w = BG.treeMinW + Math.random() * (BG.treeMaxW - BG.treeMinW);
        t.h = t.w * (1.5 + Math.random());
        t.type = Math.random() < 0.3 ? 'pine' : 'round';
        this.layers.maxRightTrees = t.x + t.w;
      }
    }

    // Ground deco
    for (const g of this.layers.groundDeco) {
      g.x -= nearShift;
      if (g.x < -10) {
        const gap = 25 + Math.random() * 35;
        g.x = this.layers.maxRightGroundDeco + gap;
        this.layers.maxRightGroundDeco = g.x;
      }
    }
  }
}

function generateSkylineSegment(
  city: SkylineCity,
  startX: number,
  groundY: number,
): SkylineSegment {
  const buildings: SkylineBuilding[] = [];
  let cx = 0;
  const count = 3 + Math.floor(Math.random() * 4);
  for (let i = 0; i < count; i++) {
    const w = 12 + Math.random() * 22;
    let h: number;
    switch (city) {
      case 'phoenix':
        h = 25 + Math.random() * 35;
        break;
      case 'neworleans':
        h = 20 + Math.random() * 30;
        break;
      case 'montreal':
        h = 35 + Math.random() * 50;
        break;
      case 'dallas':
        h = 40 + Math.random() * 55;
        break;
      case 'nashville':
        h = 30 + Math.random() * 40;
        break;
    }
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
