import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest
} from 'fastify';
import fp from 'fastify-plugin';

const plugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.route({
    url: '/status',
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      return { active: true, date: new Date() };
    },
    method: ['GET', 'POST']
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: 'routes/status'
});
