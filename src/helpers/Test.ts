import { FastifyInstance } from 'fastify';
import { User } from 'src/models/User';
import { UserService } from 'src/services/UserService';
import { Utility } from 'src/helpers/Utility';
import {
  DataServiceCreateIndexParams,
  DataServiceDeleteParams,
  DataServiceDropIndexParams,
  DataServiceInsertParams,
  DataServiceParams
} from 'src/services/DataService';
import {
  InjectOptions,
  Response as LightMyRequestResponse
} from 'light-my-request';

export const TestHelper = {
  inject: async (
    app: FastifyInstance,
    opts: InjectOptions
  ): Promise<LightMyRequestResponse> => {
    const headersOverrides = { 'x-source-type': 'test' };
    if (opts.headers) {
      opts.headers = Object.assign(opts.headers, headersOverrides);
    } else {
      opts.headers = headersOverrides;
    }
    return app.inject(opts);
  }
};

export const DataTestHelper = {
  createIndex: async ({
    app,
    db,
    collection,
    fieldOrSpec,
    options
  }: { app: FastifyInstance } & DataServiceParams &
    DataServiceCreateIndexParams) =>
    app.mongo.client
      .db(db)
      .collection(collection)
      .createIndex(fieldOrSpec, options),
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
      .deleteMany(filter, options),
  dropIndex: async ({
    app,
    db,
    collection,
    indexName,
    options
  }: { app: FastifyInstance } & DataServiceParams &
    DataServiceDropIndexParams) =>
    app.mongo.client
      .db(db)
      .collection(collection)
      .dropIndex(indexName, options),
  insert: async ({
    app,
    db,
    collection,
    document,
    options
  }: { app: FastifyInstance } & DataServiceParams & DataServiceInsertParams) =>
    await app.mongo.client
      .db(db)
      .collection(collection)
      .insertMany(document, options)
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
    const existingUser = await new UserService(app).exists({
      username: user.username
    });

    if (!existingUser) {
      const createdUser = await new UserService(app).create(user);
      // Update hash map
      await app.updateUserHashMap();
      return createdUser;
    }
  },
  delete: async ({ app, user }: { app: FastifyInstance; user: User }) => {
    const result = new UserService(app).delete(user);
    // Update hash map
    await app.updateUserHashMap();
    return result;
  },
  find: async ({ app, user }: { app: FastifyInstance; user: User }) => {
    return new UserService(app).find({ query: { username: user.username } });
  },
  login: async ({ app, user }: { app: FastifyInstance; user: User }) => {
    const loginResponse = await TestHelper.inject(app, {
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
