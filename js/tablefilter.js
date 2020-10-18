/*

tablefilter.js
@author Nicholas Yang

*/

// Filter Totals in an array, 1st element is not used (User column)
var sums;

function filter(phrase, clearBtnId, tableId){
  var clearBtn = document.getElementById(clearBtnId);
  clearBtn.style.visibility = (phrase.value.length != 0) ? "visible" : "hidden";

  var words = phrase.value.toLowerCase().split(" ");
  var table = document.getElementById(tableId);
  var ele;

  // Go through table in its entirety and search for rows with the phrase
  sums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (var r = 1; r < table.rows.length; r++){
    if (table.rows[r].id !== 'filtertotal-'+tableId) {
      ele = table.rows[r].innerHTML.replace(/<[^>]+>/g,"");
      var displayStyle = 'none';
      for (var i = 0; i < words.length; i++) {
        if (ele.toLowerCase().indexOf(words[i])>=0) {
          displayStyle = '';
        }
        else {
          displayStyle = 'none';
          break;
        }
      }
      table.rows[r].style.display = displayStyle;

      if (displayStyle !== 'none') {
        var cells = table.rows[r].getElementsByTagName("td");
        for (var j = 1; j < cells.length-1; ++j) {
          sums[j] += getSizeInBytes(cells[j].innerText);
        }
      }
    }
  }

  var elt = document.getElementById("filtertotal-"+tableId);

  // Make sure there's something in the Filter search box
  if (phrase.value.length != 0) {

    // If the Filter Total row doesn't exist yet, create it
    if (elt == null) {
      var row = table.insertRow(r);
      row.id = "filtertotal-"+tableId;

      var cell_user = row.insertCell(0);
      cell_user.innerHTML = "<p style='text-align: right'><b>FILTER TOTAL</b></p>";
      var cell_total = row.insertCell(1);
      cell_total.className = "coltotal";
      cell_total.innerText = getSize(sums[1]);

      var cell_totaldown = row.insertCell(2);
      cell_totaldown.className = "coltotal";
      cell_totaldown.innerHTML = getSize(sums[2]) + ' &#x25BC';

      var cell_totalup = row.insertCell(3);
      cell_totalup.className = "coltotal";
      cell_totalup.innerHTML = getSize(sums[3]) + ' &#x25B2';

      var cell_averagetotal = row.insertCell(4);
      cell_averagetotal.className = "colavg";
      cell_averagetotal.innerText = getSize(sums[4]);

      var cell_averagedown = row.insertCell(5);
      cell_averagedown.className = "colavg";
      cell_averagedown.innerHTML = getSize(sums[5]) + ' &#x25BC';

      var cell_averageup = row.insertCell(6);
      cell_averageup.className = "colavg";
      cell_averageup.innerHTML = getSize(sums[6]) + ' &#x25B2';

      var cell_todaytotal = row.insertCell(7);
      cell_todaytotal.className = "coltoday";
      cell_todaytotal.innerText = getSize(sums[7]);

      var cell_todaydown = row.insertCell(8);
      cell_todaydown.className = "coltoday";
      cell_todaydown.innerHTML = getSize(sums[8]) + ' &#x25BC';

      var cell_todayup = row.insertCell(9);
      cell_todayup.className = "coltoday";
      cell_todayup.innerHTML = getSize(sums[9]) + ' &#x25B2';

      var cell_lastupdate = row.insertCell(10);
    }
    // If the Filter Totals row is showing already, just update the values
    else {
      var cells = elt.getElementsByTagName("td");
      cells[1].innerText = getSize(sums[1]);
      cells[2].innerHTML = getSize(sums[2]) + ' &#x25BC';
      cells[3].innerHTML = getSize(sums[3]) + ' &#x25B2';
      cells[4].innerText = getSize(sums[4]);
      cells[5].innerHTML = getSize(sums[5]) + ' &#x25BC';
      cells[6].innerHTML = getSize(sums[6]) + ' &#x25B2';
      cells[7].innerText = getSize(sums[7]);
      cells[8].innerHTML = getSize(sums[8]) + ' &#x25BC';
      cells[9].innerHTML = getSize(sums[9]) + ' &#x25B2';
    }
  }
  else {
    // If the search is cleared, remove the Filter Total row
    if (elt != null)
      elt.parentNode.removeChild(elt);
  }
}

// For when the X button is clicked in the search filter box
function resetfilter(clearBtnId, queryBoxId, tableId) {
  var clearBtn = document.getElementById(clearBtnId);
  clearBtn.style.visibility = "hidden";

  var textInput = document.getElementById(queryBoxId);
  textInput.value = "";

  var table = document.getElementById(tableId);
  for (var r = 1; r < table.rows.length; r++){
    displayStyle = '';
    table.rows[r].style.display = displayStyle;
  }

  // Remember to remove the Filter Totals row, since search string is cleared
  var elt = document.getElementById("filtertotal-"+tableId);
  if (elt != null)
    elt.parentNode.removeChild(elt);
}

// Resets search filter, given a router name (set router name in config)
function resetFilterKeypress(evt, routerName) {
  evt = evt || window.event;
  var isEscape = false;

  if ("key" in evt) {
    isEscape = evt.key == "Escape";

    if (evt.key == "Enter")
      event.preventDefault();
  }

  if (isEscape) {
    resetfilter("filterclearbtn-"+routerName, "filterquery-"+routerName, "usertable-"+routerName);
  }
}

// Helper function to convert String value (e.g. "1.2 G") to number of bytes
function getSizeInBytes(size) {
  var prefix = ["b", "k", "M", "G", "T", "P", "E", "Z"];
  var base = 1000;
  var pos = 0;

  splitted = size.split(" ");
  result = parseFloat(splitted[0]);

  while (splitted[1] !== prefix[pos++]) {
    result *= base;
  }

  return result;
}

// Helper function to convert number of bytes into formatted String value
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
