# Phase 3 Plans

Phase 3 consists of implementing the multi-agent architecture.
By the end of this phase, the app will react and change states based on the player actions. Each agent will act according to it's own specialty, delivering specific answers and actions. Each task should have the spec and a verification step, and commit the result by the end of development.

## Task 1 - Game State
    - Spec:
        - Create a sql file called game_state.sql;
        - Add to that file, the creation of a game_state table;
        - That table should have:
            - Uuid pk
            - Key string
            - Value string
        - Also add an initial game_state row: key "mode", value "exploration"
        - Run the sql file against our local db;
        - Backend should have a GameStateRepository, that load the game state at startup;
        - GameStateRepository should expose all CRUD operations for game states: insert, delete, update, findById, findAll;
        - The backend should expose an http endpoint exposing the current game state;
        - Front end should fetch all game states on startup (before websocket connection, like fetching npcs);
        - For now, front end won't use the data. Just log all the game states retrieved at startup.
    - Verification:
        - Run database, backend, frontend;
        - Check if the frontend logs the "mode exploration" game state

## Task 2 - Front end state
    - Spec:
        - The header of the Main chat area must show the game mode, at the side of the header "The Chronicle";
        - We should show the name of the mode and an specific color:
            - Exploration in Blue
            - Dungeon in Orange
            - Combat in Red
            - Dialogue in Green
        - When clicking the "Option" button, we should show a modal with one button for each mode, in their specific colors;
        - When clicking one of the buttons, we should send a state.update event through the websocket, with the mode as key and the value as the selected mode in lowercase
        - The backend should listen to state.change events, persist the game_state, and then, send an event of state.change, with the mode as key and the selected mode as value in lowercase
        - The frontend should listen to state.change event and update the state accordingly
    - Verification:
        - Run database, frontend and backend;
        - Open the UI;
        - Check if the Exploration mode is active and visible on the header;
        - Open the options menu and click in each of the modes and check if the mode change accordingly.

## Task 3 - Transition Router
    - Spec:
        - In the backend we should have, and specialist agent, called TransitionRouterAgent;
        - His specialty, is reading the current context + the user input, and infer if we should change the current state mode;
        - Send for this LLM, the last 10 turns + the current text input from the user, and the current_state, and ask him to answer in the simple format of a json, with two attributes. The first should be called suggested_mode, with a value of either "exploration", "dungeon", "dialogue" or "combat", and the second, the confidence_score, from 0 to 1;
        - This new component must be separated in another file;
        - If the confidence_score is higher than 0.8, we operate the state change, before making the call to the llm for the usual flow of result;
    - Verification:
        - Run the test_harness_001.md for regression only.