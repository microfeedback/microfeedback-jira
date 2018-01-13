/*
 * Useful script for getting envvars to set for microfeedback-jira.
 * Pass in an issue with the same labels and components that would like
 * to assign to microfeedback issues.
 *
 *   node issue-info.js FEATURE-1234
 */
require('dotenv').config();
const JiraApi = require('jira-client');

const jira = new JiraApi({
  protocol: process.env.JIRA_PROTOCOL || 'https',
  host: process.env.JIRA_HOST,
  username: process.env.JIRA_USERNAME,
  password: process.env.JIRA_PASSWORD,
  apiVersion: '2',
  strictSSL: true,
});

async function start(issue) {
  const {fields} = await jira.findIssue(issue);
  const issuetypeName = fields.issuetype.name;
  const issuetypeID = fields.issuetype.id;
  const projectName = fields.project.name;
  const projectID = fields.project.id;
  let url = `/${projectID}/${issuetypeID}?`;
  let ret = `
# "${projectName}"
Project ID = ${projectID}
# "${issuetypeName}"
Issue Type ID = ${issuetypeID}`;
  if (fields.priority && fields.priority.id) {
    const priorityName = fields.priority.name;
    const priorityID = fields.priority.id;
    ret += `
# "${priorityName}"
Priority ID = ${priorityID}`;
    url += `priorityID=${priorityID}`;
  }
  if (fields.components && fields.components.length > 0) {
    const componentNames = fields.components.map(each => each.name);
    const componentIDs = fields.components.map(each => each.id);
    ret += `
# ${componentNames.join(',')}
Component IDs = ${componentIDs.join(',')}
`;
    url += `&` + componentIDs.map(each => `componentID=${each}`).join('&');
  }
  console.log(ret);
  console.log(`microfeedback URL = ${url}`);
}

start(process.argv[2]);
