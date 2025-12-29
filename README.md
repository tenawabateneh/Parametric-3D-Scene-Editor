# Parametric 3D Scene Editor

This project is a small but focused 3D scene editor built with React and vanilla Three.js.
The goal was not visual polish, but to demonstrate graphics-engineering fundamentals: manual lifecycle control, clean separation between UI and rendering, predictable interaction, and safe GPU memory management.

The application allows creating parametric primitives, interacting with them via hover and selection, transforming them in 3D space, and restoring the scene state after reload.

## Architecture Overview

The codebase is intentionally structured to separate engine logic from React UI concerns.

* Engine Core (src/engine/Engine.ts)
  Bootstraps the renderer, scene, camera, render loop, and lifecycle events. This layer owns all Three.js state.

* Rendering Pipeline (Renderer.ts, Loop.ts, Camera.ts)
  Handles WebGLRenderer setup, devicePixelRatio, resize handling, and the centralized requestAnimationFrame loop.

* Scene Management (SceneManager.ts, Primitives.ts)
  Responsible for creating, registering, and removing scene objects. Each primitive is treated as a logical unit (faces + edges).

* Interaction Layer (Interaction.ts, Transform.ts)
  Manages raycasting, hover/selection state, and TransformControls. Interaction is event-driven and intentionally kept out of the render loop.

* UI Layer (src/ui/*)
  Pure React components (Control Panel and HUD). The UI communicates with the engine strictly via function calls and never mutates Three.js objects directly.

This separation makes the system easier to reason about, debug, and extend, and avoids accidental coupling between React renders and GPU state.

## Performance & Graphics Optimization

Several design choices were made specifically to keep the scene responsive and predictable:

* Uniform-Driven Interaction
  Hover and selection states are handled through shader uniforms (uHover, uSelected). Materials are created once and never replaced during interaction.

* No Shader Recompilation During Interaction
  Because only uniform values are updated, the WebGL pipeline never triggers shader recompilation while hovering or selecting objects.

* Shared Shader Programs
  All primitives reuse the same GLSL source. Each mesh owns its own uniform values, but the shader code itself is shared, reducing GPU overhead.

* Scoped Raycasting
  Raycasting only tests against a curated list of selectable objects, avoiding unnecessary traversal of helpers, edges, or non-interactive scene elements.

* Clean Edge Rendering
Edges are rendered using EdgesGeometry with depth handling to avoid Z-fighting, ensuring outlines remain stable regardless of camera angle or distance.

## Disposal Strategy (Zero Leak Target)

Three.js does not automatically free GPU resources, so explicit disposal is treated as a first-class concern.
When an object is removed or the application unmounts:

* Geometries and materials are explicitly disposed
* Edge geometries and materials are also released
* TransformControls are detached and disposed
* The renderer context is properly cleaned up

During development, renderer.info.memory was monitored to verify that geometry and texture counts return to expected values after object removal.

All disposal logic is centralized in src/engine/Disposal.ts.

## Raycasting Optimization

Raycasting is implemented as an event-driven system, not a per-frame operation.

* A single THREE.Raycaster instance is reused
* Raycasting runs only on mouse movement or click events
* Hover state is tracked to avoid redundant updates
* Interaction targets are limited to a cached array of selectable objects

This approach keeps CPU usage predictable and avoids unnecessary calculations inside the render loop.

## Scene Serialization

The scene is synchronized with a deterministic JSON data model containing only:

* Object type
* Position
* Rotation
* Scale
* Stable UUID (for persistence)

The Three.js scene is treated as a projection of this data, not the source of truth.

* Transformations made via TransformControls immediately update the data model
* The serialized scene is persisted to localStorage
* On reload, the scene is reconstructed exactly from the stored data

This approach follows a CAD-style philosophy where data remains authoritative and rendering is derived from it.

## Running the Project

```bash
npm install
npm run dev
```

---

## Notes

In this project I totally avoid abstractions such as React Three Fiber. All Three.js lifecycle management, rendering, interaction, and memory handling are implemented manually to maintain full control over the graphics pipeline.

The focus is correctness, stability, and clarity over visual complexity.
