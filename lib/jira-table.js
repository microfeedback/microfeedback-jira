
function makeTable(headers, entries, sort = true) {
  if (entries.length === 0) {
    return '';
  }
  let ret = '||' + headers.join('||') + '||';
  const orderedEntries = sort ? entries.sort((a, b) => a[0] > b[0]) : entries;
  orderedEntries.forEach(each => {
    const row = each.join('|');
    ret += `\n|${row}|`;
  });
  return ret;
}

module.exports = makeTable;
