import { User } from 'src/models/User';
import HttpError from 'http-errors';
import { FastifyRequest } from 'fastify';
import { PolicyStatement } from 'src/models/PolicyStatement';
import { Policy } from 'src/models/Policy';
import {
  Constraint,
  HostnameConstraint,
  IpConstraint
} from 'src/models/constraint';

export interface AuthorizationServiceParams {
  request?: FastifyRequest;
  payload?: AuthorizationPayloadType;
  service: string;
}

export type AuthorizationPayloadType = object;

interface AuthorizeParams {
  collection: string;
  db: string;
  method: string;
}

/**
 * Authorization service helper.
 *
 * Should be extended by service classes that require authorization.
 */
export abstract class AuthorizationService {
  protected request: FastifyRequest;
  private readonly service: string;
  private readonly user?: User;

  protected constructor({
    payload,
    request,
    service
  }: AuthorizationServiceParams) {
    this.service = service;
    this.request = request;
    if (payload) {
      this.user = new User(payload);
    }
  }

  /**
   * Authorize service instance against collection, db, and method.
   *
   * @param collection
   * @param db
   * @param method
   */
  public authorize({ collection, db, method }: AuthorizeParams) {
    const statements = this.authorizePolicy({ collection, db, method });
    this.authorizeConstraints(statements);
    return this;
  }

  public authorizeConstraints(statements: PolicyStatement[]) {
    for (const statement of statements) {
      if (statement.constraints) {
        if (
          Constraint.find<IpConstraint>(IpConstraint, statement.constraints)
        ) {
          // Has IpConstraint
          if (
            !Constraint.find<IpConstraint>(
              IpConstraint,
              statement.constraints,
              {
                value: this.request.ip
              }
            )
          ) {
            // Has no IpConstraint with matching request IP
            throw new HttpError.Forbidden(
              `Invalid IP: Requests from ${this.request.ip} are not allowed by your Policy`
            );
          }
        }

        if (
          Constraint.find<HostnameConstraint>(
            HostnameConstraint,
            statement.constraints
          )
        ) {
          // Has HostnameConstraint
          if (
            !Constraint.find<HostnameConstraint>(
              HostnameConstraint,
              statement.constraints,
              {
                value: this.request.hostname
              }
            )
          ) {
            // Has no HostnameConstraint with matching request IP
            throw new HttpError.Forbidden(
              `Invalid hostname: Requests from ${this.request.hostname} are not allowed by your Policy`
            );
          }
        }
      }
    }
  }

  /**
   * Authorize policy against collection, db, and method.
   *
   * @param collection
   * @param db
   * @param method
   * @private
   */
  private authorizePolicy({
    collection,
    db,
    method
  }: AuthorizeParams): PolicyStatement[] {
    if (
      !this.user.policy.statement ||
      this.user.policy.statement.length === 0
    ) {
      // Deny if no user policy
      throw new HttpError.Forbidden(
        'Policy is invalid: No valid policy statement provided'
      );
    }

    const statements = PolicyStatement.find({
      statements: this.user.policy.statement,
      options: {
        collection: collection,
        db: db,
        service: this.service,
        method: method
      }
    });

    if (!statements) {
      // Deny if no passing statement
      throw new HttpError.Forbidden(
        'You do not have permission to perform the request'
      );
    }

    return statements;
  }
}
