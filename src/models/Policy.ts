import { PolicyStatement } from 'src/models/PolicyStatement';

export interface IPolicy {
  version?: string;
  statement: Array<PolicyStatement>;
}

export class Policy implements IPolicy {
  statement: Array<PolicyStatement>;
  version?: string;

  constructor(params: Partial<IPolicy>) {
    this.statement = params.statement.map(
      statement => new PolicyStatement(statement)
    );
    this.version = params.version;
  }

  /**
   * Convert to object.
   */
  public toObject() {
    return {
      statement: this.statement.map(statement => statement.toObject()),
      version: this.version
    };
  }
}
