import { test } from 'tap';
import { build } from 'src/app';
import { User } from 'src/models/User';
import { Utility } from 'src/helpers/Utility';
import { DataTestHelper, TestHelper, UserTestHelper } from 'src/helpers/Test';

test('routes/data/aggregate', async t => {
  const app = build();
  // Await plugin / decorated injection
  await app.ready();

  const userInstance = new User({
    email: 'john@acme.com',
    org: 'acme',
    username: 'johnsmith-aggregate',
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
          action: ['data:aggregate'],
          resource: 'acme.*'
        },
        {
          action: 'data:find',
          resource: ['sample_mflix.movies']
        }
      ]
    }
  });

  const route = Utility.route(['data.prefix', 'data.aggregate']);

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
      message: 'body should have required property \'collection\''
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

  await t.test('cannot use empty pipeline', async t => {
    const response = await getRequestResponse({
      payload: {
        collection: 'srn:coeus:acme::collection',
        db: 'acme'
      }
    });

    t.equivalent(response.json(), {
      statusCode: 400,
      error: 'Bad Request',
      message: 'body.pipeline should be array'
    });
  });

  await t.test('can aggregate with empty pipeline', async t => {
    const response = await getRequestResponse({
      payload: {
        collection: 'srn:coeus:acme::collection',
        db: 'acme',
        pipeline: []
      }
    });

    t.strictEqual(response.statusCode, 200);
    t.strictEqual(response.statusMessage, 'OK');
  });

  await t.test('can create multi-stage aggregation', async t => {
    await DataTestHelper.insert({
      app,
      collection: 'srn:coeus:acme::collection',
      db: 'acme',
      document: [
        { name: 'john', baz: true, value: 1 },
        { name: 'john', baz: true, value: 2 },
        { name: 'jane', baz: true, value: 3 },
        { name: 'jane', baz: true, value: 4 }
      ]
    });

    const response = await getRequestResponse({
      payload: {
        collection: 'srn:coeus:acme::collection',
        db: 'acme',
        pipeline: [
          {
            $match: {
              name: 'john'
            }
          },
          {
            $group: {
              _id: 1,
              total: {
                $sum: '$value'
              }
            }
          }
        ]
      }
    });

    t.equivalent(response.json(), [
      {
        _id: 1,
        total: 3
      }
    ]);

    await DataTestHelper.delete({
      app,
      collection: 'srn:coeus:acme::collection',
      db: 'acme',
      filter: {}
    });
  });

  t.tearDown(async () => {
    await UserTestHelper.delete({ app, user: userInstance });
    return app.close();
  });
  t.end();
});
