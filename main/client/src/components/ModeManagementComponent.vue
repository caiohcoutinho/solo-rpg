<script setup>
import { ref } from "vue";

const props = defineProps({
  currentGameMode: { type: String, default: "exploration" },
  websocket: { default: null },
  websocketReady: { type: Boolean, default: false },
});

const showModeModal = ref(false);
const modeOptions = ["exploration", "dungeon", "combat", "dialogue"];

function getModeLabel(mode) {
  switch ((mode || "").toLowerCase()) {
    case "dungeon": return "Dungeon";
    case "combat": return "Combat";
    case "dialogue": return "Dialogue";
    default: return "Exploration";
  }
}

function getModeColor(mode) {
  switch ((mode || "").toLowerCase()) {
    case "dungeon": return "#f59e0b";
    case "combat": return "#ef4444";
    case "dialogue": return "#009b41";
    default: return "#3b82f6";
  }
}

function selectGameMode(mode) {
  const normalizedMode = (mode || "").toLowerCase();

  if (!modeOptions.includes(normalizedMode)) {
    return;
  }

  showModeModal.value = false;

  if (!props.websocketReady || !props.websocket) {
    return;
  }

  props.websocket.send(JSON.stringify({
    type: "state.update",
    key: "mode",
    value: normalizedMode,
  }));
}
</script>

<template>
  <button
    type="button"
    class="mode-indicator"
    :style="{ color: getModeColor(currentGameMode) }"
    @click="showModeModal = true"
  >
    <span class="mode-name">{{ getModeLabel(currentGameMode) }}</span>
  </button>

  <div
    v-if="showModeModal"
    class="modal-backdrop"
    @click="showModeModal = false"
  >
    <div class="mode-modal" @click.stop>
      <div class="panel-header">✦ MODE SELECT</div>

      <div class="mode-option-list">
        <button
          v-for="mode in modeOptions"
          :key="mode"
          type="button"
          class="mode-option-button"
          :style="{
            color: getModeColor(mode),
            borderColor: getModeColor(mode)
          }"
          @click="selectGameMode(mode)"
        >
          {{ getModeLabel(mode) }}
        </button>
      </div>
    </div>
  </div>
</template>
