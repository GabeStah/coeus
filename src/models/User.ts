import { Policy } from 'src/models/Policy';

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

  constructor(args: Partial<IUser>) {
    this.active = args.active;
    this.email = args.email;
    this.org = args.org;
    this.password = args.password;
    this.policy = args.policy;
    this.srn = args.srn;
    this.username = args.username;
    this.verified = args.verified;
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
}
