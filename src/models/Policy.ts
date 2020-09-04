import { IPolicyStatement } from 'src/models/PolicyStatement';

export interface IPolicy {
  version?: string;
  statement: Array<IPolicyStatement>;
}

export class Policy implements IPolicy {
  statement: Array<IPolicyStatement>;
  version?: string;
}
