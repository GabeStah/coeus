import convict from 'convict';
import json5 from 'json5';

convict.addParser({ extension: 'json', parse: json5.parse });

// Define a schema
const config = convict({
  env: {
    doc: 'The application environment',
    format: ['production', 'development', 'testing'],
    default: 'development',
    env: 'NODE_ENV'
  },
  db: {
    mongo: {
      uri: {
        doc: 'MongoDB endpoint URI',
        env: 'DB_MONGO_URI',
        format: String,
        default: 'mongodb://127.0.0.1:4433'
      }
    },
    thresholds: {
      limit: {
        base: {
          doc: 'Default number of documents to return per request.',
          env: 'DB_THRESHOLDS_LIMIT_BASE',
          format: Number,
          default: 20
        },
        minimum: {
          doc: 'Minimum number of documents to return per request.',
          env: 'DB_THRESHOLDS_LIMIT_MINIMUM',
          format: Number,
          default: 0
        },
        maximum: {
          doc: 'Maximum number of documents to return per request.',
          env: 'DB_THRESHOLDS_LIMIT_MAXIMUM',
          format: Number,
          default: 500
        }
      },
      timeout: {
        maximum: {
          doc: 'Maximum number of milliseconds allowed to process a request.',
          env: 'DB_THRESHOLDS_TIMEOUT_MAXIMUM',
          format: Number,
          default: 5000
        }
      }
    }
  },
  mail: {
    from: {
      address: {
        doc: 'Address mail is sent from',
        format: String,
        default: 'dev@solarixdigital.com',
        env: 'MAIL_FROM_ADDRESS'
      },
      name: {
        doc: 'Name of from sender',
        format: String,
        default: 'Solarix Coeus',
        env: 'MAIL_FROM_NAME'
      }
    }
  },
  policy: {
    statement: {
      action: {
        separator: {
          doc: 'Separator character used in action strings',
          format: String,
          default: ':',
          env: 'POLICY_STATEMENT_ACTION_SEPARATOR'
        },
        values: {
          doc: 'Valid action values',
          format: Array,
          default: [
            'admin:*',
            'data:*',
            'data:delete',
            'data:find',
            'data:insert',
            'data:update',
            'user:*',
            'user:activate'
          ]
        }
      },
      resource: {
        separator: {
          doc: 'Separator character used in resource strings',
          format: String,
          default: '.',
          env: 'POLICY_STATEMENT_RESOURCE_SEPARATOR'
        }
      },
      wildcard: {
        doc: 'Wildcard character used in action/resource strings',
        format: String,
        default: '*',
        env: 'POLICY_STATEMENT_WILDCARD'
      }
    }
  },
  port: {
    doc: 'App port',
    format: Number,
    default: 8000,
    env: 'PORT'
  },
  rateLimit: {
    hookMethod: {
      doc: 'Fastify Hook method in which to attach rate limit',
      format: String,
      default: 'preHandler',
      env: 'RATE_LIMIT_HOOK_METHOD'
    },
    maxRequests: {
      doc:
        'Maximum number of allowed requests from single source within period',
      format: Number,
      default: 60,
      env: 'CONSTRAINTS_DEFAULT_MAX_REQUESTS'
    },
    timeWindow: {
      doc: 'Number of milliseconds within maxRequests are allowed',
      format: Number,
      default: 60 * 1000,
      env: 'RATE_LIMIT_TIME_WINDOW'
    }
  },
  routes: {
    admin: {
      authenticate: {
        format: String,
        default: '/authenticate'
      },
      prefix: {
        doc: 'Prefix inserted before sibling routes',
        format: String,
        default: '/admin'
      }
    },
    data: {
      aggregate: {
        format: String,
        default: '/aggregate'
      },
      createIndex: {
        format: String,
        default: '/createIndex'
      },
      delete: {
        format: String,
        default: '/delete'
      },
      dropIndex: {
        format: String,
        default: '/dropIndex'
      },
      find: {
        format: String,
        default: '/find'
      },
      insert: {
        format: String,
        default: '/insert'
      },
      listIndexes: {
        format: String,
        default: '/listIndexes'
      },
      prefix: {
        doc: 'Prefix inserted before sibling routes',
        format: String,
        default: '/data'
      },
      update: {
        format: String,
        default: '/update'
      }
    },
    prefix: {
      doc: 'API versioning prefix',
      format: String,
      default: '/v1',
      env: 'ROUTE_PREFIX'
    },
    root: {
      doc: 'Default base API endpoint',
      format: String,
      default: 'http://127.0.0.1:8000',
      env: 'ROUTE_ROOT'
    },
    user: {
      activate: {
        format: String,
        default: '/activate'
      },
      login: {
        format: String,
        default: '/login'
      },
      prefix: {
        doc: 'Prefix inserted before sibling routes',
        format: String,
        default: '/user'
      },
      register: {
        format: String,
        default: '/register'
      },
      verify: {
        format: String,
        default: '/verify'
      }
    }
  },
  security: {
    jwt: {
      secret: {
        format: String,
        default: null,
        env: 'SECURITY_JWT_SECRET',
        sensitive: true
      },
      sign: {
        issuer: {
          format: String,
          default: 'coeus.solarix.tools',
          env: 'SECURITY_JWT_SIGN_ISSUER'
        }
      },
      verify: {
        issuer: {
          format: String,
          default: 'coeus.solarix.tools',
          env: 'SECURITY_JWT_VERIFY_ISSUER'
        }
      }
    },
    ssl: {
      certificate: {
        format: String,
        default:
          '/home/ubuntu/certs/coeus.solarix.tools/coeus.solarix.tools.cer',
        sensitive: true
      },
      enabled: {
        format: Boolean,
        default: true
      },
      key: {
        format: String,
        default:
          '/home/ubuntu/certs/coeus.solarix.tools/coeus.solarix.tools.key',
        sensitive: true
      }
    }
  },
  services: {
    aws: {
      cloudwatch: {
        accessKey: {
          doc: 'AWS CloudWatch Access Key',
          format: String,
          default: '',
          env: 'AWS_CLOUDWATCH_ACCESS_KEY',
          sensitive: true
        },
        secretKey: {
          doc: 'AWS CloudWatch Secret Key',
          format: String,
          default: '',
          env: 'AWS_CLOUDWATCH_SECRET_KEY',
          sensitive: true
        },
        region: {
          doc: 'AWS CloudWatch region',
          format: String,
          default: 'us-west-2',
          env: 'AWS_CLOUDWATCH_REGION'
        },
        logGroupName: {
          doc: 'AWS CloudWatch log group name',
          format: String,
          default: 'coeus',
          env: 'AWS_CLOUDWATCH_LOG_GROUP_NAME'
        },
        logStreamName: {
          doc: 'AWS CloudWatch log stream name',
          format: String,
          default: 'base',
          env: 'AWS_CLOUDWATCH_LOG_STREAM_NAME'
        },
        retentionInDays: {
          doc: 'AWS CloudWatch retention days',
          format: Number,
          default: 3,
          env: 'AWS_CLOUDWATCH_RETENTION_DAYS'
        }
      },
      ses: {
        accessKey: {
          doc: 'AWS SES Access Key',
          format: String,
          default: 'AKIA2EL54UJR6RFLM4HI',
          env: 'AWS_SES_ACCESS_KEY',
          sensitive: true
        },
        secretKey: {
          doc: 'AWS SES Secret Key',
          format: String,
          default: '',
          env: 'AWS_SES_SECRET_KEY',
          sensitive: true
        },
        region: {
          doc: 'AWS SES region',
          format: String,
          default: 'us-west-2',
          env: 'AWS_SES_REGION'
        }
      }
    }
  },
  version: {
    format: String,
    default: '1.0.0',
    env: 'NODE_VERSION'
  }
});

// Load environment dependent configuration
const env = config.get('env');
config.loadFile('config/' + env + '.json');

// Perform validation
config.validate({ allowed: 'strict' });

export default config;
