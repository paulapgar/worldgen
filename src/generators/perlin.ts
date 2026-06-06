
// Perlin noise implementation for 2D terrain generation
// This algorithm generates smooth, natural-looking terrain using gradient noise

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

// Generate heightmap using Perlin noise
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
  const rows = heightMap.length;
  const cols = heightMap[0]?.length;

  if (!cols || rows !== cols) {
    throw new Error(`generateHeightMapPerlin requires a square heightmap, got ${rows}x${cols}`);
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
}
