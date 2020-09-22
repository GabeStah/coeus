import { FastifyInstance, FastifyPluginAsync } from 'fastify/fastify';
import fp from 'fastify-plugin';
import fastifyRateLimit from 'fastify-rate-limit';

const plugin: FastifyPluginAsync = async (instance: FastifyInstance) => {
  instance.register(fastifyRateLimit);
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: 'plugins/rate-limiter'
});
