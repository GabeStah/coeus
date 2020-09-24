import Collection from 'src/schema/collection';
import Database from 'src/schema/database';
import { FastifySchema } from 'fastify';

const schema: FastifySchema = {
  body: {
    type: 'object',
    required: ['collection', 'db', 'fieldOrSpec'],
    properties: {
      collection: Collection,
      db: Database,
      fieldOrSpec: {
        type: ['object', 'string'],
        default: null
      },
      options: {
        type: ['object', 'null'],
        default: null
      }
    }
  }
};

export default schema;
