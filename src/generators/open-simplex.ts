// OpenSimplex Noise Algorithm Explanation:
// ==========================================
// OpenSimplex is an improved version of Perlin noise that addresses several
// limitations: better handling of corner cases, more consistent performance,
// and simpler implementation. It uses simplex geometry (triangular grids) instead
// of square grids, which reduces the number of gradient calculations needed.
//
// Core Concepts:
// --------------
// 1. SIMPLEX GEOMETRY: Uses triangular simplex cells (2D) instead of squares,
//    reducing the number of gradient calculations from 4 to 3 per point.
//
// 2. SKEWING TRANSFORMS: Uses skewing (F2 and G2 constants) to transform
//    coordinates into a skewed space where simplex cells align with axes.
//
// 3. CORNER CONTRIBUTIONS: Calculates contributions from 3 corners instead of
//    4, simplifying the interpolation logic.
//
// 4. SMOOTH DECAY: Uses a smooth decay function (t^4) instead of fade, creating
//    even smoother transitions between grid points.
//
// Algorithm Stages:
// -----------------
// 1. INPUT VALIDATION: Ensure heightmap is square and non-empty
// 2. PERMUTATION TABLE INITIALIZATION: Create seed-based shuffled lookup table
// 3. COORDINATE NORMALIZATION: Map pixel coordinates to [-1, 1] range
// 4. FRACTAL NOISE GENERATION: Stack octaves with diminishing amplitude
// 5. NORMALIZATION: Scale all values to [0, 1] range for consistent output

/**
 * Generates a height map using OpenSimplex noise algorithm.
 *
 * OpenSimplex is an improved version of Perlin noise that uses simplex geometry
 * (triangular grids) instead of square grids, reducing gradient calculations
 * and providing better performance and more consistent results.
 *
 * @param heightMap - A square 2D array representing the height map to be generated.
 *                    The array is modified in-place.
 * @param roughness - A value between 0 and 1 (default: 0.5) that controls terrain roughness.
 *                    Lower values create smoother terrain; higher values create more rugged terrain.
 * @param octaves - The number of noise octaves to stack (default: 4). Higher values add more detail.
 * @param persistence - The amplitude decay between octaves (default: 0.5). Lower values create smoother transitions.
 * @param lacunarity - The frequency multiplier between octaves (default: 2.0). Higher values add more detail.
 * @param seed - A seed value for reproducible noise generation (default: random).
 *
 * @throws {Error} If the height map is not square or empty.
 *
 * @example
 * ```typescript
 * const heightMap: number[][] = Array(65).fill(0).map(() => Array(65).fill(0));
 * generateHeightMapOpenSimplex(heightMap, 0.5, 6, 0.5, 2.0, 12345);
 * // heightMap now contains generated terrain data in the range [0, 1]
 * ```
 */
// ***** GLM-4.7-flash produced
export function generateHeightMapOpenSimplex(
  heightMap: Array<Array<number>>,
  roughness: number = 0.5,
  octaves: number = 4,
  persistence: number = 0.5,
  lacunarity: number = 2.0,
  seed: number = Math.random() * 10000
): void {
  // ============================================
  // STAGE 1: INPUT VALIDATION
  // ============================================
  // Verify the heightmap is a valid square matrix for proper noise calculation
  const rows = heightMap.length;
  const cols = heightMap[0]?.length;

  if (!cols || rows !== cols) {
    throw new Error(
      `generateHeightMapOpenSimplex requires a square heightmap, got ${rows}x${cols}`
    );
  }

  if (rows === 0) {
    throw new Error('Heightmap cannot be empty');
  }

  // ============================================
  // STAGE 2: PERMUTATION TABLE INITIALIZATION
  // ============================================
  // Create a shuffled permutation table based on the seed for reproducible noise
  initPermutation(seed);

  const SIZE = rows;

  // ============================================
  // STAGE 3: COORDINATE NORMALIZATION
  // ============================================
  // Map pixel coordinates to [-1, 1] range for consistent noise sampling
  // This centers the noise around (0,0) and ensures uniform distribution
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      // Normalize x coordinate to [-1, 1] range
      const nx = (2 * x) / (SIZE - 1) - 1;
      // Normalize y coordinate to [-1, 1] range
      const ny = (2 * y) / (SIZE - 1) - 1;

      // ============================================
      // STAGE 4: FRACTAL NOISE GENERATION
      // ============================================
      // Generate multi-octave noise by stacking OpenSimplex noise at different scales
      const noise = fractalNoise(nx, ny, octaves, persistence, lacunarity);

      // ============================================
      // STAGE 5: VALUE SCALING
      // ============================================
      // Convert noise value to [0, 1] range
      heightMap[y][x] = (noise + 1) / 2;
    }
  }

  // ============================================
  // STAGE 6: NORMALIZATION
  // ============================================
  // Normalize all height values to [0, 1] range for consistent output
  // This ensures the terrain values are uniformly distributed regardless
  // of the noise generation parameters
  let min = Infinity,
    max = -Infinity;
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

  // ============================================
  // STAGE 7: ROUGHNESS APPLICATION
  // ============================================
  // Apply roughness after normalization to control terrain contrast.
  // Roughness values: 0 = flat (all values pushed toward 0.5),
  // 1.0 = normal (full variation), >1.0 = exaggerated variation
  const midpoint = 0.5;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      heightMap[y][x] = midpoint + (heightMap[y][x] - midpoint) * roughness;
      // Clamp to [0, 1] range
      heightMap[y][x] = Math.max(0, Math.min(1, heightMap[y][x]));
    }
  }
}

// Simple seeded random number generator
// Uses Mulberry32 algorithm for fast, high-quality pseudo-random numbers
// This ensures reproducible results when using the same seed
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Pseudo-random number generator using Mulberry32 algorithm
  // This algorithm produces high-quality pseudo-random numbers with good
  // statistical properties and is fast to compute
  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

// Permutation table for gradient lookup
// This table maps grid coordinates to gradient indices for noise generation
let perm: Uint8Array;
const grad3 = [
  [1, 1, 0],
  [-1, 1, 0],
  [1, -1, 0],
  [-1, -1, 0],
  [1, 0, 1],
  [-1, 0, 1],
  [1, 0, -1],
  [-1, 0, -1],
  [0, 1, 1],
  [0, -1, 1],
  [0, 1, -1],
  [0, -1, -1],
];

// Initialize permutation table with seed
// Creates a shuffled permutation table based on the seed for reproducible noise
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
// Calculates noise value for 2D coordinates using simplex geometry
// This is the core noise generation algorithm that creates smooth, continuous
// random values with natural-looking patterns
function openSimplex2D(x: number, y: number): number {
  // Constants for simplex geometry
  // F2: Skew factor for transforming coordinates
  // G2: Unskew factor for transforming coordinates back
  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;

  // Skew the input space to determine which simplex cell we're in
  // This transforms the coordinate space so that simplex cells align with axes
  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);

  const t = (i + j) * G2;
  const X0 = i - t;
  const Y0 = j - t;
  const x0 = x - X0;
  const y0 = y - Y0;

  // Determine which simplex we're in
  // Based on the position within the simplex cell, we identify which of the
  // three corners will have the highest contribution to the noise value
  let i1, j1;
  if (x0 > y0) {
    i1 = 1;
    j1 = 0;
  } else {
    i1 = 0;
    j1 = 1;
  }

  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1 + 2 * G2;
  const y2 = y0 - 1 + 2 * G2;

  // Calculate contribution from the three corners
  // Get gradient indices for the three corners of the simplex cell
  const ii = i & 255;
  const jj = j & 255;
  const gi0 = perm[ii + perm[jj]] % 12;
  const gi1 = perm[ii + i1 + perm[jj + j1]] % 12;
  const gi2 = perm[ii + 1 + perm[jj + 1]] % 12;

  // Calculate squared distances
  // These determine how close the point is to each corner of the simplex cell
  let n0 = 0,
    n1 = 0,
    n2 = 0;

  // Calculate contribution from corner 0
  // Uses smooth decay function (t^4) for smooth transitions
  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 >= 0) {
    t0 *= t0;
    n0 = t0 * t0 * (grad3[gi0][0] * x0 + grad3[gi0][1] * y0);
  }

  // Calculate contribution from corner 1
  // Uses smooth decay function (t^4) for smooth transitions
  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 >= 0) {
    t1 *= t1;
    n1 = t1 * t1 * (grad3[gi1][0] * x1 + grad3[gi1][1] * y1);
  }

  // Calculate contribution from corner 2
  // Uses smooth decay function (t^4) for smooth transitions
  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 >= 0) {
    t2 *= t2;
    n2 = t2 * t2 * (grad3[gi2][0] * x2 + grad3[gi2][1] * y2);
  }

  // Combine contributions from all three corners with scaling factor
  // The factor 70 is a constant that normalizes the output to a reasonable range
  return 70 * (n0 + n1 + n2);
}

// Fractal Brownian motion (fBm) for multi-octave noise
// Stacks multiple octaves of noise with diminishing amplitude and increasing frequency
// This creates detail at different scales, simulating natural phenomena like mountains,
// valleys, and coastlines
function fractalNoise(
  x: number,
  y: number,
  octaves: number,
  persistence: number,
  lacunarity: number
): number {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    // Add contribution from current octave
    total += openSimplex2D(x * frequency, y * frequency) * amplitude;
    // Track maximum amplitude for normalization
    maxValue += amplitude;
    // Decrease amplitude for next octave (persistence)
    amplitude *= persistence;
    // Increase frequency for next octave (lacunarity)
    frequency *= lacunarity;
  }

  // Normalize by maximum amplitude
  return total / maxValue;
}
