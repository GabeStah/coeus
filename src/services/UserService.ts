import { FastifyInstance } from 'fastify';
import config from 'config';
import { Utility } from 'src/helpers/Utility';
import { IUser, User } from 'src/models/User';
import { IPolicy } from 'src/models/Policy';
import HttpError from 'http-errors';
import { ObjectID, UpdateManyOptions, UpdateOneOptions } from 'mongodb';
import { DataServiceUpdateParams } from 'src/services/DataService';

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

export interface UserServiceVerifyParams {
  token: string;
}

// export interface UserServiceUpdateParams {
//   active?: boolean;
//   email?: string;
//   _id: ObjectID | string;
//   org?: string;
//   password?: string;
//   username?: string;
//   policy?: IPolicy;
//   verified?: boolean;
// }

export interface UserServiceUpdateParams {
  filter: object;
  update: object;
  options?: UpdateOneOptions;
}

export interface UserServiceUpdateByIdParams {
  update: object;
  options?: UpdateOneOptions;
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

    const verificationToken = {
      // Expires in 24 hours
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      value: Utility.generateToken()
    };

    const user = new User({
      active,
      email,
      org,
      password,
      username,
      policy,
      verified,
      verificationToken
    });

    const srn = Utility.buildSrn({ org, username });

    const result = await this.instance.mongo.client
      .db(this.db)
      .collection(this.collection)
      .insertOne({
        active,
        email,
        hash: user.toHash(),
        org,
        password: await Utility.hashPassword({ password }),
        policy,
        srn,
        username,
        verified,
        verificationToken
      });

    return user;
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
   * @param query
   */
  public async exists(query: object): Promise<User | null> {
    // Check for existing username
    const match = await this.find({ query });

    if (match && match.length > 0) {
      return new User(match[0]);
    }

    return null;
  }

  /**
   * Find Users by query and options.
   *
   * @param query
   * @param options
   */
  public async find({
    query,
    options
  }: UserServiceFindParams): Promise<Array<User> | null> {
    const result = await this.instance.mongo.client
      .db(this.db)
      .collection(this.collection)
      .find(query, options)
      .maxTimeMS(config.get('db.thresholds.timeout.maximum'));

    const data = await result.toArray();
    return data.map(item => new User(item));
  }

  /**
   * Get verification URL from token string.
   *
   * @param token
   */
  public static getVerificationUrl(token: string) {
    return `${config.get('routes.root')}${Utility.route([
      'user.prefix',
      'user.verify'
    ])}?token=${token}`;
  }

  /**
   * Attempt User login.
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

  /**
   * Update a user record.
   *
   * @param filter
   * @param update
   * @param options
   */
  public async update({ filter, update, options }: UserServiceUpdateParams) {
    const result = await this.instance.mongo.client
      .db(this.db)
      .collection(this.collection)
      .updateOne(filter, update, options);

    return {
      statusCode: 200,
      message: `User ${result.modifiedCount == 0 ? 'not ' : ''}updated`
    };
  }

  /**
   * Update a user record by id.
   *
   * @param id
   * @param update
   * @param options
   */
  public async updateById(
    id: string,
    { update, options }: UserServiceUpdateByIdParams
  ) {
    const result = await this.instance.mongo.client
      .db(this.db)
      .collection(this.collection)
      .updateOne({ _id: new ObjectID(id) }, update, options);

    return {
      statusCode: 200,
      message: `User ${result.modifiedCount == 0 ? 'not ' : ''}updated`
    };
  }

  /**
   * Verify User based on passed token.
   *
   * @param token
   */
  public async verify({ token }: UserServiceVerifyParams) {
    const user = await this.exists({ 'verificationToken.value': token });
    const errorMessage = 'Verification token is invalid.';

    // User doesn't exist
    if (!user) {
      throw new HttpError.Unauthorized(errorMessage);
    }

    const tokenExpired = Date.now() >= user.verificationToken.expiresAt;

    const updatedUser = await this.updateById(user.id, {
      update: {
        // Set verified boolean to expiration inverse
        $set: { verified: !tokenExpired },
        // Remove verificationToken subdocument
        $unset: { verificationToken: null }
      }
    });

    if (updatedUser.statusCode !== 200) {
      throw new HttpError.Unauthorized(errorMessage);
    }

    if (tokenExpired) {
      throw new HttpError.Unauthorized('Verification token has expired.');
    }

    return {
      statusCode: 200,
      message: `User successfully verified.`
    };
  }
}
