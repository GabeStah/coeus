import { FastifyInstance, FastifyPluginAsync } from 'fastify/fastify';
import status from 'src/routes/status';
import fp from 'fastify-plugin';
import mongo from 'src/routes/mongo';

const plugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.register(mongo);
  fastify.register(status);
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: 'routes'
});
