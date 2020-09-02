import fastify, { FastifyInstance } from 'fastify';
import mongo from 'src/plugins/db/mongo';
import routes from 'src/plugins/routes';
import validate from 'src/plugins/hooks/preValidation';
import authentication from 'src/plugins/authentication';

export function build() {
  const instance: FastifyInstance = fastify({
    logger: true
  });

  // Register plugins
  // db
  instance.register(mongo);
  // hooks
  instance.register(authentication);
  // routes
  instance.register(routes);
  // validation
  instance.register(validate);

  return instance;
}
