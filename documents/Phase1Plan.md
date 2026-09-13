# Phase 1 Plans

Phase 1 Consists of having a single agent, being called, and the result being saved into the postgresql database in the Steps table.
This is a draft of the high level tasks to achieve this goal. Each task should have the spec and a verification step, and commit the result by the end of development.

Task 1 - LLM
    - Spec: In the server, write an endpoint that connects to the LLM model, and sends a dummy request, to get the result from the LLM and log;
    - Verification: Run the server, send a curl to the endpoint, and see if the server respondes the result of the LLM model correctly.

Task 2 - Websocket
    - Spec: The frontend and backend should have a two way communication using websockets. The backend should have an endpoint for testing that can be called, that produces and event to be sent to the frontend;
    - Verification: 
        - V1: Run the server, open the frontend client, send chat from the frontend to the backend and the backend should log what was sent;
        - V2: Run the server, open the frontend client, send a curl to the testing endpoint, the backend should produce and event and the frontend should log that the event was received.

Task 3 - Turn Repository
    - Spec:
        - The database should have a simple Turn table, with a UUID for PK, a giant string for context, a giant string for result, a boolean is_user_action, and a json for result_metadata and the created timestamp;
        - The Turn table should have only one row for now, which we will insert manually via docker psql;
        - The backend should have a TurnRepository component, which loads the list of 100 newest Turns from the DB at startup and caches that data;
        - There should also be and open method for the websocket to call to retrieve the turns. For now, we'll log on startup the full list of Turns.
    - Verification: Run the server, and check in the logs if the single row was logged. If it works, remove the logs lines.

Task 4 - UI
    - Spec: The UI should follow the ui_guiding_image. There should be the 10 positions for NPC's in scene on the left. On the middle, the chat area, with the text input at the bottom. On the right, the space for the character sheet. The look and feel, the atmosphere, the colors, all should be as close as possible to the ui_guiding_image.
    - Verification: Open frontend client, and check if matches the idea of the guiding image.

Task 5 - Pinia
    - Spec: The frontend should use the Pinia library for Vue.js, create a TurnStore, and fetch the Turns through websocket at startup. Then, it should show the Turns on the middle chat area
    - Verification: Run the server, open frontend client, and check if the single Turn row appears on the main chat area.

Task 6 - Submit action button
    - Spec: 
        - The input chat area should send the inserted text to the backend via websocket;
        - The front end should show a loading icon, while we don't receive the result for the request, and the button to send should be disabled;
        - The backend should save the Turn to the Database using TurnRepository, the text input, the contect of the last 100, and is_user_action as true;
        - The backend should receive the input, add the last 100 Turns in the context for the LLM and send the message in an async call to the LLM;
        - When the LLM returns, save the data to the DB using TurnRepository, into a new Turn, with is_user_action = false;
        - Then, send and event to the frontend via websocket;
        - Then, the front end should show the result of the LLM and re-enable the send button.
    - Verification:
        - Run Postgres, backend, and frontend.
        - Submit text from the UI.
        - Confirm the user Turn is saved with is_user_action = true.
        - Confirm the LLM response Turn is saved with is_user_action = false.
        - Confirm the frontend receives and displays the LLM response.
        - Confirm reload/startup fetches the persisted Turns again.

Task 7 - Error handling
    - Spec:
        - No exception can disrupt the event or message processing;
        - On every try catch, we should catch the error and add it to a transient memory state on the server;
        - All messages should be returned to the client. If something unexpected happens, we should return to the client with an gentle message "Oops, we screwed it!"
        - If we find and error, we should accumulate those in a memory state on the server, and serve those errors as a list in a specific websocket, returning all erors on that section, ordered by timestamp;
        - The FrontEnd should log whenever a new error is found on the websocket.
    - Verification:
        - Run the server and frontend. Do notn run backend, to force an error;
        - Check if frontend logs the errors on the console.