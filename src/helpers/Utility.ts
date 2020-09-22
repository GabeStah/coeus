import bcrypt from 'bcryptjs';
import config from 'config';
import hash from 'object-hash';
import crypto from 'crypto';
import { FastifyRequest } from 'fastify';
import { PolicyStatement } from 'src/models/PolicyStatement';
import { Policy } from 'src/models/Policy';
import { Constraint, MaxRequestsConstraint } from 'src/models/constraint/';
import { map, isArray, isObject, isPlainObject, mapValues } from 'lodash';
import { ObjectID } from 'mongodb';

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
   * Check if password value is hashed instance.
   *
   * @param value
   */
  public static isHashed(value: string) {
    return value && value.length === 60 && value.substr(0, 7) === '$2a$10$';
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
   * Get rate limit configuration.
   */
  public static getRateLimitConfig() {
    return {
      /**
       * Generates unique key for rate limit tracking.
       *
       * Use payload id if specified, otherwise ip.
       *
       * @param request
       */
      keyGenerator: (
        request: FastifyRequest<{
          Body: { db?: string; collection?: string };
        }>
      ) => {
        const payload = request.payload;
        return payload && payload.id ? payload.id : request.ip;
      },
      /**
       * Get max rate limit based on request payload constraints, or default
       *
       * @param request
       */
      max: (
        request: FastifyRequest<{
          Body: { db?: string; collection?: string };
        }>
      ) => {
        const payload = request.payload;
        if (payload) {
          const serviceMethod = Utility.getServiceAndMethodFromRouterPath(
            request.routerPath
          );

          const statements = PolicyStatement.find({
            statements: new Policy(payload.policy).statement,
            options: {
              collection: request.body.collection,
              db: request.body.db,
              service: serviceMethod.service,
              method: serviceMethod.method
            }
          });

          if (Array.isArray(statements)) {
            // Find max requests instance
            for (const statement of statements) {
              const constraints = Constraint.find<MaxRequestsConstraint>(
                MaxRequestsConstraint,
                statement.constraints
              );
              if (constraints) {
                return constraints[0].value;
              }
            }
          }
        }

        return config.get('rateLimit.maxRequests');
      },
      hookMethod: config.get('rateLimit.hookMethod'),
      timeWindow: config.get('rateLimit.timeWindow')
    };
  }

  /**
   * Get service and method from router path
   *
   * @param path
   */
  public static getServiceAndMethodFromRouterPath(
    path: string
  ): { service: string; method: string } {
    const [source, service, method] = path.match(
      /^\/([A-Za-z0-9\-]+)\/([A-Za-z0-9\-]+)/
    );
    return { service, method };
  }

  /**
   * Deeply, recursively map values of object.
   *
   * @author https://github.com/Kikobeats
   * @source https://github.com/Kikobeats/map-values-deep
   *
   * @param obj
   * @param fn
   * @param key
   */
  public static mapValuesDeep(
    obj: object,
    fn: (value: any, key: string | number) => any,
    key?: string | number
  ): any {
    if (isArray(obj)) {
      return map(obj, (innerObj, idx) => {
        return this.mapValuesDeep(innerObj, fn, idx);
      });
    } else {
      if (isPlainObject(obj)) {
        return mapValues(obj, (val, key) => {
          return this.mapValuesDeep(val, fn, key);
        });
      } else {
        if (isObject(obj)) {
          return obj;
        } else {
          return fn(obj, key);
        }
      }
    }
  }

  /**
   * Normalize query parameters.
   *
   * Replaces _id and ObjectId/ObjectID references with BSON-compatible
   * ObjectID objects.
   *
   * @param obj
   */
  public static normalizeQueryObject(obj: any) {
    const objectIdRegex = /^ObjectI[dD]\(['"]([\w\d]+)['"]\)/;
    return Utility.mapValuesDeep(obj, (value: any, key: string | number) => {
      if (typeof value === 'string') {
        if (value.match(objectIdRegex)) {
          const matches = value.match(objectIdRegex);
          return new ObjectID(matches[1]);
        } else if (key === '_id') {
          return new ObjectID(value);
        }
      }
      return value;
    });
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
