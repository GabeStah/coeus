import { test } from 'tap';
import { build } from 'src/app';
import { User } from 'src/models/User';
import { Utility } from 'src/helpers/Utility';
import { TestHelper, UserTestHelper } from 'src/helpers/Test';

test('routes/user/login', async t => {
  const app = build();
  // Await plugin / decorated injection
  await app.ready();

  const route = Utility.route(['user.prefix', 'user.login']);

  const getRequestResponse = async (params?: any) => {
    return TestHelper.inject(
      app,
      Object.assign(
        {
          method: 'POST',
          url: route
        },
        params
      )
    );
  };

  await t.test('cannot login if user doesn\'t exist', async t => {
    const response = await getRequestResponse({
      payload: {
        username: 'foobar',
        password: 'wrongpassword'
      }
    });

    t.equivalent(response.json(), {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Unable to authenticate with the provided credentials.'
    });
  });

  await t.test('cannot login with invalid credentials', async t => {
    const user = await UserTestHelper.create({
      app,
      user: User.fake({ active: true, verified: true })
    });

    const response = await getRequestResponse({
      payload: {
        username: user.username,
        password: user.password + '1234'
      }
    });

    t.equivalent(response.json(), {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Unable to authenticate with the provided credentials.'
    });

    await UserTestHelper.delete({ app, user });
  });

  await t.test('cannot login if user email is not verified', async t => {
    const user = await UserTestHelper.create({
      app,
      user: User.fake({ active: true, verified: false })
    });

    const response = await getRequestResponse({
      payload: {
        username: user.username,
        password: user.password
      }
    });

    t.equivalent(response.json(), {
      statusCode: 403,
      error: 'Forbidden',
      message: 'Unable to authenticate: Please verify your email address'
    });

    await UserTestHelper.delete({ app, user });
  });

  await t.test('cannot login if user is inactive', async t => {
    const user = await UserTestHelper.create({
      app,
      user: User.fake({ active: false, verified: true })
    });

    const response = await getRequestResponse({
      payload: {
        username: user.username,
        password: user.password
      }
    });

    t.equivalent(response.json(), {
      statusCode: 403,
      error: 'Forbidden',
      message: 'Unable to authenticate: User is inactive'
    });

    await UserTestHelper.delete({ app, user });
  });

  await t.test('can login with valid credentials', async t => {
    const user = await UserTestHelper.create({
      app,
      user: User.fake({ active: true, verified: true })
    });

    const response = await getRequestResponse({
      payload: {
        username: user.username,
        password: user.password
      }
    });

    t.strictEqual(response.statusCode, 200);
    t.strictEqual(response.statusMessage, 'OK');
    t.type(response.json().token, 'string');

    const tokenPayload = JSON.parse(
      JSON.stringify(app.jwt.decode(response.json().token, { complete: false }))
    );
    t.strictEqual(tokenPayload.username, user.username);

    await UserTestHelper.delete({ app, user });
  });

  await t.test('can login with token email generation', async t => {
    const user = await UserTestHelper.create({
      app,
      user: User.fake({ active: true, verified: true })
    });

    const response = await getRequestResponse({
      payload: {
        username: user.username,
        password: user.password,
        email: true
      }
    });

    t.strictEqual(response.statusCode, 200);
    t.strictEqual(response.statusMessage, 'OK');
    t.type(response.json().token, 'string');

    const tokenPayload = JSON.parse(
      JSON.stringify(app.jwt.decode(response.json().token, { complete: false }))
    );
    t.strictEqual(tokenPayload.username, user.username);

    await UserTestHelper.delete({ app, user });
  });

  t.tearDown(async () => {
    return app.close();
  });
  t.end();
});
