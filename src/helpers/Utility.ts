import bcrypt from 'bcryptjs';
import config from 'config';
import hash from 'object-hash';
import crypto from 'crypto';
import { FastifyRequest } from 'fastify';

/**
 * Utility helper class.
 */
export class Utility {
  /**
   * Generate an SRN string from org and username.
   *
   * @param org
   * @param username
   * @private
   */
  public static buildSrn({ org, username }: { org: string; username: string }) {
    return `srn:coeus:${org}::user/${username}`;
  }

  /**
   * Determine if passwords match.
   *
   * @param password
   * @param hash
   */
  public static async doPasswordsMatch(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate a randomized token.
   */
  public static generateToken(size = 60, encoding: BufferEncoding = 'hex') {
    return crypto.randomBytes(size).toString(encoding);
  }

  /**
   * Hash the passed data.
   *
   * @param data
   */
  public static hash(data: any) {
    return hash(data);
  }

  /**
   * Hash salted password.
   *
   * @param password
   * @param iterations
   * @private
   */
  public static async hashPassword({
    password,
    iterations = 10
  }: {
    password: string;
    iterations?: number;
  }) {
    const salt = await bcrypt.genSalt(iterations);
    return bcrypt.hash(password, salt);
  }

  /**
   * Determine if header indicates test environment.
   *
   * @param request
   */
  public static isTest(request: FastifyRequest) {
    return request.headers['x-source-type'] === 'test';
  }

  /**
   * Build full route string.
   *
   * @param routes
   */
  public static route(routes: Array<string> | string) {
    if (typeof routes == 'string') {
      return config.get(`routes.${routes}`);
    }
    return routes
      .map((value: string) => config.get(`routes.${value}`))
      .reduce(
        (accumulator: string, currentValue: string, index: number): string => {
          return accumulator + currentValue;
        }
      );
  }
}
