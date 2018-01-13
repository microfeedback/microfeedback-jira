import test from 'ava';
import makeTable from './lib/jira-table';
import {parsePath} from './';

test('makeTable', t => {
  const result = makeTable(['Header 1', 'Header 2'], [['foo', 'bar']]);
  t.truthy(result);
  t.regex(result, /\|\|Header 1\|\|Header 2\|\|/);
  t.regex(result, /\|foo\|bar\|/);
});

test('parsePath', t => {
  t.deepEqual(parsePath('123/456'), {projectID: '123', issueTypeID: '456'});
  t.deepEqual(parsePath('/123/456/'), {projectID: '123', issueTypeID: '456'});
  t.throws(() => {
    parsePath('/');
  }, /Project ID and Issue Type ID are required in the path/);
  t.throws(() => {
    parsePath('');
  }, /Project ID and Issue Type ID are required in the path/);
  t.throws(() => {
    parsePath('/123/');
  }, /Issue Type ID is required in the path/);
  t.throws(() => {
    parsePath('/123');
  }, /Issue Type ID is required in the path/);
  t.throws(() => {
    parsePath('/123/456/789');
  }, /Too many segments in path/);
});
