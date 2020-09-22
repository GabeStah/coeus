import { UserService } from 'src/services/UserService';
import config from 'config';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Utility } from 'src/helpers/Utility';
import nodemailer, { SentMessageInfo } from 'nodemailer';
import NodeMail from 'nodemailer/lib/mailer';
import { User } from 'src/models/User';

export const getTokenAttachmentConfiguration = function({
  token,
  user
}: {
  token: string;
  user: User;
}) {
  return {
    content: JSON.stringify({
      Authorization: `Bearer ${token}`
    }),
    filename: `coeus.${user.username}.jwt.json`,
    contentType: 'application/json'
  };
};

export const sendEmail = async function({
  instance,
  request,
  mailOptions
}: {
  instance: FastifyInstance;
  request: FastifyRequest;
  mailOptions: NodeMail.Options;
}) {
  if (Utility.isTest(request)) {
    const info: SentMessageInfo = await instance.testMailer.sendMail(
      mailOptions
    );
    request.log.info(`Email preview: ${nodemailer.getTestMessageUrl(info)}`);
  } /* istanbul ignore next */ else {
    /* istanbul ignore next */
    await instance.mailer.sendMail(mailOptions);
  }
};

/**
 * Send activation email to passed user
 *
 * @param request
 * @param reply
 * @param next
 */
export const sendOnActivationEmail = async function(
  request: FastifyRequest,
  reply: FastifyReply,
  next: any
) {
  const user = this.requestContext.get('user');

  if (user && user.email && user.active && user.verified) {
    const token = await this.jwt.sign(await user.toSignature());
    const mailOptions: NodeMail.Options = {
      from: `"${config.get('mail.from.name')}" <${config.get(
        'mail.from.address'
      )}>`,
      attachments: [getTokenAttachmentConfiguration({ user, token })],
      to: user.email,
      subject: 'Account Activated',
      text: `Your Coeus account (${user.username}) has been activated.  Your authorization token is required to make Coeus API requests.  Please keep it secret and secure.  Token: ${token}`,
      html: `Your Coeus account (${user.username}) has been activated.  Your authorization token is required to make Coeus API requests.  <strong>Please keep it secret and secure.</strong><h3>Token</h3><code style="white-space: pre-wrap;
    white-space: -moz-pre-wrap;
    white-space: -o-pre-wrap;
    word-wrap: break-word;
    background-color: #fffaf0;">${token}</code>`
    };

    await sendEmail({
      instance: this,
      request,
      mailOptions
    });
  }
};

/**
 * Send token email to passed user
 *
 * @param request
 * @param reply
 * @param next
 */
export const sendTokenEmail = async function(
  request: FastifyRequest,
  reply: FastifyReply,
  next: any
) {
  const sendTokenEmail = this.requestContext.get('sendTokenEmail');
  if (!sendTokenEmail) {
    // Short circuit if shouldn't send
    return true;
  }
  const user = this.requestContext.get('user');

  if (user && user.email && user.active && user.verified) {
    const token = await this.jwt.sign(await user.toSignature());
    const mailOptions: NodeMail.Options = {
      from: `"${config.get('mail.from.name')}" <${config.get(
        'mail.from.address'
      )}>`,
      attachments: [getTokenAttachmentConfiguration({ user, token })],
      to: user.email,
      subject: 'Authentication Token',
      text: `Below you'll find your requested Coeus authorization token for the (${user.username}) account.  Your authorization token is required to make Coeus API requests.  Please keep it secret and secure.  Token: ${token}`,
      html: `Below you'll find your requested Coeus authorization token for the (${user.username}) account.  Your authorization token is required to make Coeus API requests.  <strong>Please keep it secret and secure.</strong><h3>Token</h3><code style="white-space: pre-wrap;
    white-space: -moz-pre-wrap;
    white-space: -o-pre-wrap;
    word-wrap: break-word;
    background-color: #fffaf0;">${token}</code>`
    };

    await sendEmail({
      instance: this,
      request,
      mailOptions
    });
  }
};

/**
 * Send verification email to passed user
 *
 * @param request
 * @param reply
 * @param next
 */
export const sendOnVerificationEmail = async function(
  request: FastifyRequest,
  reply: FastifyReply,
  next: any
) {
  const user = this.requestContext.get('user');

  if (user && user.email && !user.verified) {
    const url = UserService.getVerificationUrl(user.verificationToken.value);
    const mailOptions = {
      from: `"${config.get('mail.from.name')}" <${config.get(
        'mail.from.address'
      )}>`,
      to: user.email,
      subject: 'Email Verification',
      text: `Please verify your email address for the ${user.username} account by opening the following link: ${url}`,
      html: `Please verify your email address for the ${user.username} account by clicking the link below:<br/><br/><a href="${url}">${url}</a>`
    };

    await sendEmail({ instance: this, request, mailOptions });
  }
};
