const assert = require('assert');
const url = require('url');

const JiraApi = require('jira-client');
const microfeedback = require('microfeedback-core');
const mustache = require('mustache');
const truncate = require('truncate');
const trim = require('lodash.trim');
const parseUserAgent = require('ua-parser-js');
const {createError} = require('micro');

const makeTable = require('./lib/jira-table');
const pkg = require('./package.json');

const requiredEnvvars = [
  'JIRA_USERNAME',
  'JIRA_PASSWORD',
  'JIRA_HOST',
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

----

Reported via _[{{pkg.name}}|{{&pkg.repository}}] v{{pkg.version}}_.
`;
mustache.parse(issueTemplate);

const makeIssue = (
  {body, projectID, issueTypeID, componentIDs, priorityID, screenshotURL, extra},
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
  const title = `[microfeedback] "${truncate(body, 40)}"`;
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
  const ret = {
    fields: {
      project: {
        id: projectID,
      },
      summary: title,
      description: mustache.render(issueTemplate, view),
      issuetype: {id: issueTypeID},
    },
  };
  if (componentIDs) {
    const components = componentIDs.map(each => {
      return {id: each};
    });
    ret.fields.components = components;
  }
  if (priorityID) {
    ret.fields.priority = {id: priorityID};
  }

  return ret;
};

const parsePath = pathname => {
  const result = trim(pathname, '/').split('/');
  const projectAndIDMissing = createError(400, 'Project ID and Issue Type ID are required in the path');
  const issueMissing = createError(400, 'Issue Type ID is required in the path');
  if (result.length === 1) {
    if (result[0].length === 0) {
      throw projectAndIDMissing;
    } else {
      throw issueMissing;
    }
  } else if (result.length > 2) {
    throw createError(400, 'Too many segments in path');
  } else {
    const [projectID, issueTypeID] = result;
    if (projectID.length === 0) {
      throw projectAndIDMissing;
    } else if (issueTypeID.length === 0) {
      throw issueMissing;
    }
    return {projectID, issueTypeID};
  }
};

const JIRABackend = async (input, req) => {
  const {body, screenshotURL, extra} = input;
  // Match /<projectID>/<issueTypeID>/ in the URL
  const {pathname, query} = url.parse(req.url, true);
  const {projectID, issueTypeID} = parsePath(pathname);
  // Component IDs and Priority ID can be passed in query
  const componentIDs = query && query.componentID && Array.isArray(query.componentID) ? query.componentID : [query.componentID];
  const priorityID = query && query.priorityID;
  try {
    const result = await jira.addNewIssue(
      makeIssue(
        {
          body,
          screenshotURL,
          extra,
          projectID,
          issueTypeID,
          componentIDs,
          priorityID,
        },
        req
      )
    );
    return result;
  } catch (err) {
    if (err.response) {
      console.error(err.response);
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
  jiraIssueTypeID: process.env.JIRA_ISSUETYPE_ID,
});
Object.assign(module.exports, {
  parsePath,
});
