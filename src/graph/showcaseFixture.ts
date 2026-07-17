import type { RawMemeNode } from './TreeBuilder'

/**
 * Showcase fixture: HD Voxel Game Engine + 3 POC Games.
 *
 * ~100 nodes, depth 0-4. Used as the default visualiser tree on first load
 * and as the export/import round-trip reference.
 */
export const SHOWCASE_RAW: RawMemeNode = {
  id: `voxel-engine-root`,
  label: `HD Voxel Engine + 3 Games`,
  content: `A bespoke HD isometric voxel game engine and three radically distinct POC games — each testing a different genre, emotional register, and player relationship through the same rendering foundation.`,
  children: [
    {
      id: `engine-core`,
      label: `Engine Architecture`,
      content: `Data-oriented ECS core, HD voxel renderer with dynamic global illumination, spatial audio engine, A* grid pathfinding, and a visual scripting layer — all built to serve three very different gameplay paradigms simultaneously.`,
      children: [
        {
          id: `voxel-renderer`,
          label: `HD Voxel Renderer`,
          content: `Real-time HD voxel rendering with async chunk streaming, dynamic GI, per-vertex ambient occlusion, a clustered forward light pass, and an isometric camera rig with cinematic snap zones.`,
          children: [
            {
              id: `chunk-system`,
              label: `Chunk Streaming`,
              content: `World partitioned into fixed-size chunks; async loader maintains a radial buffer around the camera, streaming in high-res geometry and LOD-merging distant chunks to cut draw calls by 80%.`,
              children: [
                {
                  id: `chunk-gen`,
                  label: `Procedural Terrain`,
                  content: `Layered Perlin + Voronoi noise generates base terrain per chunk; each game overrides with hand-authored level data — procedural generation is the fallback editor preview, not the shipped content.`,
                },
                {
                  id: `chunk-lod`,
                  label: `Distance LOD`,
                  content: `Far chunks merge 2x2x2 voxel groups into single averaged voxels, reducing geometry by 87.5% at maximum distance while preserving silhouette and colour fidelity at the isometric view angle.`,
                },
              ],
            },
            {
              id: `global-illumination`,
              label: `Dynamic GI & Lighting`,
              content: `Per-vertex AO baked on the CPU during chunk remesh; real-time directional sun with cascaded shadows; up to 32 dynamic point lights via clustered tiled rendering — used for PSI glows, torches, and emotional scene cues.`,
              children: [
                {
                  id: `ao-system`,
                  label: `Ambient Occlusion`,
                  content: `Six-tap voxel AO computed per vertex at mesh time; dark contact shadows emerge naturally without screen-space passes, giving the voxel world depth at zero runtime cost.`,
                },
                {
                  id: `dynamic-lights`,
                  label: `Dynamic Point Lights`,
                  content: `Screen divided into 16x16 tiles; each tile stores a sorted light list culled by frustum and depth. The RPG uses this for PSI pulse effects; the Sim uses it for warm evening lamp-glow.`,
                },
              ],
            },
            {
              id: `iso-camera`,
              label: `Isometric Camera Rig`,
              content: `Fixed-angle orthographic projection at 30 degrees pitch; smooth follow-target lerp with configurable lag; per-room snap zones override the follow target for interiors; cinematic zoom-out reveals play on act transitions.`,
            },
            {
              id: `material-system`,
              label: `Voxel Material System`,
              content: `Per-voxel 8-bit material index maps to a 256-entry palette encoding colour, emission, roughness, and four animation flags: water shimmer, leaf rustle, fabric sway, and emissive pulse.`,
            },
          ],
        },
        {
          id: `ecs-core`,
          label: `Entity-Component-System`,
          content: `Data-oriented ECS with archetype storage: entities are pure IDs, components are contiguous typed arrays, systems operate on archetype queries — enabling branchless, cache-coherent iteration over thousands of game entities.`,
          children: [
            {
              id: `ecs-archetypes`,
              label: `Archetype Storage`,
              content: `Components sharing an identical type signature share a contiguous memory block; creating a new entity type auto-generates a new archetype, keeping all system iterations tightly packed and SIMD-friendly.`,
            },
            {
              id: `ecs-events`,
              label: `Typed Event Bus`,
              content: `Publish/subscribe event bus with per-type queues; collision events, dialogue triggers, mood transitions, schedule completions, and PSI ability activations all route through this bus without coupling systems.`,
            },
            {
              id: `ecs-scripting`,
              label: `Visual Scripting Bridge`,
              content: `A node-graph editor exposes ECS components and events as scriptable nodes; game designers wire dialogue trees, quest conditions, and NPC reactions without touching engine code.`,
            },
            {
              id: `ecs-queries`,
              label: `Archetype Query Cache`,
              content: `Query results (e.g. all entities with Transform + NeedsComponent + MoodComponent) are cached and invalidated only on archetype change — removing the inner loop overhead from all behaviour-tree evaluations.`,
            },
          ],
        },
        {
          id: `ai-navigation`,
          label: `Pathfinding & Behaviour`,
          content: `Hierarchical A* on the voxel grid with dynamic obstacle updates; Behaviour Trees drive all NPC decision-making with direct ECS component access for branchless leaf evaluation.`,
          children: [
            {
              id: `astar`,
              label: `A* Grid Pathfinding`,
              content: `Flat voxel-grid A* with configurable heuristic; paths cached per agent and invalidated selectively on terrain change; multi-height support lets Efa climb stairs and RPG enemies leap gaps.`,
            },
            {
              id: `behaviour-trees`,
              label: `Behaviour Trees`,
              content: `Composite BTs with Sequence, Selector, Parallel, and Decorator nodes; leaf nodes query ECS directly, enabling the Sim scheduler, the RPG NPC routines, and the Adventure examination mechanic to share the same runtime.`,
            },
          ],
        },
        {
          id: `audio-engine`,
          label: `Spatial Audio Engine`,
          content: `Voxel-aware 3D audio with occlusion, reverb zones, and an adaptive horizontal re-sequencing music system that cross-fades stems based on a floating-point tension value.`,
          children: [
            {
              id: `spatial-audio`,
              label: `Voxel Audio Occlusion`,
              content: `Sounds passing through solid voxels receive a low-pass filter proportional to material density; open-air sounds gain early reflections sampled from surrounding wall normals — no baked reverb maps needed.`,
            },
            {
              id: `adaptive-music`,
              label: `Adaptive Music System`,
              content: `Four independent stems (percussion, melody, harmony, atmosphere) fade in/out based on a 0-to-1 tension float; the RPG ties it to combat proximity, the Sim to time-of-day, the Adventure to accumulated grief state.`,
            },
          ],
        },
      ],
    },
    {
      id: `rpg-okinawa`,
      label: `RPG: Okinawa Earthbound`,
      content: `A turn-based RPG set in modern Okinawa, Japan. Inspired by Earthbound's warmth and irreverence; four teenagers navigate a reality dissolving at its edges — the world is experiencing a kind of teenage crisis called The Drift.`,
      children: [
        {
          id: `rpg-story`,
          label: `Story & Tone`,
          content: `The Drift — abstract antagonist manifested as forgetting — spreads through Naha. Memories only persist if they are genuinely felt. The game asks: what do you hold onto when the familiar starts to feel foreign?`,
          children: [
            {
              id: `rpg-premise`,
              label: `Core Premise`,
              content: `Kai and three friends discover they resist The Drift through emotional resonance — memories survive only when fully felt, turning empathy itself into a superpower and intimate conversation into a combat mechanic.`,
            },
            {
              id: `rpg-acts`,
              label: `Three-Act Structure`,
              content: `Act I: The Drift is subtle — vanished vending machines, teachers who lose nouns. Act II: landmarks dissolve, NPCs loop. Act III: the party descends into the void and reconstructs Naha from combined emotional memory.`,
              children: [
                {
                  id: `rpg-act1`,
                  label: `Act I: Strange Days`,
                  content: `Summer in Naha; Drift anomalies read as comedy before turning sinister — a cat named after someone nobody can remember, a festival nobody is surprised to have forgotten was happening.`,
                },
                {
                  id: `rpg-act2`,
                  label: `Act II: The Erasure`,
                  content: `The coast road disappears overnight; Masa's family no longer remembers him living there. Each character's backstory is targeted in ways that mirror their personal fear of being forgotten.`,
                },
                {
                  id: `rpg-act3`,
                  label: `Act III: Memory Anchor`,
                  content: `Inside The Drift's white-void core, the party reconstructs Naha piece by piece from shared memory; each choice determines which version of the world is restored — and who is remembered in it.`,
                },
              ],
            },
            {
              id: `rpg-themes`,
              label: `Themes & Subtext`,
              content: `Identity, cultural displacement, the weight of shared history, and the Okinawan concept of yuimaaru (mutual aid, interdependence) as the structural answer to The Drift's isolation mechanic.`,
            },
          ],
        },
        {
          id: `rpg-characters`,
          label: `Characters`,
          content: `Four characters with distinct combat roles, PSI trees, personal Drift vulnerabilities, and bond mechanics that link relationship depth directly to co-operative combat capability.`,
          children: [
            {
              id: `rpg-kai`,
              label: `Kai — Protagonist`,
              content: `Half-Japanese, raised between Okinawa and the UK; Kai's outsider-insider identity makes them uniquely resistant to The Drift but unable to fully commit to any memory as real enough to anchor.`,
              children: [
                {
                  id: `kai-arc`,
                  label: `Kai's Arc`,
                  content: `From detached observer to emotional anchor: Kai learns that belonging doesn't require certainty, only presence — delivered in a quiet scene by the sea wall at dusk in the game's penultimate hour.`,
                },
                {
                  id: `kai-psi`,
                  label: `Psyche Ability Tree`,
                  content: `Kai's PSI manifests as sensory interpolation — temporarily inhabiting another person's felt experience, revealing hidden memories, bypassing emotional barriers in dialogue, and targeting Drift entities' forgotten origin.`,
                },
              ],
            },
            {
              id: `rpg-party`,
              label: `Party: Three Friends`,
              content: `Yuki (emotional anchor, defensive crystallisation PSI), Masa (creative amplifier, volatile and Drift-susceptible), Hana (analytical, protective of rationality, resists PSI instinctively).`,
              children: [
                {
                  id: `rpg-yuki`,
                  label: `Yuki — The Anchor`,
                  content: `Steadfast and practical; PSI crystallises emotional states, creating defensive barriers and preserving nearby memories. Personal Drift: the fear of becoming invisible to the people they love most.`,
                },
                {
                  id: `rpg-masa`,
                  label: `Masa — The Dreamer`,
                  content: `Vivid and creative; PSI amplifies emotional charge in objects, making them Drift-resistant or explosively powerful. Personal Drift: the worry that his vivid imaginings have always been replacing reality.`,
                },
                {
                  id: `rpg-hana`,
                  label: `Hana — The Realist`,
                  content: `Documents every Drift anomaly in a paper notebook; resists PSI instinctively. Her arc: learning that documenting something is not the same as holding onto it. Her notebook is the game's most important inventory item.`,
                },
              ],
            },
            {
              id: `rpg-antagonist`,
              label: `The Drift`,
              content: `Not a villain but an entropy — the natural tendency of experience to fade. It speaks in the voice of whoever you miss most. Its defeat is not destruction but acceptance; the final battle is a conversation.`,
            },
          ],
        },
        {
          id: `rpg-combat`,
          label: `Turn-Based Combat`,
          content: `Speed-based ATB turn order; PSI ability trees per character; a Bond Meter enables co-op attacks but can only recharge through out-of-combat dialogue — combat and emotional connection are explicitly coupled.`,
          children: [
            {
              id: `rpg-psi-system`,
              label: `PSI Ability Trees`,
              content: `Four distinct trees rooted in each character's emotional mode: Kai's empathy tree, Yuki's crystallisation tree, Masa's amplification tree, Hana's analysis tree. Cross-linking abilities unlock through bond level.`,
            },
            {
              id: `rpg-enemies`,
              label: `Enemy Design Philosophy`,
              content: `All enemies are Drift manifestations of mundane things gone strange: a forgotten umbrella becomes a storm elemental, an unanswered text becomes a silence-entity. Defeating them restores a small world memory to an NPC.`,
            },
            {
              id: `rpg-bond`,
              label: `Bond Combat Mechanic`,
              content: `Bond actions (co-op attacks, protective reactions) cost Bond Meter; recharging requires 60-90 seconds of uninterrupted conversation out of combat. Combat power is directly proportional to relationship investment.`,
            },
          ],
        },
        {
          id: `rpg-world-art`,
          label: `World & Art Direction`,
          content: `Chunky expressive voxels: Okinawan tiled rooftops, shisa statues, hibiscus colour pops, and the blue-green of the East China Sea as the game's emotional anchor colour. Music blends Earthbound's dry percussion with Ryukyuan sanshin.`,
          children: [
            {
              id: `rpg-palette`,
              label: `Colour Palette`,
              content: `Foundation: sea-glass teal, coral orange, warm concrete grey. Drift zones desaturate progressively toward the ash-white void at the core — colour is a real-time indicator of world health.`,
            },
            {
              id: `rpg-districts`,
              label: `Naha Districts`,
              content: `Kokusai-dori (tourist strip, first to Drift), Shuri Castle area (cultural anchor, last to fade), fishing harbours (community life hub), Chatan's American Village (cultural collision zone with its own Drift dialect).`,
            },
          ],
        },
      ],
    },
    {
      id: `adventure-cornwall`,
      label: `Adventure: Cornwall 90s`,
      content: `A click-and-point adventure about grief, coastal isolation, and the strange intimacy of being present at someone else's loss. Set in a fictional Cornish fishing village, 1997. Every room is a story. Every object remembers.`,
      children: [
        {
          id: `adv-narrative`,
          label: `Narrative Architecture`,
          content: `Non-linear story told through environmental interaction; the plot is reconstruction — assembling what happened from fragments scattered across the cottage, the village, and the people who knew him differently.`,
          children: [
            {
              id: `adv-premise`,
              label: `The Premise`,
              content: `You arrive at your estranged father's Cornish cottage after his death. The village knew him in ways you didn't. The game is about the gap between those two truths — and whether closing it is even possible.`,
            },
            {
              id: `adv-structure`,
              label: `Story Structure`,
              content: `Five locations unlock over three in-game days; each holds memory fragments that retroactively update all prior dialogue, building a picture that is layered but never fully complete — because people never are.`,
            },
            {
              id: `adv-dialogue`,
              label: `Dialogue Design`,
              content: `All choices are tonal, not informational: not 'what happened?' versus 'who was there?' but 'I am angry' versus 'I do not understand yet.' Tone shapes character depth and trust; plot outcomes remain unchanged.`,
            },
          ],
        },
        {
          id: `adv-characters`,
          label: `Characters & Arcs`,
          content: `Six characters each holding a different facet of the father's life. None are unreliable narrators — they're honest about their limited view. The protagonist's arc is about integrating contradictory truths, not resolving them.`,
          children: [
            {
              id: `adv-protagonist`,
              label: `The Protagonist`,
              content: `Unnamed, mid-30s, estranged for a decade. The game opens the morning after a stranger's phone call. Their grief is complicated by guilt, and the guilt by a love they never articulated — which is itself the point.`,
              children: [
                {
                  id: `adv-prot-arc`,
                  label: `Arc: Denial to Integration`,
                  content: `Five grief stages map loosely to the five locations; but the game resists tidy catharsis — the final scene is quiet, unresolved, and true, because real grief doesn't conclude within a reasonable runtime.`,
                },
                {
                  id: `adv-coping`,
                  label: `Coping Mode as Mechanic`,
                  content: `The player's dominant coping mode (avoidance, intellectualising, confrontation) is tracked silently across item interactions and surfaces different memories in certain rooms, adjusting NPC trust thresholds.`,
                },
              ],
            },
            {
              id: `adv-supporting`,
              label: `Supporting Characters`,
              content: `Bev (pub landlady, keeper of his secrets), Rory (young neighbour who idolised him), and Mrs Tredinnick (elderly, the only one who shares the protagonist's complicated truth about who he actually was).`,
              children: [
                {
                  id: `adv-bev`,
                  label: `Bev — The Keeper`,
                  content: `Bev kept the father's confidences without being asked; her loyalty complicates the protagonist's resentment because it proves he was capable of showing up for someone — just not for them.`,
                },
                {
                  id: `adv-rory`,
                  label: `Rory — The Mirror`,
                  content: `Young, motherless; the father was stabilising for Rory in the way he never was at home. Meeting Rory forces the player to hold two contradictory truths: he failed you AND he mattered to someone.`,
                },
              ],
            },
            {
              id: `adv-relationships`,
              label: `Relationship System`,
              content: `Trust, understanding, and compassion tracked independently per character; each dimension changes late-game dialogue texture without altering plot outcomes — because real people don't change their story based on how much you like them.`,
            },
          ],
        },
        {
          id: `adv-themes`,
          label: `Themes & Sensitivity`,
          content: `Direct engagement with grief, estrangement, and complicated love; content design follows a formal sensitivity framework so no player is forced through the most intense material without warning and an opt-out.`,
          children: [
            {
              id: `adv-grief`,
              label: `Grief as Structure`,
              content: `The game's non-linearity mirrors grief's own disorder; some rooms won't open until you've sat with something else first — the structure of access reflects the structure of processing.`,
            },
            {
              id: `adv-isolation`,
              label: `Rural Isolation`,
              content: `The Cornish setting is itself a character: narrow lanes, phone boxes, the sound of gulls at 3am. The 90s pre-internet context removes easy escape routes, creating the earned intimacy of being truly stuck somewhere.`,
            },
            {
              id: `adv-sensitivity`,
              label: `Content Safety Design`,
              content: `Content warnings before session start; three-second opt-out windows before the three most intense sequences; a lighter mode replaces specific details with abstraction without removing emotional truth.`,
            },
          ],
        },
        {
          id: `adv-visual`,
          label: `Visual & Audio Style`,
          content: `Muted watercolour-washed voxels in a 90s Cornwall palette — sea-grey, damp-wool green, overcast afternoon blue. Music is sparse piano and field recordings; diegetic audio carries the emotional weight.`,
          children: [
            {
              id: `adv-palette`,
              label: `Cornwall Colour Palette`,
              content: `Cool low-saturation greys and greens; isolated warm accent colours mark emotionally significant objects — a red coat on a hook, a yellow mug on the draining board. Warmth is earned, not ambient.`,
            },
            {
              id: `adv-sound`,
              label: `Sound Design Philosophy`,
              content: `Diegetic-first: the creak of a specific floorboard, the silence of an empty cottage in January. Music enters in only three scenes and ends before the emotional peak — the silence after is the intended experience.`,
            },
          ],
        },
      ],
    },
    {
      id: `sim-welsh`,
      label: `Home Sim: Welsh Cottage`,
      content: `A life simulation following Owen, a young widowed dad, and his five-year-old daughter Efa through the rhythms of their days in a small South Wales town. Warm, slow, and full. The player watches; life unfolds.`,
      children: [
        {
          id: `sim-systems`,
          label: `Simulation Systems`,
          content: `Layered needs-based AI: six need meters per character decay at individual rates; a daily routine scheduler generates each morning's plan by balancing urgent needs against obligations, weather, and random life-event cards.`,
          children: [
            {
              id: `sim-needs`,
              label: `Needs Architecture`,
              content: `Sleep, Hunger, Hygiene, Social, Play/Purpose, and Emotional Safety decay at individual rates; urgent needs interrupt routines mid-action, creating the small unplanned moments that define the game's texture.`,
            },
            {
              id: `sim-scheduler`,
              label: `Daily Routine Scheduler`,
              content: `Each morning generates Owen's schedule by scoring candidate activities against current need urgency, Efa's school timetable, weather state, and that day's randomly drawn life-event card.`,
              children: [
                {
                  id: `sim-weather`,
                  label: `Welsh Weather System`,
                  content: `Rain (frequent), mist, and rare bright days drive major schedule divergence: rain means indoor carpentry and Efa's den-building; sun means the garden, the park, the longer route to kindergarten.`,
                },
                {
                  id: `sim-life-events`,
                  label: `Life Event Cards`,
                  content: `One to three random life events fire per simulated week: a neighbour drops by unannounced, Efa finds a frog in the garden, Owen's car won't start. Small disruptions are the game's primary narrative engine.`,
                },
              ],
            },
            {
              id: `sim-moods`,
              label: `Mood State Machine`,
              content: `Moods are emergent intersections: low Sleep combined with a positive Social interaction creates 'tired but grateful' rather than just 'tired'. Mood states gate specific micro-animations and contextual dialogue lines.`,
            },
          ],
        },
        {
          id: `sim-characters`,
          label: `Owen & Efa`,
          content: `The entire cast. Richness comes from watching them together: each has hundreds of micro-animations, a deep behaviour tree, and context-sensitive dialogue lines. The relationship between them is the game's only plot.`,
          children: [
            {
              id: `sim-owen`,
              label: `Owen`,
              content: `Early 30s, quiet and careful. Former secondary school art teacher who left his job after Efa's mother died. Still paints on Sunday mornings before Efa wakes — the guaranteed private hour that the player learns to protect.`,
              children: [
                {
                  id: `sim-owen-routines`,
                  label: `Owen's Daily Rhythms`,
                  content: `Morning: coffee before Efa wakes (the only guaranteed alone time). School run. One errand. The long afternoon. Evening: dinner, bath, story, the silence after. Sunday: painting, then Efa arrives in pyjamas.`,
                },
                {
                  id: `sim-owen-inner`,
                  label: `Owen's Inner Life`,
                  content: `Thought-bubbles surface during idle animations — a memory of her mother while folding laundry, a moment of pure uncomplicated happiness watching Efa eat toast. Never voiced aloud; always legible.`,
                },
              ],
            },
            {
              id: `sim-efa`,
              label: `Efa`,
              content: `Five years old, starting to know herself. Stubborn about specific things (the blue cup, shoes before coat), generous with affection, currently obsessed with dinosaurs and the colour orange.`,
              children: [
                {
                  id: `sim-efa-growth`,
                  label: `Efa's Development`,
                  content: `Interest evolves on a slow seasonal clock: dinosaurs to birds to drawing to a best friend named Sian. Language complexity gradually increases; new vocabulary appears mid-sentence as she tests it for the first time.`,
                },
                {
                  id: `sim-efa-play`,
                  label: `Efa's Play Worlds`,
                  content: `Efa creates elaborate parallel realities during play: kitchen becomes a field hospital, garden becomes a moon base. Owen participates when invited; the boundary of his participation is a key emotional register.`,
                },
              ],
            },
          ],
        },
        {
          id: `sim-world`,
          label: `World: South Welsh Town`,
          content: `A small, specific place: the cottage with its temperamental boiler, the walk past the chapel to kindergarten, the Co-op where everyone knows Owen's name, the hills that begin just beyond the estate edge.`,
          children: [
            {
              id: `sim-cottage`,
              label: `The Cottage`,
              content: `Three rooms visible simultaneously in isometric view: kitchen-diner (the heart of the game), the sitting room (Owen's secondary space), Efa's bedroom (maximally personalised). The boiler room is a recurring minor crisis.`,
            },
            {
              id: `sim-kindergarten`,
              label: `Kindergarten`,
              content: `The playground, the classroom window, the gate where Owen hands Efa over and watches her run without looking back. Three other parents at the gate form Owen's slow, cautious social reclamation arc.`,
            },
            {
              id: `sim-village`,
              label: `Village Life`,
              content: `Post office, Co-op, the cafe Owen visits once a week, the library where Efa gets her books. Off-route: the hill path, the river, the field that floods in November and becomes for two weeks the most interesting place in the world.`,
            },
          ],
        },
        {
          id: `sim-tone`,
          label: `Tone & Design Philosophy`,
          content: `Inspired by Studio Ghibli's capacity to hold ordinary life as sacred. No drama arc, no antagonist, no resolution. The point is the Tuesday morning when everything is unremarkable and somehow completely enough.`,
          children: [
            {
              id: `sim-warmth`,
              label: `Warmth Over Drama`,
              content: `The game withholds escalation as a deliberate design choice. The boiler breaks and Owen fixes it. Efa falls and cries and Owen holds her. These are the whole point — not setup for something larger.`,
            },
            {
              id: `sim-observer`,
              label: `Player as Witness`,
              content: `The player cannot control Owen or Efa directly; they can zoom, pan, and occasionally offer a soft choice — more a direction than a command. The game is about watching, not managing.`,
            },
            {
              id: `sim-welsh-culture`,
              label: `Welsh Cultural Specificity`,
              content: `Bilingual signage and occasional Welsh dialogue; the rhythm of a Welsh town — chapel culture, community warmth, neighbours who don't intrude but are absolutely there. Authenticity replaces exoticism.`,
            },
          ],
        },
      ],
    },
    {
      id: `art-pipeline`,
      label: `Art & Tech Pipeline`,
      content: `Shared production infrastructure: a unified voxel art direction guide, a hot-reload asset pipeline, per-game audio identity, and the foundational technology decision — Rust or C++, WebGPU or Vulkan — that shapes everything downstream.`,
      children: [
        {
          id: `pipeline-art-dir`,
          label: `Voxel Art Direction`,
          content: `All three games share voxel resolution (32-cubed character models), grid alignment, AO strength, and shadow intensity. Each game's distinct feel comes entirely from colour language and emotional palette.`,
          children: [
            {
              id: `style-guide`,
              label: `Cross-Game Style Rules`,
              content: `Shared anatomy ratios (3:5:3 head-torso-leg proportion), identical contact shadow behaviour, consistent emissive bloom radius — switching the engine between games should feel like changing mood, not changing physics.`,
            },
            {
              id: `art-resolution`,
              label: `HD Voxel Resolution Standard`,
              content: `1 voxel equals 10cm world-space; characters target 32-cubed voxels; environment blocks are 1m-cubed with detail meshes overlaid for wires, handles, and fine surface features that voxels alone cannot represent.`,
            },
            {
              id: `art-animation`,
              label: `Animation Philosophy`,
              content: `Weight-first animation: every action radiates from centre of mass outward; anticipation frames mandatory for all inputs over 0.5s perceived response time. Reference library: 400+ real-world motion captures mapped to shared voxel rig.`,
            },
          ],
        },
        {
          id: `pipeline-tech`,
          label: `Core Tech Decisions`,
          content: `Two critical decisions with cascading consequences: engine implementation language (Rust vs C++) and rendering backend (WebGPU for zero-install browser reach vs Vulkan for desktop peak performance).`,
          children: [
            {
              id: `tech-language`,
              label: `Language: Rust or C++`,
              content: `Rust offers memory safety, fearless concurrency, and wasm32 browser deployment via Bevy ECS. C++ offers a mature voxel ecosystem, easier shader tooling, a larger hiring pool, and industry-standard debuggers.`,
              children: [
                {
                  id: `tech-rust`,
                  label: `The Rust Case`,
                  content: `Memory safety eliminates entire classes of engine bugs; Bevy ECS is proven on voxel projects; async Tokio handles chunk streaming cleanly; wasm32 target gives free browser deployment with no rewrite needed.`,
                },
                {
                  id: `tech-cpp`,
                  label: `The C++ Case`,
                  content: `BGFX and Filament are production-proven rendering libraries; Entt ECS is battle-tested in shipped titles; FMOD integrates trivially; RenderDoc, Tracy, and Valgrind are mature; senior engineers are plentiful.`,
                },
              ],
            },
            {
              id: `tech-renderer-backend`,
              label: `Renderer: WebGPU vs Vulkan`,
              content: `WebGPU targets zero-install browser deployment but is still maturing on macOS; Vulkan targets desktop peak performance with full feature access. BGFX as an abstraction layer defers the final decision.`,
            },
            {
              id: `tech-editor`,
              label: `In-Engine Editor`,
              content: `Level editor with direct voxel painting, entity placement, and behaviour tree visualisation; hot-reload for scripts and assets during play; screenshot regression tests catch visual regressions across all three games simultaneously.`,
            },
          ],
        },
        {
          id: `pipeline-process`,
          label: `Development Process`,
          content: `Engine and game development run in parallel tracks with explicit API contracts at their boundary. Each game acts as both consumer and live test suite — if a game cannot do it, the engine does not support it.`,
          children: [
            {
              id: `process-milestones`,
              label: `Milestone Structure`,
              content: `Engine Milestone 0: one character walks on flat terrain. Game Milestone 0 (all three games simultaneously): protagonist moves between two rooms. Every subsequent engine milestone is validated by all three games at once.`,
            },
            {
              id: `process-testing`,
              label: `Automated Testing Strategy`,
              content: `200 screenshot regression frames per game; AI behaviour unit tests (scheduler produces valid daily schedules); pathfinding correctness suites (known mazes with proven optimal solutions). All run on every commit.`,
            },
          ],
        },
      ],
    },
  ],
}
