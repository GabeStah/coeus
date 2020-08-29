# Coeus

In Greek mythology [Coeus](https://en.wikipedia.org/wiki/Coeus) is the son of Uranus and Gaia and is the ["Titan of intellect and the axis of heaven around which the constellations revolved"](https://en.wikipedia.org/wiki/List_of_Greek_mythological_figures#Titans_and_Titanesses). The name is derived from the Ancient Greek [κοῖος](https://en.wiktionary.org/wiki/%CE%9A%CE%BF%E1%BF%96%CE%BF%CF%82), meaning "what?, which?, of what kind?, of what nature?".

Coeus is an HTTP API providing insightful answers through data.

## Development

1. Install Node modules: `yarn install`
2. Copy `config/example.json` to `environment.json`, replacing `environment` with the appropriate environment name (e.g. `development.json`).  See [snippets/development.json](https://gitlab.solarixdigital.com/solarix/core/soldata/coeus/snippets/20) for functional example.
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

## Databases

Each **database** **must**:

- Be globally unique and identifiable, based on a single high-level entity such as an `organization`.

### Example

- `acme`: A **database name** for the Acme `org`
- `solarix`: For Solarix projects

## Collections

Each **collection** **must**:

- Be self-contained
- Contain related data
- Use [Solarix Resource Name (SRN)](https://docs.solarix.tools/solarix-resource-names) conventions

Each **collection** **should**:

- Be based on a single high-level entity such as an `org`, if applicable

A higher-order **SRN** is preferred for aggregate queries and data storage, but smaller **collections** can be created to store separate `project` or even `app` data.

### Examples

An **SRN** of `srn::acme` is the highest order **SRN** for the `Acme` `org`, applying to all services and all projects within that `org`. A **collection name** of `srn::acme` may contain any type of Acme-related data.

Alternatively, an **SRN** of `srn:ec2:acme:tracker:api:production` with a matching **collection name** is expected to contain data only related to Acme's Tracker API project, in the production environment of the AWS EC2 service. This is a much smaller scope, so take care when choosing which **collection** names to create.

## Document

Each document **must**:

- Be less than `16MB`

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

## Roles and Privileges

**Example: Acme Admin Role**

```json5
{
  "_id": "acme.admin",
  "role": "srn:mongo::role/acme-admin",
  "db": "acme",
  "privileges": [
    {
      "resource": { 
        "db": "acme", 
        // All collections
        "collection": ""
      },
      "actions": ["find", "createCollection", "dbStats", "collStats"]
    },
    {
      "resource": { "db": "acme", "collection": "srn::acme" },
      "actions": ["insert", "update", "remove", "compact"]
    },
    {
      "resource": { "db": "acme", "collection": "srn::acme:tracker:api:development" },
      "actions": ["find"]
    }
  ],
  "roles": []
}
```

**Example: Acme Public Role**

```json5
{
  "_id": "acme.public",
  "role": "srn:mongo::role/acme-public",
  "db": "acme",
  "privileges": [
    {
      "resource": { 
        "db": "acme", 
        "collection": "srn::acme"
      },
      "actions": ["find"]
    }
  ],
  "roles": []
}
```

- [user defined roles](https://docs.mongodb.com/manual/core/security-user-defined-roles/)
- [defining roles](https://docs.mongodb.com/manual/reference/method/db.createRole/#db.createRole)

## API Routing

- `token`: JWT bearer token for auth. Associated in backend with one or more `Roles`
- `db`: database name
- `collection`: collection name