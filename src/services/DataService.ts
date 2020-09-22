import { FastifyInstance, FastifyRequest } from 'fastify';
import config from 'config';
import {
  AuthorizationPayloadType,
  AuthorizationService
} from 'src/services/AuthorizationService';
import values from 'lodash/values';
import {
  CollectionInsertManyOptions,
  CommonOptions,
  FindOneOptions,
  UpdateManyOptions
} from 'mongodb';

export interface DataServiceParams {
  db: string;
  collection: string;
  payload?: AuthorizationPayloadType;
  request?: FastifyRequest;
}

export interface DataServiceDeleteParams {
  filter: object;
  options?: CommonOptions;
}

export interface DataServiceFindParams {
  limit?: number;
  query?: object;
  options?: FindOneOptions<any>;
}

export interface DataServiceInsertParams {
  document: Array<object>;
  options?: CollectionInsertManyOptions;
}

export interface DataServiceUpdateParams {
  filter: object;
  update: object;
  options?: UpdateManyOptions;
}

/**
 * Data service class.
 */
export class DataService extends AuthorizationService {
  private instance: FastifyInstance;
  private readonly db: string;
  private readonly collection: string;

  constructor(
    instance: FastifyInstance,
    { db, collection, payload, request }: DataServiceParams
  ) {
    super({ payload, request, service: 'data' });
    this.db = db;
    this.collection = collection;
    this.instance = instance;
  }

  /**
   * Delete documents based on filter query.
   *
   * @see https://docs.mongodb.com/manual/reference/method/db.collection.deleteMany/
   * @see http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#deleteMany
   *
   * @param filter
   * @param options
   */
  public async delete({ filter, options }: DataServiceDeleteParams) {
    this.authorize({
      collection: this.collection,
      db: this.db,
      method: 'delete'
    });

    const result = await this.instance.mongo.client
      .db(this.db)
      .collection(this.collection)
      .deleteMany(filter, options);

    if (result.deletedCount > 0) {
      return {
        statusCode: 200,
        message: `${result.deletedCount} document${
          result.deletedCount > 1 ? 's' : ''
        } deleted`
      };
    }

    return {
      statusCode: 200,
      message: 'No documents deleted'
    };
  }

  /**
   * Find documents by query and options.
   *
   * @see https://docs.mongodb.com/manual/reference/method/db.collection.find/
   * @see http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#find
   *
   * @param limit
   * @param query
   * @param options
   */
  public async find({ limit, query, options }: DataServiceFindParams) {
    this.authorize({
      collection: this.collection,
      db: this.db,
      method: 'find'
    });

    const result = await this.instance.mongo.client
      .db(this.db)
      .collection(this.collection)
      .find(query, options)
      .limit(limit)
      .maxTimeMS(config.get('db.thresholds.timeout.maximum'));

    return result.toArray();
  }

  /**
   * Insert documents array.
   *
   * @see https://docs.mongodb.com/manual/reference/method/db.collection.insertMany/
   * @see http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#insertMany
   *
   * @param document
   * @param options
   */
  public async insert({ document, options }: DataServiceInsertParams) {
    this.authorize({
      collection: this.collection,
      db: this.db,
      method: 'insert'
    });

    const result = await this.instance.mongo.client
      .db(this.db)
      .collection(this.collection)
      .insertMany(document, options);

    return {
      statusCode: 200,
      message: `${result.insertedCount} document${
        result.insertedCount > 1 ? 's' : ''
      } inserted`,
      data: values(result.insertedIds)
    };
  }

  /**
   * Update documents array based on passed filter.
   *
   * @see https://docs.mongodb.com/drivers/node/usage-examples/updateMany
   * @see https://docs.mongodb.com/manual/reference/method/db.collection.updateMany/
   * @see http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#updateMany
   *
   * @param filter
   * @param options
   * @param update
   */
  public async update({ filter, update, options }: DataServiceUpdateParams) {
    this.authorize({
      collection: this.collection,
      db: this.db,
      method: 'update'
    });

    const result = await this.instance.mongo.client
      .db(this.db)
      .collection(this.collection)
      .updateMany(filter, update, options);

    return {
      statusCode: 200,
      message: `${result.modifiedCount} document${
        result.modifiedCount > 1 ? 's' : ''
      } updated`
    };
  }
}
