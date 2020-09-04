import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { UserService, UserServiceLoginParams } from 'src/services/UserService';
import { Utility } from 'src/helpers/Utility';

const plugin: FastifyPluginAsync = async (instance: FastifyInstance) => {
  instance.route<{
    Body: UserServiceLoginParams;
  }>({
    handler: async (request, reply) => {
      return new UserService(instance).login({
        password: request.body.password,
        username: request.body.username
      });
    },
    method: 'POST',
    schema: {
      body: {
        type: 'object',
        required: ['password', 'username'],
        properties: {
          password: {
            type: 'string'
          },
          username: {
            type: 'string'
          }
        }
      }
    },
    url: Utility.route(['user.prefix', 'user.login'])
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: `routes${Utility.route(['user.prefix', 'user.login'])}`
});
