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
    handler: async (request, reply) =>
      new DataService(instance, {
        db: request.body.db,
        collection: request.body.collection,
        payload: request.payload
      }).insert({
        document: request.body.document,
        options: request.body.options
      }),
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
          options: {
            type: ['object', 'null'],
            default: null
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
