import { test } from 'tap';
import { build } from 'src/app';

test('mongo', async t => {
  const app = build();

  await t.test('GET /mongo fails', async t => {
    const response = await app.inject({
      method: 'GET',
      url: '/mongo'
    });
    t.strictEqual(response.statusCode, 404, 'returns a status code of 404');
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
