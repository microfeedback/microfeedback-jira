const test = require('ava');

const makeTable = require('./lib/jira-table');

test('makeTable', t => {
  const result = makeTable(['Header 1', 'Header 2'], [['foo', 'bar']]);
  t.truthy(result);
  t.regex(result, /\|\|Header 1\|\|Header 2\|\|/);
  t.regex(result, /\|foo\|bar\|/);
});
