import test from 'node:test';
import assert from 'node:assert/strict';
import sinon from 'sinon';
import { LocationRepository } from './locationRepository.js';

test('LocationRepository should be an instance of a class', async () => {
  const locationRepo = new LocationRepository();
  assert.ok(locationRepo instanceof LocationRepository);
});

test('LocationRepository should have a findAll method', async () => {
  const locationRepo = new LocationRepository();
  assert.ok(typeof locationRepo.findAll === 'function');
});

test('LocationRepository should return an array of locations when findAll is called', async () => {
  const poolMock = {
    query: sinon.stub().resolves({ rows: [{ id: 1, name: 'Location 1' }, { id: 2, name: 'Location 2' }] })
  };
  const locationRepo = new LocationRepository(poolMock);
  const locations = await locationRepo.findAll();
  assert.ok(Array.isArray(locations));
  assert.deepEqual(locations, [{ id: 1, name: 'Location 1' }, { id: 2, name: 'Location 2' }]);
});

test('LocationRepository should insert a new location into the database', async () => {
  const poolMock = {
    query: sinon.stub().resolves({ rows: [{ id: 1 }] })
  };
  const locationRepo = new LocationRepository(poolMock);

  const location = {
    name: 'New Location'
  };

  const result = await locationRepo.insert(location);

  assert.ok(result);
  assert.strictEqual(result.id, 1);
});

test('LocationRepository should update an existing location in the database', async () => {
  const poolMock = {
    query: sinon.stub().resolves({ rows: [{ id: 1 }], rowCount: 1 })
  };
  const locationRepo = new LocationRepository(poolMock);

  const location = {
    id: 1,
    name: 'Updated Location'
  };

  const result = await locationRepo.update(location);

  assert.ok(result);
  assert.strictEqual(result.id, 1);
});

test('LocationRepository should delete a location from the database', async () => {
  const poolMock = {
    query: sinon.stub().resolves({ rows: [{ id: 1 }], rowCount: 1 })
  };
  const locationRepo = new LocationRepository(poolMock);

  const locationId = 1;

  const result = await locationRepo.delete(locationId);

  assert.ok(result);
  assert.strictEqual(result, true);
});

test('LocationRepository should find a location by ID', async () => {
  const poolMock = {
    query: sinon.stub().resolves({
      rows: [{ id: 1, name: 'Location 1' }]
    })
  };
  const locationRepo = new LocationRepository(poolMock);

  const locationId = 1;

  const location = await locationRepo.findById(locationId);

  assert.ok(location);
  assert.strictEqual(location.id, locationId);
  assert.strictEqual(location.name, 'Location 1');
});

test("FindByCampaignId should return properly", async () => {
  const poolMock = {
    query: sinon.stub().resolves({
      rows: [
        { id: 1, name: "Location 1", campaign_id: 1 },
        { id: 2, name: "Location 2", campaign_id: 1 },
      ],
    }),
  };
  const locationRepo = new LocationRepository(poolMock);

  const campaignId = 1;

  const locations = await locationRepo.findByCampaignId(campaignId);

  assert.ok(Array.isArray(locations));
  assert.strictEqual(locations.length, 2);
  assert.strictEqual(locations[0].campaign_id, campaignId);
  assert.strictEqual(locations[1].campaign_id, campaignId);
});