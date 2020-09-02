import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import {
  MongoService,
  MongoServiceFindParams,
  MongoServiceParams
} from 'src/services/mongo-service';
import config from 'config';

const plugin: FastifyPluginAsync = async (instance: FastifyInstance) => {
  instance.route<{
    Body: MongoServiceParams & MongoServiceFindParams;
  }>({
    handler: async (request, reply) => {
      return new MongoService(instance, {
        db: request.body.db,
        collection: request.body.collection
      }).find({
        limit: request.body.limit,
        query: request.body.query,
        options: request.body.options
      });
    },
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
    url: '/find'
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: 'route:mongo'
});
