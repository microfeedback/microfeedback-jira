require('dotenv').config();
const assert = require('assert');
const JiraApi = require('jira-client');
const microfeedback = require('microfeedback-core');
const mustache = require('mustache');
const truncate = require('truncate');
const parseUserAgent = require('ua-parser-js');
const {createError} = require('micro');

const makeTable = require('./lib/jira-table');
const pkg = require('./package.json');

const requiredEnvvars = [
  'JIRA_USERNAME',
  'JIRA_PASSWORD',
  'JIRA_HOST',
  'JIRA_PROJECT_ID',
  'JIRA_ISSUETYPE_ID',
];
requiredEnvvars.forEach(each => {
  assert(process.env[each], `${each} not set`);
});

const HEADER_WHITELIST = ['user-agent', 'origin', 'referer'];

const jira = new JiraApi({
  protocol: process.env.JIRA_PROTOCOL || 'https',
  host: process.env.JIRA_HOST,
  username: process.env.JIRA_USERNAME,
  password: process.env.JIRA_PASSWORD,
  apiVersion: '2',
  strictSSL: true,
});

const issueTemplate = `
(on) New feedback was posted{{suffix}}

h1. Feedback

{quote}
{{body}}
{quote}

{{#screenshotURL}}
h2. Screenshot

!{{&screenshotURL}}|width=400!
{{/screenshotURL}}

h2. Client details

{{#headerTable}}
h3. Headers

{{&headerTable}}
{{/headerTable}}

{{#browserTable}}
h3. Browser

{{&browserTable}}
{{/browserTable}}

{{#osTable}}
h3. Operating system

{{&osTable}}
{{/osTable}}

{{#extraTable}}
h3. Extra information

{{&extraTable}}
{{/extraTable}}

Reported via _[{{pkg.name}}|{{&pkg.repository}}] v{{pkg.version}}_.
`;
mustache.parse(issueTemplate);

const makeIssue = (
  {body, projectID, issueTypeID, componentIDs, screenshotURL, extra},
  req
) => {
  let suffix = '';
  if (req && req.headers.referer) {
    suffix = ` on ${req.headers.referer}`;
  }
  const view = {
    suffix,
    body,
    extra,
    screenshotURL,
    pkg,
  };
  const title = `[microfeedback] Feedback${suffix}: "${truncate(body, 25)}"`;
  // Format headers as table
  if (req && req.headers) {
    const entries = Object.entries(req.headers).filter(
      e => HEADER_WHITELIST.indexOf(e[0]) >= 0
    );
    view.headerTable = makeTable(['Header', 'Value'], entries);
  }
  // Format user agent info as table
  if (req && req.headers && req.headers['user-agent']) {
    const userAgent = parseUserAgent(req.headers['user-agent']);
    const browserEntries = Object.entries(userAgent.browser).filter(e => e[1]);
    view.browserTable = makeTable(['Key', 'Value'], browserEntries, false);
    const osEntries = Object.entries(userAgent.os).filter(e => e[1]);
    view.osTable = makeTable(['Key', 'Value'], osEntries, false);
  }
  // Format extra information as table
  if (extra) {
    view.extraTable = makeTable(['Key', 'Value'], Object.entries(extra));
  }

  let components = [];
  if (componentIDs) {
    components = componentIDs.map(each => {
      return {id: each};
    });
  }

  return {
    fields: {
      components,
      project: {
        id: projectID,
      },
      summary: title,
      description: mustache.render(issueTemplate, view),
      issuetype: {id: issueTypeID},
    },
  };
};

const JIRABackend = async (input, req) => {
  const {body, screenshotURL, extra} = input;
  try {
    const result = await jira.addNewIssue(
      makeIssue(
        {
          body,
          screenshotURL,
          extra,
          projectID: process.env.JIRA_PROJECT_ID,
          issueTypeID: process.env.JIRA_ISSUETYPE_ID,
          componentIDs: process.env.JIRA_COMPONENT_IDS && process.env.JIRA_COMPONENT_IDS.split(',').map(each => each.trim()),
        },
        req
      )
    );
    return result;
  } catch (err) {
    if (err.response) {
      const {statusCode, statusMessage} = err.response;
      throw createError(statusCode, statusMessage, err);
    } else {
      console.error(err);
      throw createError(500, 'An unknown error occurred', err);
    }
  }
};

module.exports = microfeedback(JIRABackend, {
  name: 'jira',
  version: pkg.version,
  jiraHost: process.env.JIRA_HOST,
  jiraProjectID: process.env.JIRA_PROJECT_ID,
});
