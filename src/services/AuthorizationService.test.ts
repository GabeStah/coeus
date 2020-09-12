import { test } from 'tap';
import { build } from 'src/app';
import { User } from 'src/models/User';
import { Utility } from 'src/helpers/Utility';
import { UserTestHelper } from 'src/helpers/Test';

test('AuthorizationService', async t => {
  const app = build();
  // Await plugin / decorated injection
  await app.ready();

  const route = Utility.route(['data.prefix', 'data.find']);

  await t.test(`No valid PolicyStatement`, async t => {
    const user = User.fake({ policy: { statement: [] } });
    await UserTestHelper.create({ app, user });
    const token = await UserTestHelper.login({
      app,
      user
    });

    const response = await app.inject({
      method: 'POST',
      url: route,
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
      message: 'Policy is invalid: No valid policy statement provided'
    });

    await UserTestHelper.delete({ app, user });
  });

  await t.test(
    `PolicyStatement with explicit denial (allow = false)`,
    async t => {
      const user = User.fake({
        policy: {
          version: '1.1.0',
          statement: [
            {
              action: 'data:find',
              allow: false,
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
        url: route,
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

  await t.test(`Valid PolicyStatement for service.method`, async t => {
    const user = User.fake({
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

    const response = await app.inject({
      method: 'POST',
      url: route,
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

  await t.test(`No matching PolicyStatements`, async t => {
    const user = User.fake({
      policy: {
        version: '1.1.0',
        statement: [
          {
            action: 'data:delete',
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
      url: route,
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

  await t.test(`Inactive User`, async t => {
    const user = User.fake({
      active: false,
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

    const response = await app.inject({
      method: 'POST',
      url: route,
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
      message: 'Authorization token is invalid: User is inactive'
    });

    await UserTestHelper.delete({ app, user });
  });

  t.tearDown(async () => {
    // await new UserService(app).delete(userInstance);
    return app.close();
  });
  t.end();
});