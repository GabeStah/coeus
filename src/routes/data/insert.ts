import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import {
  DataService,
  DataServiceInsertParams,
  DataServiceParams
} from 'src/services/DataService';
import { Utility } from 'src/helpers/Utility';
import { schema } from 'src/schema';

const plugin: FastifyPluginAsync = async (instance: FastifyInstance) => {
  instance.route<{
    Body: DataServiceParams & DataServiceInsertParams;
  }>({
    handler: async (request, reply) => {
      return new DataService(instance, {
        db: request.body.db,
        collection: request.body.collection,
        payload: request.payload
      }).insert({
        document: request.body.document,
        ordered: request.body.ordered
      });
    },
    preValidation: [instance.verifyJwt],
    method: 'POST',
    schema: {
      body: {
        type: 'object',
        required: ['collection', 'db', 'document'],
        properties: {
          collection: schema.collection,
          db: schema.db,
          document: {
            type: 'array',
            items: {
              type: 'object',
              default: {}
            },
            minItems: 1
          },
          ordered: {
            type: 'boolean',
            default: true
          }
        }
      }
    },
    url: Utility.route(['data.prefix', 'data.insert'])
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: `routes${Utility.route(['data.prefix', 'data.insert'])}`
});
