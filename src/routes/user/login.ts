import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { UserService, UserServiceLoginParams } from 'src/services/UserService';
import { Utility } from 'src/helpers/Utility';
import { sendTokenEmail } from 'src/plugins/mail/generators';

const plugin: FastifyPluginAsync = async (instance: FastifyInstance) => {
  instance.route<{
    Body: UserServiceLoginParams;
  }>({
    config: {
      rateLimit: Utility.getRateLimitConfig()
    },
    handler: async (request, reply) => {
      const response = new UserService(instance).login({
        email: request.body.email,
        password: request.body.password,
        username: request.body.username
      });

      const user = await new UserService(instance).exists({
        username: request.body.username
      });

      // Add user to context for hook handling
      instance.requestContext.set('user', user);
      instance.requestContext.set('sendTokenEmail', !!request.body.email);

      return response;
    },
    method: 'POST',
    onResponse: [sendTokenEmail],
    schema: {
      body: {
        type: 'object',
        required: ['password', 'username'],
        properties: {
          email: {
            type: 'boolean',
            default: false
          },
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
