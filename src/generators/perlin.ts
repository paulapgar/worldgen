
// Perlin Noise Algorithm Explanation:
// ======================================
// Perlin noise is a gradient noise algorithm that generates smooth, continuous
// random values. Unlike pure random noise, it produces natural-looking patterns
// that are commonly used in procedural generation for terrain, clouds, and textures.
//
// Core Concepts:
// --------------
// 1. GRADIENT VECTORS: At each grid point, a random gradient vector is assigned.
//    These gradients point in one of 12 possible directions (based on 3D cross
//    products of basis vectors).
//
// 2. SMOOTH INTERPOLATION: Instead of jumping between grid points, we smoothly
//    interpolate using a fade function (t^3 * (t * (6t - 15) + 10)) that creates
//    continuous derivatives.
//
// 3. FRACTAL BROWNIAN MOTION (fBm): Stacking multiple octaves of noise with
//    decreasing amplitude and increasing frequency creates detail at different
//    scales, simulating natural phenomena like mountains, valleys, and coastlines.
//
// 4. PERMUTATION TABLE: A shuffled lookup table maps grid coordinates to gradient
//    indices, ensuring reproducible results when using the same seed.
//
// Algorithm Stages:
// -----------------
// 1. INPUT VALIDATION: Ensure heightmap is square and non-empty
// 2. PERMUTATION INITIALIZATION: Create seed-based shuffled lookup table
// 3. COORDINATE NORMALIZATION: Map pixel coordinates to [-1, 1] range
// 4. FRACTAL NOISE GENERATION: Stack octaves with diminishing amplitude
// 5. VALUE SCALING: Convert to [0, 1] range and apply roughness factor

/**
 * Generates a height map using Perlin noise algorithm.
 *
 * Perlin noise is a gradient noise algorithm that generates smooth, continuous
 * random values. Unlike pure random noise, it produces natural-looking patterns
 * commonly used in procedural generation for terrain, clouds, and textures.
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
 * generateHeightMapPerlin(heightMap, 0.5, 6, 0.5, 2.0, 12345);
 * // heightMap now contains generated terrain data in the range [0, 1]
 * ```
 */
// ***** GLM-4.7-flash produced
export function generateHeightMapPerlin(
  heightMap: Array<Array<number>>,
  roughness: number = 0.5,
  octaves: number = 4,
  persistence: number = 0.5,
  lacunarity: number = 2.0,
  seed: number = Math.random() * 10000): void {

  // ============================================
  // STAGE 1: INPUT VALIDATION
  // ============================================
  // Verify the heightmap is a valid square matrix for proper noise calculation
  const rows = heightMap.length;
  const cols = heightMap[0]?.length;

  if (!cols || rows !== cols) {
    throw new Error(`generateHeightMapPerlin requires a square heightmap, got ${rows}x${cols}`);
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
      // Generate multi-octave noise by stacking Perlin noise at different scales
      const noise = fractalNoise(nx, ny, octaves, persistence, lacunarity);

      // ============================================
      // STAGE 5: VALUE SCALING
      // ============================================
      // Convert noise value to [0, 1] range and apply roughness factor
      // The roughness parameter controls overall terrain variation
      heightMap[y][x] = (noise * roughness + 1) / 2;
    }
  }
}

// Permutation table for noise generation
const perm = new Uint8Array(512);
const grad3 = [
  [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
  [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
  [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
];

// Initialize permutation table with seed
function initPermutation(seed: number): void {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    p[i] = i;
  }

  // Seed-based shuffle
  let n = seed;
  for (let i = 255; i > 0; i--) {
    n = (n * 16807) % 2147483647;
    const j = n % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }

  // Duplicate for overflow handling
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
  }
}

// Perlin noise value for 2D coordinates
function perlin2(x: number, y: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;

  x -= Math.floor(x);
  y -= Math.floor(y);

  const u = fade(x);
  const v = fade(y);

  const A = perm[X] + Y;
  const B = perm[X + 1] + Y;

  // Linear interpolation of gradient values
  return lerp(v,
    lerp(u, grad(perm, A, x, y), grad(perm, B, x - 1, y)),
    lerp(u, grad(perm, A + 1, x, y - 1), grad(perm, B + 1, x - 1, y - 1))
  );
}

// Get gradient value for a permutation index
function grad(p: Uint8Array, i: number, x: number, y: number): number {
  const gi = p[i] % 12;
  return grad3[gi][0] * x + grad3[gi][1] * y;
}

// Smooth interpolation function
function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

// Linear interpolation
function lerp(t: number, a: number, b: number): number {
  return a + t * (b - a);
}

// Fractal Brownian motion (fBm) for multi-octave noise
function fractalNoise(x: number, y: number, octaves: number, persistence: number, lacunarity: number): number {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += perlin2(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return total / maxValue;
}
