import { test } from 'tap';
import { build } from 'src/app';

test('plugins/db/mongo', async t => {
  const app = build();
  // Await plugin / decorated injection
  await app.ready();

  await t.test('mongo is connected', async t => {
    t.true(app.mongo.client.isConnected());
  });

  t.tearDown(async () => await app.close());
  t.end();
});
