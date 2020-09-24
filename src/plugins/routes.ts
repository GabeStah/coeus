import { FastifyInstance, FastifyPluginAsync } from 'fastify/fastify';
import fp from 'fastify-plugin';
import dataCreateIndex from 'src/routes/data/createIndex';
import dataDelete from 'src/routes/data/delete';
import dataDropIndex from 'src/routes/data/dropIndex';
import dataFind from 'src/routes/data/find';
import dataInsert from 'src/routes/data/insert';
import dataListIndexes from 'src/routes/data/listIndexes';
import dataUpdate from 'src/routes/data/update';
import userActivate from 'src/routes/user/activate';
import userLogin from 'src/routes/user/login';
import userRegister from 'src/routes/user/register';
import userVerify from 'src/routes/user/verify';
import status from 'src/routes/status';

const plugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.register(dataCreateIndex);
  fastify.register(dataDelete);
  fastify.register(dataDropIndex);
  fastify.register(dataFind);
  fastify.register(dataInsert);
  fastify.register(dataListIndexes);
  fastify.register(dataUpdate);
  fastify.register(userActivate);
  fastify.register(userLogin);
  fastify.register(userRegister);
  fastify.register(userVerify);
  fastify.register(status);
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: 'routes'
});
