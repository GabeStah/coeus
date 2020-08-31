# Coeus

Coeus is an HTTP API providing insightful answers through data.

In Greek mythology [Coeus](https://en.wikipedia.org/wiki/Coeus) is the son of Uranus and Gaia and is the ["Titan of intellect and the axis of heaven around which the constellations revolved"](https://en.wikipedia.org/wiki/List_of_Greek_mythological_figures#Titans_and_Titanesses). The name is derived from the Ancient Greek [κοῖος](https://en.wiktionary.org/wiki/%CE%9A%CE%BF%E1%BF%96%CE%BF%CF%82), meaning "what?, which?, of what kind?, of what nature?".

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

**NOTE:** The `test:debug` command variants *should* be executed while halting execution within a test (such as during debugging).

## Database: MongoDB

- Version: 4.4
- Region: AWS us-east-1 (required for version 4.4 free tier support)

### Naming Conventions

**NOTE:** Windows users may experience trouble within the `mongo` shell when using special characters (`/\. "$*<>:|?`).  Please use a Linux-based shell when executing shell commands that use such characters in relevant  `namespaces`.

- **Database** names *may not* contain any of the following characters: `/\. "$*<>:|?`.
- **Database** names *may not* exceed `64` characters in length.
- A `namespace` (the combined **database.collection** name) *may not* exceed `255` characters in length.
- **Collection** names *may* use special characters, so long as they begin with a letter.
- **Role** names *may only* contain letters, numbers, hyphens, and underscores.

### Databases

Each **database** *must*:

- be globally unique and identifiable, based on a single high-level entity such as an `organization`.

#### Examples

- `acme`: A **database name** for the Acme `org`
- `solarix`: For Solarix projects

### Collections

Each **collection** *must*:

- be self-contained.
- contain related data.
- use [Solarix Resource Name (SRN)](https://docs.solarix.tools/solarix-resource-names) conventions.

Each **collection** *should*:

- be based on a single high-level entity such as an `org`, if applicable.

A higher-order **SRN** is preferred for aggregate queries and data storage, but smaller **collections** can be created to store separate `project` or even `app` data.

#### Examples

An **SRN** of `srn::acme` is the highest order **SRN** for the `Acme` `org`, applying to all services and all projects within that `org`. A **collection `name`** of `srn:coeus:acme::collection` may contain any type of Acme-related data.

Alternatively, an **SRN** of `srn::acme:tracker:api:production` with related **collection `name`** of `srn:coeus:acme:tracker:api:production::collection` is expected to contain data only related to Acme's Tracker API project, in the production environment of the AWS EC2 service. This is a much smaller scope, so take care when choosing which **collection** names to create.

### Document

Each **document** *must*:

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

## Roles and Privileges

**NOTE**: Atlas disallows direct role management via Database User authentication.  Therefore, custom role creations *must* be performed via the Atlas GUI or API.

**Example: Acme Admin Role**

```json5
{
  "_id": "acme.admin",
  "role": "srn:coeus:acme::role/admin",
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
      "resource": { "db": "acme", "collection": "srn:coeus:acme::collection" },
      "actions": ["insert", "update", "remove", "compact"]
    },
    {
      "resource": { "db": "acme", "collection": "srn:coeus:acme:tracker:api:development::collection" },
      "actions": ["find"]
    }
  ],
  "roles": []
}
```

```json5
{
  "db": "acme",
  "role": "srn:coeus:acme::role/admin",
  "privileges": [
    {
      "resource": { 
        "db": "acme", 
        "collection": ""
      },
      "actions": ["find", "createCollection", "dbStats", "collStats"]
    },
    {
      "resource": { "db": "acme", "collection": "srn:coeus:acme::collection" },
      "actions": ["insert", "update", "remove", "compact"]
    },
    {
      "resource": { "db": "acme", "collection": "srn:coeus:acme:tracker:api:development::collection" },
      "actions": ["find"]
    }
  ]
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

> charlieDoe wants Solarix to make a website for his pallet processing & storage business. His request is for a simple brochure website with an single dynamic page that displays the status of each pallet in his warehouse so that his customers know the current progress on their job. @ksomerville reads up on documentation  requiremeents and there are a few starter databases in template repos to fork from, so he chooses to include the MongoDB starter with Strapi headless client. He writes his project, including the brochure/business content in the website attached to the CMS and giving the the customer access to the Strapi dashboard to update pallet info as needed. The MongoDB fork was already modeled to be structured in the preferred way SolData dictates and the Strapi repo included a snippet to add a POST to SolData web service whenever Strapi data is saved.

### Salesforce: CSV

> deniseDoe has a large customer database from Salesforce exported to csv and she want's it accessible via a JSON rest API in the future. @ksomerville visits an internal Solarix tool that triggers a process that: imports the CSV > SolData creates an EAV model table to store that data and saves it > SolData then allows that data to be accessed via REST API to those who have access to that asset.