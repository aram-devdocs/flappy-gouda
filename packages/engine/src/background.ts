import type { BgLayers } from '@repo/types';
import { atIndex } from './assert';
import {
  computeMaxRight,
  createEmptyLayers,
  populateBuildings,
  populateFarClouds,
  populateGroundDeco,
  populateMidClouds,
  populateSkyline,
  populateTrees,
  randomBuildingType,
} from './background-init';
import { BG, SKYLINE_CITIES } from './config';

interface BackgroundDeps {
  width: number;
  height: number;
  groundH: number;
  pipeSpeed: number;
}

/** Manages parallax background layers: clouds, skyline, buildings, and trees. */
export class BackgroundSystem {
  layers: BgLayers | null = null;
  private deps: BackgroundDeps;
  constructor(deps: BackgroundDeps) {
    this.deps = deps;
  }

  /** Populate all background layers. */
  init(): void {
    const { width, height, groundH } = this.deps;
    const groundY = height - groundH;
    this.layers = createEmptyLayers();
    populateFarClouds(this.layers, width);
    populateSkyline(this.layers, width, groundY);
    populateMidClouds(this.layers, width);
    populateBuildings(this.layers, width, groundY);
    populateTrees(this.layers, width, groundY);
    populateGroundDeco(this.layers, width);
    computeMaxRight(this.layers);
  }

  /** Advance all background layers by one tick. */
  update(dt: number, _now: number, isPlaying: boolean, reducedMotion = false): void {
    if (!this.layers) return;
    const W = this.deps.width;
    const ambientMul = isPlaying ? 1 : reducedMotion ? 0 : 0.35;
    this.updateClouds(ambientMul, dt, W);
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
        seg.city = atIndex(SKYLINE_CITIES, Math.floor(Math.random() * SKYLINE_CITIES.length));
        seg._canvas = null;
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
        b.type = randomBuildingType();
        b.windows = Math.floor(Math.random() * 4) + 1;
        b._canvas = null;
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
        t._canvas = null;
        this.layers.maxRightTrees = t.x + t.w;
      }
    }
  }
}
