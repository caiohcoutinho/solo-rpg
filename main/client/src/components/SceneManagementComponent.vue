<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  scenes: { type: Array, default: () => [] },
  generatedScene: { type: Object, default: () => ({}) },
  websocket: { default: null }
});

const selectedScene = ref(null);

function selectScene(scene) {
  selectedScene.value = scene;
}

function getTotalSolvedTasks() {
  return selectedScene.value?.tasks?.filter((task) => task.completed).length || 0;
}

function deleteScene() {
  if (!props.websocket){
    return;
  } 
  if (!selectedScene.value){
    return;
  }

  props.websocket.send(JSON.stringify({
    type: "scene.delete",
    id: selectedScene.value.id
  }));

  selectedScene.value = null;
}


function generateSuggestion(){
  if (!props.websocket){
    return;
  } 
  props.websocket.send(JSON.stringify({
    type: "scene.generate",
    name: selectedScene?.value?.name,
    setup: selectedScene?.value?.setup
  }));
}

function saveScene() {
  if (!props.websocket){
    return;
  } 
  if (!selectedScene.value){
    return;
  }

  props.websocket.send(JSON.stringify({
    type: "scene.update",
    id: selectedScene.value.id,
    name: selectedScene?.value?.name,
    setup: selectedScene.value.setup,
    escalation: selectedScene.value.escalation,
    payoff: selectedScene.value.payoff,
    tasks: selectedScene.value.tasks
  }));

  selectedScene.value = null;
}

function saveGeneratedScene() {
  if (!props.websocket){
    return;
  } 
  props.websocket.send(JSON.stringify({
    type: "scene.update",
    id: props.generatedScene.id,
    name: selectedScene.value.name,
    setup: props.generatedScene.scene_setup,
    escalation: props.generatedScene.scene_escalation,
    payoff: props.generatedScene.scene_payoff,
    tasks: [
      { ...props.generatedScene.tasks.task1, revealed: true, completed: false },
      { ...props.generatedScene.tasks.task2, revealed: true, completed: false },
      { ...props.generatedScene.tasks.task3, revealed: false, completed: false }
    ]
  }));
}

watch(
  () => props.scenes,
  (items) => {
    if (!selectedScene.value && items.length) {
      selectedScene.value = items[0];
    }
  },
  { immediate: true },
);
</script>


<template>
  <div class="main-layout scene_tab">
    <aside class="scene-sidebar">
      <div class="panel-header">SCENES</div>

      <div class="scene-list">
        <button
          v-for="scene in scenes"
          :key="scene.id || scene.name"
          class="scene-item"
          @click="selectedScene = scene"
        >
          {{ scene.name }}
        </button>
          <button class="scene-item" @click="selectScene({
            name: '01_07: A Debt to the Wolf',
            setup: 'Terry ventures into the Umbra again, to ask for the Legendary Wolf Spirit guidance once more. This time, he wants to learn a Gift, the Staredown Gift. That will allow him to cow down humans and lesses creatures. Devise whats the task the Wolf will ask Terry to complete.',
            escalation: '',
            payoff: '',
            tasks: [
              { goal: '', resolution: '', revealed: false, completed: false },
              { goal: '', resolution: '', revealed: false, completed: false },
              { goal: '', resolution: '', revealed: false, completed: false }
            ]
          })">✅ Create New</button>
      </div>
    </aside>

    <main class="scene-content middle-panel">
      <div class="panel-header">DETAILS</div>

      <div class="scene-body" v-if="selectedScene">
        <!-- LEFT: Scene editor -->
        <section class="scene-editor">
          <div class="section-title">SCENE</div>

          <input
            v-model="selectedScene.name"
            placeholder="Title"
            class="scene-input"
          />

          <textarea
            v-model="selectedScene.setup"
            placeholder="Setup"
            class="scene-textarea"
          ></textarea>

          <textarea v-if="getTotalSolvedTasks() >= 1"
            v-model="selectedScene.escalation"
            placeholder="Escalation"
            class="scene-textarea"
          ></textarea>
          <p v-else>Hidden Escalation</p>

          <textarea v-if="getTotalSolvedTasks() >= 2"
            v-model="selectedScene.payoff"
            placeholder="Payoff"
            class="scene-textarea"
          ></textarea>
          <p v-else>Hidden Payoff</p>

          <div
            v-if="Array.isArray(selectedScene.tasks)"
            class="scene-tasks"
          >
            <div class="section-title tasks-title">TASKS</div>

            <article
              v-for="(task, index) in selectedScene.tasks"
              :key="index"
              class="task-form"
            >
              <div class="card-title">TASK {{ index + 1 }}</div>

              <div class="task-checkboxes">
                <label class="task-checkbox">
                  <input v-model="task.revealed" type="checkbox" />
                  <span>Revealed</span>
                </label>

                <label class="task-checkbox">
                  <input v-model="task.completed" type="checkbox" />
                  <span>Completed</span>
                </label>
              </div>

              <div v-if="task.revealed" class="task-field">
                <label class="field-label">GOAL</label>
                <textarea
                  v-model="task.goal"
                  placeholder="Goal"
                  class="scene-textarea"
                ></textarea>
              </div>

              <div v-if="task.completed" class="task-field">
                <label class="field-label">RESOLUTION</label>
                <textarea
                  v-model="task.resolution"
                  placeholder="Resolution"
                  class="scene-textarea"
                ></textarea>
              </div>
            </article>
          </div>

          <div class="scene-actions">
            <button
              v-if="selectedScene?.id"
              class="scene-button danger"
              @click="deleteScene"
            >
              Delete
            </button>

            <button
              @click="generateSuggestion"
              class="context-button"
            >
              Generate
            </button>

            <button
              @click="saveScene"
              class="context-button"
            >
              Save
            </button>
          </div>
        </section>

        <!-- RIGHT: Generated content -->
        <section class="generated-panel">
          <div class="section-title">GENERATED SCENE</div>

          <div v-if="generatedScene" class="generated-content">

            <!-- Scene progression -->
            <div class="scene-stages"> 
              <article class="generated-card">
                <div class="card-title">SETUP</div>
                <p>{{ generatedScene.scene_setup }}</p>
              </article>

              <article class="generated-card">
                <div class="card-title">ESCALATION</div>
                <p v-if="generatedScene.scene_escalation">Hidden</p>
              </article>

              <article class="generated-card">
                <div class="card-title">PAYOFF</div>
                <p v-if="generatedScene.scene_payoff">Hidden</p>
              </article>
            </div>

            <!-- Tasks -->
            <div class="section-title tasks-title">TASKS</div>

            <div class="tasks" v-if="generatedScene?.tasks">
              <article
                class="task-card" v-if="generatedScene?.tasks?.task1"
              >
                <div class="card-title">
                  TASK 1
                </div>

                <div class="task-field"">
                  <span class="field-label">GOAL</span>
                  <p>{{ generatedScene?.tasks?.task1.goal }}</p>
                </div>

                <div class="task-field">
                  <span class="field-label">RESOLUTION</span>
                  <p>Hidden</p>
                  <!-- {{ tasks[0].resolution }} -->
                </div>
              </article>

              <article
                class="task-card" v-if="generatedScene?.tasks?.task2"
              >
                <div class="card-title">
                  TASK 2
                </div>

                <div class="task-field">
                  <span class="field-label">GOAL</span>
                  <p>{{ generatedScene?.tasks?.task2?.goal }}</p>
                </div>

                <div class="task-field">
                  <span class="field-label">RESOLUTION</span>
                  <p>Hidden</p>
                  <!-- {{ tasks[1].resolution }} -->
                </div>
              </article>

              <article
                class="task-card" v-if="generatedScene?.tasks?.task3"
              >
                <div class="card-title">
                  TASK 3
                </div>

                <div class="task-field">
                  <span class="field-label">GOAL</span>
                  <p>Hidden</p>
                  <!-- {{ tasks[2].goal }} -->
                </div>

                <div class="task-field">
                  <span class="field-label">RESOLUTION</span>
                  <p>Hidden</p>
                  <!-- {{ tasks[2].resolution }} -->
                </div>
              </article>
            </div>

            <!-- Save button -->
            <button
              @click="saveGeneratedScene"
              class="context-button"
            >
              Save
            </button>

          </div>

          <div v-else class="generated-empty">
            Generate a scene to see the result here.
          </div>
        </section>
      </div>

      <div v-else class="scene-empty">
        Select a scene from the left.
      </div>
    </main>
  </div>
</template>
