import { test } from "tap";
import { build } from "src/app";
import { User } from "src/models/User";
import { Utility } from "src/helpers/Utility";
import { TestHelper, UserTestHelper } from "src/helpers/Test";

test('routes/user/register', async t => {
  const app = build();
  // Await plugin / decorated injection
  await app.ready();

  await t.test(`can register`, async t => {
    const user = User.fake();

    const response = await TestHelper.inject(app, {
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

    const responseA = await TestHelper.inject(app, {
      method: 'POST',
      url: Utility.route(['user.prefix', 'user.register']),
      payload: userA.toObject()
    });

    t.strictEqual(responseA.statusCode, 200);
    t.strictEqual(responseA.statusMessage, 'OK');
    t.equivalent(responseA.json().message, 'User successfully created.');

    const responseB = await TestHelper.inject(app, {
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

  t.tearDown(async () => {
    return app.close();
  });
  t.end();
});
