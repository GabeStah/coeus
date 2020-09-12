import { IPolicy, Policy } from 'src/models/Policy';
import faker from 'faker';

export interface IUser {
  active?: boolean;
  email: string;
  org: string;
  password: string;
  policy: Policy;
  username: string;
  srn?: string;
  verified?: boolean;
}

export class User implements IUser {
  public active: boolean = false;
  public email: string;
  public org: string;
  public password: string;
  public policy: Policy;
  public srn: string;
  public username: string;
  public verified: boolean = false;

  constructor(params: Partial<IUser | any>) {
    this.active = params.active;
    this.email = params.email;
    this.org = params.org;
    this.password = params.password;
    this.policy = new Policy(params.policy);
    this.srn = params.srn;
    this.username = params.username;
    this.verified = params.verified;
  }

  /**
   * Get payload signature representing User.
   */
  get signature() {
    return {
      active: this.active,
      email: this.email,
      org: this.org,
      policy: this.policy,
      srn: this.srn,
      username: this.username
    };
  }

  /**
   * Create fake User.
   *
   * @param overrides
   */
  public static fake(overrides?: Partial<IUser | any>): User {
    const data = {
      email: faker.internet.email(),
      org: faker.helpers.slugify(faker.company.companyName()),
      username: faker.internet.userName(),
      password: faker.internet.password(8),
      active: true,
      policy: {
        version: '1.1.0',
        statement: [
          {
            action: 'data:find',
            allow: false,
            resource: 'acme.*'
          }
        ]
      }
    };

    return new User(Object.assign(data, overrides));
  }

  /**
   * Convert to object.
   */
  public toObject() {
    return {
      email: this.email,
      org: this.org,
      username: this.username,
      password: this.password,
      active: this.active,
      policy: this.policy.toObject()
    };
  }
}
