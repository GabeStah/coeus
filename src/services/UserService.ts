import { FastifyInstance, FastifyRequest } from 'fastify';
import config from 'config';
import { Utility } from 'src/helpers/Utility';
import { User } from 'src/models/User';
import { IPolicy } from 'src/models/Policy';
import HttpError from 'http-errors';
import { ObjectID, UpdateOneOptions } from 'mongodb';
import {
  AuthorizationPayloadType,
  AuthorizationService
} from 'src/services/AuthorizationService';

export interface IPrivilege {
  actions: Array<string> | string;
  resource: {
    collection?: string;
    db: string;
  };
}

export interface UserServiceParams {
  payload?: AuthorizationPayloadType;
  request: FastifyRequest;
}

export interface UserServiceActivateParams {
  id?: string;
  srn?: string;
  username?: string;
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
  email?: boolean;
  password: string;
  username: string;
}

export interface UserServiceVerifyParams {
  token: string;
}

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
export class UserService extends AuthorizationService {
  private instance: FastifyInstance;
  private readonly db: string;
  private readonly collection: string;

  constructor(instance: FastifyInstance, params?: UserServiceParams) {
    const { payload, request } = params || {};
    super({ payload, request, service: 'user' });
    this.db = 'coeus';
    this.collection = 'users';
    this.instance = instance;
  }

  /**
   * Activate User.
   *
   * @param user
   */
  public async activate({
    id,
    srn,
    username
  }: UserServiceActivateParams): Promise<User> {
    this.authorize({
      collection: this.collection,
      db: this.db,
      method: 'activate'
    });

    // Find by id, else srn, else username
    const user = await this.exists(
      id ? { _id: new ObjectID(id) } : srn ? { srn } : { username }
    );

    // Error if no user
    if (!user) {
      throw new HttpError.Forbidden(
        `Could not find a user based on search params: ${JSON.stringify({
          id,
          srn,
          username
        })}`
      );
    }

    if (user.active) {
      throw new HttpError.Forbidden(`User is already active`);
    }

    const result = await this.instance.mongo.client
      .db(this.db)
      .collection(this.collection)
      .updateOne({ _id: new ObjectID(user.id) }, { $set: { active: true } });

    // Update local copy field without requiring new db query
    user.active = true;

    return user;
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

    const srn = Utility.buildSrn({ org, username });

    const user = new User({
      active,
      email,
      org,
      password,
      username,
      policy,
      srn,
      verified,
      verificationToken
    });

    const result = await this.instance.mongo.client
      .db(this.db)
      .collection(this.collection)
      .insertOne({
        active,
        email,
        org,
        password: await Utility.hashPassword({ password }),
        policy: user.policy.toObject(),
        srn,
        username,
        verified,
        verificationToken
      });

    user._id = new ObjectID(result.insertedId);

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
      .find(Utility.normalizeQueryObject(query), options)
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
    const errorMessage =
      'Unable to authenticate with the provided credentials.';

    // User doesn't exist; don't indicate to public
    if (!user) {
      throw new HttpError.Unauthorized(errorMessage);
    }

    // Invalid password provided
    if (!(await Utility.doPasswordsMatch(password, user.password))) {
      throw new HttpError.Unauthorized(errorMessage);
    }

    // Email is not verified
    if (!user.verified) {
      throw new HttpError.Forbidden(
        'Unable to authenticate: Please verify your email address'
      );
    }

    // User is inactive
    if (!user.active) {
      throw new HttpError.Forbidden('Unable to authenticate: User is inactive');
    }

    // Sign and return JWT
    return {
      token: await this.instance.jwt.sign(await user.toSignature(), {
        noTimestamp: true
      })
    };
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
      .updateOne(Utility.normalizeQueryObject(filter), update, options);

    return {
      statusCode: 200,
      message: `User ${
        result.modifiedCount == 0 ? /* istanbul ignore next */ 'not ' : ''
      }updated`
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
      message: `User ${
        result.modifiedCount == 0 ? /* istanbul ignore next */ 'not ' : ''
      }updated`
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

    if (tokenExpired) {
      throw new HttpError.Unauthorized('Verification token has expired.');
    }

    return {
      statusCode: 200,
      message: 'User successfully verified.'
    };
  }
}
