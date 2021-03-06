import { Policy } from 'src/models/Policy';
import faker from 'faker';
import { Utility } from 'src/helpers/Utility';
import { ObjectID } from 'mongodb';

interface IUserVerificationToken {
  expiresAt: number;
  value: string;
}

export interface IUser {
  active?: boolean;
  email: string;
  _id?: ObjectID | string;
  org: string;
  password: string;
  policy: Policy;
  username: string;
  srn?: string;
  verified?: boolean;
  verificationToken?: IUserVerificationToken;
}

export class User implements IUser {
  public active: boolean = false;
  public email: string;
  public _id: ObjectID;
  public org: string;
  public password: string;
  public policy: Policy;
  public srn: string;
  public username: string;
  public verified: boolean = false;
  public verificationToken: IUserVerificationToken;

  constructor(params: Partial<IUser | any>) {
    if (params._id) {
      this._id =
        params._id instanceof ObjectID ? params._id : new ObjectID(params._id);
    }
    this.active = params.active;
    this.email = params.email;
    this.org = params.org;
    this.password = params.password;
    this.policy = new Policy(params.policy);
    this.srn = params.srn;
    this.username = params.username;
    this.verified = params.verified;
    this.verificationToken = params.verificationToken;
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
      },
      hash: faker.random.alphaNumeric(60),
      verified: true
    };

    return new User(Object.assign(data, overrides));
  }

  /**
   * Get id string from MongoDB ObjectID.
   */
  get id() {
    return this._id?.toString();
  }

  /**
   * Get payload signature representing User.
   */
  public async toSignature() {
    return {
      active: this.active,
      email: this.email,
      hash: await this.toHash(),
      id: this.id,
      org: this.org,
      policy: this.policy.toObject(),
      srn: this.srn,
      username: this.username
    };
  }

  /**
   * Get hash representation of User.
   */
  public async toHash() {
    return Utility.hash(await this.toObject());
  }

  /**
   * Convert to object.
   */
  public async toObject() {
    return {
      active: this.active,
      email: this.email,
      id: this.id,
      org: this.org,
      password: Utility.isHashed(this.password)
        ? this.password
        : await Utility.hashPassword({ password: this.password }),
      policy: this.policy.toObject(),
      username: this.username,
      srn: this.srn,
      verified: this.verified
    };
  }
}
