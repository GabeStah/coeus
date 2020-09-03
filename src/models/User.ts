import { IPrivilege } from 'src/services/UserService';

export interface IUser {
  active?: boolean;
  email: string;
  org: string;
  password: string;
  privileges?: Array<IPrivilege>;
  username: string;
  srn?: string;
  verified?: boolean;
}

export class User implements IUser {
  public active: boolean = false;
  public email: string;
  public org: string;
  public password: string;
  public privileges: Array<IPrivilege>;
  public srn: string;
  public username: string;
  public verified: boolean = false;

  constructor(args: IUser) {
    this.active = args.active;
    this.email = args.email;
    this.org = args.org;
    this.password = args.password;
    this.privileges = args.privileges;
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
      privileges: this.privileges,
      srn: this.srn,
      username: this.username
    };
  }
}
