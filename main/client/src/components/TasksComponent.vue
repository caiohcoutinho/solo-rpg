<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  tasks: { type: Array, default: () => [] },
  scene: { type: Object, default: null },
  websocket: { default: null },
  websocketReady: { type: Boolean, default: false },
});

const selectedTask = ref(null);
const showTaskDetailsModal = ref(false);

function handleTaskClick(task) {
  if (!task) return;

  selectedTask.value = task;
  showTaskDetailsModal.value = true;
}

function send(message) {
  if (!props.websocketReady || !props.websocket) return false;

  props.websocket.send(JSON.stringify(message));
  return true;
}

function closeTaskDetails() {
  showTaskDetailsModal.value = false;
  selectedTask.value = null;
}

function toggleTaskCompleted(task) {
  if (!task) return;

  const completed = !task.completed;

  if (
    !send({
      type: "task.update",
      id: task.id,
      updates: {
        completed,
      },
    })
  ) {
    return;
  }

  closeTaskDetails();
}

function completeTask() {
  if (!selectedTask.value) return;

  if (
    !send({
      type: "task.update",
      id: selectedTask.value.id,
      updates: {
        completed: true,
      },
    })
  ) {
    return;
  }

  closeTaskDetails();
}

function reopenTask() {
  if (!selectedTask.value) return;

  if (
    !send({
      type: "task.update",
      id: selectedTask.value.id,
      updates: {
        completed: false,
      },
    })
  ) {
    return;
  }

  closeTaskDetails();
}

function totalSolvedTasks() {
  return props.tasks.filter((task) => task.completed).length;
}

</script>

<template>
  <div class="panel-header">✦ TASKS</div>

  <div class="task-list">
    
    <!-- if totalSolvedTasks <= 0, show scene.setup -->
    <div class="task-slot" v-if="totalSolvedTasks() == 0">
      <div class="task-content">
        <div class="task-name">SETUP</div>
        <div class="task-description">{{ scene?.setup }}</div>
      </div>
    </div>

    <!-- if totalSolvedTasks == 1, show scene.escalation -->
    <div class="task-slot" v-if="totalSolvedTasks() == 1">
      <div class="task-content">
        <div class="task-name">ESCALATION</div>
        <div class="task-description">{{ scene?.escalation }}</div>
      </div>
    </div>

    <!-- if totalSolvedTasks >= 2, show scene.payoff -->
    <div class="task-slot" v-if="totalSolvedTasks() >= 2">
      <div class="task-content">
        <div class="task-name">PAYOFF</div>
        <div class="task-description">{{ scene?.payoff }}</div>
      </div>
    </div>

    <div
      v-for="(task, index) in tasks"
      :key="task?.id ?? index"
      class="task-slot"
      :class="{
        'task-slot-empty': !task,
        'task-slot-completed': task?.completed,
      }"
      @click="handleTaskSlotClick(task)"
    >
      <div class="task-marker">
        {{ task ? (task.completed ? "✓" : "◇") : "—" }}
      </div>

      <div class="task-content">
        <div class="task-name" v-if="task?.revealed">
          {{ task?.goal || "—" }}
        </div>
        <div class="task-name" v-else>
          Hidden
        </div>

        <div
          v-if="task?.completed"
          class="task-description"
        >
          {{ task.resolution }}
        </div>
      </div>
    </div>
  </div>

  <div
    v-if="showTaskDetailsModal && selectedTask"
    class="modal-backdrop"
    @click="closeTaskDetails"
  >
    <div class="task-details-modal" @click.stop>
      <div class="panel-header">✦ TASK DETAILS</div>

      <div class="task-modal-content">
        <div class="task-modal-name">
          {{ selectedTask.name }}
        </div>

        <div class="task-modal-status-label">
          STATUS:
        </div>

        <div
          class="task-modal-status"
          :class="{ completed: selectedTask.completed }"
        >
          {{ selectedTask.completed ? "COMPLETED" : "ACTIVE" }}
        </div>

        <div
          v-if="selectedTask.description"
          class="task-modal-description"
        >
          {{ selectedTask.description }}
        </div>
      </div>

      <div class="turn-modal-actions">
        <button
          class="action-button secondary"
          @click="closeTaskDetails"
        >
          Close
        </button>

        <button
          v-if="selectedTask.completed"
          class="action-button secondary"
          @click="reopenTask"
        >
          Reopen
        </button>

        <button
          v-else
          class="action-button"
          @click="completeTask"
        >
          Complete
        </button>
      </div>
    </div>
  </div>
</template>