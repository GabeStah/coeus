import { test } from 'tap';
import { build } from 'src/app';
import { User } from 'src/models/User';
import { Utility } from 'src/helpers/Utility';
import { UserService } from 'src/services/UserService';

test('find', async t => {
  const app = build();
  // Await plugin / decorated injection
  await app.ready();

  const userInstance = new User({
    email: 'john@acme.com',
    org: 'acme',
    username: 'johnsmith',
    password: 'password',
    active: true,
    policy: {
      version: '1.1.0',
      statement: [
        {
          action: 'data:find',
          resource: 'acme.*'
        },
        {
          action: ['data:insert', 'data:update'],
          allow: true,
          resource: 'acme.srn:coeus:acme::collection'
        },
        {
          action: ['data:delete'],
          allow: false,
          resource: 'acme.*'
        }
      ]
    }
  });

  const route = Utility.route(['data.prefix', 'data.find']);

  t.beforeEach(async (done, t) => {
    // Exists
    let user = await new UserService(app).exists({
      username: userInstance.username
    });

    if (!user) {
      await new UserService(app).create(userInstance);
    }

    const loginResponse = await app.inject({
      method: 'POST',
      url: Utility.route(['user.prefix', 'user.login']),
      payload: {
        password: userInstance.password,
        username: userInstance.username
      }
    });

    t.context.token = loginResponse.json().token;

    done();
  });

  await t.test(`GET ${route}`, async t => {
    const response = await app.inject({
      method: 'GET',
      url: route,
      headers: {
        Authorization: `Bearer ${t.context.token}`
      }
    });
    t.strictEqual(response.statusCode, 404, 'returns a status code of 404');
  });

  await t.test(`POST ${route} without body fails`, async t => {
    const response = await app.inject({
      method: 'POST',
      url: route,
      headers: {
        Authorization: `Bearer ${t.context.token}`
      }
    });
    t.strictEqual(response.statusCode, 400, 'returns a status code of 400');
  });

  await t.test(`POST ${route} with empty body`, async t => {
    const response = await app.inject({
      method: 'POST',
      url: route,
      headers: {
        Authorization: `Bearer ${t.context.token}`
      },
      payload: {}
    });
    t.strictEqual(response.statusCode, 400);
    t.strictEqual(
      response.json().message,
      "body should have required property 'collection'"
    );
  });

  await t.test(`POST ${route} with body missing collection`, async t => {
    const response = await app.inject({
      method: 'POST',
      url: route,
      headers: {
        Authorization: `Bearer ${t.context.token}`
      },
      payload: {
        collection: ''
      }
    });
    t.strictEqual(response.statusCode, 400);
    t.strictEqual(
      response.json().message,
      "body should have required property 'db'"
    );
  });

  await t.test(`POST ${route} with empty properties`, async t => {
    const response = await app.inject({
      method: 'POST',
      url: route,
      headers: {
        Authorization: `Bearer ${t.context.token}`
      },
      payload: {
        collection: '',
        db: ''
      }
    });
    t.strictEqual(response.statusCode, 500);
    t.strictEqual(response.json().message, 'collection names cannot be empty');
  });

  await t.test(`POST ${route} with collection and db success`, async t => {
    const response = await app.inject({
      method: 'POST',
      url: route,
      headers: {
        Authorization: `Bearer ${t.context.token}`
      },
      payload: {
        collection: 'foo',
        db: 'bar'
      }
    });
    t.strictEqual(response.statusCode, 200);
    t.equivalent(response.json(), Array(0));
  });

  await t.test(`POST ${route} with collection, db, query success`, async t => {
    const response = await app.inject({
      method: 'POST',
      url: route,
      headers: {
        Authorization: `Bearer ${t.context.token}`
      },
      payload: {
        collection: 'foo',
        db: 'bar',
        query: {}
      }
    });
    t.strictEqual(response.statusCode, 200);
    t.equivalent(response.json(), Array(0));
  });

  await t.test(`POST ${route} with limit under minimum`, async t => {
    const response = await app.inject({
      method: 'POST',
      url: route,
      headers: {
        Authorization: `Bearer ${t.context.token}`
      },
      payload: {
        collection: 'movies',
        db: 'sample_mflix',
        limit: 0
      }
    });

    t.strictEqual(response.statusCode, 400);
    t.equivalent(response.json().message, 'body.limit should be >= 1');
  });

  await t.test(`POST ${route} with full text search query`, async t => {
    const response = await app.inject({
      method: 'POST',
      url: route,
      headers: {
        Authorization: `Bearer ${t.context.token}`
      },
      payload: {
        collection: 'movies',
        db: 'sample_mflix',
        query: {
          $text: {
            $search: 'Superman'
          }
        },
        limit: 5
      }
    });

    t.strictEqual(response.statusCode, 200);
    t.equivalent(response.json().length, 5);
  });

  await t.test(`POST ${route} with invalid policy`, async t => {
    const user = new User({
      email: 'john@acme.com',
      org: 'acme',
      username: 'someguy',
      password: 'password',
      active: true,
      policy: {
        version: '1.1.0',
        statement: [
          {
            action: 'data:find',
            resource: 'foobar.*'
          },
          {
            action: ['data:insert', 'data:update'],
            allow: true,
            resource: 'acme.srn:coeus:acme::collection'
          },
          {
            action: ['data:delete'],
            allow: false,
            resource: 'acme.*'
          }
        ]
      }
    });

    await new UserService(app).create(user);

    const { token } = await new UserService(app).login(user);

    const response = await app.inject({
      method: 'POST',
      url: route,
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload: {
        collection: 'movies',
        db: 'sample_mflix',
        query: {
          $text: {
            $search: 'Superman'
          }
        },
        limit: 5
      }
    });

    t.strictEqual(response.statusCode, 403);
    // t.equivalent(response.json().length, 5);

    await new UserService(app).delete(user);
  });

  t.tearDown(async () => {
    await new UserService(app).delete(userInstance);
    return app.close();
  });
  t.end();
});
