import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import {
  DataService,
  DataServiceListIndexesParams,
  DataServiceParams
} from 'src/services/DataService';
import { Utility } from 'src/helpers/Utility';
import schema from 'src/schema/data/listIndexes';

const plugin: FastifyPluginAsync = async (instance: FastifyInstance) => {
  instance.route<{
    Body: DataServiceParams & DataServiceListIndexesParams;
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
      }).listIndexes({
        batchSize: request.body.batchSize,
        readPreference: request.body.readPreference
      }),
    method: 'POST',
    preValidation: [instance.verifyJwt],
    schema: schema,
    url: Utility.route(['data.prefix', 'data.listIndexes'])
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: `routes${Utility.route(['data.prefix', 'data.listIndexes'])}`
});
