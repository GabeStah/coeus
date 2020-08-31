import { test } from 'tap';
import { build } from 'src/app';

test('requests the "/status" route', async t => {
  const app = build();

  const response = await app.inject({
    method: 'GET',
    url: '/status'
  });
  t.strictEqual(response.statusCode, 200, 'returns a status code of 200');

  t.tearDown(async () => app.close());
  t.end();
});
