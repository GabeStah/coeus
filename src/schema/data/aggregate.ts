import Collection from 'src/schema/collection';
import Database from 'src/schema/database';
import { FastifySchema } from 'fastify';
import config from 'config';

const schema: FastifySchema = {
  body: {
    type: 'object',
    required: ['collection', 'db', 'pipeline'],
    properties: {
      collection: Collection,
      db: Database,
      limit: {
        type: ['number', 'null'],
        default: config.get('db.thresholds.limit.base'),
        minimum: config.get('db.thresholds.limit.minimum'),
        maximum: config.get('db.thresholds.limit.maximum')
      },
      pipeline: {
        type: 'array',
        uniqueItems: true,
        default: null,
        items: {
          type: 'object'
        }
      },
      options: {
        type: ['object', 'null'],
        default: {
          allowDiskUse: true
        }
      }
    }
  }
};

export default schema;
