import { FastifyInstance } from 'fastify';
import config from 'config';
import {
  AuthorizationPayloadType,
  AuthorizationService
} from 'src/services/AuthorizationService';
import values from 'lodash/values';

export interface DataServiceParams {
  db: string;
  collection: string;
  payload?: AuthorizationPayloadType;
}

export interface DataServiceDeleteParams {
  filter: object;
  options?: any;
}

export interface DataServiceFindParams {
  limit?: number;
  query?: object;
  options?: any;
}

export interface DataServiceInsertParams {
  document: Array<object>;
  ordered?: boolean;
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
    { db, collection, payload }: DataServiceParams
  ) {
    super({ payload, service: 'data' });
    this.db = db;
    this.collection = collection;
    this.instance = instance;
  }

  /**
   * Delete documents based on filter query.
   *
   * @see https://docs.mongodb.com/manual/reference/operator/
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
      .deleteMany(filter, <object>Object.assign({}, options));

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
      message: `No documents deleted`
    };
  }

  /**
   * Find documents by query and options.
   *
   * @see https://docs.mongodb.com/manual/reference/operator/
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
   * @param document
   * @param ordered A boolean specifying whether the mongo instance should perform an ordered or unordered insert.
   */
  public async insert({ document, ordered }: DataServiceInsertParams) {
    this.authorize({
      collection: this.collection,
      db: this.db,
      method: 'insert'
    });

    const result = await this.instance.mongo.client
      .db(this.db)
      .collection(this.collection)
      .insertMany(document, { ordered });

    return {
      statusCode: 200,
      message: `${result.insertedCount} document${
        result.insertedCount > 1 ? 's' : ''
      } inserted`,
      data: values(result.insertedIds)
    };
  }
}
