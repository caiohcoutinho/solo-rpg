# Refactored Vue components

`App.vue` now owns application orchestration: API loading, the shared WebSocket connection, tab navigation, and the Pinia turn store.

The feature UI and interactions are split into:

- `components/ChatComponent.vue` — chronicle, chat input, quick actions, turn editing/deletion.
- `components/NpcManagementComponent.vue` — NPC slots, selection, details, add/remove actions.
- `components/LocationManagementComponent.vue` — current location, selection, details, add/remove actions.
- `components/ModeManagementComponent.vue` — mode indicator and mode selection modal.
- `components/GameStateManagementComponent.vue` — game-state list, editor, and save action.
- `components/LoreManagementComponent.vue` — lore list, active toggle, and details.
- `components/SceneManagementComponent.vue` — scene list and details.
- `components/EnemyManagementComponent.vue` — enemy list and details.

The existing CSS class names are intentionally preserved so the existing stylesheet can continue styling the extracted markup.

Copy the `components` directory next to `App.vue` and replace the existing `App.vue`.
