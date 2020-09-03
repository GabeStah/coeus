import { FastifyInstance, FastifyPluginAsync } from 'fastify/fastify';
import fp from 'fastify-plugin';
import find from 'src/routes/find';
import login from 'src/routes/auth/login';
import register from 'src/routes/auth/register';
import status from 'src/routes/status';

const plugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.register(find);
  fastify.register(register);
  fastify.register(login);
  fastify.register(status);
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: 'routes'
});
