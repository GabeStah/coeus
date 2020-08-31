import fastify, { FastifyInstance } from 'fastify';
import mongo from 'src/plugins/db/mongo';
import routes from 'src/plugins/routes';

export function build() {
  const instance: FastifyInstance = fastify({
    logger: true
  });

  // Register plugins
  // db
  instance.register(mongo);
  // routes
  instance.register(routes);

  return instance;
}
