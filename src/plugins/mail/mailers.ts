import { FastifyInstance } from 'fastify';
import nodemailer from 'nodemailer';
import ses from 'aws-sdk/clients/ses';
import config from 'config';
import sendgridMailer from '@sendgrid/mail';

export async function mailers(fastify: FastifyInstance) {
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

  sendgridMailer.setApiKey(config.get('services.sendgrid.apiKey'));

  fastify.decorate('sendgridMailer', sendgridMailer);

  const testAccount = await nodemailer.createTestAccount();

  fastify.decorate(
    'testMailer',
    nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    })
  );
}
