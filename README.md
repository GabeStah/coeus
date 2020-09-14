- [Coeus](#coeus)
  - [Conventions and Terminology](#conventions-and-terminology)
  - [Development](#development)
    - [Dynamic Watches](#dynamic-watches)
  - [Testing](#testing)
    - [Coverage](#coverage)
  - [Database: MongoDB](#database-mongodb)
    - [Naming Conventions](#naming-conventions)
    - [Databases](#databases)
      - [Examples](#examples)
    - [Collections](#collections)
      - [Examples](#examples-1)
    - [Document](#document)
  - [Identifiers](#identifiers)
  - [Protected Database / Collections](#protected-database--collections)
  - [Users, Authentication, and Authorization](#users-authentication-and-authorization)
    - [User Registration](#user-registration)
      - [/user/register Request Example](#userregister-request-example)
    - [User Login](#user-login)
      - [/user/login Request Example](#userlogin-request-example)
    - [Authentication](#authentication)
    - [Authorization](#authorization)
      - [Policy](#policy)
        - [Policy Statement: Property Case Sensitivity](#policy-statement-property-case-sensitivity)
        - [Policy Statement: action](#policy-statement-action)
        - [Policy Statement: resource](#policy-statement-resource)
        - [Policy Statement: allow](#policy-statement-allow)
        - [Example Policies](#example-policies)
  - [Routes](#routes)
  - [Story Implementation Examples](#story-implementation-examples)
    - [WCASG Dashboard: Usage Stats](#wcasg-dashboard-usage-stats)
    - [Acme Logistics: Fruit](#acme-logistics-fruit)
    - [Strapi CMS](#strapi-cms)
    - [Salesforce: CSV](#salesforce-csv)
  - [API](#api)
    - [Errors](#errors)
      - [Error Response Example](#error-response-example)
  - [Requests](#requests)
    - [Limits](#limits)
    - [Timeout](#timeout)
    - [/data/find](#datafind)
      - [/data/find Schema](#datafind-schema)
      - [/data/find Request Example](#datafind-request-example)
    - [/data/insert](#datainsert)
      - [/data/insert Schema](#datainsert-schema)
      - [/data/insert Request Example](#datainsert-request-example)
    - [/data/delete](#datadelete)
      - [/data/delete Schema](#datadelete-schema)
      - [/data/delete Request Example](#datadelete-request-example)
    - [/data/update](#dataupdate)
      - [/data/update Schema](#dataupdate-schema)
      - [/data/update Request Example](#dataupdate-request-example)
  - [TODO](#todo)
    - [Performance Check: Retrieve User from Database on Every Request](#performance-check-retrieve-user-from-database-on-every-request)
    - [/data/delete Logic Check: `_id` Property](#datadelete-logic-check-_id-property)
    - [Pagination](#pagination)
    - [/user/login Option: email](#userlogin-option-email)
    - [Request Option: idempotence_id](#request-option-idempotence_id)
    - [Request Option: format](#request-option-format)
    - [Request Option: email](#request-option-email)
    - [PolicyStatement Property: ip](#policystatement-property-ip)
    - [PolicyStatement Property: hostname](#policystatement-property-hostname)
    - [/user/explain Endpoint](#userexplain-endpoint)
    - [/user/activate Endpoint](#useractivate-endpoint)
    - [API Documentation Generator](#api-documentation-generator)

# Coeus

Coeus is an HTTP API providing insightful answers through data.

In Greek mythology [Coeus](https://en.wikipedia.org/wiki/Coeus) is the son of Uranus and Gaia and is the ["Titan of intellect and the axis of heaven around which the constellations revolved"](https://en.wikipedia.org/wiki/List_of_Greek_mythological_figures#Titans_and_Titanesses). The name is derived from the Ancient Greek [κοῖος](https://en.wiktionary.org/wiki/%CE%9A%CE%BF%E1%BF%96%CE%BF%CF%82), meaning "what?, which?, of what kind?, of what nature?".

## Conventions and Terminology

The key words _MUST_, _MUST NOT_, _REQUIRED_, _SHALL_, _SHALL NOT_, _SHOULD_, _SHOULD NOT_, _RECOMMENDED_, _MAY_, and _OPTIONAL_ in this document are to be interpreted as described in [RFC2119](https://tools.ietf.org/html/rfc2119).

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

**NOTE:** The `test:debug` command variants _SHOULD_ be executed while halting execution within a test (such as during debugging).

### Coverage

`yarn run test:coverage` generates a full test coverage report using [IstanbulJS](https://github.com/istanbuljs/istanbuljs). The generated HTML report can be found in the `coverage/lcov-report`, e.g.:

| Statements        |       | Branches |       | Functions |       | Lines |       |
| ----------------- | ----- | -------- | ----- | --------- | ----- | ----- | ----- |
| src               |       |          |       |           |       |       |       |
| 100%              | 12/12 | 100%     | 0/0   | 100%      | 1/1   | 100%  | 12/12 |
| src/config        |       |          |       |           |       |       |       |
| 100%              | 8/8   | 100%     | 0/0   | 100%      | 0/0   | 100%  | 8/8   |
| src/helpers       |       |          |       |           |       |       |       |
| 100%              | 29/29 | 100%     | 5/5   | 100%      | 16/16 | 100%  | 29/29 |
| src/models        |       |          |       |           |       |       |       |
| 100%              | 66/66 | 100%     | 24/24 | 100%      | 18/18 | 100%  | 66/66 |
| src/plugins       |       |          |       |           |       |       |       |
| 100%              | 28/28 | 100%     | 2/2   | 100%      | 5/5   | 100%  | 26/26 |
| src/plugins/db    |       |          |       |           |       |       |       |
| 100%              | 15/15 | 100%     | 0/0   | 100%      | 6/6   | 100%  | 12/12 |
| src/plugins/hooks |       |          |       |           |       |       |       |
| 100%              | 7/7   | 100%     | 0/0   | 100%      | 4/4   | 100%  | 5/5   |
| src/routes        |       |          |       |           |       |       |       |
| 100%              | 7/7   | 100%     | 0/0   | 100%      | 4/4   | 100%  | 6/6   |
| src/routes/data   |       |          |       |           |       |       |       |
| 100%              | 31/31 | 100%     | 0/0   | 100%      | 12/12 | 100%  | 28/28 |
| src/routes/user   |       |          |       |           |       |       |       |
| 100%              | 19/19 | 100%     | 0/0   | 100%      | 8/8   | 100%  | 17/17 |
| src/schema        |       |          |       |           |       |       |       |
| 100%              | 1/1   | 100%     | 0/0   | 100%      | 0/0   | 100%  | 1/1   |
| src/services      |       |          |       |           |       |       |       |
| 100%              | 70/70 | 100%     | 35/35 | 100%      | 14/14 | 100%  | 70/70 |

## Database: MongoDB

- Version: 4.4
- Region: AWS us-east-1 (required for version 4.4 free tier support)

### Naming Conventions

**NOTE:** Windows users may experience trouble within the `mongo` shell when using special characters (`/\. "$*<>:|?`). Please use a Linux-based shell when executing shell commands that use such characters in relevant `namespaces`.

- **Database** names _MUST_ be a minimum of `4` characters in length.
- **Database** names _MUST NOT_ exceed a maximum of `64` characters in length.
- **Database** names _MAY NOT_ contain any of the following characters: `/\. "$*<>:|?`.
- **Database** names _MAY NOT_ begin with the string `coeus`.
- A `namespace` (the combined **database.collection** name) _MAY NOT_ exceed `255` characters in length.
- **Collection** names _MAY_ use special characters, so long as they begin with a letter.
- **Collection** names _MUST_ be a minimum of `4` characters in length.
- **Collection** names _MUST NOT_ exceed a maximum of `190` characters in length.
- **Role** names _MUST_ contain only letters, numbers, hyphens, and underscores.

### Databases

Each **database** _MUST_:

- be globally unique and identifiable, based on a single high-level entity such as an `organization`.

#### Examples

- `acme`: A **database name** for the Acme `org`
- `solarix`: For Solarix projects

### Collections

Each **collection** _MUST_:

- be self-contained.
- contain related data.
- use [Solarix Resource Name (SRN)](https://docs.solarix.tools/solarix-resource-names) conventions.

Each **collection** _SHOULD_:

- be based on a single high-level entity such as an `org`, if applicable.

A higher-order **SRN** is preferred for aggregate queries and data storage, but smaller **collections** can be created to store separate `project` or even `app` data.

#### Examples

An **SRN** of `srn::acme` is the highest order **SRN** for the `Acme` `org`, applying to all services and all projects within that `org`. A **collection `name`** of `srn:coeus:acme::collection` may contain any type of Acme-related data.

Alternatively, an **SRN** of `srn::acme:tracker:api:production` with related **collection `name`** of `srn:coeus:acme:tracker:api:production::collection` is expected to contain data only related to Acme's Tracker API project, in the production environment of the AWS EC2 service. This is a much smaller scope, so take care when choosing which **collection** names to create.

### Document

Each **document** _MUST_:

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

## Users, Authentication, and Authorization

Coeus authentication and authorization is performed based on the requesting User's `coeus.users` document. The schema of a `user` document can be found in the [src/routes/user/register.ts](src/routes/user/register.ts#L21) file. Below is an example `user` document:

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

### User Registration

A new User is registered by making an appropriate request to the `/user/register` endpoint. The current schema can be found in the [src/routes/user/register.ts](src/routes/user/register.ts#L21) file.

Once a User is registered and set `active` by an admin, that user can then login to retrieve an authentication token.

#### /user/register Request Example

Each **User** _MUST_ contain:

- `username`: To allow for multiple users per email, `username` is the **primary unique value** for differentiating users.
- `email`
- `org`: Organization name, per the [Solarix Resource Name (SRN)](https://docs.solarix.tools/solarix-resource-names/) conventions.
- `password`

Each **User** _SHOULD_ contain:

- `policy`: An object containing `PolicyStatements` defining permissions. See [Policy](#policy) for details.

For example, a `POST` request to `/user/register` can be made with a body payload of:

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

This successfully registers the above user and responds with the created message and data object:

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

### User Login

After registering a User may send a request to the `/user/login` endpoint to authenticate and retrieve their unique JSON Web Token (JWT).

#### /user/login Request Example

A `/user/login` request payload _MUST_ contain:

- `username`
- `password`

For example, a `POST` request to `/user/login` can be made with a body payload of:

```json
{
  "username": "johnsmith",
  "password": "password"
}
```

If the username and password are correct the response payload will output the User's JWT:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3RpdmUiOmZhbHNlLCJlbWFpbCI6ImpvaG5AYWNtZS5jb20iLCJvcmciOiJhY21lIiwicHJpdmlsZWdlcyI6W3sicmVzb3VyY2UiOnsiZGIiOiJhY21lIiwiY29sbGVjdGlvbiI6InNybjpjb2V1czphY21lOjpjb2xsZWN0aW9uIn0sImFjdGlvbnMiOiJmaW5kIn0seyJyZXNvdXJjZSI6eyJkYiI6InNvbGFyaXgiLCJjb2xsZWN0aW9uIjoic3JuOmNvZXVzOnNvbGFyaXg6OmNvbGxlY3Rpb24ifSwiYWN0aW9ucyI6ImZpbmQifV0sInNybiI6InNybjpjb2V1czphY21lOjp1c2VyL2pvaG5zbWl0aCIsInVzZXJuYW1lIjoiam9obnNtaXRoIiwiaWF0IjoxNTk5MDk0ODk5LCJpc3MiOiJjb2V1cy5zb2xhcml4LnRvb2xzIn0.73dnMmj1g2_gVS5rrlIcUT2MZgp7JjWZo9vbQyDas2c"
}
```

The generated `token` is issued by `coeus.solarix.tools` and contains encoded user data from the time of authentication, e.g.:

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

### Authentication

Authentication is performed for all **protected** endpoints. Such endpoints perform a JSON Web Token `preValidation` phase before processing the request payload. For example, all `/data/*` endpoints are protected.

To authenticate a request to a protected endpoint the `Authorization` header must contain a `Bearer <jwt>` value. For example, making a request to `/data/find`:

```bash
$ curl --location --request POST 'http://localhost:8000/data/find' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3RpdmUiOmZhbHNlLCJlbWFpbCI6ImpvaG5AYWNtZS5jb20iLCJvcmciOiJhY21lIiwicHJpdmlsZWdlcyI6W3sicmVzb3VyY2UiOnsiZGIiOiJhY21lIiwiY29sbGVjdGlvbiI6InNybjpjb2V1czphY21lOjpjb2xsZWN0aW9uIn0sImFjdGlvbnMiOiJmaW5kIn0seyJyZXNvdXJjZSI6eyJkYiI6InNvbGFyaXgiLCJjb2xsZWN0aW9uIjoic3JuOmNvZXVzOnNvbGFyaXg6OmNvbGxlY3Rpb24ifSwiYWN0aW9ucyI6ImZpbmQifV0sInNybiI6InNybjpjb2V1czphY21lOjp1c2VyL2pvaG5zbWl0aCIsInVzZXJuYW1lIjoiam9obnNtaXRoIiwiaWF0IjoxNTk5MDk0ODk5LCJpc3MiOiJjb2V1cy5zb2xhcml4LnRvb2xzIn0.73dnMmj1g2_gVS5rrlIcUT2MZgp7JjWZo9vbQyDas2c' \
--header 'Content-Type: application/json' \
--data-raw '{
  "collection": "srn:coeus:acme::collection",
  "db": "acme",
  "query": {
    "foo": "bar"
  }
}'
```

### Authorization

The passed JWT is decoded and evaluated to determine the privileges assigned to the User based on the User's **Policy** object.

In general, authorization is based on a combination of **four** properties:

- `service`: The service that is handling the request. For example, a request to a `/data/*` endpoint uses the [DataService](src/services/DataService.ts).
- `method`: The service method that is handling the request. For example, a request to the `/data/find` endpoint is processed by the [routes/data/find](src/routes/data/find.ts) plugin, which passes the validated request to the [DataService.find()](src/services/DataService.ts#L94) method for authorization.
- `db`: The accessed database of the request.
- `collection`: The accessed collection of the request.

Coeus compares the incoming request against the **Policy** permissions granted to the User to determine if the request is authorized.

#### Policy

The `policy` property of a **User** document defines permissions for that user. A policy consists of one or more `statement` objects.

A **policy** _MUST_ contain:

- a `statement` property with an array of **policy statement** objects defining a related collection of privileges.

A **policy** _MAY_ contain:

- a `version` semver value that indicates what API version this policy was generated with. This value is automatically generated upon creation.

A **policy statement** _MUST_ contain:

- an `action` property.
- a `resource` property.

A **policy statement** _MAY_ contain:

- an `allow` property.

##### Policy Statement: Property Case Sensitivity

All `PolicyStatement` property strings are **case insensitive.** Coeus normalizes all string casings during execution, so consistency and convention dictates that all property values remain lowercase.

##### Policy Statement: action

The `action` property defines the action(s) allowed or denied by the **statement**. An `action` string _MUST_ be formatted as `<service>:<method>`. For example, an `action` of `data:find` indicates the `find` method for the `data` service.

An asterisk (`*`) may be substituted for the `<method>` as a wildcard indicator for **ALL** methods within the given `<service>`. For example, `data:*` applies actions to all methods of the `data` service.

##### Policy Statement: resource

The `resource` property defines the resource(s) allowed or denied by the **statement**. A `resource` string _MUST_ be formatted as `<db>.<collection>`. For example, a `resource` of `acme.srn:coeus:acme::collection` indicates the `srn:coeus:acme::collection` collection of the `acme` database.

An asterisk (`*`) may be substituted for the `<collection>` as a wildcard indicator for **ALL** collections within the given `<db>`. For example, `acme:*` applies to all collections within the `acme` database.

An asterisk (`*`) may also be substituted for the entire `resource` string as a wildcard indicator for **ALL** database and collection combinations. **This provides full admin access, so use with caution.**

##### Policy Statement: allow

The `allow` property determines if the **statement** is allowing or denying permission indicated by the related `action` and `resource`.

By default, a **statement** without an `allow` property is assumed to be `true`, allowing permission to the related `resource`. Otherwise, the default policy across the app is to deny permission unless explicitly allowed.

##### Example Policies

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

## Routes

- /admin/authenticate - Authenticate as a User without password and receive JWT
- /admin/register - Register a User, automatically verify and activate, and receive JWT
- /data/delete - Delete documents
- /data/find - Find documents
- /data/insert - Insert documents
- /data/update - Update documents
- /user/login - Login via `username` / `password` and receive JWT
- /user/register - Register a User

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

| Code | Type         | Message                                               | Cause                                                                                                          |
| ---- | ------------ | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 403  | Forbidden    | Policy is invalid: No valid policy statement provided | User has no `PolicyStatement` objects within their `Policy`                                                    |
| 403  | Forbidden    | You do not have permission to perform the request     | User does not have authorization for the requested `service`, `method`, `db`, or `collection`                  |
| 403  | Forbidden    | You do not have permission to perform the request     | User has a `PolicyStatement` matching the request that is explicitly marked as denied by `allow = false`       |
| 403  | Forbidden    | Authorization token is invalid: User is inactive      | User is marked as inactive via `active = false`                                                                |
| 409  | Conflict     | Unable to create new user: <username>                 | Attempt to register a new User cannot continue, typically due to a matching `username` already in the database |
| 401  | Unauthorized | Unable to authenticate with provided credentials.     | Attempt to login failed, either because of invalid `username` or `username/password` combination               |

#### Error Response Example

```json
{
  "code": 403,
  "type": "Forbidden",
  "message": "You do not have permission to perform the request"
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

### /data/find

To find one or more documents send a `POST` request to the `/data/find` endpoint.

The body _MUST_ contain:

- `db`: The database name to query.
- `collection`: The collection name within the database to query.
- `query`: MongoDB-compatible object defining query parameters.

The body _MAY_ contain:

- `limit`: Maximum number of documents to return.
- `options`: MongoDB-compatible object defining query options.

See [MongoDb Collection.find()](http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#find) for parameter option details.

#### /data/find Schema

```js
const schema = {
  type: 'object',
  required: ['collection', 'db'],
  properties: {
    collection: {
      $id: 'collection',
      type: 'string',
      minLength: 4,
      maxLength: 190
    },
    db: {
      $id: 'db',
      type: 'string',
      minLength: 4,
      maxLength: 64,
      pattern: '^(?!coeus).+'
    }
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
};
```

#### /data/find Request Example

**Example**: Perform a full text search for the term `Superman` within the `sample_mflix.movies` collection. Limit to a maximum of `5` documents:

```bash
$ curl --location --request POST 'http://localhost:8000/data/find' \
--header 'Authorization: Bearer <JWT>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "collection": "movies",
  "db": "sample_mflix",
  "query": {
    "$text": {
      "$search": "Superman"
    }
  },
  "limit": 5
}'
```

**Response** is `5` entries similar to this one:

```json
[
  {
    "_id": "573a13dff29313caabdb959c",
    "plot": "Superman and Supergirl take on the cybernetic Brainiac, who boasts that he possesses \"the knowledge and strength of 10,000 worlds.\"",
    "genres": ["Animation", "Action", "Adventure"],
    "runtime": 75,
    "rated": "PG-13",
    "cast": ["Matt Bomer", "Stana Katic", "John Noble", "Molly C. Quinn"],
    "num_mflix_comments": 3,
    "poster": "https://m.media-amazon.com/images/M/MV5BMTkzMjczODQzMV5BMl5BanBnXkFtZTcwOTIyOTQ0OQ@@._V1_SY1000_SX677_AL_.jpg",
    "title": "Superman: Unbound",
    "fullplot": "Offering herself as a hostage, Lois Lane is caught in an aerial confrontation between her terrorist captors and the unpredictable Supergirl before Superman arrives to save the day. Soon after, knowing Superman's civilian identity, Lois attempts to get Clark Kent to make their relationship public despite his fear of the consequences, but their argument is halted by a Daily Planet staff meeting before Kent leaves when they are being alerted to a meteor. Intercepting it, Superman learns the meteor to be a robot and that he promptly defeats before activating its beacon and taking it to the Fortress of Solitude. With help from a fear-filled Supergirl, Superman learns the robot is actually a drone controlled by a being named Brainiac, a cyborg who was originally a Coluan scientist who subjected himself to extensive cybernetic and genetic enhancements. As Supergirl reveals from her experience with the monster, Brainiac seized and miniaturized Krypton's capital city of Kandor prior to the planet's destruction with her father and mother attempting to track him down before they mysteriously lost contact with Krypton. Fearing more drones would come, Superman goes flying all through the galaxy in an attempt to track down Brainiac before finding his drones attacking a planet. Though he attempted to stop them, Superman witnesses Brainiac capture the planet's capital like he did with Kandor before firing a Solar Aggressor missile to have the planet be consumed by the exploding sun. The explosion knocks Superman unconscious and he is brought upon Brainiac's ship, coming to in the examination room and fighting his way through the vessel before he discovers a room full of bottled cities prior to being attacked by Brainiac. At this point, confirming that he spared Krypton because of its eventual destruction, Brainiac reveals that he has been collecting information of all the planets he visited before destroying them. Using Superman's spacecraft, Brainiac decides to chart a course to Earth while sending Superman into Kandor. Inside Kandor, his strength waning due to the artificial red sun, Superman meets his uncle Zor-El and aunt Alura. After spending time with them, Superman formulates a plan and escapes Kandor using the subjugator robots. From there, Superman disables Brainiac's ship and spirits Kandor to Earth. At that time, Lois learns from Supergirl of why Superman left and alerts the Pentagon for a possible invasion by Brainiac as he eventually repaired his ship and arrives to Metropolis. Despite everyone, including Supergirl, doing their best to fend his drones off, Metropolis is encased in a bottle and both Superman and Supergirl are captured. Having hooked Superman up to his ship, revealing that Earth offers nothing to him, Brainiac tortures Superman to obtain Kandor before destroying the planet. However, telling his captor what Earth means to him, Superman breaks free and then frees Supergirl and convinces her to stop the Solar-Aggressor from hitting the sun. Remembering Zor-El's words about Brainiac's ideals, Superman knocks him out of the ship and they crash into a swamp. As he fights Braniac, Superman forces the cyborg to experience the chaos of life itself outside of his safe, artificial environments he created. Eventually, the combined mental and physical strain reaches its toll on Brainiac as he combusts and is reduced to ash and molten machinery. After restoring Metropolis, taking Kandor to another planet to restore it to its normal size to establish a Kryptonian colony, Superman makes his love life with Lois as Kent public with a marriage proposal. However, placed in the Fortress of Solitude, Brainiac's remains are still active.",
    "languages": ["English"],
    "released": "2013-05-23T00:00:00.000Z",
    "directors": ["James Tucker"],
    "writers": [
      "Bob Goodman",
      "Geoff Johns (graphic novel: \"Superman: Brainiac\")",
      "Gary Frank (graphic novel: \"Superman: Brainiac\")",
      "Jerry Siegel (creator)",
      "Joe Shuster (creator)",
      "Jerry Ordway (creator)",
      "Tom Grummet (creator)"
    ],
    "awards": {
      "wins": 0,
      "nominations": 3,
      "text": "3 nominations."
    },
    "lastupdated": "2015-08-31 00:27:43.340000000",
    "year": 2013,
    "imdb": {
      "rating": 6.6,
      "votes": 6421,
      "id": 2617456
    },
    "countries": ["USA"],
    "type": "movie",
    "tomatoes": {
      "viewer": {
        "rating": 2.4,
        "numReviews": 5
      },
      "lastUpdated": "2015-07-04T18:27:40.000Z"
    }
  }
]
```

### /data/insert

To insert one or more documents send a `POST` request to the `/data/insert` endpoint.

The body _MUST_ contain:

- `db`: The database name to query.
- `collection`: The collection name within the database to query.
- `document`: An array of object(s) to be inserted.

The body _MAY_ contain:

- `ordered`: If true, when an insert fails, don't execute the remaining writes. If false, continue with remaining inserts when one fails. Default: `true`

See [MongoDb Collection.insertMany()](http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#insertMany) for parameter option details.

#### /data/insert Schema

```js
const schema = {
  type: 'object',
  required: ['collection', 'db', 'document'],
  properties: {
    collection: schema.collection,
    db: schema.db,
    document: {
      type: 'array',
      items: {
        type: 'object',
        default: {}
      },
      minItems: 1
    },
    ordered: {
      type: 'boolean',
      default: true
    }
  }
};
```

#### /data/insert Request Example

**Example**: Insert 3 simple documents into the `acme.srn:coeus:acme::collection` collection:

```bash
$ curl --location --request POST 'http://localhost:8000/data/insert' \
--header 'Authorization: Bearer <JWT>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "collection": "srn:coeus:acme::collection",
  "db": "acme",
  "document": [
    {
      "data": "foo"
    },
    {
      "data": "bar"
    },
    {
      "data": "baz"
    }
  ]
}'
```

**Response**: Indicates the number of documents inserted and returns the unique `_id` array.

```json
{
  "statusCode": 200,
  "message": "3 documents inserted",
  "data": [
    "5f5c2046f95d0460e0856827",
    "5f5c2046f95d0460e0856828",
    "5f5c2046f95d0460e0856829"
  ]
}
```

### /data/delete

To delete one or more documents send a `POST` request to the `/data/delete` endpoint.

The body _MUST_ contain:

- `db`: The database name to access.
- `collection`: The collection name within the database to access.
- `filter`: MongoDB-compatible object defining the filter query on which to base deletion targets.

The body _MAY_ contain:

- `options`: MongoDB-compatible object defining method options.

See [MongoDb Collection.deleteMany()](http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#deleteMany) for parameter option details.

#### /data/delete Schema

```js
const schema = {
  type: 'object',
  required: ['collection', 'db', 'filter'],
  properties: {
    collection: schema.collection,
    db: schema.db,
    filter: {
      type: 'object',
      default: {}
    },
    options: {
      type: ['object', 'null'],
      default: null
    }
  }
};
```

#### /data/delete Request Example

**Example**: Delete all documents with a key `foo` value of `bar` within the `acme.srn:coeus:acme::collection` collection:

```bash
$ curl --location --request POST 'http://localhost:8000/data/delete' \
--header 'Authorization: Bearer <JWT>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "collection": "srn:coeus:acme::collection",
  "db": "acme",
  "filter": {
    "foo": "bar"
  }
}'
```

**Response** indicates the number of deleted documents:

```json
{
  "statusCode": 200,
  "message": "1 document deleted"
}
```

### /data/update

Update one or more documents by sending a `POST` request to the `/data/update` endpoint.

The body _MUST_ contain:

- `db`: The database name to access.
- `collection`: The collection name within the database to access.
- `filter`: MongoDB-compatible object defining the filter query on which to base update targets.
- `update`: MongoDB-compatible object defining the document shape with which to update.

The body _MAY_ contain:

- `options`: MongoDB-compatible object defining method options.

See [MongoDb Collection.updateMany()](http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#updateMany) for parameter option details.

#### /data/update Schema

```js
const schema = {
  type: 'object',
  required: ['collection', 'db', 'filter', 'update'],
  properties: {
    collection: schema.collection,
    db: schema.db,
    filter: {
      type: 'object',
      minProperties: 1,
      default: null
    },
    options: {
      type: ['object', 'null'],
      default: null
    },
    update: {
      type: 'object',
      minProperties: 1,
      default: null
    }
  }
};
```

#### /data/update Request Example

**Example**: Update all documents with a `data` key value that matches the RegEx `^bar` (begins with 'bar') within the `acme.srn:coeus:acme::collection` collection. For all matched documents, set the `data` key value to `foo`:

```bash
$ curl --location --request POST 'http://localhost:8000/data/update' \
--header 'Authorization: Bearer <JWT>' \
--header 'Content-Type: application/json' \
--data-raw '{
    "collection": "srn:coeus:acme::collection",
    "db": "acme",
    "filter": {
        "data": {
            "$regex": "^bar"
        }
    },
    "update": {
        "$set": {
            "data": "foo"
        }
    }
}'
```

**Response** indicates the number of updated documents:

```json
{
  "statusCode": 200,
  "message": "2 documents updated"
}
```

## TODO

### Compression

- [x] Integrate response payload compression.

### Performance Check: Cache In-Memory User Data

- Using JWT payload to determine Policy is preferred for speed, but the only means of disabling a User for an Admin is to wait for JWT token expiration.
- Cache User db permissions in-memory for validation against request. Update in-memory cache on any relevant `/user` successful endpoint request.
- Use `coeus.users` `hash` property for fast validation, comparing JWT hash to in-memory hash.

Generate `hash` when:

- User document inserted into db
- User document updated in db

### /data/delete Logic Check: `_id` Property

- If a `/data/delete` `filter` object key is `_id`, perform backend conversion of value to `ObjectId(value)` before making MongoDB request to ensure proper parsing.

### Pagination

- see: https://docs.mongodb.com/manual/indexes/#indexes

### Caching

- Apply request caching; in-memory or Redis-powered.

### CORS Support

- Add CORS support.
- Integrate with `PolicyStatement` `ip` / `hostname` properties.

### /user/register Option: email

- [x] Integrate email support (AWS SES)
- Email verification token to user email address.
- Clicking should set User `verified = true`.
- Upon verification email user with confirmation and inform to await admin activation.

### /user/login Option: email

- Email generated JWT token to user email address.
- Send attachment
- User must be `active` and `verified`.

### /user/activate Endpoint

- Endpoint for activating specified User(s), so they can login, recieve JWT, and make requests.
- Upon activation email User with JWT.

### Request Option: idempotence_id

- Mutable action requests (i.e. `delete`, `insert`, `update`) should have an `idempotence_id` to ensure repeated requests are not processed multiple times.

### Request Option: format

- json, csv, etc: Allow output format of results

### Request Option: email

- Email address to send results to. Requires background worker system.

### PolicyStatement Property: ip

- Restrict requests from ip address/range

### PolicyStatement Property: hostname

- Restrict requests from hostname

### /user/explain Endpoint

- Explains Policy rules of specified User(s), such as `db` and `collection` access, and associated `service` and `method` allowances.

### API Documentation Generator

- Swagger or similar tool?
