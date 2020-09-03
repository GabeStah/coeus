import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { UserService, UserServiceCreateParams } from 'src/services/UserService';

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
        privileges: request.body.privileges
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
          privileges: {
            type: 'array',
            uniqueItems: true,
            items: {
              type: 'object',
              required: ['actions', 'resource'],
              properties: {
                resource: {
                  type: 'object',
                  required: ['db', 'collection'],
                  properties: {
                    collection: {
                      type: ['string', 'null']
                    },
                    db: {
                      type: 'string',
                      pattern: '^(?!coeus).+'
                    }
                  }
                },
                actions: {
                  type: ['array', 'string'],
                  enum: ['delete', 'find', 'insert', 'update'],
                  items: {
                    type: 'string',
                    enum: ['delete', 'find', 'insert', 'update']
                  }
                }
              }
            }
          }
        }
      }
    },
    url: '/auth/register'
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: 'routes/auth/register'
});
