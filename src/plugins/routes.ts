import { FastifyInstance, FastifyPluginAsync } from 'fastify/fastify';
import fp from 'fastify-plugin';
import find from 'src/routes/find';
import status from 'src/routes/status';
import validate from 'src/plugins/validate';

const plugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.register(find);
  fastify.register(status);
  fastify.register(validate);
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: 'routes'
});
