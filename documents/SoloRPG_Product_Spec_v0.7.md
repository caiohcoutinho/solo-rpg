# SoloRPG --- Product Specification (Discovery Draft)

**Version:** 0.7\
**Status:** Discovery

## Vision

SoloRPG is an AI-assisted engine for playing a solo tabletop RPG, where
a collection of specialized AI experts collectively perform the
responsibilities of a Game Master.

Rather than relying on a single omniscient LLM, the system delegates
each player interaction to the expert best suited for the current
situation.

The goal is to maximize consistency, immersion and rule fidelity by
separating responsibilities.

## Product Scope

The first version supports **exactly one RPG system**.

The application is not intended to be a generic framework where users
can import arbitrary RPG systems.

Instead, a handcrafted **Game Module** is developed specifically for one
chosen system.

Supporting additional systems is explicitly out of scope for the initial
release.

## Design Principles

### Single Responsibility

Each expert owns exactly one responsibility.

  Component            Responsibility
  -------------------- -----------------------
  Exploration Expert   World exploration
  Dialogue Expert      NPC roleplay
  Dungeon Expert       Dangerous exploration
  Combat Expert        Enemy actions
  Rules Engine         Game mechanics
  Transition Router    Expert selection
  World Repository     Persistence

### Rules Isolation

Game mechanics are centralized inside the Rules Engine.

Experts describe situations only. The Rules Engine determines whether a
roll is required, which rule applies, attributes, skills, modifiers,
difficulty, resolves dice, and returns structured mechanical outcomes.

### Shared Voice

All experts receive the same Voice Card.

### Persistent World

The world exists independently from the conversation. Conversation
history is not the source of truth.

## High-Level Architecture

Player → Transition Router → Active Expert → (Rules Engine + World
Repository) → UI

## Components

### Transition Router

-   Classifies the player's intent.
-   No narrative, rules or persistence authority.
-   Inputs: current mode, game state, player input.
-   Outputs: next mode, confidence, reason.
-   Implemented as a lightweight LLM classifier behind a stable service
    interface.

### Exploration Expert

Responsible for world exploration, travel, locations, NPC introductions
and environmental descriptions.

Each response ends with: 1. Recommended action. 2. Alternative action.
3. Free-form input.

### Dialogue Expert

Responsible for portraying NPCs consistently according to motivations,
personality, goals, knowledge and relationships.

### Dungeon Expert

Responsible for dangerous exploration, room generation, traps, hazards
and continuity.

### Combat Expert

Responsible for enemy tactics, decisions and combat narration.

### Arbiter

Invoked manually by the player to review rule compliance.

## Rules Engine

The sole authority on mechanics.

It infers: - Whether a roll is required. - Applicable rule. - Attributes
and skills. - Modifiers. - Difficulty. - Dice results. - Mechanical
consequences.

## World Model

### Static Canon

Loaded before the campaign (lore, setting, official material).

### Emergent Canon

Created during play and persisted as campaign canon.

## World Repository

Stores: - Character Sheet - NPCs - Locations - Dungeons

Experts emit structured persistence events (CreateNPC, UpdateNPC,
CreateLocation, etc.). The repository validates and persists them.

Important campaign moments may be stored as Memories. There is no
append-only event log.

## User Interface

Mode-driven.

Exploration shows two suggested actions with transition indicators plus
free-form input.

Dialogue, Dungeon and Combat use free-form input.

## AI Context

Experts receive: - Shared Voice Card - Campaign state - Relevant
entities - Static canon - Retrieved memories

## LLM Strategy

A single LLM with specialized prompts for each expert.

## Game Module

Contains: - Rulebooks - Character schema - Dice mechanics -
Terminology - Rule interpretation - Prompt augmentations -
System-specific assets

## Open Questions

1.  Entity schemas.
2.  Rules Engine API.
3.  Memory retrieval strategy.
4.  UI outside Exploration mode.
5.  Prompt contracts.
6.  Persistence event schema.
7.  Save/load lifecycle.
