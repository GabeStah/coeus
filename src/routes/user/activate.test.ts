import { test } from 'tap';
import { build } from 'src/app';
import { User } from 'src/models/User';
import { Utility } from 'src/helpers/Utility';
import { TestHelper, UserTestHelper } from 'src/helpers/Test';

test('routes/user/activate', async t => {
  const app = build();
  // Await plugin / decorated injection
  await app.ready();

  const route = Utility.route(['user.prefix', 'user.activate']);

  const getRequestResponse = async (user: User, params?: any) => {
    return TestHelper.inject(
      app,
      Object.assign(
        {
          method: 'POST',
          url: route,
          headers: {
            Authorization: `Bearer ${await UserTestHelper.login({
              app,
              user
            })}`
          }
        },
        params
      )
    );
  };

  await t.test(
    'can activate with valid PolicyStatement and target user',
    async t => {
      const targetUser = await UserTestHelper.create({
        app,
        user: User.fake({ active: false, verified: true })
      });
      const user = await UserTestHelper.create({
        app,
        user: User.fake({
          policy: {
            version: '1.1.0',
            statement: [
              {
                action: 'user:activate',
                resource: '*'
              }
            ]
          }
        })
      });

      const response = await getRequestResponse(user, {
        payload: {
          id: targetUser.id
        }
      });

      t.equivalent(response.json(), {
        statusCode: 200,
        message: 'User activated'
      });

      await UserTestHelper.delete({ app, user });
      await UserTestHelper.delete({ app, user: targetUser });
    }
  );

  await t.test('can activate via username', async t => {
    const targetUser = await UserTestHelper.create({
      app,
      user: User.fake({ active: false, verified: true })
    });
    const user = await UserTestHelper.create({
      app,
      user: User.fake({
        policy: {
          version: '1.1.0',
          statement: [
            {
              action: 'user:activate',
              resource: '*'
            }
          ]
        }
      })
    });

    const response = await getRequestResponse(user, {
      payload: {
        username: targetUser.username
      }
    });

    t.equivalent(response.json(), {
      statusCode: 200,
      message: 'User activated'
    });

    await UserTestHelper.delete({ app, user });
    await UserTestHelper.delete({ app, user: targetUser });
  });

  await t.test('can activate via srn', async t => {
    const targetUser = await UserTestHelper.create({
      app,
      user: User.fake({ active: false, verified: true })
    });
    const user = await UserTestHelper.create({
      app,
      user: User.fake({
        policy: {
          version: '1.1.0',
          statement: [
            {
              action: 'user:activate',
              resource: '*'
            }
          ]
        }
      })
    });

    const response = await getRequestResponse(user, {
      payload: {
        srn: targetUser.srn
      }
    });

    t.equivalent(response.json(), {
      statusCode: 200,
      message: 'User activated'
    });

    await UserTestHelper.delete({ app, user });
    await UserTestHelper.delete({ app, user: targetUser });
  });

  await t.test(
    'cannot authorize without coeus.users PolicyStatement',
    async t => {
      const targetUser = await UserTestHelper.create({
        app,
        user: User.fake()
      });
      const user = await UserTestHelper.create({
        app,
        user: User.fake({
          policy: {
            version: '1.1.0',
            statement: [
              {
                action: 'user:activate',
                allow: false,
                resource: '*'
              }
            ]
          }
        })
      });

      const response = await getRequestResponse(user, {
        payload: {
          id: targetUser.id
        }
      });

      t.equivalent(response.json(), {
        statusCode: 403,
        error: 'Forbidden',
        message: 'You do not have permission to perform the request'
      });

      await UserTestHelper.delete({ app, user });
      await UserTestHelper.delete({ app, user: targetUser });
    }
  );

  await t.test('cannot activate unfound user', async t => {
    const targetUser = await UserTestHelper.create({
      app,
      user: User.fake({ active: false, verified: true })
    });
    const user = await UserTestHelper.create({
      app,
      user: User.fake({
        policy: {
          version: '1.1.0',
          statement: [
            {
              action: 'user:activate',
              resource: '*'
            }
          ]
        }
      })
    });

    const searchUsername = targetUser.username + '1234567890';

    const response = await getRequestResponse(user, {
      payload: {
        username: searchUsername
      }
    });

    t.equivalent(response.json(), {
      statusCode: 400,
      error: 'Bad Request',
      message: `Could not find a user based on search params: {"username":"${searchUsername}"}`
    });

    await UserTestHelper.delete({ app, user });
    await UserTestHelper.delete({ app, user: targetUser });
  });

  t.tearDown(async () => {
    return app.close();
  });
  t.end();
});
