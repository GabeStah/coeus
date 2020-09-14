import fastify, { FastifyInstance } from 'fastify';
import mongo from 'src/plugins/db/mongo';
import routes from 'src/plugins/routes';
import validate from 'src/plugins/hooks/preValidation';
import authentication from 'src/plugins/authentication';
import fastifyCompress from 'fastify-compress';
import mail from 'src/plugins/mail';
// import fastifyCaching from 'fastify-caching';
// import fastifyCors from 'fastify-cors';

export function build() {
  const instance: FastifyInstance = fastify({
    logger: true
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
  // hooks
  instance.register(authentication);
  // mail
  instance.register(mail);
  // routes
  instance.register(routes);
  // validation
  instance.register(validate);

  return instance;
}
