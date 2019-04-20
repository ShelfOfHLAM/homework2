import "babel-polyfill";
import Chart from "chart.js";

const meteoURL = "/xml.meteoservice.ru/export/gismeteo/point/140.xml";

async function loadCurrency() {
  const response = await fetch(meteoURL);
  const xmlTest = await response.text();
  const parser = new DOMParser();
  const times =  parser.parseFromString(xmlTest, "text/xml").querySelectorAll("FORECAST[hour]");
  const result = Object.create(null);
  for (let i = 0; i < times.length; i++) {
    const timeTag = times.item(i);
    const heats= timeTag.querySelectorAll("HEAT[max]");
    const temps= timeTag.querySelectorAll("TEMPERATURE[max]");
    const heat = heats.item(0).getAttribute("max");
    const temp = temps.item(0).getAttribute("max");
    const hour = timeTag.getAttribute("hour");
    result[i] = [hour+":00",heat,temp] ;
  }
 
  return result;
}

const buttonBuild = document.getElementById("btn");
const canvasCtx = document.getElementById("out").getContext("2d");
buttonBuild.addEventListener("click", async function() {
  const normalData = await loadCurrency();
  const keys = Object.keys(normalData);
  const time = keys.map(key => normalData[key][0]);
  const plotDataH = keys.map(key => normalData[key][1]);
  const plotDataT = keys.map(key => normalData[key][2]);

  const chartConfig = {
    type: "line",

    data: {
      labels: time,
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