import { Constraint } from 'src/models/constraint/';

interface HostnameConstraintInterface {
  type: 'hostname';
  value: string | Array<string>;
}

export class HostnameConstraint extends Constraint
  implements HostnameConstraintInterface {
  type: 'hostname';
  value: string | Array<string>;

  /**
   * Determine if passed value equals or within instance current value.
   *
   * @param value
   */
  public equals(value: string) {
    // Remove port if included
    value = value.substring(
      0,
      /* istanbul ignore next */
      value.indexOf(':') > 0 ? value.indexOf(':') : undefined
    );
    if (typeof value === 'string' && Array.isArray(this.value)) {
      return this.value.includes(value);
    }
    return value === this.value;
  }
}
