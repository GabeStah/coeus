import { test } from 'tap';
import { build } from 'src/app';
import { User } from 'src/models/User';
import { Utility } from 'src/helpers/Utility';
import { UserTestHelper } from 'src/helpers/Test';
import faker from 'faker';

test('AuthorizationService', async t => {
  const app = build();
  // Await plugin / decorated injection
  await app.ready();

  await t.test(`can register`, async t => {
    const user = User.fake();

    const response = await app.inject({
      method: 'POST',
      url: Utility.route(['user.prefix', 'user.register']),
      payload: user.toObject()
    });

    t.strictEqual(response.statusCode, 200);
    t.strictEqual(response.statusMessage, 'OK');
    t.equivalent(response.json().message, 'User successfully created.');

    await UserTestHelper.delete({ app, user });
  });

  await t.test(`cannot register with duplicate username`, async t => {
    const userA = User.fake();
    const userB = User.fake({ username: userA.username });

    const responseA = await app.inject({
      method: 'POST',
      url: Utility.route(['user.prefix', 'user.register']),
      payload: userA.toObject()
    });

    t.strictEqual(responseA.statusCode, 200);
    t.strictEqual(responseA.statusMessage, 'OK');
    t.equivalent(responseA.json().message, 'User successfully created.');

    const responseB = await app.inject({
      method: 'POST',
      url: Utility.route(['user.prefix', 'user.register']),
      payload: userB.toObject()
    });

    t.equivalent(responseB.json(), {
      statusCode: 409,
      error: 'Conflict',
      message: `Unable to create new user: ${userA.username}`
    });

    await UserTestHelper.delete({ app, user: userA });
  });

  await t.test(`cannot delete not-existent user`, async t => {
    const user = User.fake();

    const deleted = await UserTestHelper.delete({ app, user });
    t.strictEqual(deleted, true);
  });

  await t.test(`can login`, async t => {
    const user = User.fake();

    const responseRegister = await app.inject({
      method: 'POST',
      url: Utility.route(['user.prefix', 'user.register']),
      payload: user.toObject()
    });

    t.strictEqual(responseRegister.statusCode, 200);
    t.strictEqual(responseRegister.statusMessage, 'OK');
    t.equivalent(responseRegister.json().message, 'User successfully created.');

    const loginResponse = await app.inject({
      method: 'POST',
      url: Utility.route(['user.prefix', 'user.login']),
      payload: {
        username: user.username,
        password: user.password
      }
    });

    t.strictEqual(loginResponse.statusCode, 200);
    t.strictEqual(loginResponse.statusMessage, 'OK');
    t.type(loginResponse.json().token, 'string');

    await UserTestHelper.delete({ app, user });
  });

  await t.test(`login with invalid username`, async t => {
    const user = User.fake();

    const responseRegister = await app.inject({
      method: 'POST',
      url: Utility.route(['user.prefix', 'user.register']),
      payload: user.toObject()
    });

    t.strictEqual(responseRegister.statusCode, 200);
    t.strictEqual(responseRegister.statusMessage, 'OK');
    t.equivalent(responseRegister.json().message, 'User successfully created.');

    const loginResponse = await app.inject({
      method: 'POST',
      url: Utility.route(['user.prefix', 'user.login']),
      payload: {
        username: user.username + faker.random.alphaNumeric(4),
        password: user.password
      }
    });

    // t.strictEqual(loginResponse.statusCode, 401);
    // t.strictEqual(loginResponse.statusMessage, 'Unauthorized');
    t.equivalent(loginResponse.json(), {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Unable to authenticate with provided credentials.'
    });

    await UserTestHelper.delete({ app, user });
  });

  await t.test(`login with invalid password`, async t => {
    const user = User.fake();

    const responseRegister = await app.inject({
      method: 'POST',
      url: Utility.route(['user.prefix', 'user.register']),
      payload: user.toObject()
    });

    t.strictEqual(responseRegister.statusCode, 200);
    t.strictEqual(responseRegister.statusMessage, 'OK');
    t.equivalent(responseRegister.json().message, 'User successfully created.');

    const loginResponse = await app.inject({
      method: 'POST',
      url: Utility.route(['user.prefix', 'user.login']),
      payload: {
        username: user.username,
        password: user.password + faker.random.alphaNumeric(4)
      }
    });

    // t.strictEqual(loginResponse.statusCode, 401);
    // t.strictEqual(loginResponse.statusMessage, 'Unauthorized');
    t.equivalent(loginResponse.json(), {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Unable to authenticate with provided credentials.'
    });

    await UserTestHelper.delete({ app, user });
  });

  t.tearDown(async () => {
    return app.close();
  });
  t.end();
});
