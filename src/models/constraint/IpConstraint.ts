import { Constraint } from 'src/models/constraint/';

interface IpConstraintInterface {
  type: 'ip';
  value: string | Array<string>;
}

export class IpConstraint extends Constraint implements IpConstraintInterface {
  type: 'ip';
  value: string | Array<string>;
}
