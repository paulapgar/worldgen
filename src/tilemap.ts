import { TileMap, vec, Rectangle } from "excalibur";
import { Resources, getHeightColor, getHeightGrayScale } from "./resources";
import { generateHeightMapDiamondSquare } from "./generators/diamond-square";
import { generateHeightMapOpenSimplex } from "./generators/open-simplex";
import { generateHeightMapPerlin } from "./generators/perlin";

/**
 * Generates a tilemap with random colored tiles
 * @param rows - Number of rows (default: 65)
 * @param columns - Number of columns (default: 65)
 * @param tileWidth - Width of each tile in pixels (default: 8)
 * @param tileHeight - Height of each tile in pixels (default: 8)
 * @param method - Heightmap generation method (default: 'open-simplex')
 * @param style - Tile style ('color' or 'grayscale')
 * @param roughness - Terrain roughness factor (default: 0.5)
 * @param octaves - Number of noise octaves (default: 6)
 * @param persistence - Amplitude decay per octave (default: 0.5)
 * @param lacunarity - Frequency multiplier per octave (default: 2.0)
 * @param seed - Random seed for deterministic noise (default: random)
 * @returns A configured TileMap with random colors
 */
export function createRandomTilemap(
  rows: number = 65,
  columns: number = 65,
  tileWidth: number = 8,
  tileHeight: number = 8,
  method: 'diamond-square' | 'open-simplex' | 'perlin' = 'open-simplex',
  style: 'color' | 'grayscale' = 'grayscale',
  roughness: number = 0.5,
  octaves: number = 6,
  persistence: number = 0.5,
  lacunarity: number = 2.0,
  seed: number = Math.random() * 10000
): TileMap {

  const tilemap = new TileMap({
    pos: vec(0, 35),
    tileWidth,
    tileHeight,
    rows,
    columns,
  });

  // Generate heightmap
  const heightmap = Array.from({ length: rows }, () => Array(columns).fill(0));

  switch (method) {
    case 'diamond-square':
      generateHeightMapDiamondSquare(heightmap, roughness);
      break;
    case 'open-simplex':
      generateHeightMapOpenSimplex(heightmap, roughness, octaves, persistence, lacunarity, seed);
      break;
    case 'perlin':
      generateHeightMapPerlin(heightmap, roughness, octaves, persistence, lacunarity, seed);
      break;
    default:
      throw new Error(`Unknown heightmap generation method: ${method}`);
  }

  // Generate tiles based on heightmap
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const height = heightmap[row][col];

      let tileResource: Rectangle;
      switch (style) {
        case 'color':
          tileResource = getHeightColor(height);
          break;
        case 'grayscale':
          tileResource = getHeightGrayScale(height);
          break;
        default:
          throw new Error(`Unknown tile style: ${style}`);
      }

      const tile = tilemap.getTile(col, row);
      if (tile && tileResource instanceof Rectangle) {
        tile.addGraphic(tileResource);
      }
    }
  }

  return tilemap;
}

/**
 * Generates a tilemap displaying all rainbow sprites
 * @returns A configured TileMap with rainbow sprite tiles
 */
export function createRainbowSpriteTilemap(): TileMap {

  // Define all rainbow sprite names in order
  const spriteNames = [
    // Red shades
    'redLight', 'redMedium', 'red', 'redDark', 'redDark2',
    // Orange shades
    'orangeLight', 'orangeMedium', 'orange', 'orangeDark', 'orangeDark2',
    // Yellow shades
    'yellowLight', 'yellowMedium', 'yellow', 'yellowDark', 'yellowDark2',
    // Green shades
    'greenLight', 'greenMedium', 'green', 'greenDark', 'greenDark2',
    // Blue shades
    'blueLight', 'blueMedium', 'blue', 'blueDark', 'blueDark2',
    // Indigo shades
    'indigoLight', 'indigoMedium', 'indigo', 'indigoDark', 'indigoDark2',
    // Violet shades
    'violetLight', 'violetMedium', 'violet', 'violetDark', 'violetDark2',
    // Brown shades
    'brownLight', 'brownMedium', 'brown', 'brownDark', 'brownDark2',
    // Gray shades
    'gray65', 'gray75', 'gray85', 'gray95', 'gray105',
    'gray115', 'gray125', 'gray135', 'gray145', 'gray155',
    'gray165', 'gray175', 'gray185', 'gray195', 'gray205',
    'gray215', 'gray225', 'gray235', 'gray245', 'gray255'
  ];

  // Assign sprites to tile positions in an 8×5 grid
  let maxRow = spriteNames.length / 5; // Y rows of 5 columns

  const tilemap = new TileMap({
    pos: vec(550, 365),
    tileWidth: 10,
    tileHeight: 10,
    rows: maxRow,
    columns: 5,
  });

  for (let row = 0; row < maxRow; row++) {
    for (let col = 0; col < 5; col++) {
      const spriteIndex = row * 5 + col;
      const spriteName = spriteNames[spriteIndex];

      const tile = tilemap.getTile(col, row);
      if (tile) {
        tile.addGraphic((Resources as any)[spriteName]);
      }
    }
  }

  return tilemap;
}