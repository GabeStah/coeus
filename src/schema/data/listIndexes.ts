import Collection from 'src/schema/collection';
import Database from 'src/schema/database';
import { FastifySchema } from 'fastify';

const schema: FastifySchema = {
  body: {
    type: 'object',
    required: ['collection', 'db'],
    properties: {
      batchSize: {
        type: 'number'
      },
      collection: Collection,
      db: Database,
      readPreference: {
        type: 'string',
        enum: [
          'primary',
          'primaryPreferred',
          'secondary',
          'secondaryPreferred',
          'nearest'
        ]
      }
    }
  }
};

export default schema;
