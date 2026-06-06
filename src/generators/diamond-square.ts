

// ***** Qwen3.6-27B produced
// Diamond-square algorithm for height map generation
// This algorithm generates a height map using fractal noise, creating natural-looking terrain
// by recursively subdividing a grid and adding random perturbations at each level.
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



// Haiku
// export function generateHeightMap(
//   heightMap: Array<Array<number>>,
//   roughness: number = 0.5,
//   maxHeight: number = 100
// ): void {
//   const get = (x: number, y: number) => heightMap[y][x];
//   const set = (x: number, y: number, val: number) => {
//     heightMap[y][x] = val;
//   };

//   // Initialize corners of the 0..32 range
//   set(0, 0, Math.random() * maxHeight);
//   set(0, 32, Math.random() * maxHeight);
//   set(32, 0, Math.random() * maxHeight);
//   set(32, 32, Math.random() * maxHeight);

//   let step = 32;
//   let scale = maxHeight;

//   while (step > 1) {
//     const halfStep = Math.floor(step / 2);

//     // Diamond step: fill in the midpoints of squares
//     for (let y = 0 + halfStep; y < 32; y += step) {
//       for (let x = 0 + halfStep; x < 32; x += step) {
//         const avg =
//           (get(x - halfStep, y - halfStep) +
//             get(x + halfStep, y - halfStep) +
//             get(x - halfStep, y + halfStep) +
//             get(x + halfStep, y + halfStep)) /
//           4;
//         set(x, y, avg + (Math.random() - 0.5) * scale);
//       }
//     }

//     // Square step: fill in points that form squares with the diamond points
//     for (let y = 0; y < 33; y += halfStep) {
//       for (let x = 0 + ((y + halfStep) % step); x < 33; x += step) {
//         let sum = 0;
//         let count = 0;

//         if (x - halfStep >= 0) {
//           sum += get(x - halfStep, y);
//           count++;
//         }
//         if (x + halfStep <= 32) {
//           sum += get(x + halfStep, y);
//           count++;
//         }
//         if (y - halfStep >= 0) {
//           sum += get(x, y - halfStep);
//           count++;
//         }
//         if (y + halfStep <= 32) {
//           sum += get(x, y + halfStep);
//           count++;
//         }

//         if (count > 0) {
//           set(x, y, sum / count + (Math.random() - 0.5) * scale);
//         }
//       }
//     }

//     step = halfStep;
//     scale *= roughness;
//   }
// }
