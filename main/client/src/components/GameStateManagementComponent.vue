<script setup>
import { ref } from "vue";

const props = defineProps({
  gameStates: { type: Array, default: () => [] },
  campaigns: { type: Array, default: () => [] },
  campaign: { type: Object, default: null },
  scenes: { type: Array, default: () => [] },
  scene: { type: Object, default: null },
  characters: { type: Array, default: () => [] },
  websocket: { default: null },
  websocketReady: { type: Boolean, default: false },
});

const selectedGameState = ref(null);

function selectGameState(state) {
  selectedGameState.value = state;
}

function saveGameState() {
  if (!selectedGameState.value || !props.websocketReady || !props.websocket) {
    return;
  }

  props.websocket.send(JSON.stringify({
    type: "state.update",
    key: selectedGameState.value.key,
    value: selectedGameState.value.value,
  }));
}
</script>

<template>
  <div class="main-layout">
    <aside class="config-sidebar">
      <div class="panel-header">KEY</div>

      <div class="config-list">
        <button
          v-for="state in gameStates"
          :key="state.key"
          class="config-item"
          @click="selectGameState(state)"
        >
          {{ state.key }}
        </button>
      </div>
    </aside>

    <main class="config-content">
      <div class="panel-header">VALUE</div>

      <div class="config-body">
        <div v-if="selectedGameState">
          <!-- if key is current_campaign_id should show a select option between allCampaign values, selected in campaign id -->
          <select v-if="selectedGameState.key === 'current_campaign_id'" v-model="selectedGameState.value" v-on:change="saveGameState">
            <option v-for="c in campaigns" :value="c.id" :key="c.id">{{ c.name }}</option>
          </select>
          <select v-else-if="selectedGameState.key === 'current_scene_id'" v-model="selectedGameState.value" v-on:change="saveGameState">
            <option v-for="s in scenes" :value="s.id" :key="s.id">{{ s.name }}</option>
          </select>
          <select v-else-if="selectedGameState.key === 'main_character'" v-model="selectedGameState.value" v-on:change="saveGameState">
            <option v-for="c in characters" :value="c.id" :key="c.id">{{ c.name }}</option>
          </select>
          <input v-else-if="selectedGameState.key === 'enable_auto_transition'" type="checkbox" v-model="selectedGameState.value" v-on:change="saveGameState">
          <input v-else-if="selectedGameState.key === 'enable_delete_turn_confirmation'" type="checkbox" v-model="selectedGameState.value" v-on:change="saveGameState">
          <div v-else>
            <textarea v-model="selectedGameState.value" rows="10" cols="50"></textarea>
            <button @click="saveGameState">Save</button>
          </div>
        </div>
        <div v-else>Select an item from the left.</div>
      </div>
    </main>
  </div>
</template>
