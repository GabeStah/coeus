import { test } from 'tap';
import { build } from 'src/app';
import { User } from 'src/models/User';
import { Utility } from 'src/helpers/Utility';
import { DataTestHelper, TestHelper, UserTestHelper } from 'src/helpers/Test';

test('routes/data/createIndex', async t => {
  const app = build();
  // Await plugin / decorated injection
  await app.ready();

  const userInstance = new User({
    email: 'john@acme.com',
    org: 'acme',
    username: 'johnsmith-createIndex',
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
          resource: 'acme.*'
        },
        {
          action: ['data:createIndex'],
          resource: 'acme.*'
        },
        {
          action: 'data:find',
          resource: ['sample_mflix.movies']
        }
      ]
    }
  });

  const route = Utility.route(['data.prefix', 'data.createIndex']);

  // Ensure created
  await UserTestHelper.create({ app, user: userInstance });

  const getRequestResponse = async (params?: any) => {
    return TestHelper.inject(
      app,
      Object.assign(
        {
          method: 'POST',
          url: route,
          headers: {
            Authorization: `Bearer ${await UserTestHelper.login({
              app,
              user: userInstance
            })}`
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

  await t.test(`GET ${route}`, async t => {
    const response = await getRequestResponse({
      method: 'GET'
    });
    t.strictEqual(response.statusCode, 404, 'returns a status code of 404');
  });

  await t.test('with empty body', async t => {
    const response = await getRequestResponse({ payload: {} });
    t.equivalent(response.json(), {
      statusCode: 400,
      error: 'Bad Request',
      message: "body should have required property 'collection'"
    });
  });

  await t.test('with body missing db', async t => {
    const response = await getRequestResponse({
      payload: {
        collection: ''
      }
    });
    t.equivalent(response.json(), {
      statusCode: 400,
      error: 'Bad Request',
      message: 'body.collection should NOT be shorter than 4 characters'
    });
  });

  await t.test('with empty db', async t => {
    const response = await getRequestResponse({
      payload: {
        collection: 'something',
        db: ''
      }
    });

    t.equivalent(response.json(), {
      statusCode: 400,
      error: 'Bad Request',
      message: 'body.db should NOT be shorter than 4 characters'
    });
  });

  await t.test('cannot use empty fieldOrSpec', async t => {
    const response = await getRequestResponse({
      payload: {
        collection: 'srn:coeus:acme::collection',
        db: 'acme',
        fieldOrSpec: {}
      }
    });

    t.equivalent(response.json(), {
      statusCode: 500,
      code: '67',
      error: 'Internal Server Error',
      message:
        'Error in specification { name: "", key: {} } :: caused by :: Index keys cannot be empty.'
    });
  });

  await t.test('can create single field index', async t => {
    const response = await getRequestResponse({
      payload: {
        collection: 'srn:coeus:acme::collection',
        db: 'acme',
        fieldOrSpec: {
          name: 1
        }
      }
    });

    t.equivalent(response.json(), {
      statusCode: 200,
      message: `'name_1' index created on 'acme.srn:coeus:acme::collection'`
    });

    await DataTestHelper.dropIndex({
      app,
      collection: 'srn:coeus:acme::collection',
      db: 'acme',
      indexName: 'name_1'
    });
  });

  await t.test('can create multi-field index', async t => {
    const response = await getRequestResponse({
      payload: {
        collection: 'srn:coeus:acme::collection',
        db: 'acme',
        fieldOrSpec: {
          name: 1,
          email: -1
        }
      }
    });

    t.equivalent(response.json(), {
      statusCode: 200,
      message: `'name_1_email_-1' index created on 'acme.srn:coeus:acme::collection'`
    });

    await DataTestHelper.dropIndex({
      app,
      collection: 'srn:coeus:acme::collection',
      db: 'acme',
      indexName: 'name_1_email_-1'
    });
  });

  t.tearDown(async () => {
    await UserTestHelper.delete({ app, user: userInstance });
    return app.close();
  });
  t.end();
});
