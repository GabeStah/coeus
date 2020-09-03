import { test } from 'tap';
import { build } from 'src/app';

test('plugins/authentication', async t => {
  const app = build();

  await t.test('no auth provided', async t => {
    const response = await app.inject({
      method: 'POST',
      url: '/find'
    });
    t.strictEqual(response.statusCode, 401);
    t.equivalent(response.json(), {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'No Authorization was found in request.headers'
    });
  });

  t.tearDown(async () => await app.close());
  t.end();
});
