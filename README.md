# microfeedback-jira

[![Build Status](https://travis-ci.org/microfeedback/microfeedback-jira.svg?branch=master)](https://travis-ci.org/microfeedback/microfeedback-jira)
[![Greenkeeper badge](https://badges.greenkeeper.io/microfeedback/microfeedback-jira.svg)](https://greenkeeper.io/)

An easily-deployable microservice for collecting user feedback as JIRA issues.

## API

### `POST /<projectID>/<issueTypeID>`

Post a new feedback issue on the configured JIRA project.

Example: `/10001/3?componentID=12702&componentID=12701&priorityID=3`

The path must include:

- `projectID` (required): ID for the project to post issues on.
- `issueTypeID` (required): ID for the issue types for posted issues.

The JSON payload may contain the following keys:

- `body` (required): The feedback content.
- `screenshotURL`: Optional URL to a screenshot image.
- `extra`: Optional object containing optional information to include in the issue.

The foloowing query parameters are optional:

- `componentID`: JIRA component ID to assign to issues. May be passed
multiple times.
- `priorityID`: Priority ID to assign to issues.

## Helper script

You can use the `issue-info.js` script in this repo to get the project,
    issue type ID, component IDs, and priority ID for a given issue.

```
node issue-info.js FEATURE-1234
```

This will print out the URL that you would use to POST to the same
project (with the same issue type, component(s), and priority).

## Deploy using [now](https://zeit.co/now)

If you already have a [now](https://zeit.co/now) account, you can deploy
microfeedback-jira to now using either

- **One click deploy** OR
- **One command deploy**


### One click deploy

Click the button below. Enter a zeit API token associated with your
account and the required environment variables.

[![Deploy to now](https://deploy.now.sh/static/button.svg)](https://deploy.now.sh/?repo=https://github.com/microfeedback/microfeedback-jira&env=JIRA_USERNAME&env=JIRA_PASSWORD&env=JIRA_HOST)

### One command deploy

Use the `now` CLI to deploy this repo. Pass in your JIRA credentials and
required configuration.


```
now microfeedback/microfeedback-jira
```

For more detailed setup instructions, see the next section.

## Configuration (Environment variables)

Configuration is defined through environment variables and can be passed
when you deploy microfeedback-jira.

```
now microfeedback/microfeedback-jira -e JIRA_USERNAME=foo@bar.com -e JIRA_PASSWORD=secret \
  -e JIRA_HOST=company.atlassian.net
```

The following envvars must be set:

- `JIRA_HOST`: JIRA host, e.g., `'yourcompany.atlassian.net'`
- `JIRA_USERNAME` and `JIRA_PASSWORD`: Credentials for the
                                                  JIRA user that will
                                                  post issues


## Development

* Fork and clone this repo. `cd` into the project directory.
* `npm install`
* Copy `.env.example`: `cp .env.example .env`
* (Optional) Update the envvars in `.env`.
* To run tests: `npm test`
* To run the server with auto-reloading and request logging: `npm run dev`
  * This requires the envvars in `.env` to be set correctly.

### Debugging in tests with iron-node

Add `debugger` statements, then run the following:

```
npm i -g iron-node
npm run test:debug
```

## Related

- [microfeedback-core](https://github.com/microfeedback/microfeedback-core)

## License

MIT Licensed.
