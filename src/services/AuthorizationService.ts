import { User } from 'src/models/User';
import { IPolicyStatement, PolicyStatement } from 'src/models/PolicyStatement';

export interface AuthorizationServiceParams {
  payload?: AuthorizationPayloadType;
  service: string;
}

export type AuthorizationPayloadType = object;

/**
 * Authorization service helper.
 */
export abstract class AuthorizationService {
  private readonly service: string;
  private readonly user?: User;

  protected constructor({ payload, service }: AuthorizationServiceParams) {
    this.service = service;
    this.user = new User(payload);
  }

  public authorize({ method }: { method: string }) {
    this.authorizeUser();
    this.authorizePolicy({ method });
    return this;
  }

  private authorizePolicy({ method }: { method: string }) {
    if (
      !this.user ||
      !this.user.policy ||
      !this.user.policy.statement ||
      this.user.policy.statement.length < 0
    ) {
      // Deny if no user policy
      throw {
        statusCode: 403,
        error: 'Forbidden',
        message: 'Policy is invalid: No valid policy statement provided'
      };
    }

    this.user.policy.statement.forEach((statement: PolicyStatement) => {
      // TODO: Pass resource to ensure authorization succeeds
      statement.matchesServiceMethod({ method: method, service: this.service });
    });
  }

  private authorizeUser() {
    if (!this.user) {
      // Deny if no user
      throw {
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Authorization token is invalid: User is not valid'
      };
    }
    if (!this.user.active) {
      // Deny if not active
      throw {
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Authorization token is invalid: User is inactive'
      };
    }
  }
}
