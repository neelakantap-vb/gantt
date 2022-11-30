// Fetching data from sheets
const baseUrl = 'https://docs.google.com/spreadsheets/d/';
const ssid = '1KnYDlmdxzlsOWZjaU58ghUj1ZZFCXoDaYpCIuCa3Hrc';
const gviz = `/gviz/tq?`;
const jsonOutput = 'tqx=out:json'
const sheet = 'sheet=Sheet4';

const url = `${baseUrl}${ssid}${gviz}&${jsonOutput}&${sheet}`;

const colCount = 8;
// const colTaskID = 1;
// const colTaskName = 2;
// const colResource = 3;
const colStartDate = 4;
const colEndDate = 5;
const colDuration = 6;
const colPercentComplete = 7;
// const colDependencies = 8;


function daysToMilliseconds(days) {
  return days * 24 * 60 * 60 * 1000;
}

function processData(rows){
  let rowsArray = new Array();
  rows.forEach((row)=>{
    const cells = row.c;
    let rowArray = new Array(8).fill(null);
    for (let index = 0; index < colCount; index++) {
      // console.log(cells[index]?.v, typeof(cells[index]?.v))
      const value = cells[index]?.v
      if (value){
        if(index == colStartDate-1 || index == colEndDate-1) {
          rowArray[index] = new Date(value.slice(5,-1))
          rowArray[index].setMonth(rowArray[index].getMonth() + 1)
        } else if(index === colDuration-1) rowArray[index] = daysToMilliseconds(value)
        else if(index === colPercentComplete-1) rowArray[index] = value
        else rowArray[index] = value.toString()
      }
    }
    if (rowArray[colStartDate-1].getTime() === rowArray[colEndDate-1].getTime())
      rowArray[colEndDate-1].setDate(rowArray[colEndDate-1].getDate() + 1)
    rowsArray.push(rowArray)
  })
  return rowsArray
}

async function getData(){
  return await fetch(url)
  .then(res => res.text())
  .then(data => {
    const json = JSON.parse(data.substr(47).slice(0, -2));
    return processData(json.table.rows);
  })
}




// Gantt Chart
google.charts.load('current', {'packages':['gantt']});
google.charts.setOnLoadCallback(drawChart);

async function drawChart() {
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Task ID');
  data.addColumn('string', 'Task Name');
  data.addColumn('string', 'Resource');
  data.addColumn('date', 'Start Date');
  data.addColumn('date', 'End Date');
  data.addColumn('number', 'Duration');
  data.addColumn('number', 'Percent Complete');
  data.addColumn('string', 'Dependencies');

  const rows = await getData()
  // const rows = [['autosuggest', 'BE - API to pull Divisions of logged user', 'BE', new Date(2022, 11, 21), new Date(2022, 11, 23), null, 75, null]]
  console.log(rows)

  data.addRows(rows)

  var options = {
    height: 5700,
    width: 7000,
    gantt: {
      criticalPathEnabled: true,
      barHeight: 40,
      barCornerRadius: 25,
      trackHeight: 80,
      labelStyle : {
        fontSize: 20
      },
      labelMaxWidth: 800 
    }
  };

  var chart = new google.visualization.Gantt(document.getElementById('chart_div'));

  chart.draw(data, options);
}