import { test } from 'tap';
import { build } from 'src/app';
import { User } from 'src/models/User';
import { Utility } from 'src/helpers/Utility';
import { TestHelper, UserTestHelper } from 'src/helpers/Test';
import faker from 'faker';
import { UserService } from 'src/services/UserService';
import { ObjectID } from 'mongodb';

test('AuthorizationService', async t => {
  const app = build();
  // Await plugin / decorated injection
  await app.ready();

  await t.test('cannot delete not-existent user', async t => {
    const user = User.fake();

    const deleted = await UserTestHelper.delete({ app, user });
    t.strictEqual(deleted, true);
  });

  await t.test('login with invalid username', async t => {
    const user = User.fake();

    const responseRegister = await TestHelper.inject(app, {
      method: 'POST',
      url: Utility.route(['user.prefix', 'user.register']),
      payload: await user.toObject()
    });

    t.strictEqual(responseRegister.statusCode, 200);
    t.strictEqual(responseRegister.statusMessage, 'OK');
    t.equivalent(responseRegister.json().message, 'User successfully created.');

    const loginResponse = await TestHelper.inject(app, {
      method: 'POST',
      url: Utility.route(['user.prefix', 'user.login']),
      payload: {
        username: user.username + faker.random.alphaNumeric(4),
        password: user.password
      }
    });

    t.equivalent(loginResponse.json(), {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Unable to authenticate with the provided credentials.'
    });

    await UserTestHelper.delete({ app, user });
  });

  await t.test('login with invalid password', async t => {
    const user = User.fake();

    const responseRegister = await TestHelper.inject(app, {
      method: 'POST',
      url: Utility.route(['user.prefix', 'user.register']),
      payload: await user.toObject()
    });

    t.strictEqual(responseRegister.statusCode, 200);
    t.strictEqual(responseRegister.statusMessage, 'OK');
    t.equivalent(responseRegister.json().message, 'User successfully created.');

    const loginResponse = await TestHelper.inject(app, {
      method: 'POST',
      url: Utility.route(['user.prefix', 'user.login']),
      payload: {
        username: user.username,
        password: user.password + faker.random.alphaNumeric(4)
      }
    });

    t.equivalent(loginResponse.json(), {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Unable to authenticate with the provided credentials.'
    });

    await UserTestHelper.delete({ app, user });
  });

  await t.test('user updatable by _id', async t => {
    const user = User.fake({
      _id: '123456abcdef'
    });

    const responseRegister = await TestHelper.inject(app, {
      method: 'POST',
      url: Utility.route(['user.prefix', 'user.register']),
      payload: await user.toObject()
    });

    t.strictEqual(responseRegister.statusCode, 200);
    t.strictEqual(responseRegister.statusMessage, 'OK');
    t.equivalent(responseRegister.json().message, 'User successfully created.');

    const foundUsers = await new UserService(app).find({
      query: { username: user.username }
    });

    const foundUser = foundUsers[0];

    const updateResponse = await new UserService(app).update({
      filter: { _id: new ObjectID(foundUser.id) },
      update: { $set: { org: 'other' } }
    });

    t.equivalent(updateResponse, {
      statusCode: 200,
      message: 'User updated'
    });

    await UserTestHelper.delete({ app, user });
  });

  await t.test('user updatable', async t => {
    const user = User.fake();

    const responseRegister = await TestHelper.inject(app, {
      method: 'POST',
      url: Utility.route(['user.prefix', 'user.register']),
      payload: await user.toObject()
    });

    t.strictEqual(responseRegister.statusCode, 200);
    t.strictEqual(responseRegister.statusMessage, 'OK');
    t.equivalent(responseRegister.json().message, 'User successfully created.');

    const foundUsers = await new UserService(app).find({
      query: { username: user.username }
    });

    const foundUser = foundUsers[0];

    const updateResponse = await new UserService(app).update({
      filter: { _id: new ObjectID(foundUser.id) },
      update: { $set: { org: 'other' } }
    });

    t.equivalent(updateResponse, {
      statusCode: 200,
      message: 'User updated'
    });

    await UserTestHelper.delete({ app, user });
  });

  await t.test('update by id', async t => {
    const user = User.fake();

    const responseRegister = await TestHelper.inject(app, {
      method: 'POST',
      url: Utility.route(['user.prefix', 'user.register']),
      payload: await user.toObject()
    });

    t.strictEqual(responseRegister.statusCode, 200);
    t.strictEqual(responseRegister.statusMessage, 'OK');
    t.equivalent(responseRegister.json().message, 'User successfully created.');

    const foundUsers = await new UserService(app).find({
      query: { username: user.username }
    });

    const foundUser = foundUsers[0];

    const updateResponse = await new UserService(app).updateById(foundUser.id, {
      update: { $set: { org: 'other' } }
    });

    t.equivalent(updateResponse, {
      statusCode: 200,
      message: 'User updated'
    });

    await UserTestHelper.delete({ app, user });
  });

  await t.test('can verify valid user', async t => {
    const user = User.fake();

    const responseRegister = await TestHelper.inject(app, {
      method: 'POST',
      url: Utility.route(['user.prefix', 'user.register']),
      payload: await user.toObject()
    });

    t.strictEqual(responseRegister.statusCode, 200);
    t.strictEqual(responseRegister.statusMessage, 'OK');
    t.equivalent(responseRegister.json().message, 'User successfully created.');

    const foundUsers = await new UserService(app).find({
      query: { username: user.username }
    });

    const foundUser = foundUsers[0];

    const responseVerify = await TestHelper.inject(app, {
      method: 'GET',
      url: Utility.route(['user.prefix', 'user.verify']),
      query: {
        token: foundUser.verificationToken.value
      }
    });

    t.equivalent(responseVerify.json(), {
      statusCode: 200,
      message: 'User successfully verified.'
    });

    await UserTestHelper.delete({ app, user });
  });

  await t.test('cannot verify with invalid token', async t => {
    const response = await TestHelper.inject(app, {
      method: 'GET',
      url: Utility.route(['user.prefix', 'user.verify']),
      query: {
        token: 'a'.repeat(60)
      }
    });

    t.equivalent(response.json(), {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Verification token is invalid.'
    });
  });

  await t.test('cannot verify with expired token', async t => {
    const user = User.fake();

    const responseRegister = await TestHelper.inject(app, {
      method: 'POST',
      url: Utility.route(['user.prefix', 'user.register']),
      payload: await user.toObject()
    });

    t.strictEqual(responseRegister.statusCode, 200);
    t.strictEqual(responseRegister.statusMessage, 'OK');
    t.equivalent(responseRegister.json().message, 'User successfully created.');

    const foundUsers = await new UserService(app).find({
      query: { username: user.username }
    });

    const foundUser = foundUsers[0];

    await new UserService(app).updateById(foundUser.id, {
      update: {
        $set: { 'verificationToken.expiresAt': Date.now() - 1000 }
      }
    });

    const responseVerify = await TestHelper.inject(app, {
      method: 'GET',
      url: Utility.route(['user.prefix', 'user.verify']),
      query: {
        token: foundUser.verificationToken.value
      }
    });

    t.equivalent(responseVerify.json(), {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Verification token has expired.'
    });

    await UserTestHelper.delete({ app, user });
  });

  t.tearDown(async () => {
    return app.close();
  });
  t.end();
});
