import { test } from 'tap';
import { build } from 'src/app';
import { Utility } from 'src/helpers/Utility';
import config from 'config';

test('plugins/authentication', async t => {
  await t.test('no auth provided', async t => {
    const app = build();
    // Await plugin / decorated injection
    await app.ready();
    const response = await app.inject({
      method: 'POST',
      url: Utility.route(['data.prefix', 'data.find'])
    });
    t.strictEqual(response.statusCode, 401);
    t.equivalent(response.json(), {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'No Authorization was found in request.headers'
    });
    await app.close();
  });

  await t.test(`no JWT secret set`, async t => {
    try {
      config.set('security.jwt.secret', null);
      const app = build();
      // Await plugin / decorated injection
      await app.ready();
      await app.close();
    } catch (e) {
      t.equivalent(e, new Error("'security.jwt.secret' MUST be defined."));
    }
  });

  t.end();
});
