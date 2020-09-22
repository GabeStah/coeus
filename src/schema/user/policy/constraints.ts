export const ConstraintsSchema = {
  type: 'array',
  uniqueItems: true,
  items: {
    anyOf: [
      {
        type: 'object',
        required: ['type', 'value'],
        properties: {
          type: {
            type: 'string',
            enum: ['maxRequests']
          },
          value: {
            type: 'number'
          }
        }
      },
      {
        type: 'object',
        required: ['type', 'value'],
        properties: {
          type: {
            type: 'string',
            enum: ['ip']
          },
          value: {
            oneOf: [
              {
                type: 'array',
                items: {
                  type: 'string',
                  format: 'ipv4'
                }
              },
              {
                type: 'string',
                format: 'ipv4'
              }
            ]
          }
        }
      },
      {
        type: 'object',
        required: ['type', 'value'],
        properties: {
          type: {
            type: 'string',
            enum: ['hostname']
          },
          value: {
            oneOf: [
              {
                type: 'array',
                items: {
                  type: 'string',
                  format: 'hostname'
                }
              },
              {
                type: 'string',
                format: 'hostname'
              }
            ]
          }
        }
      }
    ]
  }
};
