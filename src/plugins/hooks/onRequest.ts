import { FastifyPluginAsync } from 'fastify';
// Import override type declaration
import { FastifyInstance } from 'fastify/types/instance';
import fp from 'fastify-plugin';

/**
 * Execute request validation logic
 *
 * @param instance
 */
const plugin: FastifyPluginAsync = async (instance: FastifyInstance) => {
  instance.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
    return;
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: 'hooks/onRequest'
});
