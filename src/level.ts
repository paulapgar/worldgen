import { Color, DefaultLoader, Engine, ExcaliburGraphicsContext, Scene, SceneActivationContext } from "excalibur";
import { Player } from "./player";
import { createRandomTilemap } from "./tilemap";
import { createRainbowSpriteTilemap } from "./tilemap";

interface SliderRange {
    min: number;
    max: number;
}

interface MethodConfig {
    name: 'diamond-square' | 'open-simplex' | 'perlin';
    ranges: {
        roughness: SliderRange;
        octaves: SliderRange;
        persistence: SliderRange;
        lacunarity: SliderRange;
    };
    defaults: {
        roughness: number;
        octaves: number;
        persistence: number;
        lacunarity: number;
    };
}

const METHOD_CONFIGS: MethodConfig[] = [
    {
        name: 'diamond-square',
        ranges: {
            roughness: { min: 0, max: 10 },
            octaves: { min: 0, max: 0 },
            persistence: { min: 0, max: 0 },
            lacunarity: { min: 0, max: 0 },
        },
        defaults: {
            roughness: 5.0,
            octaves: 0,
            persistence: 0,
            lacunarity: 0,
        },
    },
    {
        name: 'open-simplex',
        ranges: {
            roughness: { min: 0, max: 5 },
            octaves: { min: 1, max: 10 },
            persistence: { min: 0, max: 1 },
            lacunarity: { min: 1, max: 5 },
        },
        defaults: {
            roughness: 1.5,
            octaves: 6,
            persistence: 0.5,
            lacunarity: 2.0,
        },
    },
    {
        name: 'perlin',
        ranges: {
            roughness: { min: 0, max: 10 },
            octaves: { min: 1, max: 10 },
            persistence: { min: 0, max: 1 },
            lacunarity: { min: 1, max: 5 },
        },
        defaults: {
            roughness: 3.0,
            octaves: 6,
            persistence: 0.4,
            lacunarity: 3.0,
        },
    },
];

/**
 * The main game level scene.
 *
 * Handles scene lifecycle, initializes the player actor, and sets up
 * the background colour.
 */
export class MyLevel extends Scene {
    private currentTilemap: any = null;
    private method: 'diamond-square' | 'open-simplex' | 'perlin' = 'diamond-square';
    private style: 'color' | 'grayscale' = 'color';
    private seed: number = 0;

    private randomizeButton = document.getElementById('randomize-seed') as HTMLButtonElement;
    private seedValue = document.getElementById('seed-value') as HTMLSpanElement;
    private grayscaleButton = document.getElementById('grayscale-btn') as HTMLButtonElement;
    private landscapeButton = document.getElementById('landscape-btn') as HTMLButtonElement;
    private diamondSquareButton = document.getElementById('diamond-square-btn') as HTMLButtonElement;
    private openSimplexButton = document.getElementById('open-simplex-btn') as HTMLButtonElement;
    private perlinButton = document.getElementById('perlin-btn') as HTMLButtonElement;
    private roughnessSlider = document.getElementById('roughness-slider') as HTMLInputElement;
    private roughnessValue = document.getElementById('roughness-value') as HTMLSpanElement;

    // Current parameter values
    private roughness: number = 5.0;
    private octaves: number = 0;
    private persistence: number = 0;
    private lacunarity: number = 0;

    /**
     * Get the configuration for a given method
     */
    private getMethodConfig(methodName: 'diamond-square' | 'open-simplex' | 'perlin'): MethodConfig {
        const config = METHOD_CONFIGS.find(c => c.name === methodName);
        if (!config) {
            throw new Error(`Unknown method: ${methodName}`);
        }
        return config;
    }

    /**
     * Apply a method configuration and update slider ranges
     */
    private applyMethodConfig(methodName: 'diamond-square' | 'open-simplex' | 'perlin'): void {
        const config = this.getMethodConfig(methodName);
        this.method = methodName;
        this.roughness = config.defaults.roughness;
        this.octaves = config.defaults.octaves;
        this.persistence = config.defaults.persistence;
        this.lacunarity = config.defaults.lacunarity;

        // Update slider range and value
        if (this.roughnessSlider) {
            this.roughnessSlider.min = config.ranges.roughness.min.toString();
            this.roughnessSlider.max = config.ranges.roughness.max.toString();
            this.roughnessSlider.step = '0.1';
        }
    }

    /**
     * Generate a new random seed
     */
    private generateSeed(): void {
        this.seed = Math.floor(Math.random() * 10000);
        if (this.seedValue) {
            this.seedValue.textContent = this.seed.toString();
        }
    }

    /**
     * Randomize the tilemap by generating a new seed and creating a new map
     */
    public refreshTilemap(): void {
        if (this.currentTilemap) {
            this.remove(this.currentTilemap);
        }
        this.currentTilemap = createRandomTilemap(65, 65, 8, 8, this.method, this.style, this.roughness, this.octaves, this.persistence, this.lacunarity, this.seed);
        this.add(this.currentTilemap);
    }

    /**
     * Check if the scene is ready
     */
    private refreshButtons(): void {
        this.randomizeButton.disabled = false;
        this.grayscaleButton.disabled = false;
        this.landscapeButton.disabled = false;
        this.diamondSquareButton.disabled = false;
        this.openSimplexButton.disabled = false;
        this.perlinButton.disabled = false;
        this.roughnessSlider.disabled = false;
        this.roughnessSlider.value = this.roughness.toString();
        this.roughnessValue.textContent = this.roughness.toFixed(1);
    }

    /**
     * Initialise the scene when it is created or activated.
     *
     * Sets the background to black and creates a {@link Player} instance
     * which is then added to the scene so it is rendered and updated.
     *
     * @param engine - The Excalibur engine instance.
     */
    override onInitialize(engine: Engine): void {
        // Scene.onInitialize is where we recommend you perform the composition for your game
        this.backgroundColor = Color.Black; // or any other color
        //const player = new Player();
        //this.add(player); // Actors need to be added to a scene to be drawn

        // Create and add the tilemap
        this.currentTilemap = createRandomTilemap(65, 65, 8, 8, this.method, this.style, this.roughness, this.octaves, this.persistence, this.lacunarity, this.seed);
        this.add(this.currentTilemap);

        // Create and add the rainbow sprite display tilemap
        const rainbowSpriteTilemap = createRainbowSpriteTilemap();
        this.add(rainbowSpriteTilemap);

        // Handle randomize button click
        if (this.randomizeButton) {
            this.randomizeButton.addEventListener('click', () => {
            this.generateSeed();
            this.refreshTilemap();
        });
        }

        // Handle method buttons
        if (this.diamondSquareButton) {
            this.diamondSquareButton.addEventListener('click', () => {
                this.applyMethodConfig('diamond-square');
                this.refreshButtons();
                this.refreshTilemap();
            });
        }

        if (this.openSimplexButton) {
            this.openSimplexButton.addEventListener('click', () => {
                this.applyMethodConfig('open-simplex');
                this.refreshButtons();
                this.refreshTilemap();
            });
        }

        if (this.perlinButton) {
            this.perlinButton.addEventListener('click', () => {
                this.applyMethodConfig('perlin');
                this.refreshButtons();
                this.refreshTilemap();
            });
        }

        // Handle grayscale button
        if (this.grayscaleButton) {
            this.grayscaleButton.addEventListener('click', () => {
                this.style = 'grayscale';
                this.refreshTilemap();
            });
        }

        // Handle landscape button
        if (this.landscapeButton) {
            this.landscapeButton.addEventListener('click', () => {
                this.style = 'color';
                this.refreshTilemap();
            });
        }

        // Handle roughness slider
        if (this.roughnessSlider) {
            this.roughnessSlider.addEventListener('input', () => {
                this.roughness = parseFloat(this.roughnessSlider.value);
                this.roughnessValue.textContent = this.roughness.toFixed(1);
                this.refreshTilemap();
            });
        }
    }

    /**
     * Pre-load scene-specific resources.
     *
     * Override this method to add any resources that should be loaded
     * before the scene becomes active.
     *
     * @param loader - The Excalibur resource loader.
     */
    override onPreLoad(loader: DefaultLoader): void {
        // Add any scene specific resources to load
    }

    /**
     * Called when Excalibur transitions to this scene.
     *
     * Only one scene is active at a time.
     *
     * @param context - The activation context containing any data passed during transition.
     */
    override onActivate(context: SceneActivationContext<unknown>): void {
        // Called when Excalibur transitions to this scene
        // Only 1 scene is active at a time
        this.refreshButtons();
    }

    /**
     * Called when Excalibur transitions away from this scene.
     *
     * Only one scene is active at a time.
     *
     * @param context - The deactivation context containing any data passed during transition.
     */
    override onDeactivate(context: SceneActivationContext): void {
        // Called when Excalibur transitions away from this scene
        // Only 1 scene is active at a time
    }

    /**
     * Called before anything updates in the scene.
     *
     * @param engine - The Excalibur engine instance.
     * @param elapsedMs - Time in milliseconds since the last frame.
     */
    override onPreUpdate(engine: Engine, elapsedMs: number): void {
        // Called before anything updates in the scene
    }

    /**
     * Called after everything updates in the scene.
     *
     * @param engine - The Excalibur engine instance.
     * @param elapsedMs - Time in milliseconds since the last frame.
     */
    override onPostUpdate(engine: Engine, elapsedMs: number): void {
        // Called after everything updates in the scene
    }

    /**
     * Called before Excalibur draws to the screen.
     *
     * @param ctx - The graphics context used for rendering.
     * @param elapsedMs - Time in milliseconds since the last frame.
     */
    override onPreDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
        // Called before Excalibur draws to the screen
    }

    /**
     * Called after Excalibur draws to the screen.
     *
     * @param ctx - The graphics context used for rendering.
     * @param elapsedMs - Time in milliseconds since the last frame.
     */
    override onPostDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
        // Called after Excalibur draws to the screen
    }
}