# Coeus

Coeus is an HTTP API providing insightful answers through data.

In Greek mythology [Coeus](https://en.wikipedia.org/wiki/Coeus) is the son of Uranus and Gaia and is the ["Titan of intellect and the axis of heaven around which the constellations revolved"](https://en.wikipedia.org/wiki/List_of_Greek_mythological_figures#Titans_and_Titanesses). The name is derived from the Ancient Greek [κοῖος](https://en.wiktionary.org/wiki/%CE%9A%CE%BF%E1%BF%96%CE%BF%CF%82), meaning "what?, which?, of what kind?, of what nature?".

## Development

1. Install Node modules: `yarn install`
2. Copy `config/example.json` to `environment.json`, replacing `environment` with the appropriate environment name (e.g. `development.json`). See [snippets/development.json](https://gitlab.solarixdigital.com/solarix/core/soldata/coeus/snippets/20) for functional example.
3. Update the configuration file with appropriate values.
4. Make code changes under `src/`
5. Build dist package from TypeScript with `yarn run build`
6. Launch app with `yarn run start`
7. Perform status check to ensure server is active:

```bash
$ curl -X POST "localhost:8000/status"
{"active":true,"date":"2020-08-28T22:14:56.294Z"}
```

### Dynamic Watches

1. Execute `yarn run watch` to monitor and rebuild on source changes.
2. In a second console, execute `yarn run watch:server` to monitor build changes and restart the server.

## Testing

1. Create `*.test.ts` files under `src/`
2. Execute `yarn run test` to perform a one-off test
3. Alternatively, execute `yarn run test:watch` to watch and re-run tests on code change

**NOTE:** The `test:debug` command variants _should_ be executed while halting execution within a test (such as during debugging).

## Database: MongoDB

- Version: 4.4
- Region: AWS us-east-1 (required for version 4.4 free tier support)

### Naming Conventions

**NOTE:** Windows users may experience trouble within the `mongo` shell when using special characters (`/\. "$*<>:|?`). Please use a Linux-based shell when executing shell commands that use such characters in relevant `namespaces`.

- **Database** names _may not_ contain any of the following characters: `/\. "$*<>:|?`.
- **Database** names _may not_ exceed `64` characters in length.
- A `namespace` (the combined **database.collection** name) _may not_ exceed `255` characters in length.
- **Collection** names _may_ use special characters, so long as they begin with a letter.
- **Role** names _may only_ contain letters, numbers, hyphens, and underscores.

### Databases

Each **database** _must_:

- be globally unique and identifiable, based on a single high-level entity such as an `organization`.

#### Examples

- `acme`: A **database name** for the Acme `org`
- `solarix`: For Solarix projects

### Collections

Each **collection** _must_:

- be self-contained.
- contain related data.
- use [Solarix Resource Name (SRN)](https://docs.solarix.tools/solarix-resource-names) conventions.

Each **collection** _should_:

- be based on a single high-level entity such as an `org`, if applicable.

A higher-order **SRN** is preferred for aggregate queries and data storage, but smaller **collections** can be created to store separate `project` or even `app` data.

#### Examples

An **SRN** of `srn::acme` is the highest order **SRN** for the `Acme` `org`, applying to all services and all projects within that `org`. A **collection `name`** of `srn:coeus:acme::collection` may contain any type of Acme-related data.

Alternatively, an **SRN** of `srn::acme:tracker:api:production` with related **collection `name`** of `srn:coeus:acme:tracker:api:production::collection` is expected to contain data only related to Acme's Tracker API project, in the production environment of the AWS EC2 service. This is a much smaller scope, so take care when choosing which **collection** names to create.

### Document

Each **document** _must_:

- be less than `16MB`.

## Identifiers

- database
- collection
- document
- srn
- service
- org
- project
- app
- environment
- resource-type
- resource-id

## Protected Database / Collections

The `coeus` database is protected and used for administration purposes.

- `coeus.users` - Stores all User documents

## Authentication

- Limitations: https://docs.atlas.mongodb.com/reference/unsupported-commands/ (requires M10+ Atlas cluster)

## User

```json
{
  "_id": "12345",
  "srn": "srn:coeus:acme::user/johndoe",
  "email": "john@acme.com",
  "org": "acme",
  "username": "johndoe",
  "password": "password",
  "verified": true,
  "active": true,
  "policy": {
    "version": "1.1.0",
    "statement": [
      {
        "action": "data:find",
        "resource": "acme.*"
      },
      {
        "action": ["data:insert", "data:update"],
        "allow": true,
        "resource": "acme.srn:coeus:acme::collection"
      },
      {
        "action": ["data:delete"],
        "allow": false,
        "resource": "acme.*"
      }
    ]
  }
}
```

### Policy

The `policy` property of a **User** document defines permissions for that user. A policy consists of one or more `statement` objects.

A **policy** _may_ contain:

- a `version` semver value that indicates what API version this policy was generated with. This value is automatically generated upon creation.

A **policy statement** _must_ contain:

- an `action` property.
- a `resource` property.

A **policy statement** _may_ contain:

- an `allow` property.

#### Policy Statement: action

The `action` property defines the action(s) allowed or denied by the **statement**. An `action` string _must_ be formatted as `<service>:<method>`. For example, an `action` of `data:find` indicates the `find` method for the `data` service.

An asterisk (`*`) may be substituted for the `<method>` as a wildcard indicator for **ALL** methods within the given `<service>`. For example, `data:*` applies actions to all methods of the `data` service.

#### Policy Statement: resource

The `resource` property defines the resource(s) allowed or denied by the **statement**. A `resource` string _must_ be formatted as `<db>.<collection>`. For example, a `resource` of `acme.srn:coeus:acme::collection` indicates the `srn:coeus:acme::collection` collection of the `acme` database.

An asterisk (`*`) may be substituted for the `<collection>` as a wildcard indicator for **ALL** collections within the given `<db>`. For example, `acme:*` applies to all collections within the `acme` database.

An asterisk (`*`) may also be substituted for the entire `resource` string as a wildcard indicator for **ALL** database and collection combinations. **This provides full admin access, so use with caution.**

#### Policy Statement: allow

The `allow` property determines if the **statement** is allowing or denying permission indicated by the related `action` and `resource`.

By default, a **statement** without an `allow` property is assumed to be `true`, allowing permission to the related `resource`. Otherwise, the default policy across the app is to deny permission unless explicitly allowed.

#### Example Policies

The following policy is intended for an Acme `org` User with moderate permissions. The policy:

- allows `data:find` access across the `acme` database
- allows `data:insert` and `data:update` access to the `srn:coeus:acme::collection` collection in the `acme` database.
- denies `data:delete` access across the `acme` database

```json
{
  "version": "1.1.0",
  "statement": [
    {
      "action": "data:find",
      "resource": "acme.*"
    },
    {
      "action": ["data:insert", "data:update"],
      "allow": true,
      "resource": "acme.srn:coeus:acme::collection"
    },
    {
      "action": ["data:delete"],
      "allow": false,
      "resource": "acme.*"
    }
  ]
}
```

The following policy is intended for a Solarix `org` User with full administrative privileges. The policy:

- allows access to all `admin` service methods across **ALL** resources
- allows access to all `data` service methods across **ALL** resources

```json
{
  "version": "1.1.0",
  "statement": [
    {
      "action": "admin:*",
      "resource": "*"
    },
    {
      "action": "data:*",
      "resource": "*"
    }
  ]
}
```

### Routes

- /admin/authenticate - Authenticate as a User without password and receive JWT
- /admin/register - Register a User, automatically verify and activate, and receive JWT
- /data/delete - Delete documents
- /data/find - Find documents
- /data/insert - Insert documents
- /data/update - Update documents
- /user/login - Login via `username` / `password` and receive JWT
- /user/register - Register a User

#### `/user/register`

**Purpose**: Register a user.

`POST` request payload example:

```json
{
  "email": "john@acme.com",
  "org": "acme",
  "username": "johnsmith",
  "password": "password",
  "policy": {
    "version": "1.1.0",
    "statement": [
      {
        "action": "data:find",
        "resource": "acme.*"
      },
      {
        "action": ["data:insert", "data:update"],
        "allow": true,
        "resource": "acme.srn:coeus:acme::collection"
      },
      {
        "action": ["data:delete"],
        "allow": false,
        "resource": "acme.*"
      }
    ]
  }
}
```

Response payload example:

```json
{
  "message": "User successfully created.",
  "data": {
    "email": "john@acme.com",
    "org": "acme",
    "srn": "srn:coeus:acme::user/johnsamith",
    "username": "johnsamith",
    "policy": {
      "version": "1.1.0",
      "statement": [
        {
          "action": "data:find",
          "resource": "acme.*"
        },
        {
          "action": ["data:insert", "data:update"],
          "allow": true,
          "resource": "acme.srn:coeus:acme::collection"
        },
        {
          "action": ["data:delete"],
          "allow": false,
          "resource": "acme.*"
        }
      ]
    }
  }
}
```

Each **User** _must_ contain:

- `username`: To allow for multiple users per email, `username` is the **primary unique value** for differentiating users.
- `email`
- `org`: Organization name, per the [Solarix Resource Name (SRN)](https://docs.solarix.tools/solarix-resource-names/) conventions.
- `password`

Each **User** _may_ contain:

- `policy`: An object containing `PolicyStatements` defining permissions. See [Policy](#policy) for details.

#### `/login`

**Purpose**: Login via username and password to retrieve a valid JWT.

`POST` request payload example:

```json
{
  "username": "johnsmith",
  "password": "password"
}
```

Response payload example:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3RpdmUiOmZhbHNlLCJlbWFpbCI6ImpvaG5AYWNtZS5jb20iLCJvcmciOiJhY21lIiwicHJpdmlsZWdlcyI6W3sicmVzb3VyY2UiOnsiZGIiOiJhY21lIiwiY29sbGVjdGlvbiI6InNybjpjb2V1czphY21lOjpjb2xsZWN0aW9uIn0sImFjdGlvbnMiOiJmaW5kIn0seyJyZXNvdXJjZSI6eyJkYiI6InNvbGFyaXgiLCJjb2xsZWN0aW9uIjoic3JuOmNvZXVzOnNvbGFyaXg6OmNvbGxlY3Rpb24ifSwiYWN0aW9ucyI6ImZpbmQifV0sInNybiI6InNybjpjb2V1czphY21lOjp1c2VyL2pvaG5zbWl0aCIsInVzZXJuYW1lIjoiam9obnNtaXRoIiwiaWF0IjoxNTk5MDk0ODk5LCJpc3MiOiJjb2V1cy5zb2xhcml4LnRvb2xzIn0.73dnMmj1g2_gVS5rrlIcUT2MZgp7JjWZo9vbQyDas2c"
}
```

An `/user/login` request payload _must_ contain:

- `username`
- `password`

The returned `token` is issued by `coeus.solarix.tools`. The decoded payload contains valid user data from the time of authentication, e.g.:

```json
{
  "active": false,
  "email": "john@acme.com",
  "org": "acme",
  "policy": {
    "version": "1.1.0",
    "statement": [
      {
        "action": "data:find",
        "resource": "acme.*"
      },
      {
        "action": ["data:insert", "data:update"],
        "allow": true,
        "resource": "acme.srn:coeus:acme::collection"
      },
      {
        "action": ["data:delete"],
        "allow": false,
        "resource": "acme.*"
      }
    ]
  },
  "srn": "srn:coeus:acme::user/johnsmith",
  "username": "johnsmith",
  "iat": 1599095260,
  "iss": "coeus.solarix.tools"
}
```

## Story Implementation Examples

### WCASG Dashboard: Usage Stats

> WCASG is to start collection some very basic user stats about their widget in WCASG Dashboard issue #75 and @gabestah must store that data. The database is already built, underwent customization stresses during development and may not perfectly fit the widget/dashboard model as if it was built from scratch. However, it must still report data to SolData on how many times a widget is loaded by a web browser. Perhaps @gabestah reads the future documentation about SolData API, integrates the database storage per the specific project best fit solutions and uses a provided snippet of php to run a cronjob to POST to webhook that will be processed & stored by SolData in a timely manner. @ksomerville is then able to visualize the pageview & bandwidth data at the end of the month to include on the customer invoices.

- **database**: `wcasg`
- **collection**: `srn:coeus:wcasg::collection`

> Number of current Active Sites
> Page Views Per Current Month (For all active sites)
> Overall Page Views (For all active sites)
> Overall Bandwidth Used Per Month
> Average Bandwidth Per Sites (Bandwidth total / # of active sites) per month
> Voice Bandwidth Used Per Month (For all active sites)

### Acme Logistics: Fruit

> bettyDoe at Acme Logistics asks @ksomerville to create a small app for her logistics company that transports fruit from regional farms. The client will require a database that stores information such as fruits, client profiles, farm asset profiles, current deliveries, sales amounts and a wide variety of other points. He refers to internal developer documentation and the basic API it offers so that the company's data can be easily submitted and eventually visualized in a report. He then writes a small script that submits some of that data to the SolData web service daily. @ksomerville then creates a visualization to automate weekly and sends the client an email with only the week's sales numbers and number of deliveries.

### Strapi CMS

> charlieDoe wants Solarix to make a website for his pallet processing & storage business. His request is for a simple brochure website with an single dynamic page that displays the status of each pallet in his warehouse so that his customers know the current progress on their job. @ksomerville reads up on documentation requiremeents and there are a few starter databases in template repos to fork from, so he chooses to include the MongoDB starter with Strapi headless client. He writes his project, including the brochure/business content in the website attached to the CMS and giving the the customer access to the Strapi dashboard to update pallet info as needed. The MongoDB fork was already modeled to be structured in the preferred way SolData dictates and the Strapi repo included a snippet to add a POST to SolData web service whenever Strapi data is saved.

### Salesforce: CSV

> deniseDoe has a large customer database from Salesforce exported to csv and she want's it accessible via a JSON rest API in the future. @ksomerville visits an internal Solarix tool that triggers a process that: imports the CSV > SolData creates an EAV model table to store that data and saves it > SolData then allows that data to be accessed via REST API to those who have access to that asset.

## API

### Errors

#### HTTP Status Codes

| Code | Type              | Description                                                                      |
| ---- | ----------------- | -------------------------------------------------------------------------------- |
| 200  | OK                | Working as intended.                                                             |
| 400  | Bad Request       | The request was unacceptable, due to malformed request, payload, or otherwise.   |
| 401  | Unauthorized      | No valid API key provided.                                                       |
| 402  | Request Failed    | The parameters were valid but the request failed.                                |
| 403  | Forbidden         | The API key doesn't have permissions to perform the request.                     |
| 404  | Not Found         | The requested resource doesn't exist.                                            |
| 429  | Too Many Requests | Request timeout threshold was reached. Wait a while or adjust request frequency. |
| 500  | Server Error      | A server issue caused a failed request.                                          |

#### Types

| Type                  | Description                                          |
| --------------------- | ---------------------------------------------------- |
| api_connection_error  | Failure to connect to Coeus.                         |
| api_error             | Internal Coeus error.                                |
| authentication_error  | Failure to properly authenticate within the request. |
| invalid_request_error | Request has invalid parameters.                      |
| rate_limit_error      | Too many requests in too short a period.             |

#### Example

```json
{
  "code": 400,
  "type": "authentication_error",
  "message": "You do not have permission to access that resource."
}
```

## Requests

### Limits

By default, Coeus limits the number of documents returned by a single request:

- `20` - Default maximum number of documents retrieved if no `limit` specified. Configurable via the `config.db.thresholds.limit.base` path.
- `1` - Minimum number of documents that can be retrieved. Configurable via the `config.db.thresholds.limit.minimum` path.
- `100` - Maximum number of documents that can be retrieved. Configurable via the `config.db.thresholds.limit.minimum` path.

### Timeout

By default, Coeus restricts all requests to under `5000` milliseconds. This value is configurable via the `config.db.thresholds.timeout.maximum` path.

### Pagination

TODO

- https://docs.mongodb.com/manual/indexes/#indexes

### Find

To find one or more documents send a `POST` request to the `/data/find` endpoint.

The body _must_ contain:

- `db`: The database name to query.
- `collection`: The collection name within the database to query.

The body _may_ contain:

- `query`: MongoDB-compatible object defining query parameters.
- `limit`: Maximum number of documents to return.
- `options`: MongoDB-compatible object defining query options.

#### Schema

Below is the JSON Schema for the `/data/find` endpoint.

```js
const schema = {
  body: {
    type: 'object',
    required: ['collection', 'db'],
    properties: {
      collection: {
        type: 'string'
      },
      db: {
        type: 'string'
      },
      limit: {
        type: ['number', 'null'],
        default: config.get('db.thresholds.limit.base'),
        minimum: config.get('db.thresholds.limit.minimum'),
        maximum: config.get('db.thresholds.limit.maximum')
      },
      options: {
        type: ['object', 'null'],
        default: null
      },
      query: {
        type: ['object', 'string'],
        default: {}
      }
    }
  }
};
```

#### Examples

**Example**: Perform a full text search for the term `Superman` within the `sample_mflix.movies` collection. Limit to a maximum of `5` documents:

```json
{
  "collection": "movies",
  "db": "sample_mflix",
  "query": {
    "$text": {
      "$search": "Superman"
    }
  },
  "limit": 5
}
```

### Insert

TODO

### Update

TODO

## TODO

### Request Option: idempotence_id

- Mutable action requests (i.e. `delete`, `insert`, `update`) should have an `idempotence_id` to ensure repeated requests are not processed multiple times.

### Request Option: format

- json, csv, etc: Allow output format of results

### Request Option: email

- Email address to send results to. Requires background worker system.

### Privilege Option: ip address

- Restrict requests from ip address/range

### Privilege Option: hostname

- Restrict requests from hostname
