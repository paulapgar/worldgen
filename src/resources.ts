import { ImageSource, Loader, Color, Rectangle } from 'excalibur';

// Rainbow color palette (5 shades per color)
const rainbowColors = [
  // Red shades
  { name: 'redLight', color: '#FFB3B3' },
  { name: 'redMedium', color: '#FF6666' },
  { name: 'red', color: '#FF0000' },
  { name: 'redDark', color: '#CC0000' },
  { name: 'redDark2', color: '#990000' },
  // Orange shades
  { name: 'orangeLight', color: '#FFD9B3' },
  { name: 'orangeMedium', color: '#FF9933' },
  { name: 'orange', color: '#FF6600' },
  { name: 'orangeDark', color: '#CC5200' },
  { name: 'orangeDark2', color: '#993300' },
  // Yellow shades
  { name: 'yellowLight', color: '#FFFFB3' },
  { name: 'yellowMedium', color: '#FFFF66' },
  { name: 'yellow', color: '#FFCC00' },
  { name: 'yellowDark', color: '#CC9900' },
  { name: 'yellowDark2', color: '#996600' },
  // Green shades
  { name: 'greenLight', color: '#B3FFB3' },
  { name: 'greenMedium', color: '#66FF66' },
  { name: 'green', color: '#00CC00' },
  { name: 'greenDark', color: '#009900' },
  { name: 'greenDark2', color: '#006600' },
  // Blue shades
  { name: 'blueLight', color: '#B3D9FF' },
  { name: 'blueMedium', color: '#6699FF' },
  { name: 'blue', color: '#0066FF' },
  { name: 'blueDark', color: '#0033CC' },
  { name: 'blueDark2', color: '#000099' },
  // Indigo shades (darker, more purple)
  { name: 'indigoLight', color: '#6A5ACD' },
  { name: 'indigoMedium', color: '#483D8B' },
  { name: 'indigo', color: '#4B0082' },
  { name: 'indigoDark', color: '#3A006F' },
  { name: 'indigoDark2', color: '#2E0051' },
  // Violet shades (lighter, more pinkish)
  { name: 'violetLight', color: '#EE82EE' },
  { name: 'violetMedium', color: '#DA70D6' },
  { name: 'violet', color: '#BA55D3' },
  { name: 'violetDark', color: '#9B31D5' },
  { name: 'violetDark2', color: '#8A2BE2' },
  // Brown shades
  { name: 'brownLight', color: '#CD853F' },
  { name: 'brownMedium', color: '#A0522D' },
  { name: 'brown', color: '#8B4513' },
  { name: 'brownDark', color: '#654321' },
  { name: 'brownDark2', color: '#4E342E' },
  // Gray shades
  { name: 'gray65', color: '#414141' },
  { name: 'gray75', color: '#4B4B4B' },
  { name: 'gray85', color: '#555555' },
  { name: 'gray95', color: '#5F5F5F' },
  { name: 'gray105', color: '#696969' },
  { name: 'gray115', color: '#737373' },
  { name: 'gray125', color: '#7D7D7D' },
  { name: 'gray135', color: '#878787' },
  { name: 'gray145', color: '#919191' },
  { name: 'gray155', color: '#9B9B9B' },
  { name: 'gray165', color: '#A5A5A5' },
  { name: 'gray175', color: '#AFAFAF' },
  { name: 'gray185', color: '#B9B9B9' },
  { name: 'gray195', color: '#C3C3C3' },
  { name: 'gray205', color: '#CDCDCD' },
  { name: 'gray215', color: '#D7D7D7' },
  { name: 'gray225', color: '#E1E1E1' },
  { name: 'gray235', color: '#EBEBEB' },
  { name: 'gray245', color: '#F5F5F5' },
  { name: 'gray255', color: '#FFFFFF' },
];

// Generate all color squares
const colorSquares = rainbowColors.map(({ name, color }) => ({
  name,
  image: new Rectangle({ width: 10, height: 10, color: Color.fromHex(color) }),
}));

// It is convenient to put your resources in one place
export const Resources = {
  Sword: new ImageSource('./images/sword.png'), // Vite public/ directory serves the root images
  // Rainbow color squares
  ...colorSquares.reduce(
    (acc, { name, image }) => ({
      ...acc,
      [name]: image,
    }),
    {}
  ),
} as any;

// We build a loader and add all of our resources to the boot loader
// You can build your own loader by extending DefaultLoader
export const loader = new Loader();
for (const res of Object.values(Resources)) {
  // Only load ImageSource objects, not generated Graphics like Rectangle
  if (res instanceof ImageSource) {
    loader.addResource(res);
  }
}

/**
 * Gets the color rectangle based on height value
 * @param height - Height value (0.0 to 1.0)
 * @returns The appropriate color Rectangle from Resources
 */
export function getHeightColor(height: number): Rectangle {
  if (height > 0.9) return Resources.gray255;
  if (height > 0.8) return Resources.gray135;
  if (height > 0.7) return Resources.gray75;
  if (height > 0.6) return Resources.greenDark2;
  if (height > 0.5) return Resources.greenDark;
  if (height > 0.4) return Resources.yellowDark;
  if (height > 0.3) return Resources.blueMedium;
  return Resources.blueDark;
}

export function getHeightGrayScale(height: number): Rectangle {
  // Map height (0.0 to 1.0) to grayscale colors in 0.1 increments
  // 0.0 → gray65, 0.1 → gray85, 0.2 → gray105, ..., 1.0 → gray255
  const grayColors = [
    'gray65',
    'gray85',
    'gray105',
    'gray125',
    'gray145',
    'gray165',
    'gray185',
    'gray205',
    'gray225',
    'gray245',
    'gray255',
  ];

  // Normalize height to 0-10 range (10 steps of 0.1)
  const index = Math.min(Math.floor(height * 10), 10);

  return Resources[grayColors[index]];
}
