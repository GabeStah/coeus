import { FastifyInstance, FastifyPluginAsync } from 'fastify/fastify';
import fp from 'fastify-plugin';
import { mailers } from 'src/plugins/mail/mailers';

/**
 * Mail plugin to handling outgoing messages.
 *
 * @param fastify
 */
const plugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  await mailers(fastify);
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: 'mail'
});
