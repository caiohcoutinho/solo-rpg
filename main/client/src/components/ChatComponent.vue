<script setup>
import { computed, ref, watch, onBeforeUnmount } from "vue";
import ModeManagementComponent from "./ModeManagementComponent.vue";

const props = defineProps({
  turns: { type: Array, default: () => [] },
  websocket: { default: null },
  websocketReady: { type: Boolean, default: false },
  serverEvent: { default: null },
  currentGameMode: { type: String, default: "exploration" },
  enableTurnDeleteConfirmation: { type: Boolean, default: false }
});

const chatInput = ref("");
const localMessages = ref([]);
const isLoading = ref(false);
const selectedTurn = ref(null);
const turnDraft = ref("");
const isTurnMutationPending = ref(false);
const turnMutationError = ref("");
const showDeleteConfirm = ref(false);
const pendingDeleteTurnId = ref(null);

let turnMutationTimeout = null;

const chatEntries = computed(() => [...props.turns, ...localMessages.value]);

const canSendChat = computed(
  () =>
    props.websocketReady &&
    chatInput.value.trim() &&
    !isLoading.value,
);

function send(message) {
  if (!props.websocketReady || !props.websocket) {
    return false;
  }

  props.websocket.send(JSON.stringify(message));
  return true;
}

function sendQuickAction(quickAction) {
  if (!send({ type: "quick_action", ...quickAction })) {
    return;
  }

  isLoading.value = true;
  localMessages.value.push({
    type: "user",
    text: quickAction.description,
    timestamp: new Date().toLocaleTimeString(),
  });
  chatInput.value = "";
}

function sendChat(isChallenge = false) {
  const text = chatInput.value.trim();

  if (!text || !props.websocketReady) {
    return;
  }

  if (!send({ type: "chat", text, is_challenge: isChallenge })) {
    return;
  }

  isLoading.value = true;
  localMessages.value.push({
    type: "user",
    text,
    timestamp: new Date().toLocaleTimeString(),
  });
  chatInput.value = "";
}

function executeQuickAction(quickAction) {
  if (quickAction) {
    sendQuickAction(quickAction);
  }
}

function clearTurnMutationTimeout() {
  if (turnMutationTimeout) {
    clearTimeout(turnMutationTimeout);
    turnMutationTimeout = null;
  }
}

function scheduleTurnMutationTimeout() {
  clearTurnMutationTimeout();
  turnMutationTimeout = window.setTimeout(() => {
    if (!isTurnMutationPending.value) {
      return;
    }

    isTurnMutationPending.value = false;
    turnMutationError.value = "The turn request timed out. Please try again.";
  }, 10000);
}

function openTurnEditor(turn) {
  clearTurnMutationTimeout();
  selectedTurn.value = turn;
  turnDraft.value = turn.result || turn.text || "";
  turnMutationError.value = "";
  showDeleteConfirm.value = false;
  pendingDeleteTurnId.value = null;
}

function closeTurnEditor() {
  clearTurnMutationTimeout();
  selectedTurn.value = null;
  turnDraft.value = "";
  turnMutationError.value = "";
  isTurnMutationPending.value = false;
  showDeleteConfirm.value = false;
  pendingDeleteTurnId.value = null;
}

function submitTurnUpdate() {
  if (
    !selectedTurn.value ||
    !props.websocketReady ||
    isTurnMutationPending.value
  ) {
    return;
  }

  isTurnMutationPending.value = true;
  turnMutationError.value = "";
  scheduleTurnMutationTimeout();

  send({
    type: "turn.update",
    id: selectedTurn.value.id,
    text: turnDraft.value,
  });
}

function requestTurnDeletion(turn) {
  if (props.enableTurnDeleteConfirmation.value) {
    pendingDeleteTurnId.value = turn.id;
    showDeleteConfirm.value = true;
    return;
  }

  isTurnMutationPending.value = true;
  turnMutationError.value = "";
  scheduleTurnMutationTimeout();

  send({
    type: "turn.delete",
    id: turn.id,
  });
}



function confirmTurnDeletion() {
  if (
    !pendingDeleteTurnId.value ||
    !props.websocketReady ||
    isTurnMutationPending.value
  ) {
    return;
  }

  isTurnMutationPending.value = true;
  turnMutationError.value = "";
  scheduleTurnMutationTimeout();

  send({
    type: "turn.delete",
    id: pendingDeleteTurnId.value,
  });
}

function handleServerEvent(data) {
  if (!data) {
    return;
  }

  if (data.type === "turns" || data.type === "llm.response") {
    localMessages.value = [];
    isLoading.value = false;
    return;
  }

  if (data.type === "turn.change.success") {
    clearTurnMutationTimeout();

    if (selectedTurn.value?.id === data.turnId) {
      closeTurnEditor();
    }

    localMessages.value = [];
    isTurnMutationPending.value = false;
    turnMutationError.value = "";
    return;
  }

  if (data.type === "llm.error") {
    clearTurnMutationTimeout();
    isLoading.value = false;
    localMessages.value.push({
      type: "system",
      text: data.error || "Oops, we screwed it!",
      timestamp: new Date().toLocaleTimeString(),
    });

    if (isTurnMutationPending.value) {
      isTurnMutationPending.value = false;
      turnMutationError.value =
        data.error || "The turn request failed.";
    }
    return;
  }

  if (data.type === "server.errors") {
    if (isTurnMutationPending.value) {
      turnMutationError.value =
        data.message || "The turn request failed.";
      isTurnMutationPending.value = false;
    }
    return;
  }

  if (data.type === "websocket.error") {
    isLoading.value = false;
  }
}

watch(() => props.serverEvent, handleServerEvent);

onBeforeUnmount(clearTurnMutationTimeout);
</script>

<template>
  <div class="chronicle-header">
    <div class="panel-header">✦ THE CHRONICLE</div>
    <ModeManagementComponent
      :current-game-mode="currentGameMode"
      :websocket="websocket"
      :websocket-ready="websocketReady"
    />
  </div>

  <div class="chronicle-display">
    <div v-if="chatEntries.length === 0" class="empty-state">
      [ENCOUNTER AWAITING YOU...]
    </div>

    <div
      v-for="(log, index) in chatEntries"
      :key="log.id || `local-${index}`"
      class="log-entry"
    >
      <button
        v-if="log.id"
        type="button"
        class="turn-block"
        @click="openTurnEditor(log)"
      >
        <div v-if="log.is_note" class="note-entry-container">
          <span class="note-entry">
            📝 {{ log.text || log.result }}
          </span>
        </div>

        <span
          v-if="!log.is_note && (log.type === 'user' || log.is_user_action)"
          class="user-entry"
        >
          [YOU]: {{ log.result || log.text }}
        </span>

        <span v-else-if="!log.is_note" class="system-entry">
          {{ log.result || log.text }}
        </span>

        <span class="turn-id">{{ log.id }}</span>
      </button>

      <span
        v-else-if="!log.is_note && (log.type === 'user' || log.isUserAction)"
        class="user-entry"
      >
        [YOU]: {{ log.text || log.result }}
      </span>

      <span v-else class="system-entry">
        {{ log.result || log.text }}
      </span>

      <div
        v-if="log.quickAction1 || log.quickAction2"
        class="quick-actions"
      >
        <template v-for="action in [log.quickAction1, log.quickAction2]" :key="action?.description">
          <div
            v-if="action"
            class="quick-action-wrapper"
            :class="{ 'has-challenge-tooltip': action.isChallenge }"
          >
            <button
              class="quick-action-button"
              :class="{ challenge: action.isChallenge }"
              @click.stop="executeQuickAction(action)"
            >
              <span class="action-desc">{{ action.description }}</span>
              <span
                v-if="action.isChallenge && action.attribute"
                class="challenge-test-tag"
              >
                ({{ action.attribute }} + {{ action.ability }})
              </span>
            </button>

            <div v-if="action.isChallenge" class="challenge-tooltip">
              <!-- target emoji -->
              <div class="tooltip-section target">
                <span class="label">🎯 TARGET: {{ action.target }}</span>
              </div>
              <div class="tooltip-section reward">
                <span class="label">🏆 REWARD:</span> {{ action.reward }}
              </div>
              <div class="tooltip-section cost">
                <span class="label">💀 FAILURE COST:</span> {{ action.cost }}
              </div>
              <div class="tooltip-section reasoning">
                <span class="label">🧠 REASONING:</span> {{ action.reasoning }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>

  <div class="chat-input-area">
    <div v-if="isLoading" class="loading-indicator">⏳ Awaiting...</div>

    <input
      v-model="chatInput"
      type="text"
      placeholder="Enter command..."
      class="chat-input"
      :disabled="isLoading"
      @keyup.enter="sendChat"
    />

    <button
      class="send-button"
      :disabled="!canSendChat"
      @click="sendChat"
    >
      → SEND
    </button>
  </div>

  <div
    v-if="selectedTurn"
    class="modal-backdrop"
    @click="closeTurnEditor"
  >
    <div class="turn-modal" @click.stop>
      <div class="panel-header">✦ TURN EDITOR</div>

      <label class="turn-modal-label" for="turn-text">Turn text</label>
      <textarea
        id="turn-text"
        v-model="turnDraft"
        class="turn-textarea"
      ></textarea>

      <div class="turn-modal-actions">
        <button class="action-button secondary" @click="closeTurnEditor">
          Cancel
        </button>
        <button
          class="action-button danger"
          :disabled="isTurnMutationPending"
          @click="requestTurnDeletion(selectedTurn)"
        >
          Delete
        </button>
        <button
          class="action-button primary"
          :disabled="isTurnMutationPending"
          @click="submitTurnUpdate"
        >
          Update
        </button>
      </div>

      <div v-if="turnMutationError" class="turn-error">
        {{ turnMutationError }}
      </div>

      <div v-if="showDeleteConfirm" class="delete-confirmation">
        <span>Delete this turn permanently?</span>
        <div class="turn-modal-actions">
          <button
            class="action-button secondary"
            @click="showDeleteConfirm = false"
          >
            No
          </button>
          <button class="action-button danger" @click="confirmTurnDeletion">
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
