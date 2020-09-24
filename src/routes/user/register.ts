import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { UserService, UserServiceCreateParams } from 'src/services/UserService';
import { Utility } from 'src/helpers/Utility';
import { sendOnVerificationEmail } from 'src/plugins/mail/generators';
import { UserSchema } from 'src/schema/user';

const plugin: FastifyPluginAsync = async (instance: FastifyInstance) => {
  instance.route<{
    Body: UserServiceCreateParams;
  }>({
    config: {
      rateLimit: Utility.getRateLimitConfig()
    },
    handler: async (request, reply) => {
      const user = await new UserService(instance, { request }).create({
        email: request.body.email,
        org: request.body.org,
        password: request.body.password,
        username: request.body.username,
        policy: request.body.policy
      });

      // Add user to context for hook handling
      instance.requestContext.set('user', user);

      return {
        message: 'User successfully created.',
        data: {
          active: user.active,
          email: user.email,
          org: user.org,
          policy: user.policy.toObject(),
          srn: user.srn,
          username: user.username,
          verified: user.verified
        }
      };
    },
    onResponse: [instance.updateUserHashMap, sendOnVerificationEmail],
    method: 'POST',
    schema: UserSchema,
    url: Utility.route(['user.prefix', 'user.register'])
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: `routes${Utility.route(['user.prefix', 'user.register'])}`
});
