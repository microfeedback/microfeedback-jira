# microfeedback-jira

[![Build Status](https://travis-ci.org/microfeedback/microfeedback-jira.svg?branch=master)](https://travis-ci.org/microfeedback/microfeedback-jira)
[![Greenkeeper badge](https://badges.greenkeeper.io/microfeedback/microfeedback-jira.svg)](https://greenkeeper.io/)

[![Deploy to now](https://deploy.now.sh/static/button.svg)](https://deploy.now.sh/?repo=https://github.com/microfeedback/microfeedback-jira&env=JIRA_USERNAME&env=JIRA_PASSWORD&env=JIRA_HOST)
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

An easily-deployable microservice for collecting user feedback as JIRA issues.

## Documentation

https://microfeedback.js.org/backends/microfeedback-jira

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

- [microfeedback-github](https://github.com/microfeedback/microfeedback-github)
- [microfeedback-core](https://github.com/microfeedback/microfeedback-core)

## License

MIT Licensed.
