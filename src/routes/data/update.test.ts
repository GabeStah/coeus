import { test } from "tap";
import { build } from "src/app";
import { User } from "src/models/User";
import { Utility } from "src/helpers/Utility";
import { DataTestHelper, TestHelper, UserTestHelper } from "src/helpers/Test";

test('routes/data/update', async t => {
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
        },
        {
          action: 'data:find',
          resource: ['sample_mflix.movies']
        }
      ]
    }
  });

  const route = Utility.route(['data.prefix', 'data.update']);

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

  await t.test(`without body fails`, async t => {
    const response = await getRequestResponse();
    t.equivalent(response.json(), {
      statusCode: 400,
      error: 'Bad Request',
      message: 'body should be object'
    });
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

  await t.test(`without filter property`, async t => {
    const response = await getRequestResponse({
      payload: {
        collection: 'srn:coeus:acme::collection',
        db: 'acme'
      }
    });

    t.equivalent(response.json(), {
      statusCode: 400,
      error: 'Bad Request',
      message: 'body.filter should be object'
    });
  });

  await t.test(`with no filter properties`, async t => {
    const response = await getRequestResponse({
      payload: {
        collection: 'srn:coeus:acme::collection',
        db: 'acme',
        filter: {}
      }
    });

    t.equivalent(response.json(), {
      statusCode: 400,
      error: 'Bad Request',
      message: 'body.filter should NOT have fewer than 1 properties'
    });
  });

  await t.test(`without update property`, async t => {
    const response = await getRequestResponse({
      payload: {
        collection: 'srn:coeus:acme::collection',
        db: 'acme',
        filter: {
          data: 'bar'
        }
      }
    });

    t.equivalent(response.json(), {
      statusCode: 400,
      error: 'Bad Request',
      message: 'body.update should be object'
    });
  });

  await t.test(`with no update properties`, async t => {
    const response = await getRequestResponse({
      payload: {
        collection: 'srn:coeus:acme::collection',
        db: 'acme',
        filter: {
          data: 'bar'
        },
        update: {}
      }
    });

    t.equivalent(response.json(), {
      statusCode: 400,
      error: 'Bad Request',
      message: 'body.update should NOT have fewer than 1 properties'
    });
  });

  await t.test(
    `with valid collection, db, filter, and update document`,
    async t => {
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
          { data: 'bar', baz: true },
          { data: 'bar2', baz: true },
          { data: 'bar3', baz: true },
          { data: 'bar4', baz: true },
          { data: 'bar5', baz: true }
        ]
      });

      const response = await getRequestResponse({
        payload: {
          collection: 'srn:coeus:acme::collection',
          db: 'acme',
          filter: {
            data: 'bar'
          },
          update: {
            $set: { data: 'foo' }
          }
        }
      });

      t.strictEqual(response.json().statusCode, 200);
      t.strictEqual(response.json().message, '1 document updated');

      await DataTestHelper.delete({
        app,
        collection: 'srn:coeus:acme::collection',
        db: 'acme',
        filter: {}
      });
    }
  );

  await t.test(
    `with valid collection, db, filter, and update multiple documents`,
    async t => {
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
          { data: 'bar', baz: true },
          { data: 'bar2', baz: true },
          { data: 'bar3', baz: true },
          { data: 'bar4', baz: true },
          { data: 'bar5', baz: true }
        ]
      });

      const response = await getRequestResponse({
        payload: {
          collection: 'srn:coeus:acme::collection',
          db: 'acme',
          filter: {
            data: { $regex: '^bar' }
          },
          update: {
            $set: { data: 'foo' }
          }
        }
      });

      t.strictEqual(response.json().statusCode, 200);
      t.strictEqual(response.json().message, '5 documents updated');

      await DataTestHelper.delete({
        app,
        collection: 'srn:coeus:acme::collection',
        db: 'acme',
        filter: {}
      });
    }
  );

  t.tearDown(async () => {
    await UserTestHelper.delete({ app, user: userInstance });
    return app.close();
  });
  t.end();
});
