import { Actor, Collider, CollisionContact, Engine, Side, vec } from "excalibur";
import { Resources } from "./resources";

// Actors are the main unit of composition you'll likely use, anything that you want to draw and move around the screen
// is likely built with an actor

// They contain a bunch of useful components that you might use
// actor.transform
// actor.motion
// actor.graphics
// actor.body
// actor.collider
// actor.actions
// actor.pointer


/**
 * Player actor that represents the controllable character in the game.
 *
 * Extends Excalibur's {@link Actor} and configures initial position, size,
 * and a simple patrol pattern via the actions API.
 *
 * @example
 * ```ts
 * const player = new Player();
 * scene.add(player);
 * ```
 */
export class Player extends Actor {
  /**
   * Creates a new {@link Player} instance.
   *
   * The player is initialized at position (150, 150) with a bounding box of
   * 100 × 100 pixels.
   */
  constructor() {
    super({
      // Giving your actor a name is optional, but helps in debugging using the dev tools or debug mode
      // https://github.com/excaliburjs/excalibur-extension/
      // Chrome: https://chromewebstore.google.com/detail/excalibur-dev-tools/dinddaeielhddflijbbcmpefamfffekc
      // Firefox: https://addons.mozilla.org/en-US/firefox/addon/excalibur-dev-tools/
      name: 'Player',
      pos: vec(150, 150),
      width: 100,
      height: 100,
      // anchor: vec(0, 0), // Actors default center colliders and graphics with anchor (0.5, 0.5)
      // collisionType: CollisionType.Active, // Collision Type Active means this participates in collisions read more https://excaliburjs.com/docs/collisiontypes
    });

  }

  /**
   * Initializes the player's graphics and patrol behavior before the first
   * frame is rendered.
   *
   * Loads the sword sprite, starts a delayed infinite patrol loop, and
   * registers a pointer-down handler for click debugging.
   */
  override onInitialize() {
    // Generally recommended to stick logic in the "On initialize"
    // This runs before the first update
    // Useful when
    // 1. You need things to be loaded like Images for graphics
    // 2. You need excalibur to be initialized & started 
    // 3. Deferring logic to run time instead of constructor time
    // 4. Lazy instantiation
    this.graphics.add(Resources.Sword.toSprite());

    // Actions are useful for scripting common behavior, for example patrolling enemies
    this.actions.delay(2000);
    this.actions.repeatForever(ctx => {
      ctx.moveBy({offset: vec(100, 0), duration: 1000});
      ctx.moveBy({offset: vec(0, 100), duration: 1000});
      ctx.moveBy({offset: vec(-100, 0), duration: 1000});
      ctx.moveBy({offset: vec(0, -100), duration: 1000});
    });

    // Sometimes you want to click on an actor!
    this.on('pointerdown', evt => {
      // Pointer events tunnel in z order from the screen down, you can cancel them!
      // if (true) {
      //   evt.cancel();
      // }
      console.log('You clicked the actor @', evt.worldPos.toString());
    });
  }

  /**
   * Called every frame before Excalibur's built-in update logic.
   *
   * @param engine - The current game engine instance.
   * @param elapsedMs - Milliseconds since the last frame.
   */
  override onPreUpdate(engine: Engine, elapsedMs: number): void {
    // Put any update logic here runs every frame before Actor builtins
  }

  /**
   * Called every frame after Excalibur's built-in update logic.
   *
   * @param engine - The current game engine instance.
   * @param elapsedMs - Milliseconds since the last frame.
   */
  override onPostUpdate(engine: Engine, elapsedMs: number): void {
    // Put any update logic here runs every frame after Actor builtins
  }

  /**
   * Called before a collision is resolved.
   *
   * Override this method to opt out of a specific collision by calling
   * {@link CollisionContact.cancel}.
   *
   * @param self - The player's collider.
   * @param other - The collider that was hit.
   * @param side - The side of the player that was contacted.
   * @param contact - Collision contact information (can be cancelled).
   */
  override onPreCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    // Called before a collision is resolved, if you want to opt out of this specific collision call contact.cancel()
  }

  /**
   * Called after a collision has been resolved and overlap is corrected.
   *
   * @param self - The player's collider.
   * @param other - The collider that was hit.
   * @param side - The side of the player that was contacted.
   * @param contact - Collision contact information.
   */
  override onPostCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    // Called every time a collision is resolved and overlap is solved
  }

  /**
   * Called when the player first comes into contact with another collider.
   *
   * @param self - The player's collider.
   * @param other - The collider that was hit.
   * @param side - The side of the player that was contacted.
   * @param contact - Collision contact information.
   */
  override onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    // Called when a pair of objects are in contact
  }

  /**
   * Called when the player separates from another collider after being in
   * contact.
   *
   * @param self - The player's collider.
   * @param other - The collider that was hit.
   * @param side - The side of the player that was contacted.
   * @param lastContact - Collision contact information from the last contact.
   */
  override onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
    // Called when a pair of objects separates
  }
}
