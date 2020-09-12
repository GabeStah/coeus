import { FastifyInstance, FastifyPluginAsync } from 'fastify/fastify';
import fp from 'fastify-plugin';
import dataDelete from 'src/routes/data/delete';
import dataFind from 'src/routes/data/find';
import dataInsert from 'src/routes/data/insert';
import userLogin from 'src/routes/user/login';
import userRegister from 'src/routes/user/register';
import status from 'src/routes/status';

const plugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.register(dataDelete);
  fastify.register(dataFind);
  fastify.register(dataInsert);
  fastify.register(userLogin);
  fastify.register(userRegister);
  fastify.register(status);
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: 'routes'
});
