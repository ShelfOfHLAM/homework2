import "babel-polyfill";
import Chart from "chart.js";

const meteoURL = "/xml.meteoservice.ru/export/gismeteo/point/140.xml";

async function loadCurrency() {
  const response = await fetch(meteoURL);
  const xmlTest = await response.text();
  const parser = new DOMParser();
  const currencyData = parser.parseFromString(xmlTest, "text/xml");
  const times = currencyData.querySelectorAll("FORECAST[day][hour]");
  const result = Object.create(null);
  for (let i = 0; i < times.length; i++) {
    const timeTag = times.item(i);
    const heats= timeTag.querySelectorAll("HEAT[min][max]");
    const temps= timeTag.querySelectorAll("TEMPERATURE[max][min]");
    const heatTag = heats.item(0);
    const tempTag = temps.item(0);
    const heat = heatTag.getAttribute("max");
    const temp = tempTag.getAttribute("max");
    const hour = timeTag.getAttribute("hour");
    result[i] = [hour+":00",heat,temp] ;
  }
  
  result.length = times.length;
 
  return result;
}

const buttonBuild = document.getElementById("btn");
const canvasCtx = document.getElementById("out").getContext("2d");
buttonBuild.addEventListener("click", async function() {
  const normalData = await loadCurrency();
  const k = normalData.length;
  const key = Object.create(null);
  const plotDatH = Object.create(null);
  const plotDatT = Object.create(null);

  for (let i = 0; i < normalData.length; i++) {
    key[i] = normalData[i][0];
    plotDatH[i] = normalData[i][1];
    plotDatT[i] = normalData[i][2];
  }

  const keys1 = Object.keys(key);

  const keys = keys1.map(keyp => key[keyp]);
  const plotDataH = keys1.map(keyp => plotDatH[keyp]);
  const plotDataT = keys1.map(keyp => plotDatT[keyp]);

  const chartConfig = {
    type: "line",

    data: {
      labels: keys,
      datasets: [
        {
          label: "Температура",
          backgroundColor: "rgba(255, 0, 0, 0.5)",
          borderColor: "rgb(180, 0, 0)",
          data: plotDataT
        },{
          label: "Температура по ощущениям",
          backgroundColor: "rgba(0, 255, 0, 0.5)",
          borderColor: "rgb(0, 180, 0)",
          data: plotDataH
        }]
    }
  };

  if (window.chart) {
    chart.data.labels = chartConfig.data.labels;
    chart.data.datasets[0].data = chartConfig.data.datasets[0].data;
    chart.update({
      duration: 800,
      easing: "easeOutBounce"
    });
  } else {
    window.chart = new Chart(canvasCtx, chartConfig);
  }
});

function compare(a, b) {
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
}
