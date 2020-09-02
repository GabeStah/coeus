import { FastifyInstance } from 'fastify';
import config from 'config';

export interface MongoServiceParams {
  db: string;
  collection: string;
}

export interface MongoServiceFindParams {
  limit?: number;
  query?: object;
  options?: any;
}

/**
 * Database request helper.
 */
export class MongoService {
  private instance: FastifyInstance;
  private db: string;
  private collection: string;

  constructor(
    instance: FastifyInstance,
    { db, collection }: MongoServiceParams
  ) {
    this.instance = instance;
    this.db = db;
    this.collection = collection;
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
  }: MongoServiceFindParams) {
    const result = await this.instance.mongo.client
      .db(this.db)
      .collection(this.collection)
      .find(query, options)
      .limit(limit)
      .maxTimeMS(config.get('db.thresholds.timeout.maximum'));

    return result.toArray();
  }
}
