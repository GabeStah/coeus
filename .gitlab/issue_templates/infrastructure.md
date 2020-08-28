>>>
## [Infrastructure] Submission Instructions

Last Updated: 06/17/20 (v1.0.0)

1. Enter a descriptive title.  Use relevant keywords including applicable technologies, areas affected, subsection of project, etc.
2. Fill out all relevant `h2` titled sections below as best you can, then delete the quoted instruction text.
3. (Optional) All sections are optional, so delete any unused sections entirely.
4. (Optional) Add one or more `Assignees`.
5. Add [labels](#adding-labels).
6. Submit!

### Adding Labels

Adjust the pre-defined labels below, as needed.

1. Add **one or more** `area/` labels (defaults: ~"area/infrastructure", ~"area/provider/aws").
2. Add **one** scoped `kind::` label (default: ~"kind::feature").
3. Add **one** scoped `priority::` label (default: ~"priority::nominal").  **TIP:** If you're unsure of the appropriate priority, discard the `priority::` label and add the ~"needs/priority" label instead.
4. Add **one** scoped `stage::` label (default: ~"stage::ready").

If you aren't using the GUI to add labels you may do so by responding to your opened issue with a new comment that contains text with the `/label ~"scope::name"` syntax, e.g.:

```
/label ~"area/infrastructure"
/label ~"area/provider/aws"
/label ~"kind::feature"
/label ~"priority::nominal"
/label ~"stage::ready"
```
>>>

## Project Description, Goals, and Usage

>>>
- Describe the overall project.
- Describe the goals of this infrastructure.
- Describe how the infrastructure will be used to meet the goals of the project.

_**Example:**_

The project is a tracking system for that dastardly Road Runner.  The infrastructure should provide a robust platform on which we can build out a backend API to maintain logs and Road Runner sighting statistics, along with a dashboard web app for the client to monitor API-generated data.
>>>

## Client, Project, and App Names

>>>
Explicitly define any applicable url-friendly identifiers that are associated with this infrastructure.  Where appropriate, these values will be used in both internal and external URLs, SRNs, future project/app names, and so forth.

- **Client** is the internal name used to describe the client or organization.  Most infrastructure will apply to only (1) client.  This is often defined as a second-level GitLab group name in which a project is created (e.g. `solarix/<client-name>`).
- **Projects** is the name of the overall project being worked on.  Most infrastructure for non-Solarix clients will apply to only (1) project.  This is often defined as the third-level GitLab group name in which an app is created (e.g. `solarix/<client-name>/<project-name>`).  In cases where a project is a self-contained system without the need for multiple related apps a project may be created as a GitLab repository instead of a group.  However, it is typically better to separate each project into its own group so future work with the same client can remain self-contained.
- **App** is the name of an individual application or repository.  Some projects require multiple apps that makeup the whole of the final product.  Apps are typically defined as the fourth-level GitLab repository/project name (e.g. `solarix/<client-name>/<project-name>/<app-name>`).

For more information and examples see [Solarix Resource Names](https://docs.solarix.tools/solarix-resource-names/#format).

_**Example:**_

This project is a Road Runner tracking system for the ACME client and requires an API backend, a front-end dashboard for the client, and public-facing documentation.

- **Client**: `acme`
- **Project**: `road-runner-tracker`
- **Apps**:
  - `api`
  - `dashboard`
  - `docs`
>>>

## Environments and Domains

>>>
- List **all** environments this infrastructure should reside within and cover (e.g. `internal`, `testing`, `staging`, or `production`).  If it is unclear which environment(s) are applicable, make note and a solution can be discussed.  For more information see [Domains](https://docs.solarix.tools/aws/domains/).
- Typically, if a given **app** requires an accessible endpoint then it needs a qualified domain associated with it.  If uncertain, make note and admin can help determine the best course of action.

_**Example:**_

This project is in internal development, so we need a `testing` environment for most apps, along with `solarix.dev` endpoints.  The client will also need to review development changes to the dashboard, so we'll need a `staging` environment and `solarix.site` endpoint for the dashboard and the associated API data source as well.

| App       | Environment | Endpoint                                          |
| --------- | ----------- | ------------------------------------------------- |
| api       | testing     | `api.road-runner-tracker.acme.solarix.dev`        |
| dashboard | testing     | `dashboard.road-runner-tracker.acme.solarix.dev`  |
| docs      | testing     | `docs.road-runner-tracker.acme.solarix.dev`       |
| api       | staging     | `api.road-runner-tracker.acme.solarix.site`       |
| dashboard | staging     | `dashboard.road-runner-tracker.acme.solarix.site` |
>>>

## Resources, Performance/Cost Requirements, and SRNs

>>>
List each general resource / component required to meet the infrastructure goals.  In general, these resources are things like EC2 instances, database instances, API endpoints, Lambda functions, S3 buckets, etc.  For more information see [AWS Products](https://aws.amazon.com/).

**Note**: It may be very difficult to accurately estimate all the resources needed for a project, especially early in development, so make note where unsure and provide best guesses.  For example, a front-end web app will typically require at least an EC2 instance / container, and a data storage system such as a database.  A JSON API may require an EC2 instance / container with an optional API Gateway.

For each critical resource give a brief description of the expected performance requirements, ideal specifications, and/or cost limitations, if applicable.  While costs for many AWS resources are usage-based, EC2 instances and similar resources perform (and are charged) based on chosen CPU + memory options, among other things.  Furthermore, expected workloads/bottlenecks determine which optimizations to focus on (i.e. general purpose vs GPU vs CPU vs storage optimized).  *If possible, provide an estimate for the CPU/memory/storage needs of primary resources.*  If unknown or not possible, provide a cost/budget goal on a per-instance or project-wide basis.

Lastly, you may *optionally* provide a suggested [Solarix Resource Name (SRN)](https://docs.solarix.tools/solarix-resource-names) for each listed resource.

See [EC2 Pricing](https://aws.amazon.com/ec2/pricing/on-demand/) for more information.

_**Example:**_

***NOTE**: The table format used here is just an example.  Use bullet-points, sections, table, or whatever format best supports the required information.*

| App            | Environment | Resource Type | Specs / Budget | Info                                  | SRN                                                            |
| -------------- | ----------- | ------------- | -------------- | ------------------------------------- | -------------------------------------------------------------- |
| api            | testing     | ec2 instance  | t3.small       |                                       | `srn:ec2:acme:road-runner-tracker:api:testing::instance`       |
| api, dashboard | testing     | rds MySQL DB  | db.t3.small    |                                       | `srn:rds:acme:road-runner-tracker::testing::db`                 |
| dashboard      | testing     | ec2 instance  | t3.medium      | Must support a LAMP stack             | `srn:ec2:acme:road-runner-tracker:dashboard:testing::instance` |
| docs           | testing     | ec2 instance  | N/A            | Use dashboard instance                | N/A                                                            |
| api            | staging     | ec2 instance  | t3.large       |                                       | `srn:ec2:acme:road-runner-tracker:api:staging::instance`       |
| api, dashboard | staging     | rds MySQL DB  | db.t3.large    |                                       | `srn:rds:acme:road-runner-tracker::staging::db`                 |
| dashboard      | staging     | ec2 instance  | r5.2xlarge     | High memory usage expected            | `srn:ec2:acme:road-runner-tracker:dashboard:staging::instance` |
| docs           | staging     | N/A           | N/A            | Not required in `staging` environment | N/A                                                            |
>>>

### Security: Public vs Private

>>>
If applicable, describe which resources should be publicly available and which should remain private.  In general, a resource should be public if it needs to be accessed by the client, end-users, or other unknown parties.  However, if the resource needs to communicate only with other infrastructure resources, it can often be private.
>>>

## Requirements

>>>
- Describe any explicit requirements that the infrastructure **must** meet.  These may include hard performance requirements not covered elsewhere, software requirements, internal or external accessibility, accounts, etc.

_**Example:**_

The following software needs to be installed:

| Service           | Website                     |
| ----------------- | --------------------------- |
| WHM               | https://cpanel.net/products |
| cPanel            | https://cpanel.net/products |
| WHMCS             | https://www.whmcs.com       |
| Duda WHMCS Module | https://duda.co             |
>>>

## Certificates

>>>
Any infrastructure resources that have external web endpoints should have a valid TLS certificate.  If available, include the client's provided TLS certificate here.  Otherwise, briefly describe which resource(s) will need TLS certificates.

_**Example:**_

The API, Dashboard, and Docs apps all have public endpoints and require us to create TLS certificates.  Down the road, the production environment will also require a certificate, to be provided by the client.
>>>

## Special Considerations

>>>
- Describe any special considerations that may be applicable to implementing and/or integrating this infrastructure.
>>>

## Assets

>>>
- Provide important credentials, such as usernames, passwords, SSH keys, certificates, URLs, IPs, etc.  **TIP:** For secure data use Solarix's [secrets management](https://docs.solarix.tools/software/secrets/) software and link to the appropriate records.
- Attach or link to any relevant additional assets (mockups, spreadsheets, docs, screenshots, etc).

_**Example:**_

| Service           | Notes                                                                                                                        | Files                                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| cPanel            | 15day Trial License                                                                                                          |                                                                                              |
| WHMCS             | License: WHMCS-1234567890                                                                                          | [whmcs_v7102_full_1_.zip](/uploads/e9b16fd6f0ef379dfdfebd9136039cd3/whmcs_v7102_full_1_.zip) |
| Duda WHMCS Module | API creds in BitWarden. [Install Guide](https://developer.duda.co/docs/whmcs-installation-guide#domain-configuration--setup) | [Duda.WHMCS.Latest.zip](/uploads/ed1d60b802eecbe9fd7f321652f2330a/Duda.WHMCS.Latest.zip)     |
>>>

## Additional Details

>>>
- Add any missing additional details.
>>>

## Related Issues

>>>
- List any relevant issues or epics.
>>>