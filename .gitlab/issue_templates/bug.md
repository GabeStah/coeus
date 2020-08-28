>>>
## [Bug] Submission Instructions

Last Updated: 03/28/20

1. Enter a descriptive title.  Try to summarize the exact symptom(s) using contextual language and details.  **TIP:** Be as specific as possible (e.g. "Staging GET /posts API endpoint returns an empty object when passed a large 'id' value." vs "Posts API no work, make sad").
2. Fill out all relevant `h2` titled sections below as best you can, then delete the quoted instruction text.
3. (Optional) All sections are optional, so delete any unused sections entirely.
4. (Optional) Add one or more `Assignees`.
5. Add [labels](#adding-labels).
6. Submit!

### Adding Labels

Adjust the pre-defined labels below, as needed.

1. Add **one or more** `area/` labels.
2. Add **one** scoped `kind::` label (default: ~"kind::bug").
3. Add **one** scoped `priority::` label (default: ~"priority::nominal").  **TIP:** If you're unsure of the appropriate priority, discard the `priority::` label and add the ~"needs/priority" label instead.
4. Add **one** scoped `stage::` label (default: ~"stage::ready").

If you aren't using the GUI to add labels you may do so by responding to your opened issue with a new comment that contains text with the `/label ~"scope::name"` syntax, e.g.:

```
/label ~"area/AREA_NAME"
/label ~"kind::bug"
/label ~"priority::nominal"
/label ~"stage::ready"
```
>>>

## Expected Behavior

>>>
Describe the expected, functional behavior. 

_**Example:**_

The response should be a valid JSON object with appropriate data:

```json
{
  "userId": 1,
  "id": 1234567890,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
}
```

**TIP**: If you're unsure of what the expected behavior should be just leave this section blank.
>>>

## Actual Behavior

>>>
Describe the current, broken behavior.  Provide as much detail as necessary.  If applicable, this section should describe the outcome of the reproduction steps.

_**Example:**_

The API response is a blank JSON object:

```json
{}
```
>>>

## Steps to Reproduce

>>>
Outline the step-by-step process used to reproduce the bug.  If you cannot determine reliable way to reproduce, that's OK, just indicate as much along with what actions you took.

_**Example:**_

1. Open terminal.
2. Run `curl --location --request GET 'https://jsonplaceholder.typicode.com/posts/1234567890'` 
>>>

## Context

>>>
Provide contextual information.  You need only provide relevant info, but some examples might include:

- Environment (OS, platform, cloud service, server name/instance IP, production/staging/dev/test/local/etc)
- Environment variables, URLs, arguments, data, etc that wasn't mentioned above.
- Version/build of the project software
- Version/build of other related software

_**Example:**_

- Environment: Ubuntu 18.04 on **blog-app-staging** DigitalOcean droplet (172.151.226.157)
- ENV vars: `BLOG_APP_API_SECRET=foobar098765`
- API version: 3
- Chrome Version 80.0.3987.149
>>>

## Assets

>>>
- Provide important credentials, such as usernames, passwords, SSH keys, certificates, URLs, IPs, etc.  **TIP:** For secure data use Solarix's [secrets management](https://docs.solarix.tools/software/secrets/) software and link to the appropriate records.
- Attach or link to any relevant additional assets (screenshots, log dumps, configuration files, etc).
>>>

## Possible Solutions

>>>
If you have a guess at a possible solution describe it here.

_**Example:**_

- Perform a sanity check on the requested `id` to ensure it doesn't exceed maximum expected value.
- Respond with an error JSON object, as necessary.
>>>

## Additional Details

>>>
- Add any missing additional details.
>>>

## Related Issues

>>>
- List any relevant issues or epics.
>>>