import Collection from 'src/schema/collection';
import Database from 'src/schema/database';
import { FastifySchema } from 'fastify';

const schema: FastifySchema = {
  body: {
    type: 'object',
    required: ['collection', 'db', 'filter'],
    properties: {
      collection: Collection,
      db: Database,
      filter: {
        type: 'object',
        default: {}
      },
      options: {
        type: ['object', 'null'],
        default: null
      }
    }
  }
};

export default schema;
