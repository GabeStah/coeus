import fastify, { FastifyInstance, FastifyRequest } from 'fastify';
import pino from 'pino';
import authentication from 'src/plugins/authentication';
import mongo from 'src/plugins/db/mongo';
import rateLimiter from 'src/plugins/rate-limiter';
import routes from 'src/plugins/routes';
import validate from 'src/plugins/hooks/preValidation';
import fastifyCompress from 'fastify-compress';
import mail from 'src/plugins/mail';
import { fastifyRequestContextPlugin } from 'fastify-request-context';
// import fastifyCaching from 'fastify-caching';
// import fastifyCors from 'fastify-cors';

export function build() {
  const instance: FastifyInstance = fastify({
    logger: pino({
      level: 'info',
      redact: ['req.headers.authorization', 'body.password'],
      serializers: {
        req(req: FastifyRequest) {
          return {
            method: req.method,
            url: req.url,
            headers: req.headers,
            hostname: req.hostname,
            remoteAddress: req.ip,
            remotePort: req.connection.remotePort
          };
        }
      }
    })
  });

  instance.addHook('preHandler', function(req, reply, done) {
    if (req.body) {
      req.log.info({ payload: req.payload, body: req.body }, 'request content');
    }
    done();
  });

  // Compression
  instance.register(fastifyCompress);

  // Caching
  // instance.register(fastifyCaching);

  // CORS
  // instance.register(fastifyCors, {
  //   origin: ['http://example.com']
  // });

  // Register plugins
  // db
  instance.register(mongo);
  // mail
  instance.register(mail);
  // request context
  instance.register(fastifyRequestContextPlugin, {
    hook: 'preValidation'
  });

  instance.register(rateLimiter);
  // hooks
  instance.register(authentication);
  // routes
  instance.register(routes);
  // validation
  instance.register(validate);

  return instance;
}
