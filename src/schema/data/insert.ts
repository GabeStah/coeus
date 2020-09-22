import Collection from 'src/schema/collection';
import Database from 'src/schema/database';
import { FastifySchema } from 'fastify';

const schema: FastifySchema = {
  body: {
    type: 'object',
    required: ['collection', 'db', 'document'],
    properties: {
      collection: Collection,
      db: Database,
      document: {
        type: 'array',
        items: {
          type: 'object',
          default: {}
        },
        minItems: 1
      },
      options: {
        type: ['object', 'null'],
        default: null
      }
    }
  }
};

export default schema;
