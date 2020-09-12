import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import {
  DataService,
  DataServiceDeleteParams,
  DataServiceParams
} from 'src/services/DataService';
import { Utility } from 'src/helpers/Utility';
import { schema } from 'src/schema';

const plugin: FastifyPluginAsync = async (instance: FastifyInstance) => {
  instance.route<{
    Body: DataServiceParams & DataServiceDeleteParams;
  }>({
    handler: async (request, reply) => {
      return new DataService(instance, {
        db: request.body.db,
        collection: request.body.collection,
        payload: request.payload
      }).delete({
        filter: request.body.filter,
        options: request.body.options
      });
    },
    preValidation: [instance.verifyJwt],
    method: 'POST',
    schema: {
      body: {
        type: 'object',
        required: ['collection', 'db', 'filter'],
        properties: {
          collection: schema.collection,
          db: schema.db,
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
    },
    url: Utility.route(['data.prefix', 'data.delete'])
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: `routes${Utility.route(['data.prefix', 'data.delete'])}`
});
