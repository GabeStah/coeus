import { PolicySchema } from 'src/schema/user/policy';
import { FastifySchema } from 'fastify';

export const UserSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['email', 'org', 'username', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email'
      },
      org: {
        type: 'string',
        minLength: 2
      },
      username: {
        type: 'string',
        minLength: 4
      },
      password: {
        type: 'string',
        minLength: 8
      },
      policy: PolicySchema
    }
  }
};
