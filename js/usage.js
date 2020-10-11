/*

usage.js
@author Nicholas Yang

*/

function getSize(size) {
  var prefix = ["b", "k", "M", "G", "T", "P", "E", "Z"];
  var base = 1000;
  var pos = 0;

  while (size > base) {
    size /= base;
    pos++;
  }

  if (pos > 2) 
    precision = 1000.0;
  else
    precision = 1.0;

  var result = (Math.round(size*precision)/precision) + ' ' + prefix[pos];

  if (result == 0)
    return "0 k";
  else if (result == 1000)
    return "1 k";

  return result;
}

function goToDetail(row, pathPrefix) {
  var htmFile = "";

  pathPrefix = typeof pathPrefix !== 'undefined' ? pathPrefix : '.';

  for (var i = 0; i < row.cells.length; i++) {
    for (var j = 0; j < row.cells[i].childNodes.length; j++) {
      var textArr = row.cells[i].childNodes[j].textContent.split(":");
      if (textArr.length == 6) {
        if (row.cells[i].childNodes[j].textContent) {
          htmFile = pathPrefix + "/reports/"+row.cells[i].childNodes[j].textContent.replace(/:/g,'-')+"/detail.htm";
        }
      }
    }
  }
  window.open(htmFile, '_parent');
}

function goToTotalsDetail(pathPrefix) {

  pathPrefix = typeof pathPrefix !== 'undefined' ? pathPrefix : '.';

  var htmFile = pathPrefix + "/reports/detail.htm";
  window.open(htmFile, '_parent');
}
