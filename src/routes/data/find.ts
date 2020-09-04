import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import {
  DataService,
  DataServiceFindParams,
  DataServiceParams
} from 'src/services/DataService';
import config from 'config';
import { Utility } from 'src/helpers/Utility';

const plugin: FastifyPluginAsync = async (instance: FastifyInstance) => {
  instance.route<{
    Body: DataServiceParams & DataServiceFindParams;
  }>({
    handler: async (request, reply) => {
      return new DataService(instance, {
        db: request.body.db,
        collection: request.body.collection,
        payload: request.payload
      }).find({
        limit: request.body.limit,
        query: request.body.query,
        options: request.body.options
      });
    },
    preValidation: [instance.verifyJwt],
    method: 'POST',
    schema: {
      body: {
        type: 'object',
        required: ['collection', 'db'],
        properties: {
          collection: {
            type: 'string'
          },
          db: {
            type: 'string'
          },
          limit: {
            type: ['number', 'null'],
            default: config.get('db.thresholds.limit.base'),
            minimum: config.get('db.thresholds.limit.minimum'),
            maximum: config.get('db.thresholds.limit.maximum')
          },
          options: {
            type: ['object', 'null'],
            default: null
          },
          query: {
            type: ['object', 'null'],
            default: {}
          }
        }
      }
    },
    url: Utility.route(['data.prefix', 'data.find'])
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: `routes${Utility.route(['data.prefix', 'data.find'])}`
});
