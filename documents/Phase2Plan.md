# Phase 2 Plans

Phase 2 consists of improving some features for quality of life before we can dive deep into multi agent architecture on Phase 3. This is a draft of the high level tasks to achieve this goal. Each task should have the spec and a verification step, and commit the result by the end of development.

## Task 1 - Backtracking
    - Spec:
        - The backend should present the turn objects with the uuid information recovered from the database;
        - The Frontend UI should present each turn on the main chat area in a block. This "block" outlines should be highlighted when hovering;
        - The block should hide the id of the turn;
        - When clicking a turn block, a popup should appear, shadowing and disabling the backdrop;
        - This popup should show:
            - A text area with the full text of the clicked turn;
            - An update button, that should send the update to the backend;
            - A delete button, that should sent the removal of that turn to the backend. After clicking delete, a message should be shown asking for confirmation;
        - Upon sending any change, the frontend should disable both buttons and wait and event from the backend callend turn.change.success with the id of the turn, before closing the popup. If 10s are done and the event have not arrived, an error message should appear on the popup and the buttons should be enabled again.
        - The backend should handle turn.update and turn.delete events appropriately, updating and deleting by id.
    - Verification:
        - V1: Run frontend, database and backend. Hover the turns on the chat area and verify their outlines being highlighted as you hover. Inspect the page and verify the ids are present on hidden elements;
        - V2: 
            - Run frontend, database and backend;
            - Click a turn;
            - Add a test text at the end of the turn text;
            - Click update;
            - Verify the popup is closed and the text is updated on the main chat area;
            - Click the same turn again;
            - Remove the test text at the end of the turn text;
            - Click update;
            - Verify the popup is closed and the text is updated back to the old text.
        - V3: 
            - Run frontend, database and backend;
            - Go to the text input on the main chat area;
            - Send some test turn text;
            - Wait for the response of the LLM;
            - Click the test turn you've created;
            - Click delete;
            - Confirm the deletion;
            - Check the main chat area no longer shows the delete turn;
            - Click the turn that was anwered from the LLM;
            - Click delete;
            - Confirm the deletion;
            - Check the main chat area no longer shows the deleted turn's response.

# Task 2 -  NPC's table
    - Spec:
        - Create a npc_table.sql file;
        - Add on that file, a sql to create a new table;
        - That table should be called "npcs";
        - It should have:
            - uuid pk
            - name string
            - gender 'M' or 'F'
            - portrait string
            - created timestamp
            - in_scene boolean
        - On the same file, add an sample single row insert on the table, with a random uuid, the name 'Maria' and gender 'F';
        - Run the script against the docker solorpg-postgres instance running locally.
    - Verification:
        - Query the database and check the table exists.

# Task 3 - NPC's front and backend
    - Spec:
        - The backend should have a NpcRepository;
        - The NpcRepository should fetch all npcs on startup and keep them in cache;
        - The NpcRepository should have methods for:
            - updating
            - deleting
            - getNpcById
            - getActiveNpcs: should list only the npcs with in_scene = true
        - Update and Delete should also refresh the cache.
        - The backend should expose npc.fetch, npc.delete and npc.update events on the websocket, operating accordingly.
        - The backend should also expose all the portrait images on the local portrait folder inside the project;
        - The front should fetch the active npcs from the backend at startup;
        - For each active npc, the frontend should fetch the portrait image from the local resources served by the server and show them in the NPC section on the left (not Bestiary)
        - Each image should be presented in a perfect square, with the name of the npc on the bottom;
        - The blocks up until 10 without active npcs should show an empty square.
    - Verification:
        - Run frontend, database and backend;
        - Open the UI and check if Maria's portrait and name are displayed on the left side of the page, called "NPCs"

# Task 4 - Cleanup and Refactor
    - Spec:
        - Before moving to the next phase, there's cleaning we should do in the codebase;
        - Extract the encryption and decryption logic to a separate component, and write tests for it;
        - Fully delete references for the sendDummyLlmRequest, this is no longer needed;
        - Fully remove these components:
            - /api/adventures
            - /api/llm/dummy
            - /api/ws/test-event
        - Logging start up turns and npcs: no longer needed. Delete those logs.
        - Add a fixed request text (something like "[TEST][TEST][TEST][TEST][TEST]") that, when sent to the server, we don't reach for LLM, just reply it back. Both are still saved as steps, we just don't reach for the LLM, to save tokens on tests.
    - Verification:
        - Run the regression tests described on test_harness_001.md