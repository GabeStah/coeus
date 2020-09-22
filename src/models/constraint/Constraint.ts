import {
  HostnameConstraint,
  IpConstraint,
  MaxRequestsConstraint
} from 'src/models/constraint/';

export interface ConstraintInterface {
  type: string;
  value: number | string | Array<string>;
}

/**
 * Constraints define rules that a given must request must abide by.
 */
export class Constraint implements ConstraintInterface {
  type: string;
  value: number | string | Array<string>;

  constructor(params: ConstraintInterface) {
    this.type = params.type;
    this.value = params.value;
  }

  /**
   * Get constraint of type from collection.
   *
   * Optionally validate value.
   *
   * @param type
   * @param collection
   * @param options
   */
  public static find<T extends Constraint>(
    type: new (params: ConstraintInterface) => T,
    collection?: Constraint[],
    options?: {
      value: string | number;
    }
  ): Constraint[] | null {
    if (collection) {
      const constraints = collection.filter(constraint => {
        if (constraint instanceof type) {
          if (options && options.value) {
            if (constraint.equals(options.value)) {
              return constraint;
            }
          } else {
            return constraint;
          }
        }
      });
      if (constraints.length > 0) {
        return constraints;
      }
    }
    return null;
  }

  public toObject() {
    return {
      type: this.type,
      value: this.value
    };
  }

  /**
   * Determine if passed value equals or within instance current value.
   *
   * @param value
   */
  public equals(value: number | string) {
    if (typeof value === 'string' && Array.isArray(this.value)) {
      return this.value.includes(value);
    }
    return value === this.value;
  }
}

export function ConstraintFactory(params: ConstraintInterface): Constraint {
  switch (params.type) {
    case 'hostname':
      return new HostnameConstraint(params);
    case 'ip':
      return new IpConstraint(params);
    case 'maxRequests':
      return new MaxRequestsConstraint(params);
  }
}
