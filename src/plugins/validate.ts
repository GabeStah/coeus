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
  instance.addHook('preValidation', async (request, reply) => {
    return;
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: 'hooks/preValidation'
});
