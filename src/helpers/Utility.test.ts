import { test } from 'tap';
import { build } from 'src/app';
import { Utility } from 'src/helpers/Utility';

test('helpers/Utility tests', async t => {
  const app = build();
  // Await plugin / decorated injection
  await app.ready();

  await t.test('route(string)', async t => {
    const value = Utility.route('data.prefix');
    t.strictEqual(value, '/data');
  });

  await t.test('route(string[])', async t => {
    const value = Utility.route(['data.prefix', 'data.find']);
    t.strictEqual(value, '/data/find');
  });

  t.tearDown(async () => {
    return app.close();
  });
  t.end();
});
