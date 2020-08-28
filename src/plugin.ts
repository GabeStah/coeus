import { FastifyInstance, FastifyPluginAsync } from 'fastify/fastify';
import fp from 'fastify-plugin';
//
// async function routes(fastify: Server, options) {
//   fastify.get('/', async (request, reply) => {
//     return { hello: 'world' }
//   })
// }
//
// module.exports = routes

export interface MyPluginOptions {
  myPluginOption: string;
}

const myPlugin: FastifyPluginAsync<MyPluginOptions> = async (
  fastify: FastifyInstance,
  options: MyPluginOptions
) => {
  fastify.decorateRequest('myPluginProp', 'super_secret_value');
  fastify.decorateReply('myPluginProp', options.myPluginOption);
};

// export default fp(
//   async (
//     fastify: FastifyInstance,
//     options: FastifyPluginOptions
//   ): Promise<void> => {}
// );

export default fp(myPlugin, {
  fastify: '3.3.x',
  name: 'routes'
});
