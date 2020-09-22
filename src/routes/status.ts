import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest
} from 'fastify';
import fp from 'fastify-plugin';
import { Utility } from 'src/helpers/Utility';

const plugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.route({
    config: {
      rateLimit: Utility.getRateLimitConfig()
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      return { active: true, date: new Date() };
    },
    method: ['GET', 'POST'],
    url: '/status'
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: 'routes/status'
});
