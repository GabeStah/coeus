import config from 'config';

export interface IPolicyStatement {
  action: Array<string> | string;
  allow?: boolean;
  resource: Array<string> | string;
}

interface ComparisonParams {
  policyValue: string;
  requestValue: string;
}

export class PolicyStatement implements IPolicyStatement {
  action: Array<string> | string;
  allow?: boolean = true;
  resource: Array<string> | string;
  private actionSeparator: string = config.get(
    'policy.statement.action.separator'
  );
  private resourceSeparator: string = config.get(
    'policy.statement.resource.separator'
  );
  private wildcard: string = config.get('policy.statement.wildcard');

  constructor(params: IPolicyStatement) {
    this.action = params.action;
    this.allow = params.allow;
    this.resource = params.resource;
  }

  /**
   * Compare policy and request collection strings for match.
   *
   * @param policyValue
   * @param requestValue
   * @private
   */
  private compareCollections({
    policyValue,
    requestValue
  }: ComparisonParams): boolean {
    if (policyValue === this.wildcard) {
      // Always match wildcard
      return true;
    }
    return policyValue.toLowerCase() === requestValue.toLowerCase();
  }

  /**
   * Compare policy and request database strings for match.
   *
   * @param policyValue
   * @param requestValue
   * @private
   */
  private static compareDatabases({
    policyValue,
    requestValue
  }: ComparisonParams): boolean {
    return policyValue.toLowerCase() === requestValue.toLowerCase();
  }

  /**
   * Compare policy and request method strings for match.
   *
   * @param policyValue
   * @param requestValue
   * @private
   */
  private compareMethods({
    policyValue,
    requestValue
  }: ComparisonParams): boolean {
    if (policyValue === this.wildcard) {
      // Always match wildcard
      return true;
    }
    return policyValue.toLowerCase() === requestValue.toLowerCase();
  }

  /**
   * Compare policy and request service strings for match.
   *
   * @param policyValue
   * @param requestValue
   * @private
   */
  private static compareServices({
    policyValue,
    requestValue
  }: ComparisonParams): boolean {
    return policyValue.toLowerCase() === requestValue.toLowerCase();
  }

  /**
   * Get database and collection string tuple from resource string.
   *
   * @param resource
   * @private
   */
  private getDatabaseAndCollectionFromResource(
    resource: string
  ): [string, string] {
    const [db, collection] = resource.split(this.resourceSeparator);
    return [db, collection];
  }

  /**
   * Get service and method string tuple from resource string.
   *
   * @param action
   * @private
   */
  private getServiceAndMethodFromAction(action: string): [string, string] {
    const [service, method] = action.split(this.actionSeparator);
    return [service, method];
  }

  /**
   * Matches passed request collection and db to local resource.
   *
   * @param collection
   * @param db
   */
  public matchesCollectionDatabase({
    db,
    collection
  }: {
    db: string;
    collection: string;
  }) {
    if (typeof this.resource === 'string') {
      // short circuit if resource is wildcard
      if (this.resource === this.wildcard) {
        return true;
      }

      const [
        policyDatabase,
        policyCollection
      ] = this.getDatabaseAndCollectionFromResource(this.resource);

      return (
        PolicyStatement.compareDatabases({
          policyValue: policyDatabase,
          requestValue: db
        }) &&
        this.compareCollections({
          policyValue: policyCollection,
          requestValue: collection
        })
      );
    } else {
      for (const resource of this.resource) {
        // short circuit if resource is wildcard
        if (resource === this.wildcard) {
          return true;
        }

        const [
          policyDatabase,
          policyCollection
        ] = this.getDatabaseAndCollectionFromResource(resource);

        if (
          PolicyStatement.compareDatabases({
            policyValue: policyDatabase,
            requestValue: db
          }) &&
          this.compareCollections({
            policyValue: policyCollection,
            requestValue: collection
          })
        ) {
          // Match
          return true;
        }
      }
      // No match
      return false;
    }
  }

  /**
   * Matches passed request service and method to local action.
   *
   * @param service
   * @param method
   */
  public matchesServiceMethod({
    service,
    method
  }: {
    service: string;
    method: string;
  }) {
    if (typeof this.action === 'string') {
      const [policyService, policyMethod] = this.getServiceAndMethodFromAction(
        this.action
      );

      // Match
      return (
        PolicyStatement.compareServices({
          policyValue: policyService,
          requestValue: service
        }) &&
        this.compareMethods({
          policyValue: policyMethod,
          requestValue: method
        })
      );
    } else {
      for (const action of this.action) {
        const [
          policyService,
          policyMethod
        ] = this.getServiceAndMethodFromAction(action);
        if (
          PolicyStatement.compareServices({
            policyValue: policyService,
            requestValue: service
          }) &&
          this.compareMethods({
            policyValue: policyMethod,
            requestValue: method
          })
        ) {
          // Match
          return true;
        }
      }
      // No match
      return false;
    }
  }

  /**
   * Convert to object.
   */
  public toObject() {
    return {
      action: this.action,
      allow: this.allow,
      resource: this.resource
    };
  }
}
