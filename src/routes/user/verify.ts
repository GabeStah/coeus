import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { UserService, UserServiceVerifyParams } from 'src/services/UserService';
import { Utility } from 'src/helpers/Utility';

const plugin: FastifyPluginAsync = async (instance: FastifyInstance) => {
  instance.route<{
    Querystring: UserServiceVerifyParams;
  }>({
    handler: async (request, reply) => {
      return new UserService(instance).verify({
        token: request.query.token
      });
    },
    method: 'GET',
    schema: {
      querystring: {
        token: {
          type: 'string',
          minLength: 60
        }
      }
    },
    url: Utility.route(['user.prefix', 'user.verify'])
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: `routes${Utility.route(['user.prefix', 'user.verify'])}`
});
