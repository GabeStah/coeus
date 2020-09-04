import { MongoClient } from "mongodb";
import {
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerBase,
  RawServerDefault
} from "fastify/types/utils";
import { FastifyLoggerInstance } from "fastify/types/logger";

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
    mongo: { client: MongoClient };
    verifyJwt: any;
  }

  interface FastifyRequest {
    payload?: any;
  }
}
