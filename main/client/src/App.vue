<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

import ChatComponent from "./components/ChatComponent.vue";
import NpcManagementComponent from "./components/NpcManagementComponent.vue";
import TasksComponent from "./components/TasksComponent.vue";
import LocationManagementComponent from "./components/LocationManagementComponent.vue";
import GameStateManagementComponent from "./components/GameStateManagementComponent.vue";
import LoreManagementComponent from "./components/LoreManagementComponent.vue";
import SceneManagementComponent from "./components/SceneManagementComponent.vue";
import EnemyManagementComponent from "./components/EnemyManagementComponent.vue";

const health = ref("Checking API...");
const websocketStatus = ref("Connecting websocket...");
const websocketReady = ref(false);
const activeTab = ref("game");

const activeNpcs = ref([]);
const allNpcs = ref([]);
const gameStates = ref([]);
const locations = ref([]);
const currentLocation = ref(null);
const currentGameMode = ref("exploration");
const turns = ref([]);
const lore = ref([]);
const scenes = ref([]);
const scene = ref(null);
const enemies = ref([]);
const characters = ref([]);
const tasks = ref([]);
const campaign = ref(null);
const allCampaigns = ref([])
const generatedScene = ref({});
const enableTurnDeleteConfirmation = ref(false);

const chatEvent = ref(null);

let websocket;

function sendWebsocketMessage(message) {
  if (!websocket || websocket.readyState !== WebSocket.OPEN) {
    return false;
  }

  websocket.send(JSON.stringify(message));
  return true;
}

function syncGameModeFromStates(states = []) {
  const modeState = states.find((state) => state.key === "mode");
  currentGameMode.value =
    typeof modeState?.value === "string" && modeState.value
      ? modeState.value.toLowerCase()
      : "exploration";

  const enableTurnDeleteConfirmationGameState = states.find((state) => state.key === "enable_turn_delete_confirmation");
  enableTurnDeleteConfirmation.value = enableTurnDeleteConfirmationGameState?.value === "true";
}

function syncLocationFromStates(states = [], locationList = []) {
  const locationState = states.find((state) => state.key === "current_location");
  currentLocation.value = locationList.find(
    (location) => location.id === locationState?.value,
  ) || null;
}

async function loadJson(url, onSuccess, errorMessage) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      onSuccess(await response.json());
    }
  } catch (error) {
    console.error(errorMessage, error);
  }
}

function connectWebsocket() {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  websocket = new WebSocket(`${protocol}://${window.location.host}/ws`);

  websocket.addEventListener("open", () => {
    websocketReady.value = true;
    websocketStatus.value = "Connected";

    sendWebsocketMessage({ type: "turns" });
    sendWebsocketMessage({ type: "npc.fetch" });
  });

  websocket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    console.log("WebSocket event received:", data);

    if (data.type === "turns") {
      turns.value = (data.turns || []);
      chatEvent.value = data;
      return;
    }

    if (
      data.type === "npc.fetch" ||
      data.type === "npc.update" ||
      data.type === "npc.delete"
    ) {
      activeNpcs.value = data.npcs || [];
      return;
    }

    if (
      data.type === "chat.ack" ||
      data.type === "turn.change.success" ||
      data.type === "llm.response" ||
      data.type === "llm.error" ||
      data.type === "server.errors"
    ) {
      if (data.type === "llm.response" || data.type === "turn.change.success") {
        turns.value = (data.turns || []);
      }

      chatEvent.value = data;
      return;
    }

    if (data.type === "state.change") {
      if (data.key === "mode") {
        currentGameMode.value =
          typeof data.value === "string"
            ? data.value.toLowerCase()
            : "exploration";
      }

      if (data.key === "current_location") {
        currentLocation.value =
          locations.value.find((location) => location.id === data.value) || null;
      }

      if (Array.isArray(data.gameStates)) {
        gameStates.value = data.gameStates;
      }
      return;
    }

    if (data.type === "location.update") {
      currentLocation.value = data.location;
      return;
    }

    if (data.type === "lore") {
      lore.value = data.lore || [];
    }

    if (data.type == "scene") {
      scenes.value = data.scenes || [];
    }

    if (data.type == "scene.generated") {
      generatedScene.value = data.generated_scene || {};
    }

    if (data.type == 'scene.tasks') {
      tasks.value = data.tasks || [];
    }
  });

  websocket.addEventListener("close", () => {
    websocketReady.value = false;
    websocketStatus.value = "Disconnected";
  });

  websocket.addEventListener("error", () => {
    websocketReady.value = false;
    websocketStatus.value = "Error";
    chatEvent.value = { type: "websocket.error" };
  });
}

onMounted(async () => {
  try {
    const response = await fetch("/api/health");
    const healthData = await response.json();
    health.value = healthData.ok
      ? `API ready, database ${healthData.database}`
      : "API ready, database unavailable";
  } catch (error) {
    health.value = `API unavailable: ${error.message}`;
  }

  await loadJson(
    "/api/npcs/active",
    (data) => (activeNpcs.value = data),
    "Failed to load active NPCs:",
  );

  await loadJson(
    "/api/npcs",
    (data) => (allNpcs.value = data),
    "Failed to load NPCs:",
  );

  await loadJson(
    "/api/game-state",
    (data) => {
      gameStates.value = data;
      syncGameModeFromStates(data);
    },
    "Failed to load game states:",
  );

  await loadJson(
    "/api/locations",
    (data) => {
      locations.value = data;
      syncLocationFromStates(gameStates.value, data);
    },
    "Failed to load locations:",
  );

  await loadJson(
    "/api/lore",
    (data) => (lore.value = data),
    "Failed to load lore:",
  );

  await loadJson(
    "/api/scenes",
    (data) => (scenes.value = data),
    "Failed to load scenes:",
  );

  await loadJson(
    "/api/scene",
    (data) => (scene.value = data),
    "Failed to load scenes:",
  )

  await loadJson(
    "/api/enemies",
    (data) => (enemies.value = data),
    "Failed to load enemies:",
  );

  await loadJson(
    "/api/tasks",
    (data) => (tasks.value = data),
    "Failed to load tasks:",
  )

  await loadJson(
    "/api/campaign",
    (data) => (campaign.value = data),
    "Failed to load campaign:",
  )

  await loadJson(
    "/api/campaigns",
    (data) => (allCampaigns.value = data),
    "Failed to load campaigns:",
  )

  await loadJson(
    "/api/turns",
    (data) => (turns.value = data.turns),
    "Failed to load turns:",
  )

  await loadJson(
    "/api/characters",
    (data) => (characters.value = data),
    "Failed to load characters:",
  )

  connectWebsocket();
});

onBeforeUnmount(() => {
  websocket?.close();
});
</script>

<template>
  <div class="game-container">
    <header class="top-bar">
      <div class="logo">⚔ SOLO RPG ENGINE</div>

      <div class="menu-items">
        <span class="menu-item" @click="activeTab = 'game'">GAME</span>
        <span class="menu-item" @click="activeTab = 'combat'">COMBAT</span>
        <span class="menu-item" @click="activeTab = 'context'">LORE</span>
        <span class="menu-item" @click="activeTab = 'scenes'">SCENE</span>
        <span class="menu-item" @click="activeTab = 'config'">GAME STATE</span>
        <span class="menu-item">HELP</span>
      </div>

      <div class="status-indicator">
        {{ campaign?.name }} · {{ health }} · {{ websocketStatus }}
      </div>
    </header>

    <div v-if="activeTab === 'game'" class="main-layout game_tab">
      <aside class="left-panel">
        <LocationManagementComponent
          :locations="locations"
          :current-location="currentLocation"
          :websocket="websocket"
          :websocket-ready="websocketReady"
        />

        <NpcManagementComponent
          :active-npcs="activeNpcs"
          :all-npcs="allNpcs"
          :websocket="websocket"
          :websocket-ready="websocketReady"
        />
      </aside>

      <main class="middle-panel">
        <ChatComponent
          :turns="turns"
          :websocket="websocket"
          :websocket-ready="websocketReady"
          :server-event="chatEvent"
          :current-game-mode="currentGameMode"
          :enableTurnDeleteConfirmation="enableTurnDeleteConfirmation"
        />
      </main>

      <aside class="right-panel">
        <TasksComponent
          :scene="scene"
          :tasks="tasks"
          :websocket="websocket"
          :websocket-ready="websocketReady"
        />
      </aside>
    </div>

    <LoreManagementComponent
      v-if="activeTab === 'context'"
      :lore="lore"
      :websocket="websocket"
    />

    <SceneManagementComponent
      v-if="activeTab === 'scenes'"
      :generated-scene="generatedScene"
      :scenes="scenes"
      :websocket="websocket"
    />

    <GameStateManagementComponent
      v-if="activeTab === 'config'"
      :campaigns="allCampaigns"
      :campaign="campaign"
      :scenes="scenes"
      :scene="scene"
      :characters="characters"
      :game-states="gameStates"
      :websocket="websocket"
      :websocket-ready="websocketReady"
    />

    <EnemyManagementComponent
      v-if="activeTab === 'combat'"
      :enemies="enemies"
    />

    <footer class="bottom-bar">
      <div class="command-area">
        <span class="command">⚔ ATTACK</span>
        <span class="command">◉ INSPECT</span>
        <span class="command">☞ LOOT</span>
        <span class="command">⚡ SPELL</span>
        <span class="command">📖 ITEM</span>
        <span class="command">🎯 WORTH</span>
        <span class="command">🌙 REST</span>
        <span class="command">⚔ FLEE!</span>
      </div>
      <div class="command-prompt">C:\DUNGEONLABS&gt; enter command...</div>
    </footer>
  </div>
</template>
