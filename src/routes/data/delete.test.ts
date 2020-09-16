import { test } from 'tap';
import { build } from 'src/app';
import { User } from 'src/models/User';
import { Utility } from 'src/helpers/Utility';
import { DataTestHelper, TestHelper, UserTestHelper } from 'src/helpers/Test';

test('routes/data/delete', async t => {
  const app = build();
  // Await plugin / decorated injection
  await app.ready();

  const userInstance = new User({
    email: 'john@acme.com',
    org: 'acme',
    username: 'johnsmith-delete',
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
          resource: 'acme.*'
        },
        {
          action: ['data:delete'],
          resource: 'acme.*'
        },
        {
          action: 'data:find',
          resource: ['sample_mflix.movies']
        }
      ]
    }
  });

  const route = Utility.route(['data.prefix', 'data.delete']);

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

  await t.test(`with empty body`, async t => {
    const response = await getRequestResponse({ payload: {} });
    t.equivalent(response.json(), {
      statusCode: 400,
      error: 'Bad Request',
      message: "body should have required property 'collection'"
    });
  });

  await t.test(`with body missing db`, async t => {
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

  await t.test(`with empty db`, async t => {
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

  await t.test(`without filter property deletes all`, async t => {
    await DataTestHelper.delete({
      app,
      collection: 'srn:coeus:acme::collection',
      db: 'acme',
      filter: {}
    });

    await DataTestHelper.insert({
      app,
      collection: 'srn:coeus:acme::collection',
      db: 'acme',
      document: [
        { foo: 'bar', baz: true },
        { foo: 'bar', baz: true }
      ]
    });

    const response = await getRequestResponse({
      payload: {
        collection: 'srn:coeus:acme::collection',
        db: 'acme'
      }
    });

    t.equivalent(response.json(), {
      statusCode: 200,
      message: '2 documents deleted'
    });
  });

  await t.test(`with filter deletes specific documents`, async t => {
    await DataTestHelper.delete({
      app,
      collection: 'srn:coeus:acme::collection',
      db: 'acme',
      filter: {}
    });

    await DataTestHelper.insert({
      app,
      collection: 'srn:coeus:acme::collection',
      db: 'acme',
      document: [
        { foo: 'bar1', baz: true },
        { foo: 'bar2', baz: true },
        { foo: 'bar3', baz: true },
        { foo: 'bar4', baz: true },
        { foo: 'bar5', baz: true }
      ]
    });

    const response = await getRequestResponse({
      payload: {
        collection: 'srn:coeus:acme::collection',
        db: 'acme',
        filter: { foo: 'bar3' }
      }
    });

    t.equivalent(response.json(), {
      statusCode: 200,
      message: '1 document deleted'
    });
  });

  await t.test(`with non-matching filter deletes no documents`, async t => {
    await DataTestHelper.delete({
      app,
      collection: 'srn:coeus:acme::collection',
      db: 'acme',
      filter: {}
    });

    await DataTestHelper.insert({
      app,
      collection: 'srn:coeus:acme::collection',
      db: 'acme',
      document: [
        { foo: 'bar1', baz: true },
        { foo: 'bar2', baz: true },
        { foo: 'bar3', baz: true },
        { foo: 'bar4', baz: true },
        { foo: 'bar5', baz: true }
      ]
    });

    const response = await getRequestResponse({
      payload: {
        collection: 'srn:coeus:acme::collection',
        db: 'acme',
        filter: {
          aKey:
            Math.random()
              .toString(36)
              .substring(2, 15) +
            Math.random()
              .toString(36)
              .substring(2, 15)
        }
      }
    });

    t.equivalent(response.json(), {
      statusCode: 200,
      message: 'No documents deleted'
    });

    // cleanup
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
