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
import { UserService } from 'src/services/UserService';
import HttpError from 'http-errors';

export type UserHashMap = { [key: string]: string };

const plugin: FastifyPluginAsync = async (instance: FastifyInstance) => {
  if (!config.get('security.jwt.secret')) {
    throw new Error("'security.jwt.secret' MUST be defined.");
  }

  // register JWT
  instance.register(fastifyJwt, {
    secret: config.get('security.jwt.secret'),
    sign: {
      issuer: config.get('security.jwt.sign.issuer'),
      noTimestamp: true
    },
    verify: {
      issuer: config.get('security.jwt.verify.issuer')
    }
  });

  instance.decorate('userHashMap', {});

  /**
   * Update user hash map from db
   */
  instance.decorate('updateUserHashMap', async function () {
    const result = await new UserService(instance).find({ query: {} });
    const userHashMap: UserHashMap = {};
    for (const user of result) {
      userHashMap[user.id] = await user.toHash();
    }
    instance.userHashMap = userHashMap;
  });

  instance.addHook('onReady', async done => {
    // Load initial user hash map on app init
    await instance.updateUserHashMap();
    done();
  });

  // Add JWT verification method to instance
  instance.decorate('verifyJwt', async function (
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    request.payload = <Partial<User>>await request.jwtVerify();

    if (
      !request.payload.id ||
      !request.payload.hash ||
      !instance.userHashMap.hasOwnProperty(request.payload.id) ||
      instance.userHashMap[request.payload.id] !== request.payload.hash
    ) {
      // If request has no id or hash, if cache hashmap has no matching id,
      // or if hashmap does not match then deny request
      throw new HttpError.Unauthorized(
        'Authorization token is out of date. Please obtain a new token and try again.'
      );
    }

    return;
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: 'plugins/authentication'
});
