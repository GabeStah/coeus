import { test } from 'tap';
import { build } from 'src/app';

test('find', async t => {
  const app = build();

  await t.test('GET /find', async t => {
    const response = await app.inject({
      method: 'GET',
      url: '/find'
    });
    t.strictEqual(response.statusCode, 404, 'returns a status code of 404');
  });

  await t.test('POST /find without body fails', async t => {
    const response = await app.inject({
      method: 'POST',
      url: '/find'
    });
    t.strictEqual(response.statusCode, 400, 'returns a status code of 400');
  });

  await t.test('POST /find with empty body', async t => {
    const response = await app.inject({
      method: 'POST',
      url: '/find',
      payload: {}
    });
    t.strictEqual(response.statusCode, 400);
    t.strictEqual(
      response.json().message,
      "body should have required property 'collection'"
    );
  });

  await t.test('POST /find with body missing collection', async t => {
    const response = await app.inject({
      method: 'POST',
      url: '/find',
      payload: {
        collection: ''
      }
    });
    t.strictEqual(response.statusCode, 400);
    t.strictEqual(
      response.json().message,
      "body should have required property 'db'"
    );
  });

  await t.test('POST /find with empty properties', async t => {
    const response = await app.inject({
      method: 'POST',
      url: '/find',
      payload: {
        collection: '',
        db: ''
      }
    });
    t.strictEqual(response.statusCode, 500);
    t.strictEqual(response.json().message, 'collection names cannot be empty');
  });

  await t.test('POST /find with collection and db success', async t => {
    const response = await app.inject({
      method: 'POST',
      url: '/find',
      payload: {
        collection: 'foo',
        db: 'bar'
      }
    });
    t.strictEqual(response.statusCode, 200);
    t.equivalent(response.json(), Array(0));
  });

  await t.test('POST /find with collection, db, query success', async t => {
    const response = await app.inject({
      method: 'POST',
      url: '/find',
      payload: {
        collection: 'foo',
        db: 'bar',
        query: {}
      }
    });
    t.strictEqual(response.statusCode, 200);
    t.equivalent(response.json(), Array(0));
  });

  await t.test('POST /find with limit under minimum', async t => {
    const response = await app.inject({
      method: 'POST',
      url: '/find',
      payload: {
        collection: 'movies',
        db: 'sample_mflix',
        limit: 0
      }
    });

    t.strictEqual(response.statusCode, 400);
    t.equivalent(response.json().message, 'body.limit should be >= 1');
  });

  await t.test('POST /find with full text search query', async t => {
    const response = await app.inject({
      method: 'POST',
      url: '/find',
      payload: {
        collection: 'movies',
        db: 'sample_mflix',
        query: {
          $text: {
            $search: 'Superman'
          }
        },
        limit: 5
      }
    });

    t.strictEqual(response.statusCode, 200);
    t.equivalent(response.json().length, 5);
  });

  t.tearDown(async () => await app.close());
  t.end();
});
