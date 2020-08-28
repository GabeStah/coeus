import 'module-alias/register';
import fastify, { FastifyInstance } from 'fastify';
import config from 'config';
import routes from 'src/plugins/routes';
import mongo from 'src/plugins/db/mongo';

const instance: FastifyInstance = fastify({
  logger: true
});

// Register plugins
// db
instance.register(mongo);
// routes
instance.register(routes);

const start = async () => {
  try {
    await instance.listen(config.get('port'));
  } catch (err) {
    instance.log.error(err);
    process.exit(1);
  }
};

start();
