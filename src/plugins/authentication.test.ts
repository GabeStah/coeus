import { test } from 'tap';
import { build } from 'src/app';
import { Utility } from 'src/helpers/Utility';
import config from 'config';
import { User } from 'src/models/User';
import { TestHelper, UserTestHelper } from 'src/helpers/Test';

test('plugins/authentication', async t => {
  await t.test('no auth provided', async t => {
    const app = build();
    // Await plugin / decorated injection
    await app.ready();
    const response = await TestHelper.inject(app, {
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
    const secret = config.get('security.jwt.secret');
    try {
      config.set('security.jwt.secret', null);
      const app = build();
      // Await plugin / decorated injection
      await app.ready();
      await app.close();
    } catch (e) {
      t.equivalent(e, new Error("'security.jwt.secret' MUST be defined."));
    } finally {
      // Reapply for future tests
      config.set('security.jwt.secret', secret);
    }
  });

  await t.test(`valid userHashMap entry`, async t => {
    const app = build();
    // Await plugin / decorated injection
    await app.ready();
    const user = User.fake({
      active: true,
      policy: {
        version: '1.1.0',
        statement: [
          {
            action: 'data:find',
            resource: 'acme.*'
          }
        ]
      }
    });
    await UserTestHelper.create({ app, user });
    const token = await UserTestHelper.login({
      app,
      user
    });

    const response = await TestHelper.inject(app, {
      method: 'POST',
      url: Utility.route(['data.prefix', 'data.find']),
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload: {
        collection: 'srn:coeus:acme::collection',
        db: 'acme'
      }
    });

    t.strictEqual(response.statusCode, 200);
    t.strictEqual(response.statusMessage, 'OK');

    await UserTestHelper.delete({ app, user });
    await app.close();
  });

  await t.test(`id missing in userHashMap`, async t => {
    const app = build();
    // Await plugin / decorated injection
    await app.ready();
    const user = User.fake({
      active: true,
      policy: {
        version: '1.1.0',
        statement: [
          {
            action: 'data:find',
            resource: 'acme.*'
          }
        ]
      }
    });
    await UserTestHelper.create({ app, user });

    const token = await UserTestHelper.login({
      app,
      user
    });

    const userDocument = await UserTestHelper.find({ app, user });

    // Remove id from hashmap
    delete app.userHashMap[userDocument[0].id];

    const response = await TestHelper.inject(app, {
      method: 'POST',
      url: Utility.route(['data.prefix', 'data.find']),
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload: {
        collection: 'srn:coeus:acme::collection',
        db: 'acme'
      }
    });

    t.equivalent(response.json(), {
      statusCode: 401,
      error: 'Unauthorized',
      message:
        'Authorization token is out of date. Please obtain a new token and try again.'
    });

    await UserTestHelper.delete({ app, user });
    await app.close();
  });

  await t.test(`hash mismatch in userHashMap`, async t => {
    const app = build();
    // Await plugin / decorated injection
    await app.ready();
    const user = User.fake({
      active: true,
      policy: {
        version: '1.1.0',
        statement: [
          {
            action: 'data:find',
            resource: 'acme.*'
          }
        ]
      }
    });
    await UserTestHelper.create({ app, user });

    const token = await UserTestHelper.login({
      app,
      user
    });

    const userDocument = await UserTestHelper.find({ app, user });

    // Alter hash
    app.userHashMap[userDocument[0].id] = '12345';

    const response = await TestHelper.inject(app, {
      method: 'POST',
      url: Utility.route(['data.prefix', 'data.find']),
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload: {
        collection: 'srn:coeus:acme::collection',
        db: 'acme'
      }
    });

    t.equivalent(response.json(), {
      statusCode: 401,
      error: 'Unauthorized',
      message:
        'Authorization token is out of date. Please obtain a new token and try again.'
    });

    await UserTestHelper.delete({ app, user });
    await app.close();
  });

  t.end();
});
