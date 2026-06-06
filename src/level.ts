import { Color, DefaultLoader, Engine, ExcaliburGraphicsContext, Scene, SceneActivationContext } from "excalibur";
import { Player } from "./player";
import { createRandomTilemap } from "./tilemap";
import { createRainbowSpriteTilemap } from "./tilemap";

/**
 * The main game level scene.
 *
 * Handles scene lifecycle, initializes the player actor, and sets up
 * the background colour.
 */
export class MyLevel extends Scene {
    private currentTilemap: any = null;
    private method: 'diamond-square' | 'open-simplex' | 'perlin' = 'perlin';
    private style: 'color' | 'grayscale' = 'color';
    private seed: number = 0;

    // open-simplex defaults
    // private roughness: number = 0.5;
    // private octaves: number = 6;
    // private persistence: number = 0.5;
    // private lacunarity: number = 2.0;

    // perlin defaults
    private roughness: number = 3.0;
    private octaves: number = 6;
    private persistence: number = 0.4;
    private lacunarity: number = 3.0;

    /**
     * Generate a new random seed
     */
    private generateSeed(): void {
        this.seed = Math.floor(Math.random() * 10000);
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

        // Generate a new random seed
        this.generateSeed();

        // Create and add the tilemap
        this.currentTilemap = createRandomTilemap(65, 65, 8, 8, this.method, this.style, this.roughness, this.octaves, this.persistence, this.lacunarity, this.seed);
        this.add(this.currentTilemap);

        // Create and add the rainbow sprite display tilemap
        const rainbowSpriteTilemap = createRainbowSpriteTilemap();
        this.add(rainbowSpriteTilemap);

        // Handle mouse clicks to create a new tilemap
        engine.input.pointers.on('down', () => {
            if (this.currentTilemap) {
                this.remove(this.currentTilemap);
            }
            this.generateSeed();
            this.currentTilemap = createRandomTilemap(65, 65, 8, 8, this.method, this.style, this.roughness, this.octaves, this.persistence, this.lacunarity, this.seed);
            this.add(this.currentTilemap);
        });
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