import { test } from 'tap';
import { build } from 'src/app';
import { User } from 'src/models/User';
import { Utility } from 'src/helpers/Utility';
import config from 'config';
import { TestHelper, UserTestHelper } from 'src/helpers/Test';

test('routes/data/find', async t => {
  const app = build();
  // Await plugin / decorated injection
  await app.ready();

  const userInstance = new User({
    email: 'john@acme.com',
    org: 'acme',
    username: 'johnsmith',
    password: 'password',
    active: true,
    verified: true,
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
        },
        {
          action: 'data:find',
          resource: ['sample_mflix.movies']
        }
      ]
    }
  });

  const route = Utility.route(['data.prefix', 'data.find']);

  t.beforeEach(async (done, t) => {
    // Ensure created
    await UserTestHelper.create({ app, user: userInstance });
    // Login and get token
    t.context.token = await UserTestHelper.login({ app, user: userInstance });

    done();
  });

  await t.test(`GET ${route}`, async t => {
    const response = await TestHelper.inject(app, {
      method: 'GET',
      url: route,
      headers: {
        Authorization: `Bearer ${t.context.token}`
      }
    });
    t.strictEqual(response.statusCode, 404, 'returns a status code of 404');
  });

  await t.test(`POST ${route} without body fails`, async t => {
    const response = await TestHelper.inject(app, {
      method: 'POST',
      url: route,
      headers: {
        Authorization: `Bearer ${t.context.token}`
      }
    });
    t.strictEqual(response.statusCode, 400, 'returns a status code of 400');
  });

  await t.test(`POST ${route} with empty body`, async t => {
    const response = await TestHelper.inject(app, {
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
    const response = await TestHelper.inject(app, {
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
      'body.collection should NOT be shorter than 4 characters'
    );
  });

  await t.test(`POST ${route} with empty properties`, async t => {
    const response = await TestHelper.inject(app, {
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
    t.equivalent(response.json(), {
      statusCode: 400,
      error: 'Bad Request',
      message: 'body.collection should NOT be shorter than 4 characters'
    });
  });

  await t.test(`POST ${route} with collection and db success`, async t => {
    const response = await TestHelper.inject(app, {
      method: 'POST',
      url: route,
      headers: {
        Authorization: `Bearer ${t.context.token}`
      },
      payload: {
        collection: 'srn:coeus:acme::collection',
        db: 'acme'
      }
    });
    t.strictEqual(response.statusCode, 200);
  });

  await t.test(`POST ${route} with collection, db, query success`, async t => {
    const response = await TestHelper.inject(app, {
      method: 'POST',
      url: route,
      headers: {
        Authorization: `Bearer ${t.context.token}`
      },
      payload: {
        collection: 'srn:coeus:acme::collection',
        db: 'acme',
        query: {}
      }
    });
    t.strictEqual(response.statusCode, 200);
  });

  await t.test(`POST ${route} with limit under minimum`, async t => {
    const response = await TestHelper.inject(app, {
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
    const response = await TestHelper.inject(app, {
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

  await t.test(`POST ${route} without limit`, async t => {
    const response = await TestHelper.inject(app, {
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
            $search: 'Space'
          }
        }
      }
    });

    t.strictEqual(response.statusCode, 200);
    t.equivalent(
      response.json().length,
      config.get('db.thresholds.limit.base')
    );
  });

  t.tearDown(async () => {
    await UserTestHelper.delete({ app, user: userInstance });
    return app.close();
  });
  t.end();
});
