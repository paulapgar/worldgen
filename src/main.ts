import { Color, DisplayMode, Engine, FadeInOut } from 'excalibur';

import { MyLevel } from './level';
import { loader } from './resources';

// Goal is to keep main.ts small and just enough to configure the engine
const game = new Engine({
  width: 600, // Logical width and height in game pixels
  height: 600,
  displayMode: DisplayMode.Fixed, // Display mode tells excalibur how to fill the window
  pixelArt: true, // pixelArt will turn on the correct settings to render pixel art without jaggies or shimmering artifacts
  scenes: {
    start: MyLevel,
  },
});

// Generate height map when game starts
game
  .start('start', {
    // name of the start scene 'start'
    loader, // Optional loader (but needed for loading images/sounds)
    inTransition: new FadeInOut({
      // Optional in transition
      duration: 1000,
      direction: 'in',
      color: Color.Black,
    }),
  })
  .then(() => {});
