import { UserService } from 'src/services/UserService';
import config from 'config';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Utility } from 'src/helpers/Utility';
import nodemailer, { SentMessageInfo } from 'nodemailer';

/**
 * Send verification email to passed user
 *
 * @param request
 * @param reply
 * @param next
 */
export const sendVerificationEmail = async function(
  request: FastifyRequest,
  reply: FastifyReply,
  next: any
) {
  const user = this.requestContext.get('user');

  if (user && user.email && !user.verified) {
    // Send verification email
    const url = UserService.getVerificationUrl(user.verificationToken.value);
    const mailOptions = {
      from: `"${config.get('mail.from.name')}" <${config.get(
        'mail.from.address'
      )}>`,
      to: user.email,
      subject: 'Email Verification',
      text: `Please verify your email address by opening the following link: ${url}`,
      html: `Please verify your email address by clicking the link below:<br/><br/><a href="${url}">${url}</a>`
    };

    if (Utility.isTest(request)) {
      const info: SentMessageInfo = await this.testMailer.sendMail(mailOptions);
      request.log.info(`Email preview: ${nodemailer.getTestMessageUrl(info)}`);
    } else {
      await this.mailer.sendMail(mailOptions);
    }
  }
};
