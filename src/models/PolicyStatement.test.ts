import { test } from 'tap';
import { build } from 'src/app';
import { User } from 'src/models/User';
import { Utility } from 'src/helpers/Utility';
import { UserTestHelper } from 'src/helpers/Test';

test('PolicyStatement', async t => {
  const app = build();
  // Await plugin / decorated injection
  await app.ready();

  await t.test(
    `'data' service with wildcard method to '/find' method`,
    async t => {
      const user = User.fake({
        policy: {
          version: '1.1.0',
          statement: [
            {
              action: 'data:*',
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

      const response = await app.inject({
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
    }
  );

  await t.test(
    `multiple PolicyStatement actions with valid match is successful`,
    async t => {
      const user = User.fake({
        policy: {
          version: '1.1.0',
          statement: [
            {
              action: ['data:find', 'data:update'],
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

      const response = await app.inject({
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
    }
  );

  await t.test(
    `multiple PolicyStatement actions with no valid match is forbidden`,
    async t => {
      const user = User.fake({
        policy: {
          version: '1.1.0',
          statement: [
            {
              action: ['data:delete', 'data:update'],
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

      const response = await app.inject({
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
        statusCode: 403,
        error: 'Forbidden',
        message: 'You do not have permission to perform the request'
      });

      await UserTestHelper.delete({ app, user });
    }
  );

  await t.test(`request unauthorized database is forbidden`, async t => {
    const user = User.fake({
      policy: {
        version: '1.1.0',
        statement: [
          {
            action: ['data:find', 'data:update'],
            resource: 'other.*'
          }
        ]
      }
    });
    await UserTestHelper.create({ app, user });
    const token = await UserTestHelper.login({
      app,
      user
    });

    const response = await app.inject({
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
      statusCode: 403,
      error: 'Forbidden',
      message: 'You do not have permission to perform the request'
    });

    await UserTestHelper.delete({ app, user });
  });

  await t.test(`request unauthorized collection is forbidden`, async t => {
    const user = User.fake({
      policy: {
        version: '1.1.0',
        statement: [
          {
            action: ['data:find', 'data:update'],
            resource: ['acme.bar']
          }
        ]
      }
    });
    await UserTestHelper.create({ app, user });
    const token = await UserTestHelper.login({
      app,
      user
    });

    const response = await app.inject({
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
      statusCode: 403,
      error: 'Forbidden',
      message: 'You do not have permission to perform the request'
    });

    await UserTestHelper.delete({ app, user });
  });

  await t.test(`request with wildcard resource is allowed`, async t => {
    const user = User.fake({
      policy: {
        version: '1.1.0',
        statement: [
          {
            action: ['data:find', 'data:update'],
            resource: '*'
          }
        ]
      }
    });
    await UserTestHelper.create({ app, user });
    const token = await UserTestHelper.login({
      app,
      user
    });

    const response = await app.inject({
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
  });

  await t.test(
    `request with resource array and wildcard value is allowed`,
    async t => {
      const user = User.fake({
        policy: {
          version: '1.1.0',
          statement: [
            {
              action: ['data:find', 'data:update'],
              resource: ['acme:other', '*']
            }
          ]
        }
      });
      await UserTestHelper.create({ app, user });
      const token = await UserTestHelper.login({
        app,
        user
      });

      const response = await app.inject({
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
    }
  );

  t.tearDown(async () => {
    return app.close();
  });
  t.end();
});
