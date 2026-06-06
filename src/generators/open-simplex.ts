
// Implemented by GLM-4.7-flash
// OpenSimplex noise implementation for 2D terrain generation
// This algorithm generates smooth, natural-looking terrain using gradient noise

// Generate heightmap using OpenSimplex noise
export function generateHeightMapOpenSimplex(
  heightMap: Array<Array<number>>,
  roughness: number = 0.5,
  octaves: number = 4,
  persistence: number = 0.5,
  lacunarity: number = 2.0,
  seed: number = Math.random() * 10000): void {

  // ============================================
  // STAGE 1: INPUT VALIDATION
  // ============================================
  const rows = heightMap.length;
  const cols = heightMap[0]?.length;

  if (!cols || rows !== cols) {
    throw new Error(`generateHeightMapOpenSimplex requires a square heightmap, got ${rows}x${cols}`);
  }

  if (rows === 0) {
    throw new Error('Heightmap cannot be empty');
  }

  // ============================================
  // STAGE 2: GENERATE NOISE
  // ============================================
  // Initialize permutation table with seed
  initPermutation(seed);

  const SIZE = rows;

  // Generate noise for each cell
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      // Normalize coordinates to [-1, 1] range
      const nx = (2 * x) / (SIZE - 1) - 1;
      const ny = (2 * y) / (SIZE - 1) - 1;

      // Generate fractal noise
      const noise = fractalNoise(nx, ny, octaves, persistence, lacunarity);

      // Scale by roughness and convert to [0, 1] range
      heightMap[y][x] = (noise * roughness + 1) / 2;
    }
  }

  // ============================================
  // STAGE 3: NORMALIZATION
  // ============================================
  // Normalize all height values to [0, 1] range
  let min = Infinity, max = -Infinity;
  for (const row of heightMap) {
    for (const v of row) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }

  const range = max - min || 1;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      heightMap[y][x] = (heightMap[y][x] - min) / range;
    }
  }
}

// Simple seeded random number generator
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Pseudo-random number generator using Mulberry32 algorithm
  next(): number {
    let t = this.seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// Permutation table for gradient lookup
let perm: Uint8Array;
const grad3 = [
  [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
  [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
  [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
];

// Initialize permutation table with seed
function initPermutation(seed: number) {
  const p = new Uint8Array(256);
  const rng = new SeededRandom(seed);

  for (let i = 0; i < 256; i++) {
    p[i] = i;
  }

  // Shuffle using Fisher-Yates with seeded random
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }

  // Duplicate for overflow handling
  perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
  }
}

// OpenSimplex 2D noise function
function openSimplex2D(x: number, y: number): number {
  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;

  // Skew the input space to determine which simplex cell we're in
  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);

  const t = (i + j) * G2;
  const X0 = i - t;
  const Y0 = j - t;
  const x0 = x - X0;
  const y0 = y - Y0;

  // Determine which simplex we're in
  let i1, j1;
  if (x0 > y0) { i1 = 1; j1 = 0; }
  else { i1 = 0; j1 = 1; }

  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1 + 2 * G2;
  const y2 = y0 - 1 + 2 * G2;

  // Calculate contribution from the three corners
  const ii = i & 255;
  const jj = j & 255;
  const gi0 = perm[ii + perm[jj]] % 12;
  const gi1 = perm[ii + i1 + perm[jj + j1]] % 12;
  const gi2 = perm[ii + 1 + perm[jj + 1]] % 12;

  // Calculate squared distances
  let n0 = 0, n1 = 0, n2 = 0;

  // Calculate contribution from corner 0
  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 >= 0) {
    t0 *= t0;
    n0 = t0 * t0 * (grad3[gi0][0] * x0 + grad3[gi0][1] * y0);
  }

  // Calculate contribution from corner 1
  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 >= 0) {
    t1 *= t1;
    n1 = t1 * t1 * (grad3[gi1][0] * x1 + grad3[gi1][1] * y1);
  }

  // Calculate contribution from corner 2
  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 >= 0) {
    t2 *= t2;
    n2 = t2 * t2 * (grad3[gi2][0] * x2 + grad3[gi2][1] * y2);
  }

  return 70 * (n0 + n1 + n2);
}

// Fractal noise with multiple octaves
function fractalNoise(x: number, y: number, octaves: number, persistence: number, lacunarity: number): number {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += openSimplex2D(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return total / maxValue;
}
