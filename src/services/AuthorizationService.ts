import { User } from 'src/models/User';
import HttpError from 'http-errors';

export interface AuthorizationServiceParams {
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
  private readonly service: string;
  private readonly user?: User;

  protected constructor({ payload, service }: AuthorizationServiceParams) {
    this.service = service;
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
    this.authorizeUser();
    this.authorizePolicy({ collection, db, method });
    return this;
  }

  /**
   * Authorize policy against collection, db, and method.
   *
   * @param collection
   * @param db
   * @param method
   * @private
   */
  private authorizePolicy({ collection, db, method }: AuthorizeParams) {
    if (
      !this.user.policy.statement ||
      this.user.policy.statement.length === 0
    ) {
      // Deny if no user policy
      throw new HttpError.Forbidden(
        'Policy is invalid: No valid policy statement provided'
      );
    }

    for (const statement of this.user.policy.statement) {
      const matchesServiceMethod = statement.matchesServiceMethod({
        method,
        service: this.service
      });

      if (
        matchesServiceMethod &&
        statement.allow !== null &&
        statement.allow !== undefined &&
        !!statement.allow === false
      ) {
        // Deny if 'allow' property is defined and falsy
        throw new HttpError.Forbidden(
          'You do not have permission to perform the request'
        );
      }

      const matchesCollectionDatabase = statement.matchesCollectionDatabase({
        db,
        collection
      });

      if (matchesServiceMethod && matchesCollectionDatabase) {
        // Passed with allowed match
        return true;
      }
    }

    // Deny if no passing statement
    throw new HttpError.Forbidden(
      'You do not have permission to perform the request'
    );
  }

  /**
   * Authorize user.
   *
   * Ensures that user is active.
   *
   * @private
   */
  private authorizeUser() {
    if (!this.user.active) {
      // Deny if not active
      throw new HttpError.Forbidden(
        'Authorization token is invalid: User is inactive'
      );
    }
  }
}
