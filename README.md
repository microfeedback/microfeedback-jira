# microfeedback-jira

[![Build Status](https://travis-ci.org/microfeedback/microfeedback-jira.svg?branch=master)](https://travis-ci.org/microfeedback/microfeedback-jira)
[![Greenkeeper badge](https://badges.greenkeeper.io/microfeedback/microfeedback-jira.svg)](https://greenkeeper.io/)

An easily-deployable microservice for collecting user tickets as JIRA issues.

### API

#### `POST /`

Post a new feedback issue on the configured JIRA project.

The JSON payload may contain the following keys:

- `body` (required): The feedback content.
- `screenshotURL`: Optional URL to a screenshot image.
- `extra`: Optional object containing optional information to include in the issue.

## Deploy using [now](https://zeit.co/now)

If you already have a [now](https://zeit.co/now) account, you can deploy
microfeedback-jira to now using either

- **One click deploy** OR
- **One command deploy**


### One click deploy

Click the button below. Enter a zeit API token associated with your
account and the required environment variables.

[![Deploy to now](https://deploy.now.sh/static/button.svg)](https://deploy.now.sh/?repo=https://github.com/microfeedback/microfeedback-jira&env=JIRA_USERNAME&env=JIRA_PASSWORD&env=JIRA_HOST&env=JIRA_PROJECT_ID&env=JIRA_ISSUETYPE_ID)

### One command deploy

Use the `now` CLI to deploy this repo. Pass in your JIRA credentials and
required configuration.


```
now microfeedback/microfeedback-jira
```

For more detailed setup instructions, see the next section.

## Configuration

Configuration is defined through environment variables and can be passed
when you deploy microfeedback-jira.

```
now microfeedback/microfeedback-jira -e JIRA_USERNAME=foo@bar.com -e JIRA_PASSWORD=secret \
  -e JIRA_HOST=company.atlassian.net -e JIRA_PROJECT_ID=1001 -e JIRA_ISSUETYPE_ID=1234
```

The following options are available:

- `JIRA_USERNAME` and `JIRA_PASSWORD` (required): Credentials for the
                                                  JIRA user that will
                                                  post issues
- `JIRA_HOST` (required): JIRA host, e.g., `'yourcompany.atlassian.net'`
- `JIRA_PROJECT_ID` (required): ID for the project to post issues on.
- `JIRA_ISSUETYPE_ID` (required): ID for the issue types for posted
                                  issues.
- `JIRA_COMPONENT_IDS`: IDs (comma-separated) of components to assign to
                                  issues.

## Development

* Fork and clone this repo. `cd` into the project directory.
* `npm install`
* Copy `.env.example`: `cp .env.example .env`
* (Optional) Update `GH_TOKEN` in `.env`.
* To run tests: `npm test`
* To run the server with auto-reloading and request logging: `npm run dev`

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
