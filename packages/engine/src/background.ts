import type { BgLayers, Plane, SkylineCity } from '@repo/types';
import {
  computeMaxRight,
  createEmptyLayers,
  createPlanePool,
  populateBuildings,
  populateFarClouds,
  populateGroundDeco,
  populateMidClouds,
  populateSkyline,
  populateTrees,
} from './background-init.js';
import { BG, SKYLINE_CITIES } from './config.js';

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
/** Manages parallax background layers: clouds, skyline, buildings, trees, and planes. */
export class BackgroundSystem {
  layers: BgLayers | null = null;
  planePool: Plane[] = [];
  planeActiveCount = 0;
  private nextPlaneTime = 0;
  private deps: BackgroundDeps;
  constructor(deps: BackgroundDeps) {
    this.deps = deps;
  }

  /** Populate all background layers and spawn the first plane. */
  init(): void {
    const { width, height, groundH } = this.deps;
    const groundY = height - groundH;
    this.layers = createEmptyLayers();
    this.planePool = createPlanePool();
    this.planeActiveCount = 0;
    populateFarClouds(this.layers, width);
    populateSkyline(this.layers, width, groundY);
    populateMidClouds(this.layers, width);
    populateBuildings(this.layers, width, groundY);
    populateTrees(this.layers, width, groundY);
    populateGroundDeco(this.layers, width);
    this.spawnPlane(performance.now());
    computeMaxRight(this.layers);
  }

  /** Spawn a new banner plane from a random edge at a non-conflicting altitude. */
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

  /** Advance all background layers by one tick. */
  update(dt: number, now: number, isPlaying: boolean): void {
    if (!this.layers) return;
    const W = this.deps.width;
    const ambientMul = isPlaying ? 1 : 0.35;
    this.updateClouds(ambientMul, dt, W);
    this.updatePlanes(ambientMul, dt, W, now);
    if (!isPlaying) return;
    this.updateScrollingLayers(dt);
  }

  private updateClouds(ambientMul: number, dt: number, W: number): void {
    if (!this.layers) return;
    for (const c of this.layers.farClouds) {
      c.x -= c.speed * this.deps.pipeSpeed * dt * ambientMul;
      if (c.x + c.w < -20) {
        c.x = W + 20 + Math.random() * 60;
        c.y = 15 + Math.random() * 60;
      }
    }
    for (const c of this.layers.midClouds) {
      c.x -= c.speed * this.deps.pipeSpeed * dt * ambientMul;
      if (c.x + c.w < -20) {
        c.x = W + 20 + Math.random() * 40;
        c.y = 60 + Math.random() * 100;
      }
    }
  }

  private updatePlanes(ambientMul: number, dt: number, W: number, now: number): void {
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
  }

  private updateScrollingLayers(dt: number): void {
    if (!this.layers) return;
    const skyShift = BG.farSpeed * this.deps.pipeSpeed * dt;
    const midShift = BG.midSpeed * this.deps.pipeSpeed * dt;
    const nearShift = BG.nearSpeed * this.deps.pipeSpeed * dt;
    this.layers.maxRightSkyline -= skyShift;
    this.layers.maxRightBuildings -= midShift;
    this.layers.maxRightTrees -= nearShift;
    this.layers.maxRightGroundDeco -= nearShift;
    this.scrollSkyline(skyShift);
    this.scrollBuildings(midShift);
    this.scrollTrees(nearShift);
    for (const g of this.layers.groundDeco) {
      g.x -= nearShift;
      if (g.x < -10) {
        g.x = this.layers.maxRightGroundDeco + 25 + Math.random() * 35;
        this.layers.maxRightGroundDeco = g.x;
      }
    }
  }

  private scrollSkyline(shift: number): void {
    if (!this.layers) return;
    for (const seg of this.layers.skyline) {
      seg.x -= shift;
      if (seg.x + seg.totalW < -20) {
        const gap = 5;
        seg.x = this.layers.maxRightSkyline + gap;
        this.layers.maxRightSkyline = seg.x + seg.totalW;
        seg.city = SKYLINE_CITIES[Math.floor(Math.random() * SKYLINE_CITIES.length)] as SkylineCity;
      }
    }
  }

  private scrollBuildings(shift: number): void {
    if (!this.layers) return;
    for (const b of this.layers.buildings) {
      b.x -= shift;
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
  }

  private scrollTrees(shift: number): void {
    if (!this.layers) return;
    for (const t of this.layers.trees) {
      t.x -= shift;
      if (t.x + t.w < -20) {
        const gap = 20 + Math.random() * 50;
        t.x = this.layers.maxRightTrees + gap;
        t.w = BG.treeMinW + Math.random() * (BG.treeMaxW - BG.treeMinW);
        t.h = t.w * (1.5 + Math.random());
        t.type = Math.random() < 0.3 ? 'pine' : 'round';
        this.layers.maxRightTrees = t.x + t.w;
      }
    }
  }
}
