import { FastifyInstance } from 'fastify';
import config from 'config';
import { Utility } from 'src/helpers/Utility';
import { IUser, User } from 'src/models/User';
import { IPolicy } from 'src/models/Policy';
import HttpError from 'http-errors';

export interface IPrivilege {
  actions: Array<string> | string;
  resource: {
    collection?: string;
    db: string;
  };
}

export interface UserServiceCreateParams {
  active?: boolean;
  email: string;
  org: string;
  password: string;
  username: string;
  policy: IPolicy;
  verified?: boolean;
}

export interface UserServiceFindParams {
  query?: object;
  options?: any;
}

export interface UserServiceLoginParams {
  password: string;
  username: string;
}

export interface UserServiceUpdateParams {
  email: string;
  org: string;
  password?: string;
  policy: IPolicy;
}

/**
 * User service.
 */
export class UserService {
  private instance: FastifyInstance;
  private db: string;
  private collection: string;

  constructor(instance: FastifyInstance) {
    this.instance = instance;
    this.db = 'coeus';
    this.collection = 'users';
  }

  /**
   * Create a new user record.
   *
   * @param data
   */
  public async create({
    active = false,
    email,
    org,
    password,
    username,
    policy,
    verified = false
  }: UserServiceCreateParams | User) {
    // Do not create if username exists
    if (await this.exists({ username })) {
      throw new HttpError.Conflict(`Unable to create new user: ${username}`);
    }

    const srn = Utility.buildSrn({ org, username });
    const result = await this.instance.mongo.client
      .db(this.db)
      .collection(this.collection)
      .insertOne({
        active,
        email,
        org,
        srn,
        password: await Utility.hashPassword({ password }),
        username,
        policy,
        verified
      });
    return {
      message: 'User successfully created.',
      data: {
        active,
        email,
        org,
        srn,
        username,
        policy,
        verified
      }
    };
  }

  /**
   * Delete a user record.
   *
   * @param data
   */
  public async delete({ username }: UserServiceCreateParams | User) {
    const user = await this.exists({ username });

    // Short circuit if no existing user found
    if (!user) {
      return true;
    }

    const deleted = await this.instance.mongo.client
      .db(this.db)
      .collection(this.collection)
      .deleteOne({ username });

    return {
      message: 'User successfully deleted.',
      data: {
        deleted
      }
    };
  }

  /**
   * Determines if user exists
   *
   * @param username
   */
  public async exists({
    username
  }: {
    username: string;
  }): Promise<User | null> {
    // Check for existing username
    const match = await this.find({ query: { username } });

    if (match && match.length > 0) {
      return new User(match[0]);
    }

    return null;
  }

  /**
   * Find documents by query and options.
   *
   * @param query
   * @param options
   */
  public async find({
    query,
    options
  }: UserServiceFindParams): Promise<Array<IUser> | null> {
    const result = await this.instance.mongo.client
      .db(this.db)
      .collection(this.collection)
      .find(query, options)
      .maxTimeMS(config.get('db.thresholds.timeout.maximum'));

    return await result.toArray();
  }

  /**
   * Attempt user login.
   *
   * @param password
   * @param username
   */
  public async login({ password, username }: UserServiceLoginParams | User) {
    const user = await this.exists({ username });
    const errorMessage = 'Unable to authenticate with provided credentials.';

    // User doesn't exist; don't indicate to public
    if (!user) {
      throw new HttpError.Unauthorized(errorMessage);
    }

    // Invalid password provided
    if (!(await Utility.doPasswordsMatch(password, user.password))) {
      throw new HttpError.Unauthorized(errorMessage);
    }

    // Sign and return JWT
    return { token: await this.instance.jwt.sign(user.signature) };
  }

  // /**
  //  * Update a user record.
  //  *
  //  * @param email
  //  * @param org
  //  * @param password
  //  * @param username
  //  * @param privileges
  //  */
  // public async update({
  //                       email,
  //                       org,
  //                       password,
  //                       username,
  //                       policy
  //                     }: UserServiceCreateParams) {
  //   // Do not create if username exists
  //   if (await this.exists({ username })) {
  //     throw new Error(`Unable to create new user: ${username}`);
  //   }
  //
  //   const srn = Utility.buildSrn({ org, username });
  //   const result = await this.instance.mongo.client
  //     .db(this.db)
  //     .collection(this.collection)
  //     .insertOne({
  //       email,
  //       org,
  //       srn,
  //       password: await Utility.hashPassword({ password }),
  //       username,
  //       active: false,
  //       verified: false,
  //       policy
  //     });
  //   return {
  //     message: 'User successfully created.',
  //     data: {
  //       email,
  //       org,
  //       srn,
  //       username,
  //       policy
  //     }
  //   };
  // }
}
