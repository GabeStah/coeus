import { FastifyInstance } from 'fastify';
import { User } from 'src/models/User';
import { UserService } from 'src/services/UserService';
import { Utility } from 'src/helpers/Utility';
import {
  DataServiceDeleteParams,
  DataServiceInsertParams,
  DataServiceParams
} from 'src/services/DataService';

export const DataTestHelper = {
  insert: async ({
    app,
    db,
    collection,
    document,
    ordered
  }: { app: FastifyInstance } & DataServiceParams & DataServiceInsertParams) =>
    await app.mongo.client
      .db(db)
      .collection(collection)
      .insertMany(document, { ordered }),
  delete: async ({
    app,
    db,
    collection,
    filter,
    options
  }: { app: FastifyInstance } & DataServiceParams & DataServiceDeleteParams) =>
    app.mongo.client
      .db(db)
      .collection(collection)
      .deleteMany(filter, <object>Object.assign({}, options))
  // find: async ({
  //   app,
  //   db,
  //   collection,
  //   query,
  //   options,
  //   limit = config.get('db.thresholds.limit.base')
  // }: { app: FastifyInstance } & DataServiceParams & DataServiceFindParams) =>
  //   app.mongo.client
  //     .db(db)
  //     .collection(collection)
  //     .find(query, options)
  //     .limit(limit)
  //     .maxTimeMS(config.get('db.thresholds.timeout.maximum'))
};

export const UserTestHelper = {
  create: async ({ app, user }: { app: FastifyInstance; user: User }) => {
    // Exists
    let existingUser = await new UserService(app).exists({
      username: user.username
    });

    if (!existingUser) {
      await new UserService(app).create(user);
    }
  },
  delete: async ({ app, user }: { app: FastifyInstance; user: User }) => {
    return new UserService(app).delete(user);
  },
  // find: async ({ app, user }: { app: FastifyInstance; user: User }) => {
  //   return new UserService(app).find({ query: { username: user.username } });
  // },
  login: async ({ app, user }: { app: FastifyInstance; user: User }) => {
    const loginResponse = await app.inject({
      method: 'POST',
      url: Utility.route(['user.prefix', 'user.login']),
      payload: {
        password: user.password,
        username: user.username
      }
    });

    return loginResponse.json().token;
  }
};
