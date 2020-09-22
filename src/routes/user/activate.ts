import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import {
  UserService,
  UserServiceActivateParams
} from 'src/services/UserService';
import { Utility } from 'src/helpers/Utility';
import { sendOnActivationEmail } from 'src/plugins/mail/generators';

const plugin: FastifyPluginAsync = async (instance: FastifyInstance) => {
  instance.route<{
    Body: UserServiceActivateParams;
  }>({
    config: {
      rateLimit: Utility.getRateLimitConfig()
    },
    handler: async (request, reply) => {
      const user = await new UserService(instance, {
        payload: request.payload
      }).activate({
        id: request.body.id,
        srn: request.body.srn,
        username: request.body.username
      });

      // Add user to context for hook handling
      instance.requestContext.set('user', user);

      return {
        statusCode: 200,
        message: 'User activated'
      };
    },
    method: 'POST',
    onResponse: [instance.updateUserHashMap, sendOnActivationEmail],
    preValidation: [instance.verifyJwt],
    schema: {
      body: {
        type: 'object',
        properties: {
          id: {
            type: 'string'
          },
          srn: {
            type: 'string'
          },
          username: {
            type: 'string'
          }
        },
        oneOf: [
          {
            required: ['id']
          },
          {
            required: ['srn']
          },
          {
            required: ['username']
          }
        ]
      }
    },
    url: Utility.route(['user.prefix', 'user.activate'])
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: `routes${Utility.route(['user.prefix', 'user.activate'])}`
});
