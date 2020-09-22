import Collection from 'src/schema/collection';
import Database from 'src/schema/database';
import { FastifySchema } from 'fastify';

const schema: FastifySchema = {
  body: {
    type: 'object',
    required: ['collection', 'db', 'filter', 'update'],
    properties: {
      collection: Collection,
      db: Database,
      filter: {
        type: 'object',
        minProperties: 1,
        default: null
      },
      options: {
        type: ['object', 'null'],
        default: null
      },
      update: {
        type: 'object',
        minProperties: 1,
        default: null
      }
    }
  }
};

export default schema;
