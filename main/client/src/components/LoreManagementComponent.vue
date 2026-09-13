<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  lore: { type: Array, default: () => [] },
  websocket: { default: null },
});

const selectedLore = ref(null);

function selectLore(item) {
  selectedLore.value = item;
}

function deleteLore() {
  if (!props.websocket || !selectedLore.value) return;

  props.websocket.send(JSON.stringify({
    type: "lore.delete",
    id: selectedLore.value.id
  }));

  selectedLore.value = null;
}

function saveLore() {
  if (!props.websocket || !selectedLore.value) return;

  props.websocket.send(JSON.stringify({
    type: "lore.update",
    id: selectedLore.value.id,
    active: selectedLore.value.active,
    name: selectedLore.value.name,
    description: selectedLore.value.description
  }));

  selectedLore.value = null;
}

watch(
  () => props.lore,
  (items) => {
    if (!selectedLore.value && items.length) {
      selectedLore.value = items[0];
    }
  },
  { immediate: true },
);

function toggleLore(item) {
  if (!props.websocket) return;

  props.websocket.send(JSON.stringify({
    type: "lore.update",
    id: item.id,
    active: item.active,
    name: item.name,
    description: item.description,
  }));
}
</script>

<template>
  <div class="main-layout">
    <aside class="context-sidebar">
      <div class="panel-header">LORE</div>

      <div class="context-list">
        <button
          v-for="item in lore"
          :key="item.id || item.name"
          class="context-item"
          @click="selectLore(item)"
        >
          <input
            type="checkbox"
            v-model="item.active"
            @change.stop="toggleLore(item)"
          />
          {{ item.name }}
        </button>
        
        <button class="context-item" @click="selectLore({})">✅ Create New</button>
      </div>
    </aside>

    <main class="context-content">
      <div class="panel-header">DETAILS</div>

      <div class="context-body">
        <div v-if="selectedLore" class="lore-form">
          
          <!-- Text field for title, text area for description -->
          <input
            v-model="selectedLore.name"
            placeholder="Title"
            class="context-input"
          />
          <textarea
            v-model="selectedLore.description"
            placeholder="Description"
            class="context-textarea"
          ></textarea>

          <!-- if lore has id, show the delete lore button-->
          <button
            v-if="selectedLore.id"
            class="context-button danger"
            @click="deleteLore"
          >
            Delete
          </button>
          <button @click="saveLore" class="context-button">Save</button>
        </div>
        <div v-else>Select an item from the left.</div>
      </div>
    </main>
  </div>
</template>
