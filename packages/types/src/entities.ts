/** The player-controlled bird entity with position, velocity, and rotation. */
export interface Bird {
  /** Vertical position from the top of the canvas. */
  y: number;
  /** Vertical velocity in pixels/tick (negative = upward). */
  vy: number;
  /** Visual rotation angle in radians. */
  rot: number;
}

/** A single pipe obstacle with horizontal position and gap placement. */
export interface Pipe {
  /** Horizontal position from the left edge. */
  x: number;
  /** Height of the top pipe section in pixels. */
  topH: number;
  /** Whether the bird has already passed and scored this pipe. */
  scored: boolean;
  /** Vertical gap size for this pipe in pixels (set per-pipe for variation). */
  gap: number;
}

/** An ambient cloud with optional pre-rendered canvas cache. */
export interface Cloud {
  /** Horizontal position. */
  x: number;
  /** Vertical position. */
  y: number;
  /** Logical width in pixels. */
  w: number;
  /** Drift speed multiplier. */
  speed: number;
  /** Pre-rendered offscreen canvas (null until first render pass). */
  _canvas: HTMLCanvasElement | null;
  /** Padding used in the pre-rendered canvas. */
  _pad: number;
  /** Logical width stored after pre-render. */
  _logW: number;
  /** Logical height stored after pre-render. */
  _logH: number;
}

/** Identifier for a city skyline silhouette variant. */
export type SkylineCity = 'phoenix' | 'neworleans' | 'montreal' | 'dallas' | 'nashville';

/** A single building within a skyline segment. */
export interface SkylineBuilding {
  /** Offset from the segment's left edge. */
  ox: number;
  /** Width of the building in pixels. */
  w: number;
  /** Height of the building in pixels. */
  h: number;
  /** Whether the building has a spire on top. */
  hasSpire: boolean;
  /** Whether the building has a dome roof. */
  hasDome: boolean;
  /** Whether the building has a cactus decoration (Phoenix). */
  hasCactus: boolean;
}

/** A horizontal segment of the far-layer city skyline. */
export interface SkylineSegment {
  /** Horizontal position from the left edge. */
  x: number;
  /** Y-coordinate of the ground line. */
  groundY: number;
  /** City variant used for building shapes. */
  city: SkylineCity;
  /** Buildings contained in this segment. */
  buildings: SkylineBuilding[];
  /** Total pixel width of the segment. */
  totalW: number;
  /** Scroll speed multiplier. */
  speed: number;
  /** Pre-rendered offscreen canvas (null until first render pass). */
  _canvas: HTMLCanvasElement | null;
  /** X offset from segment position to cached canvas left edge. */
  _cacheOffX: number;
  /** Y offset from segment groundY to cached canvas top edge. */
  _cacheOffY: number;
  /** Logical width of the cached canvas. */
  _cacheW: number;
  /** Logical height of the cached canvas. */
  _cacheH: number;
}

/** Mid-ground building style variant. */
export type BuildingType = 'house' | 'apartment' | 'office';

/** A mid-ground building entity with type-specific rendering. */
export interface Building {
  /** Horizontal position. */
  x: number;
  /** Vertical position (top of the building). */
  y: number;
  /** Width in pixels. */
  w: number;
  /** Height in pixels. */
  h: number;
  /** Architectural style for rendering. */
  type: BuildingType;
  /** Number of window rows to draw. */
  windows: number;
  /** Scroll speed multiplier. */
  speed: number;
  /** Pre-rendered offscreen canvas (null until first render pass). */
  _canvas: HTMLCanvasElement | null;
  /** X offset from building position to cached canvas left edge. */
  _cacheOffX: number;
  /** Y offset from building position to cached canvas top edge. */
  _cacheOffY: number;
  /** Logical width of the cached canvas. */
  _cacheW: number;
  /** Logical height of the cached canvas. */
  _cacheH: number;
}

/** Near-ground tree style variant. */
export type TreeType = 'pine' | 'round';

/** A near-ground tree entity in the parallax foreground. */
export interface Tree {
  /** Horizontal position. */
  x: number;
  /** Vertical position (base of the tree at ground level). */
  y: number;
  /** Width in pixels. */
  w: number;
  /** Height in pixels. */
  h: number;
  /** Shape variant for rendering. */
  type: TreeType;
  /** Scroll speed multiplier. */
  speed: number;
  /** Pre-rendered offscreen canvas (null until first render pass). */
  _canvas: HTMLCanvasElement | null;
  /** X offset from tree position to cached canvas left edge. */
  _cacheOffX: number;
  /** Y offset from tree position to cached canvas top edge. */
  _cacheOffY: number;
  /** Logical width of the cached canvas. */
  _cacheW: number;
  /** Logical height of the cached canvas. */
  _cacheH: number;
}

/** A small ground-level decoration (dash or dot). */
export interface GroundDeco {
  /** Horizontal position. */
  x: number;
  /** Visual style of the decoration. */
  type: 'dash' | 'dot';
  /** Scroll speed multiplier. */
  speed: number;
}

/** All parallax background layers and their rightmost edge trackers. */
export interface BgLayers {
  /** Far-distance cloud entities. */
  farClouds: Cloud[];
  /** Far-distance city skyline segments. */
  skyline: SkylineSegment[];
  /** Mid-distance cloud entities. */
  midClouds: Cloud[];
  /** Mid-ground building entities. */
  buildings: Building[];
  /** Near-ground tree entities. */
  trees: Tree[];
  /** Ground-level decorations (dashes and dots). */
  groundDeco: GroundDeco[];
  /** Rightmost x-coordinate among skyline segments (for recycling). */
  maxRightSkyline: number;
  /** Rightmost x-coordinate among buildings (for recycling). */
  maxRightBuildings: number;
  /** Rightmost x-coordinate among trees (for recycling). */
  maxRightTrees: number;
  /** Rightmost x-coordinate among ground decorations (for recycling). */
  maxRightGroundDeco: number;
}
