import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import {
  DataService,
  DataServiceCreateIndexParams,
  DataServiceParams
} from 'src/services/DataService';
import { Utility } from 'src/helpers/Utility';
import schema from 'src/schema/data/createIndex';

const plugin: FastifyPluginAsync = async (instance: FastifyInstance) => {
  instance.route<{
    Body: DataServiceParams & DataServiceCreateIndexParams;
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
      }).createIndex({
        fieldOrSpec: request.body.fieldOrSpec,
        options: request.body.options
      }),
    method: 'POST',
    preValidation: [instance.verifyJwt],
    schema: schema,
    url: Utility.route(['data.prefix', 'data.createIndex'])
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: `routes${Utility.route(['data.prefix', 'data.createIndex'])}`
});
