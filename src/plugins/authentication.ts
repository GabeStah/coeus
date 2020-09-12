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
import config from 'config';
import { User } from 'src/models/User';

const plugin: FastifyPluginAsync = async (instance: FastifyInstance) => {
  if (!config.get('security.jwt.secret')) {
    throw new Error("'security.jwt.secret' MUST be defined.");
  }

  // register JWT
  instance.register(fastifyJwt, {
    secret: config.get('security.jwt.secret'),
    sign: {
      issuer: config.get('security.jwt.sign.issuer')
    },
    verify: {
      issuer: config.get('security.jwt.verify.issuer')
    }
  });

  // Add JWT verification method to instance
  instance.decorate('verifyJwt', async function(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    request.payload = <Partial<User>>await request.jwtVerify();

    return;
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: 'plugins/authentication'
});
