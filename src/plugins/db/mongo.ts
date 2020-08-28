import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { MongoClient } from 'mongodb';
import config from 'config';

/**
 * Registers MongoDB client and establishes hooks for connection creation/closure.
 *
 * @param instance
 */
const plugin: FastifyPluginAsync = async (instance: FastifyInstance) => {
  // Add MongoDB property to instance
  instance.decorate('mongo', {
    client: MongoClient
  });

  // Add db client and connect
  instance.addHook('onReady', async done => {
    instance.mongo.client = new MongoClient(config.get('db.mongo.uri'));
    await instance.mongo.client.connect();
    done();
  });

  // Close db connection on app close
  instance.addHook('onClose', async (instance: FastifyInstance) => {
    return instance.mongo.client.close();
  });
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: 'db:mongo'
});
