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
  IndexOptions,
  ReadPreferenceMode,
  UpdateManyOptions
} from 'mongodb';
import { Utility } from 'src/helpers/Utility';

export interface DataServiceParams {
  db: string;
  collection: string;
  payload?: AuthorizationPayloadType;
  request?: FastifyRequest;
}

export interface DataServiceCreateIndexParams {
  fieldOrSpec: object | string;
  options?: IndexOptions;
}

export interface DataServiceDeleteParams {
  filter: object;
  options?: CommonOptions;
}

export interface DataServiceDropIndexParams {
  indexName: string;
  options?: IndexOptions;
}

export interface DataServiceFindParams {
  limit?: number;
  query?: object;
  options?: FindOneOptions<any>;
}

export interface DataServiceListIndexesParams {
  batchSize?: number;
  readPreference?: ReadPreferenceMode;
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
   * Create an index in db.collection.
   *
   * @see https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/
   * @see http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#createIndex
   * @see https://docs.mongodb.com/manual/indexes/#index-types
   *
   * @param fieldOrSpec
   * @param options
   */
  public async createIndex({
    fieldOrSpec,
    options
  }: DataServiceCreateIndexParams) {
    this.authorize({
      collection: this.collection,
      db: this.db,
      method: 'createIndex'
    });

    const result = await this.instance.mongo.client
      .db(this.db)
      .collection(this.collection)
      .createIndex(fieldOrSpec, options);

    return {
      statusCode: 200,
      message: `'${result}' index created on '${this.db}.${this.collection}'`
    };
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
      .deleteMany(Utility.normalizeQueryObject(filter), options);

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
   * Drop an index from db.collection.
   *
   * @see https://docs.mongodb.com/manual/reference/method/db.collection.dropIndex/
   * @see http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#dropIndex
   *
   * @param indexName
   * @param options
   */
  public async dropIndex({ indexName, options }: DataServiceDropIndexParams) {
    this.authorize({
      collection: this.collection,
      db: this.db,
      method: 'dropIndex'
    });

    await this.instance.mongo.client
      .db(this.db)
      .collection(this.collection)
      .dropIndex(indexName, options);

    return {
      statusCode: 200,
      message: `'${indexName}' index dropped from '${this.db}.${this.collection}'`
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
      .find(Utility.normalizeQueryObject(query), options)
      .limit(limit)
      .maxTimeMS(config.get('db.thresholds.timeout.maximum'));

    return result.toArray();
  }

  /**
   * List all indexes for db.collection
   *
   * @see https://docs.mongodb.com/manual/reference/method/db.collection.listIndexes/
   * @see http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#listIndexes
   * @see https://docs.mongodb.com/manual/indexes/#index-types
   */
  public async listIndexes(options: DataServiceListIndexesParams) {
    this.authorize({
      collection: this.collection,
      db: this.db,
      method: 'listIndexes'
    });

    const result = await this.instance.mongo.client
      .db(this.db)
      .collection(this.collection)
      .listIndexes(options);

    const data = await result.toArray();

    return {
      statusCode: 200,
      message: `${data.length} indexes found on '${this.db}.${this.collection}'`,
      data: await result.toArray()
    };
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
      .updateMany(Utility.normalizeQueryObject(filter), update, options);

    return {
      statusCode: 200,
      message: `${result.modifiedCount} document${
        result.modifiedCount > 1 ? 's' : ''
      } updated`
    };
  }
}
