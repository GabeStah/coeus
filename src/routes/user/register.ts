import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { UserService, UserServiceCreateParams } from 'src/services/UserService';
import { Utility } from 'src/helpers/Utility';
import config from 'config';

const plugin: FastifyPluginAsync = async (instance: FastifyInstance) => {
  instance.route<{
    Body: UserServiceCreateParams;
  }>({
    handler: async (request, reply) => {
      return new UserService(instance).create({
        email: request.body.email,
        org: request.body.org,
        password: request.body.password,
        username: request.body.username,
        policy: request.body.policy
      });
    },
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
                      type: ['array', 'string'],
                      enum: [
                        '*',
                        'admin:*',
                        'data:*',
                        'data:delete',
                        'data:find',
                        'data:insert',
                        'data:update'
                      ],
                      items: {
                        type: 'string',
                        enum: [
                          '*',
                          'admin:*',
                          'data:*',
                          'data:delete',
                          'data:find',
                          'data:insert',
                          'data:update'
                        ]
                      }
                    },
                    allow: {
                      type: 'boolean',
                      default: true
                    },
                    resource: {
                      type: ['array', 'string'],
                      pattern: '^(?!coeus).+',
                      items: {
                        type: 'string',
                        pattern: '^(?!coeus).+'
                      }
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
