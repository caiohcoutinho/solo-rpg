import test from 'node:test';
import assert from 'node:assert/strict';
import { TaskRepository } from './taskRepository.js';

function createRepository(queryResult) {
    const pool = {
        query: async () => queryResult,
    };

    return new TaskRepository(pool);
}

test('insert should execute the correct query and return the inserted id', async () => {
    const queryResult = {
        rows: [{ id: 42 }],
    };

    const calls = [];
    const pool = {
        query: async (query) => {
            calls.push(query);
            return queryResult;
        },
    };

    const repository = new TaskRepository(pool);

    const log = {
        duration: 120,
        agent: 'test-agent',
        max_tokens: 1000,
        context_size: 4000,
        model: 'test-model',
    };

    const result = await repository.insert(log);

    assert.equal(result, 42);
    assert.deepEqual(calls, [{
        text: 'INSERT INTO tasks (duration, agent, max_tokens, context_size, model) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        values: [120, 'test-agent', 1000, 4000, 'test-model'],
    }]);
});

test('findByIdAndStatus should execute the correct query and return the first row', async () => {
    const task = {
        id: 42,
        status: 'completed',
    };

    const calls = [];
    const pool = {
        query: async (query) => {
            calls.push(query);
            return { rows: [task] };
        },
    };

    const repository = new TaskRepository(pool);

    const result = await repository.findByIdAndStatus(42, 'completed');

    assert.deepEqual(result, task);
    assert.deepEqual(calls, [{
        text: 'SELECT * FROM tasks WHERE id = $1 AND status = $2',
        values: [42, 'completed'],
    }]);
});

test('findById should execute the correct query and return the first row', async () => {
    const task = {
        id: 42,
        status: 'pending',
    };

    const calls = [];
    const pool = {
        query: async (query) => {
            calls.push(query);
            return { rows: [task] };
        },
    };

    const repository = new TaskRepository(pool);

    const result = await repository.findById(42);

    assert.deepEqual(result, task);
    assert.deepEqual(calls, [{
        text: 'SELECT * FROM tasks WHERE id = $1',
        values: [42],
    }]);
});

test('findBySceneId should execute the correct query and return all rows', async () => {
    const tasks = [
        { id: 1, scene_id: 10 },
        { id: 2, scene_id: 10 },
    ];

    const calls = [];
    const pool = {
        query: async (query) => {
            calls.push(query);
            return { rows: tasks };
        },
    };

    const repository = new TaskRepository(pool);

    const result = await repository.findBySceneId(10);

    assert.deepEqual(result, tasks);
    assert.deepEqual(calls, [{
        text: 'SELECT * FROM tasks WHERE scene_id = $1',
        values: [10],
    }]);
});

test('updateStatus should execute the correct query and return rowCount', async () => {
    const calls = [];
    const pool = {
        query: async (query) => {
            calls.push(query);
            return { rowCount: 1 };
        },
    };

    const repository = new TaskRepository(pool);

    const result = await repository.updateStatus(42, 'completed');

    assert.equal(result, 1);
    assert.deepEqual(calls, [{
        text: 'UPDATE tasks SET status = $1 WHERE id = $2',
        values: ['completed', 42],
    }]);
});

test('delete should execute the correct query and return rowCount', async () => {
    const calls = [];
    const pool = {
        query: async (query) => {
            calls.push(query);
            return { rowCount: 1 };
        },
    };

    const repository = new TaskRepository(pool);

    const result = await repository.delete(42);

    assert.equal(result, 1);
    assert.deepEqual(calls, [{
        text: 'DELETE FROM tasks WHERE id = $1',
        values: [42],
    }]);
});