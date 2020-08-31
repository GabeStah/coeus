import { test } from 'tap';
import app from 'src/app';
import { MongoClient } from 'mongodb';

test('db:mongo', async t => {
  await t.test('mongo.client property exists', async t => {
    console.log(app);
    t.hasFields(app.mongo, 'client');
    t.type(app.mongo.client, MongoClient);
  });

  await t.test('POST /mongo succeeds', async t => {
    const response = await app.inject({
      method: 'POST',
      url: '/mongo'
    });
    t.strictEqual(response.statusCode, 200, 'returns a status code of 200');
  });

  t.tearDown(async () => await app.close());
  t.end();
});
