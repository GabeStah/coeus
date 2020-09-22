import config from 'config';
import { ConstraintsSchema } from 'src/schema/user/policy/constraints';

export const PolicySchema = {
  type: 'object',
  required: ['statement'],
  properties: {
    statement: {
      type: 'array',
      uniqueItems: true,
      items: {
        type: 'object',
        required: ['action', 'resource'],
        properties: {
          action: {
            oneOf: [
              {
                type: 'string',
                enum: config.get('policy.statement.action.values')
              },
              {
                type: 'array',
                items: {
                  type: 'string',
                  enum: config.get('policy.statement.action.values')
                }
              }
            ]
          },
          allow: {
            type: 'boolean',
            default: true
          },
          resource: {
            oneOf: [
              {
                type: 'array',
                items: {
                  type: 'string',
                  pattern: '^(?!coeus).+'
                }
              },
              {
                type: 'string',
                pattern: '^(?!coeus).+'
              }
            ]
          },
          constraints: ConstraintsSchema
        }
      }
    },
    version: {
      type: 'string',
      default: config.get('version')
    }
  }
};
