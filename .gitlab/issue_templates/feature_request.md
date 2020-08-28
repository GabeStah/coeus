>>>
## [Feature Request] Submission Instructions

Last Updated: 06/03/20 (v1.0.1)

1. Enter a descriptive title.  Use relevant keywords including applicable technologies, areas affected, subsection of project, etc.
2. Fill out all relevant `h2` titled sections below as best you can, then delete the quoted instruction text.
3. (Optional) All sections are optional, so delete any unused sections entirely.
4. (Optional) Add one or more `Assignees`.
5. Add [labels](#adding-labels).
6. Submit!

### Adding Labels

Adjust the pre-defined labels below, as needed.

1. Add **one or more** `area/` labels.
2. Add **one** scoped `kind::` label (default: ~"kind::feature").
3. Add **one** scoped `priority::` label (default: ~"priority::nominal").  **TIP:** If you're unsure of the appropriate priority, discard the `priority::` label and add the ~"needs/priority" label instead.
4. Add **one** scoped `stage::` label (default: ~"stage::ready").

If you aren't using the GUI to add labels you may do so by responding to your opened issue with a new comment that contains text with the `/label ~"scope::name"` syntax, e.g.:

```
/label ~"area/AREA_NAME"
/label ~"kind::feature"
/label ~"priority::nominal"
/label ~"stage::ready"
```
>>>

## Description, Motivation, and Usage

>>>
- Describe the feature in brief.
- Describe the motivation behind this feature.
- Describe how the feature should be used by the target audience (i.e. client, user, developer, company, etc).

_**Example:**_

This feature integrates Google Cloud's Text to Speech service into the existing Text to Speech plugin.  The goal is to provide end-users with improved accuracy, voice options, and a better overall listening experience compared to the built-in browser-based text to speech API.  When enabled, this feature is the default playback method used by the Text to Speech plugin.
>>>

## Tasks

>>>
- List and describe tasks necessary to complete feature implementation.

_**Example:**_

- [ ] Create Google Cloud Text to Speech ACL
- [ ] Create AWS Lambda ACL
- [ ] Create AWS API Gateway endpoint
- [ ] Create Lambda function to connect to Google Text to Speech service
- [ ] Integrate API Gateway endpoint into Text to Speech plugin
- [ ] Test integration
>>>

## Special Considerations

>>>
- Describe any special considerations that may be applicable to implementing and/or integrating this feature.

_**Example:**_

Google Cloud's Text to Speech API requires a `Bearer: Token` authorization header.  To hide this token from end-users a proxy service may be necessary to accept end-user requests and pass them along to the Google Text to Speech API.  AWS Lambda functions and AWS API Gateway may be a viable solution.
>>>

## Context

>>>
Provide any relevant contextual information, such as:

- Environment ([Solarix Resource Name (SRN)](https://docs.solarix.tools/solarix-resource-names/), OS, platform, cloud service, server name/instance IP, production/staging/dev/test/local/etc)
- Environment variables, URLs, arguments, data, etc that wasn't mentioned above.
- Version/build of the project software
- Version/build of other related software

_**Example:**_

- Environment: Ubuntu 18.04 on `srn:ec2:client-name:project:app:production::instance`
- ENV vars: `BLOG_APP_API_SECRET=foobar098765`
- API version: 3
- Chrome Version 80.0.3987.149
>>>

## Assets

>>>
- Provide important credentials, such as usernames, passwords, SSH keys, certificates, URLs, IPs, etc.  **TIP:** For secure data use Solarix's [secrets management](https://docs.solarix.tools/software/secrets/) software and link to the appropriate records.
- Attach or link to any relevant additional assets (mockups, spreadsheets, docs, screenshots, etc).
>>>

## Implementation Suggestions

>>>
- If you have a suggested implementation method describe it here.

_**Example:**_

A custom API endpoint using AWS Lambda + API Gateway will keep the Google Text to Speech API token hidden from end-users, while also providing relatively quick response times.
>>>

## Additional Details

>>>
- Add any missing additional details.
>>>

## Related Issues

>>>
- List any relevant issues or epics.
>>>