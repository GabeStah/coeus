import Collection from 'src/schema/collection';
import Database from 'src/schema/database';
import { FastifySchema } from 'fastify';

const schema: FastifySchema = {
  body: {
    type: 'object',
    required: ['collection', 'db', 'indexName'],
    properties: {
      collection: Collection,
      db: Database,
      indexName: {
        type: 'string',
        minLength: 1
      },
      options: {
        type: ['object', 'null']
      }
    }
  }
};

export default schema;
