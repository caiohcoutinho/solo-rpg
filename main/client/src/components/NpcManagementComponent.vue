<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  activeNpcs: { type: Array, default: () => [] },
  allNpcs: { type: Array, default: () => [] },
  websocket: { default: null },
  websocketReady: { type: Boolean, default: false },
});

const selectedNpc = ref(null);
const showNpcDetailsModal = ref(false);
const showNpcSelectModal = ref(false);

const npcSlots = computed(() =>
  Array.from({ length: 10 }, (_, index) => props.activeNpcs[index] || null),
);

function getPortraitSrc(npc) {
  if (!npc?.portrait) return "";
  return npc.portrait.startsWith("http")
    ? npc.portrait
    : `/portraits/${npc.portrait}`;
}

function handleNpcSlotClick(npc) {
  if (npc) {
    selectedNpc.value = npc;
    showNpcDetailsModal.value = true;
  } else {
    showNpcSelectModal.value = true;
  }
}

function send(message) {
  if (!props.websocketReady || !props.websocket) return false;
  props.websocket.send(JSON.stringify(message));
  return true;
}

function removeNpcFromScene() {
  if (!selectedNpc.value || !send({
    type: "npc.update",
    id: selectedNpc.value.id,
    updates: { in_scene: false },
  })) {
    return;
  }

  showNpcDetailsModal.value = false;
  selectedNpc.value = null;
}

function addNpcToScene(npc) {
  if (!npc || !send({
    type: "npc.update",
    id: npc.id,
    updates: { in_scene: true },
  })) {
    return;
  }

  showNpcSelectModal.value = false;
}
</script>

<template>
  <div class="panel-header">✦ NPCS</div>

  <div class="npc-list">
    <div
      v-for="(npc, index) in npcSlots"
      :key="npc?.id ?? index"
      class="npc-slot"
      :class="{ 'npc-slot-empty': !npc }"
      @click="handleNpcSlotClick(npc)"
    >
      <img
        v-if="npc"
        :src="getPortraitSrc(npc)"
        :alt="npc.name"
        class="npc-portrait-image"
      />
      <div v-else class="npc-portrait-placeholder">✧</div>
      <div class="npc-name">{{ npc?.name || "—" }}</div>
    </div>
  </div>

  <div
    v-if="showNpcDetailsModal && selectedNpc"
    class="modal-backdrop"
    @click="showNpcDetailsModal = false; selectedNpc = null"
  >
    <div class="npc-details-modal" @click.stop>
      <div class="panel-header">✦ NPC DETAILS</div>

      <div class="npc-modal-profile">
        <img
          v-if="selectedNpc.portrait"
          :src="getPortraitSrc(selectedNpc)"
          :alt="selectedNpc.name"
          class="npc-modal-portrait-image"
        />

        <div class="npc-modal-info">
          <div class="npc-modal-name">{{ selectedNpc.name }}</div>
          <div class="npc-modal-background-label">BACKGROUND:</div>
          <div class="npc-modal-background-text">
            {{ selectedNpc.background || "No background story available." }}
          </div>
        </div>
      </div>

      <div class="turn-modal-actions">
        <button
          class="action-button secondary"
          @click="showNpcDetailsModal = false; selectedNpc = null"
        >
          Close
        </button>
        <button class="action-button danger" @click="removeNpcFromScene">
          Remove from Scene
        </button>
      </div>
    </div>
  </div>

  <div
    v-if="showNpcSelectModal"
    class="modal-backdrop"
    @click="showNpcSelectModal = false"
  >
    <div class="npc-select-modal" @click.stop>
      <div class="panel-header">✦ ADD NPC TO SCENE</div>

      <div class="npc-selection-grid">
        <div
          v-for="npc in allNpcs"
          :key="npc.id"
          class="npc-selection-card"
          :class="{ 'npc-selection-card-disabled': npc.inScene }"
          @click="!npc.inScene && addNpcToScene(npc)"
        >
          <img
            v-if="npc.portrait"
            :src="getPortraitSrc(npc)"
            :alt="npc.name"
            class="npc-selection-portrait"
          />
          <div v-else class="npc-portrait-placeholder">✧</div>
          <div class="npc-selection-name">{{ npc.name }}</div>
        </div>

        <div v-if="allNpcs.length === 0" class="empty-state">
          [NO CREATED NPCS FOUND]
        </div>
      </div>

      <div class="turn-modal-actions">
        <button
          class="action-button secondary"
          @click="showNpcSelectModal = false"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
