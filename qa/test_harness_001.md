# Test Harness 001

This document describes the tests and use cases to validate the app functionalities are correctly working.

## Use Case 001 - NPC's
    - Verification:
        - Run database, frontend and backend;
        - Open the UI;
        - Verify that Maria is listed as an NPC, her name and portrait are shown

## Use Case 002 - Main chat area
    - Verification:
        - Run database, frontend and backend;
        - Open the UI;
        - Verify that there's the existing turns showing on main chat area;
        - Add the "[TEST][TEST][TEST][TEST][TEST]" text on the input and send it to the server;
        - Verify the answer is also "[TEST][TEST][TEST][TEST][TEST]"
        - Click on your own text sent and updated it to "[test] updating own block";
        - Click on your own text sent and cancel the update;
        - Click on your own text sent and delete it.