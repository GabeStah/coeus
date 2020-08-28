import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest
} from 'fastify';
import fp from 'fastify-plugin';
import { Collection } from 'mongodb';

const plugin: FastifyPluginAsync = async (instance: FastifyInstance) => {
  instance.route({
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const collection: Collection = instance.mongo.client
        .db('sample_airbnb')
        .collection('listingsAndReviews');

      const data = collection.find({}, { limit: 5 });

      return data.toArray();
    },
    method: 'POST',
    url: '/mongo'
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: 'route:mongo'
});
