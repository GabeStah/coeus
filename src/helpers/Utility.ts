import bcrypt from 'bcryptjs';
import config from 'config';

/**
 * Utility helper class.
 */
export class Utility {
  /**
   * Generate an SRN string from org and username.
   *
   * @param org
   * @param username
   * @private
   */
  public static buildSrn({ org, username }: { org: string; username: string }) {
    return `srn:coeus:${org}::user/${username}`;
  }

  /**
   * Determine if passwords match.
   *
   * @param password
   * @param hash
   */
  public static async doPasswordsMatch(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Hash salted password.
   *
   * @param password
   * @param iterations
   * @private
   */
  public static async hashPassword({
    password,
    iterations = 10
  }: {
    password: string;
    iterations?: number;
  }) {
    const salt = await bcrypt.genSalt(iterations);
    return bcrypt.hash(password, salt);
  }

  /**
   * Build full route string.
   *
   * @param routes
   */
  public static route(routes: Array<string> | string) {
    if (typeof routes == 'string') {
      return config.get(`routes.${routes}`);
    }
    return routes
      .map((value: string) => config.get(`routes.${value}`))
      .reduce(
        (accumulator: string, currentValue: string, index: number): string => {
          return accumulator + currentValue;
        }
      );
  }
}
