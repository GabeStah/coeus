import { IPolicy, Policy } from 'src/models/Policy';
import faker from 'faker';
import { Utility } from 'src/helpers/Utility';

export interface IUser {
  active?: boolean;
  email: string;
  hash?: string;
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
  public hash: string;
  public org: string;
  public password: string;
  public policy: Policy;
  public srn: string;
  public username: string;
  public verified: boolean = false;

  constructor(params: Partial<IUser | any>) {
    this.active = params.active;
    this.email = params.email;
    this.hash = params.hash;
    this.org = params.org;
    this.password = params.password;
    this.policy = new Policy(params.policy);
    this.srn = params.srn;
    this.username = params.username;
    this.verified = params.verified;
  }

  // /**
  //  * Generate hash representation from User properties.
  //  *
  //  * @param active
  //  * @param policy
  //  * @param username
  //  * @param verified
  //  */
  // static hash({
  //   active,
  //   policy,
  //   username,
  //   verified
  // }: {
  //   active: boolean;
  //   policy: Policy | object;
  //   username: string;
  //   verified: boolean;
  // }) {
  //   return Utility.hash({
  //     active,
  //     policy,
  //     username,
  //     verified
  //   });
  // }

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
      },
      hash: faker.random.alphaNumeric(60)
    };

    return new User(Object.assign(data, overrides));
  }

  /**
   * Get payload signature representing User.
   */
  get signature() {
    return {
      active: this.active,
      email: this.email,
      hash: this.hash,
      org: this.org,
      policy: this.policy,
      srn: this.srn,
      username: this.username
    };
  }

  /**
   * Get hash representation of User.
   */
  public toHash() {
    return Utility.hash(this.toObject());
  }

  /**
   * Convert to object.
   */
  public toObject() {
    return {
      active: this.active,
      email: this.email,
      org: this.org,
      password: this.password,
      policy: this.policy.toObject(),
      username: this.username,
      srn: this.srn,
      verified: this.verified
    };
  }
}
