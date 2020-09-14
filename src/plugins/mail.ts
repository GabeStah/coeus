import { FastifyInstance, FastifyPluginAsync } from 'fastify/fastify';
import fp from 'fastify-plugin';
import nodemailer from 'nodemailer';
import ses from 'aws-sdk/clients/ses';
import config from 'config';

/**
 * Mail plugin to handling outgoing messages.
 *
 * @param fastify
 */
const plugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.decorate(
    'mailer',
    nodemailer.createTransport({
      SES: new ses({
        apiVersion: '2010-12-01',
        accessKeyId: config.get('services.aws.ses.accessKey'),
        region: config.get('services.aws.ses.region'),
        secretAccessKey: config.get('services.aws.ses.secretKey')
      })
    })
  );
};

export default fp(plugin, {
  fastify: '3.3.x',
  name: 'mail'
});
