import { FastifyInstance } from 'fastify';
import config from 'config';
import {
  AuthorizationPayloadType,
  AuthorizationService
} from 'src/services/AuthorizationService';

export interface DataServiceParams {
  db: string;
  collection: string;
  payload?: AuthorizationPayloadType;
}

export interface DataServiceFindParams {
  limit?: number;
  query?: object;
  options?: any;
}

/**
 * Data service class.
 */
export class DataService extends AuthorizationService {
  private instance: FastifyInstance;
  private db: string;
  private collection: string;

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
   * Find documents by query and options.
   *
   * @param limit
   * @param query
   * @param options
   */
  public async find({
    limit = config.get('db.thresholds.limit.base'),
    query = {},
    options = null
  }: DataServiceFindParams) {
    this.authorize({ method: 'find' });

    const result = await this.instance.mongo.client
      .db(this.db)
      .collection(this.collection)
      .find(query, options)
      .limit(limit)
      .maxTimeMS(config.get('db.thresholds.timeout.maximum'));

    return result.toArray();
  }
}
