

// Diamond-Square Algorithm for Height Map Generation
// ================================================
//
// The Diamond-Square algorithm is a fractal noise generation technique used to create
// natural-looking terrain height maps. It was originally developed for terrain generation
// in video games and computer graphics.
//
// ## Mathematical Foundation
//
// The algorithm works by recursively subdividing a square grid, starting with a
// 2^n + 1 sized grid (e.g., 33×33, 65×65, 129×129). At each level of recursion:
//
// 1. **Diamond Step**: For each diamond-shaped region, calculate the average of its
//    four corner points and add a random perturbation scaled by the current roughness
//    factor. This creates the "diamond" shapes in the fractal pattern.
//
// 2. **Square Step**: For each square-shaped region, calculate the average of its
//    existing neighbors and add a random perturbation scaled by the current roughness.
//    This fills in the gaps created by the diamond step.
//
// The roughness parameter controls the amplitude of the random perturbations at each
// level. A lower roughness value creates smoother terrain with fewer details, while
// a higher value creates more rugged, jagged terrain.
//
// ## Algorithm Complexity
//
// - Time Complexity: O(n²) where n is the grid size (2^n + 1)
// - Space Complexity: O(1) additional space (modifies input in-place)
// - Recursion Depth: n levels (where n = log₂(grid_size - 1))
//
// ## Parameters
//
// - `heightMap`: A square 2D array representing the height map to be generated.
//   Must have dimensions of 2^n + 1 (e.g., 33, 65, 129, 257).
// - `roughness`: A value between 0 and 1 (default: 0.5) that controls terrain roughness.
//   Lower values create smoother terrain; higher values create more rugged terrain.
//
// ## Usage
//
// The function modifies the input height map in-place and normalizes all values
// to the range [0, 1] for consistent output. The algorithm is particularly useful
// for generating:
//
// - Procedural terrain for games and simulations
// - Natural-looking landscapes with fractal detail
// - Height maps for 3D rendering and visualization
//
// ## References
//
// - Fournier, A., Fussell, D., & Carpenter, L. (1982). "Computer rendering of fractal
//   landscapes". Computer Graphics, 16(3), 37-50.
// - https://en.wikipedia.org/wiki/Diamond-square_algorithm

/**
 * Generates a height map using the Diamond-Square fractal noise algorithm.
 *
 * This function implements the Diamond-Square algorithm, which creates natural-looking
 * terrain by recursively subdividing a grid and adding random perturbations at each
 * level. The algorithm produces fractal noise that can be used for terrain generation,
 * landscape visualization, and procedural content creation.
 *
 * @param heightMap - A square 2D array representing the height map to be generated.
 *                    Must have dimensions of 2^n + 1 (e.g., 33, 65, 129, 257).
 *                    The array is modified in-place.
 * @param roughness - A value between 0 and 1 (default: 0.5) that controls terrain roughness.
 *                    Lower values create smoother terrain with fewer details;
 *                    higher values create more rugged, jagged terrain.
 *
 * @throws {Error} If the height map is not square or if its size is not of the form 2^n + 1.
 *
 * @example
 * ```typescript
 * const heightMap: number[][] = Array(65).fill(0).map(() => Array(65).fill(0));
 * generateHeightMapDiamondSquare(heightMap, 0.5);
 * // heightMap now contains generated terrain data in the range [0, 1]
 * ```
 */
// ***** Qwen3.6-27B produced
export function generateHeightMapDiamondSquare(
  heightMap: Array<Array<number>>,
  roughness: number = 0.5
): void {
  // ============================================
  // STAGE 1: INPUT VALIDATION
  // ============================================
  // Validate heightmap dimensions
  const rows = heightMap.length;
  const cols = heightMap[0]?.length;

  if (!cols || rows !== cols) {
    throw new Error(`generateHeightMapDiamondSquare requires a square heightmap, got ${rows}x${cols}`);
  }

  // Validate that size fits diamond-square algorithm (must be 2^n + 1)
  // This is required because the algorithm works by recursively halving the grid
  const n = Math.log2(rows - 1);
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(
      `generateHeightMapDiamondSquare requires heightmap size of 2^n + 1 (e.g., 33, 65, 129, 257), got ${rows}x${cols}`
    );
  }

  const SIZE = rows;

  // ============================================
  // STAGE 2: CORNER INITIALIZATION
  // ============================================
  // Initialize the four corners with random values
  // These serve as the seed values for the fractal generation
  heightMap[0][0] = Math.random();
  heightMap[0][SIZE - 1] = Math.random();
  heightMap[SIZE - 1][0] = Math.random();
  heightMap[SIZE - 1][SIZE - 1] = Math.random();

  // ============================================
  // STAGE 3: RECURSIVE SUBDIVISION
  // ============================================
  // Start with the full grid size and progressively reduce it
  let size = SIZE - 1;  // Current grid size (starts as SIZE-1)
  let scale = roughness; // Current roughness factor (starts at user-provided value)

  // Continue until we reach a 2x2 grid (size = 1)
  while (size > 1) {
    const half = size >> 1; // Calculate half the current size (integer division by 2)

    // ============================================
    // STAGE 3A: DIAMOND STEP
    // ============================================
    // For each diamond-shaped region, calculate the average of its four corners
    // and add a random perturbation scaled by the current roughness
    // This creates the "diamond" shapes in the fractal pattern
    for (let y = 0; y < SIZE - 1; y += size) {
      for (let x = 0; x < SIZE - 1; x += size) {
        const avg =
          (heightMap[y][x] + heightMap[y][x + size] + heightMap[y + size][x] + heightMap[y + size][x + size]) / 4;
        heightMap[y + half][x + half] = avg + (Math.random() * 2 - 1) * scale;
      }
    }

    // ============================================
    // STAGE 3B: SQUARE STEP
    // ============================================
    // For each square-shaped region, calculate the average of its existing neighbors
    // and add a random perturbation scaled by the current roughness
    // This fills in the gaps created by the diamond step
    for (let y = 0; y < SIZE; y += half) {
      for (let x = (y % size === 0 ? half : 0); x < SIZE; x += size) {
        let sum = 0;
        let count = 0;

        // Check each of the four neighbors and add their values
        if (y - half >= 0) { sum += heightMap[y - half][x]; count++; }
        if (y + half < SIZE) { sum += heightMap[y + half][x]; count++; }
        if (x - half >= 0) { sum += heightMap[y][x - half]; count++; }
        if (x + half < SIZE) { sum += heightMap[y][x + half]; count++; }

        heightMap[y][x] = sum / count + (Math.random() * 2 - 1) * scale;
      }
    }

    // Prepare for next iteration: reduce size by half and halve the roughness
    // This creates the fractal detail at smaller scales
    size = half;
    scale *= 0.5;
  }

  // ============================================
  // STAGE 4: NORMALIZATION
  // ============================================
  // Normalize all height values to the range [0, 1] for consistent output
  // This ensures the terrain data is usable regardless of the random seed
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
