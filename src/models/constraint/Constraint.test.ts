import { test } from 'tap';
import { build } from 'src/app';
import { User } from 'src/models/User';
import { Utility } from 'src/helpers/Utility';
import { TestHelper, UserTestHelper } from 'src/helpers/Test';
import config from 'config';

test('Constraint', async t => {
  const app = build();
  // Await plugin / decorated injection
  await app.ready();

  const route = Utility.route(['data.prefix', 'data.find']);

  const getRequestResponse = async (params?: any) => {
    return TestHelper.inject(
      app,
      Object.assign(
        {
          method: 'POST',
          url: route,
          headers: {
            Authorization: `Bearer ${params.token}`
          },
          payload: {
            collection: 'srn:coeus:acme::collection',
            db: 'acme'
          }
        },
        params
      )
    );
  };

  await t.test(
    'cannot complete request if MaxRequests constraint value exceeded',
    async t => {
      const user = User.fake({
        policy: {
          version: '1.1.0',
          statement: [
            {
              action: 'data:*',
              resource: 'acme.*',
              constraints: [
                {
                  type: 'maxRequests',
                  value: 1
                }
              ]
            }
          ]
        }
      });
      await UserTestHelper.create({ app, user });

      const token = await UserTestHelper.login({
        app,
        user
      });

      const response = await getRequestResponse({ token });

      t.strictEqual(response.statusCode, 200);
      t.strictEqual(response.statusMessage, 'OK');

      const responseB = await getRequestResponse({ token });

      t.equivalent(responseB.json(), {
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded, retry in 1 minute'
      });

      await UserTestHelper.delete({ app, user });
    }
  );

  await t.test(
    'can complete request with no MaxRequests constraint',
    async t => {
      // Temp set limit to reduce test iterations
      const defaultMaxRequests = config.get('rateLimit.maxRequests');
      config.set('rateLimit.maxRequests', 10);
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

      const expectedSuccessfulRequests = config.get('rateLimit.maxRequests');

      for (let i = 0; i <= expectedSuccessfulRequests; i++) {
        const response = await getRequestResponse({ token });

        if (i < expectedSuccessfulRequests) {
          t.strictEqual(response.statusCode, 200);
          t.strictEqual(response.statusMessage, 'OK');
        } else {
          t.equivalent(response.json(), {
            statusCode: 429,
            error: 'Too Many Requests',
            message: 'Rate limit exceeded, retry in 1 minute'
          });
        }
      }

      // Reset max
      config.set('rateLimit.maxRequests', defaultMaxRequests);
      await UserTestHelper.delete({ app, user });
    }
  );

  await t.test(
    'cannot complete request if MaxRequests constraint value on ANY matching statement is exceeded',
    async t => {
      // Temp set limit to reduce test iterations
      const defaultMaxRequests = config.get('rateLimit.maxRequests');
      config.set('rateLimit.maxRequests', 10);
      const user = User.fake({
        policy: {
          version: '1.1.0',
          statement: [
            {
              action: 'data:*',
              resource: 'acme.*'
            },
            {
              action: 'data:*',
              resource: 'acme.*',
              constraints: [
                {
                  type: 'maxRequests',
                  value: 1
                }
              ]
            }
          ]
        }
      });

      await UserTestHelper.create({ app, user });

      const token = await UserTestHelper.login({
        app,
        user
      });

      const response = await getRequestResponse({ token });

      t.strictEqual(response.statusCode, 200);
      t.strictEqual(response.statusMessage, 'OK');

      const responseB = await getRequestResponse({ token });

      t.equivalent(responseB.json(), {
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded, retry in 1 minute'
      });

      await UserTestHelper.delete({ app, user });
    }
  );

  await t.test(
    'cannot complete request with mismatched IP constraint',
    async t => {
      const user = User.fake({
        policy: {
          version: '1.1.0',
          statement: [
            {
              action: 'data:*',
              resource: 'acme.*',
              constraints: [
                {
                  type: 'ip',
                  value: ['127.0.0.2']
                }
              ]
            }
          ]
        }
      });
      await UserTestHelper.create({ app, user });

      const token = await UserTestHelper.login({
        app,
        user
      });

      const response = await getRequestResponse({ token });

      t.equivalent(response.json(), {
        statusCode: 403,
        error: 'Forbidden',
        message: `Invalid IP: Requests from 127.0.0.1 are not allowed by your Policy`
      });

      await UserTestHelper.delete({ app, user });
    }
  );

  await t.test('can complete request with matching IP constraint', async t => {
    const user = User.fake({
      policy: {
        version: '1.1.0',
        statement: [
          {
            action: 'data:*',
            resource: 'acme.*',
            constraints: [
              {
                type: 'ip',
                value: '127.0.0.1'
              }
            ]
          }
        ]
      }
    });
    await UserTestHelper.create({ app, user });

    const token = await UserTestHelper.login({
      app,
      user
    });

    const response = await getRequestResponse({ token });

    t.strictEqual(response.statusCode, 200);
    t.strictEqual(response.statusMessage, 'OK');

    await UserTestHelper.delete({ app, user });
  });

  await t.test(
    'cannot complete request with mismatched hostname constraint',
    async t => {
      const user = User.fake({
        policy: {
          version: '1.1.0',
          statement: [
            {
              action: 'data:*',
              resource: 'acme.*',
              constraints: [
                {
                  type: 'hostname',
                  value: 'example.com'
                }
              ]
            }
          ]
        }
      });
      await UserTestHelper.create({ app, user });

      const token = await UserTestHelper.login({
        app,
        user
      });

      const response = await getRequestResponse({ token });

      t.equivalent(response.json(), {
        statusCode: 403,
        error: 'Forbidden',
        message: `Invalid hostname: Requests from localhost:80 are not allowed by your Policy`
      });

      await UserTestHelper.delete({ app, user });
    }
  );

  await t.test(
    'can complete request with matching hostname constraint',
    async t => {
      const user = User.fake({
        policy: {
          version: '1.1.0',
          statement: [
            {
              action: 'data:*',
              resource: 'acme.*',
              constraints: [
                {
                  type: 'hostname',
                  value: ['localhost']
                }
              ]
            }
          ]
        }
      });
      await UserTestHelper.create({ app, user });

      const token = await UserTestHelper.login({
        app,
        user
      });

      const response = await getRequestResponse({ token });

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
