import { MongoClient } from 'mongodb';
import {
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerBase,
  RawServerDefault
} from 'fastify/types/utils';
import { FastifyLoggerInstance } from 'fastify/types/logger';
import Mail from 'nodemailer/lib/mailer';
import { UserHashMap } from 'src/plugins/authentication';

declare module 'fastify' {
  /**
   * Override with app-decorated properties
   */
  export interface FastifyInstance<
    RawServer extends RawServerBase = RawServerDefault,
    RawRequest extends RawRequestDefaultExpression<
      RawServer
    > = RawRequestDefaultExpression<RawServer>,
    RawReply extends RawReplyDefaultExpression<
      RawServer
    > = RawReplyDefaultExpression<RawServer>,
    Logger = FastifyLoggerInstance
  > {
    mailer: Mail;
    testMailer: Mail;
    mongo: { client: MongoClient };
    userHashMap: UserHashMap;
    updateUserHashMap: () => void;
    verifyJwt: any;
  }

  interface FastifyRequest {
    payload?: any;
  }
}
