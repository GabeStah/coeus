import { Constraint } from 'src/models/constraint/';

interface MaxRequestsConstraintInterface {
  type: 'maxRequests';
  value: number;
}

export class MaxRequestsConstraint extends Constraint
  implements MaxRequestsConstraintInterface {
  type: 'maxRequests';
  value: number;
}
