import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest
} from 'fastify/fastify';
// Import override type declaration
import fastify from '../@types/fastify';
import fp from 'fastify-plugin';
import fastifyJwt from 'fastify-jwt';

const plugin: FastifyPluginAsync = async (instance: FastifyInstance) => {
  // JSON Web Token
  instance.register(fastifyJwt, {
    secret: 'mysecret'
  });

  // Add MongoDB property to instance
  instance.decorate('authenticate', async function(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const payload = await request.jwtVerify();
      await instance.mongo.client
        .db()
        .admin()
        .command({
          updateUser: 'soldatatester',
          customData: {
            payload: payload
          }
        });
    } catch (err) {
      reply.send(err);
    }
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: 'plugins/hooks/preValidation'
});
