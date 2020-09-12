import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import {
  DataService,
  DataServiceParams,
  DataServiceUpdateParams
} from 'src/services/DataService';
import { Utility } from 'src/helpers/Utility';
import { schema } from 'src/schema';

const plugin: FastifyPluginAsync = async (instance: FastifyInstance) => {
  instance.route<{
    Body: DataServiceParams & DataServiceUpdateParams;
  }>({
    handler: async (request, reply) =>
      new DataService(instance, {
        db: request.body.db,
        collection: request.body.collection,
        payload: request.payload
      }).update({
        filter: request.body.filter,
        options: request.body.options,
        update: request.body.update
      }),
    preValidation: [instance.verifyJwt],
    method: 'POST',
    schema: {
      body: {
        type: 'object',
        required: ['collection', 'db', 'filter', 'update'],
        properties: {
          collection: schema.collection,
          db: schema.db,
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
    },
    url: Utility.route(['data.prefix', 'data.update'])
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: `routes${Utility.route(['data.prefix', 'data.update'])}`
});
