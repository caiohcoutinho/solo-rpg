<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  enemies: { type: Array, default: () => [] },
});

const selectedEnemy = ref(null);

function getPortraitSrc(enemy) {
  if (!enemy?.portrait) return "";
  return enemy.portrait.startsWith("http")
    ? enemy.portrait
    : `/portraits/${enemy.portrait}`;
}

watch(
  () => props.enemies,
  (items) => {
    if (!selectedEnemy.value && items.length) {
      selectedEnemy.value = items[0];
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="main-layout">
    <aside class="left-panel combat-sidebar">
      <div class="panel-header">COMBAT</div>

      <div class="enemy-section">
        <div
          v-for="enemy in enemies"
          :key="enemy.id"
          class="enemy-slot"
          @click="selectedEnemy = enemy"
        >
          <img
            v-if="enemy.portrait"
            :src="getPortraitSrc(enemy)"
            :alt="enemy.name"
            class="enemy-portrait-image"
          />

          <div v-else class="enemy-portrait-placeholder">✧</div>

          <div class="enemy-name">{{ enemy.name }}</div>
        </div>
      </div>
    </aside>

    <main class="combat-content">
      <div class="panel-header">DETAILS</div>

      <div class="combat-body">
        <div v-if="selectedEnemy">
          <textarea
            v-model="selectedEnemy.name"
            rows="10"
            cols="50"
          ></textarea>
        </div>
        <div v-else>Select an item from the left.</div>
      </div>
    </main>
  </div>
</template>
