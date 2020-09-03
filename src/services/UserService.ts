import { FastifyInstance } from 'fastify';
import config from 'config';
import { Utility } from 'src/helpers/Utility';
import { IUser, User } from 'src/models/User';

export interface IPrivilege {
  actions: Array<string> | string;
  resource: {
    collection?: string;
    db: string;
  };
}

export interface UserServiceCreateParams {
  email: string;
  org: string;
  password: string;
  username: string;
  privileges?: Array<IPrivilege>;
}

export interface UserServiceFindParams {
  query?: object;
  options?: any;
}

export interface UserServiceLoginParams {
  password: string;
  username: string;
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
   * @param email
   * @param org
   * @param password
   * @param username
   * @param privileges
   */
  public async create({
    email,
    org,
    password,
    username,
    privileges
  }: UserServiceCreateParams) {
    // Do not create if username exists
    if (await this.exists({ username })) {
      throw new Error(`Unable to create new user: ${username}`);
    }

    const srn = Utility.buildSrn({ org, username });
    const result = await this.instance.mongo.client
      .db(this.db)
      .collection(this.collection)
      .insertOne({
        email,
        org,
        srn,
        password: await Utility.hashPassword({ password }),
        username,
        active: false,
        verified: false,
        privileges
      });
    return {
      message: 'User successfully created.',
      data: {
        email,
        org,
        srn,
        username,
        privileges
      }
    };
  }

  /**
   * Attempt user login.
   *
   * @param password
   * @param username
   */
  public async login({ password, username }: UserServiceLoginParams) {
    const user = await this.exists({ username });
    const errorMessage = `Unable to authenticate with provided credentials.`;

    // User doesn't exist; don't indicate to public
    if (!user) {
      throw new Error(errorMessage);
    }

    // Invalid password provided
    if (!(await Utility.doPasswordsMatch(password, user.password))) {
      throw new Error(errorMessage);
    }

    // Sign and return JWT
    return { token: await this.instance.jwt.sign(user.signature) };
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
    query = {},
    options = null
  }: UserServiceFindParams): Promise<Array<IUser> | null> {
    const result = await this.instance.mongo.client
      .db(this.db)
      .collection(this.collection)
      .find(query, options)
      .maxTimeMS(config.get('db.thresholds.timeout.maximum'));

    const blah = await result.toArray();

    return blah;
  }
}
