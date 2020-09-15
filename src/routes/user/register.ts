import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { UserService, UserServiceCreateParams } from 'src/services/UserService';
import { Utility } from 'src/helpers/Utility';
import config from 'config';
import { sendVerificationEmail } from 'src/helpers/Mail';

const plugin: FastifyPluginAsync = async (instance: FastifyInstance) => {
  instance.route<{
    Body: UserServiceCreateParams;
  }>({
    handler: async (request, reply) => {
      const user = await new UserService(instance).create({
        email: request.body.email,
        org: request.body.org,
        password: request.body.password,
        username: request.body.username,
        policy: request.body.policy
      });

      // Update hash map
      await instance.updateUserHashMap();

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
    onResponse: [sendVerificationEmail],
    method: 'POST',
    schema: {
      body: {
        type: 'object',
        required: ['email', 'org', 'username', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email'
          },
          org: {
            type: 'string',
            minLength: 2
          },
          username: {
            type: 'string',
            minLength: 4
          },
          password: {
            type: 'string',
            minLength: 8
          },
          policy: {
            type: 'object',
            required: ['statement'],
            properties: {
              statement: {
                type: 'array',
                uniqueItems: true,
                items: {
                  type: 'object',
                  required: ['action', 'resource'],
                  properties: {
                    action: {
                      oneOf: [
                        {
                          type: 'string',
                          enum: config.get('policy.statement.action.values')
                        },
                        {
                          type: 'array',
                          items: {
                            type: 'string',
                            enum: config.get('policy.statement.action.values')
                          }
                        }
                      ]
                    },
                    allow: {
                      type: 'boolean',
                      default: true
                    },
                    resource: {
                      oneOf: [
                        {
                          type: 'array',
                          items: {
                            type: 'string',
                            pattern: '^(?!coeus).+'
                          }
                        },
                        {
                          type: 'string',
                          pattern: '^(?!coeus).+'
                        }
                      ]
                    }
                  }
                }
              },
              version: {
                type: 'string',
                default: config.get('version')
              }
            }
          }
        }
      }
    },
    url: Utility.route(['user.prefix', 'user.register'])
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: `routes${Utility.route(['user.prefix', 'user.register'])}`
});
