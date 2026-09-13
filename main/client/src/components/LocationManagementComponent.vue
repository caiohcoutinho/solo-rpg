<script setup>
import { ref } from "vue";

const props = defineProps({
  locations: { type: Array, default: () => [] },
  currentLocation: { default: null },
  websocket: { default: null },
  websocketReady: { type: Boolean, default: false },
});

const showLocationSelectModal = ref(false);
const selectedLocation = ref(null);

function getPortraitSrc(location) {
  if (!location?.portrait) return "";
  return location.portrait.startsWith("http")
    ? location.portrait
    : `/portraits/${location.portrait}`;
}

function handleLocationClick(location) {
  if (location) {
    selectedLocation.value = location;
    showLocationSelectModal.value = true;
  } else {
    selectedLocation.value = null;
    showLocationSelectModal.value = true;
  }
}

function send(message) {
  if (!props.websocketReady || !props.websocket) return false;
  props.websocket.send(JSON.stringify(message));
  return true;
}

function selectLocation(location) {
  if (!location || !send({
    type: "state.update",
    key: "current_location",
    value: location.id,
  })) {
    return;
  }

  showLocationSelectModal.value = false;
}

function removeLocationFromScene() {
  if (!send({
    type: "state.update",
    key: "current_location",
    value: null,
  })) {
    return;
  }

  showLocationSelectModal.value = false;
}
</script>

<template>
  <div class="panel-header">LOCATION</div>

  <div class="location-section">
    <div
      class="location-block"
      :class="{ 'location-block-empty': !currentLocation }"
      @click="handleLocationClick(currentLocation)"
    >
      <img
        v-if="currentLocation"
        :src="getPortraitSrc(currentLocation)"
        :alt="currentLocation.name"
        class="location-portrait-image"
      />
      <div v-else class="location-portrait-placeholder">✧</div>

      <div v-if="currentLocation" class="location-name">
        {{ currentLocation.name }}
      </div>
    </div>
  </div>

  <div
    v-if="showLocationSelectModal"
    class="modal-backdrop"
    @click="showLocationSelectModal = false"
  >
    <div class="location-select-modal" @click.stop>
      <div v-if="!currentLocation" class="location-selection-grid">
        <div class="panel-header">✦ ADD LOCATION TO SCENE</div>

        <div
          v-for="location in locations"
          :key="location.id"
          class="location-selection-card"
          @click="selectLocation(location)"
        >
          <img
            v-if="location.portrait"
            :src="getPortraitSrc(location)"
            :alt="location.name"
            class="location-selection-image"
          />
          <div v-else class="location-portrait-placeholder">✧</div>
          <div class="location-selection-name">{{ location.name }}</div>
        </div>

        <div v-if="locations.length === 0" class="empty-state">
          [NO CREATED LOCATIONS FOUND]
        </div>
      </div>

      <div v-else>
        <div class="panel-header">✦ {{ currentLocation.name }}</div>
        <img
          v-if="currentLocation.portrait"
          :src="getPortraitSrc(currentLocation)"
          :alt="currentLocation.name"
          class="location-selection-image"
        />
        <div class="location-selection-backgrounds">
          {{ currentLocation.background }}
        </div>
      </div>

      <div class="turn-modal-actions">
        <button
          class="action-button secondary"
          @click="showLocationSelectModal = false"
        >
          Cancel
        </button>
        <button
          v-if="currentLocation"
          class="action-button danger"
          @click="removeLocationFromScene"
        >
          Remove from Scene
        </button>
      </div>
    </div>
  </div>
</template>
