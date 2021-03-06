import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import {
  DataService,
  DataServiceDeleteParams,
  DataServiceParams
} from 'src/services/DataService';
import { Utility } from 'src/helpers/Utility';
import schema from 'src/schema/data/delete';

const plugin: FastifyPluginAsync = async (instance: FastifyInstance) => {
  instance.route<{
    Body: DataServiceParams & DataServiceDeleteParams;
  }>({
    config: {
      rateLimit: Utility.getRateLimitConfig()
    },
    handler: async (request, reply) =>
      new DataService(instance, {
        db: request.body.db,
        collection: request.body.collection,
        payload: request.payload,
        request
      }).delete({
        filter: request.body.filter,
        options: request.body.options
      }),
    method: 'POST',
    preValidation: [instance.verifyJwt],
    schema: schema,
    url: Utility.route(['data.prefix', 'data.delete'])
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: `routes${Utility.route(['data.prefix', 'data.delete'])}`
});
