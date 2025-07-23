const API_BASE_URL = "https://api.kitechnik.com";

let graphType = "wholesalePrice"; //Default graph type for the first chart
let graphTypesForSecondChart = ["actualelectricityconsumption"]; //Default second chart graph type
let myChartInstance;
let myChartInstance2 = null;
let graphIdentifiers;
let batteryData = [];
let batteryChartInstance = null;
let hydrogenData = [];
let hydrogenChartInstance = null;

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

//Define the vertical line plugin for the first chart
const verticalLinePlugin1 = {
  id: "verticalLine1",
  afterDraw(chart) {
    if (
      !chart.tooltip ||
      !chart.tooltip._active ||
      chart.tooltip._active.length === 0
    ) {
      return; //Verhindert Fehler, falls kein Tooltip aktiv ist
    }

    const ctx = chart.ctx;
    const activePoint = chart.tooltip._active[0]; //Get the active tooltip point
    const x = activePoint.element.x; //X-Koordinate des Punktes

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, chart.chartArea.top); //Linie von oben ...
    ctx.lineTo(x, chart.chartArea.bottom); //... nach unten zeichnen
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.8)"; //Farbe anpassen
    ctx.stroke();
    ctx.restore();
  },
};

//Define the vertical line plugin for the second chart
const verticalLinePlugin2 = {
  id: "verticalLine2",
  afterDraw(chart) {
    if (
      !chart.tooltip ||
      !chart.tooltip._active ||
      chart.tooltip._active.length === 0
    ) {
      return; //Verhindert Fehler, falls kein Tooltip aktiv ist
    }

    const ctx = chart.ctx;
    const activePoint = chart.tooltip._active[0]; //Get the active tooltip point
    const x = activePoint.element.x; //X-Koordinate des Punktes

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, chart.chartArea.top); //Linie von oben ...
    ctx.lineTo(x, chart.chartArea.bottom); //... nach unten zeichnen
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.8)"; //Farbe anpassen
    ctx.stroke();
    ctx.restore();
  },
};

//Function to load the graph identifiers from the JSON file
async function loadGraphIdentifiers() {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/graphIdentifiers`);
    const data = await response.json();
    graphIdentifiers = data;
    console.log("[INFO] Graph identifiers loaded:", graphIdentifiers);
  } catch (error) {
    console.error("[ERROR] Loading graph identifiers:", error.message);
  }
}

//Function to fetch data dynamically based on the selected graph type and time range
const fetchData = debounce(async function () {
  if (!graphIdentifiers) {
    //Ensures loading before proceeding
    console.error("[ERROR] Graph identifiers not loaded yet.");
    return;
  }

  try {
    //Define start and end time for data request
    const now = new Date();
    const timeRangeInHours = 1;
    const start = new Date(now.getTime() - timeRangeInHours * 60 * 60 * 1000);
    const end = now;

    const startISOString = start.toISOString(); //Converts to ISO string
    const endISOString = end.toISOString();

    console.log(
      `[INFO] Fetching data for graph type: ${graphType}, Start: ${startISOString}, End: ${endISOString}`
    );

    const graphData = graphIdentifiers[graphType]; //Resolve graphType to ID
    const graphId = graphData ? graphData.id : "1"; //Fallback to ID 1

    //Construct dynamic API URL
    const response = await fetchWithRetry(
      `${API_BASE_URL}/data?graphType=${graphId}&start=${encodeURIComponent(
        startISOString
      )}&end=${encodeURIComponent(endISOString)}`
    );

    const data = await response.json();
    console.log("[INFO] Received data:", data);

    if (!data.labels || !data.values) {
      throw new Error(
        "Data structure is incorrect. Expected labels and values arrays."
      );
    }

    //Filtering out null values
    const filteredLabels = [];
    const filteredValues = [];

    data.values.forEach((value, index) => {
      if (value !== null) {
        filteredLabels.push(data.labels[index]);
        filteredValues.push(value);
      }
    });

    //Destroy existing chart instance to avoid overlapping
    if (myChartInstance) {
      myChartInstance.destroy();
    }

    const color = graphData ? graphData.color : "rgb(0, 0, 0)";
    const label = graphData ? graphData.label : "Unknown Graph";

    createChart("myChart", filteredLabels, filteredValues, label, color);

    //Fetch data for the second chart
    fetchDataForSecondGraph();
  } catch (error) {
    console.error("[ERROR] Fetching data:", error);
  }
}, 300);

//Function to create the first chart
function createChart(canvasId, labels, values, labelName, borderColor) {
  const ctx = document.getElementById(canvasId).getContext("2d");

  const formattedLabels = labels.map((label) =>
    typeof label === "string" ? new Date(label) : label
  );

  myChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: formattedLabels,
      datasets: [
        {
          label: labelName,
          data: values,
          borderColor: borderColor,
          backgroundColor: borderColor.startsWith("rgb")
            ? borderColor.replace(/rgb\(([^)]+)\)/, "rgba($1, 0.8)")
            : "rgba(0, 0, 0, 0.8)", //Fallback to black
          tension: 0.1,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 8,
          pointHitRadius: 20,
          borderWidth: 2.5,
          pointBackgroundColor: borderColor,
          pointHoverBorderWidth: 3.5,
          pointHoverBackgroundColor: borderColor,
          pointHoverBorderColor: "#fff",
        },
      ],
    },
    options: {
      layout: {
        padding: {
          left: 20,
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          mode: "index",
          intersect: false,
          callbacks: {
            label: (context) =>
              `${context.dataset.label}: ${context.raw.toFixed(2)} €/MWh`,
          },
        },
        verticalLine1: {},
      },
      interaction: {
        mode: "index",
        intersect: false,
      },
      elements: {
        legend: {
          borderRadius: 10,
        },
      },
      scales: {
        x: {
          ticks: {
            font: {
              size: 14,
              family: "Roboto, Arial, sans-serif",
              weight: 500,
            },
          },
          type: "time",
          time: {
            unit: "hour",
            tooltipFormat: "ll HH:mm",
            displayFormats: {
              hour: "D, HH:mm",
            },
          },
        },

        y: {
          ticks: {
            font: {
              size: 14,
              family: "Roboto, Arial, sans-serif",
              weight: 500,
            },
          },
          title: {
            display: true,
            text: "€/MWh",
            font: {
              size: 16,
              family: "Roboto, Arial, sans-serif",
              weight: 500,
            },
          },
          beginAtZero: true,
        },
      },
    },
    plugins: [verticalLinePlugin1],
  });
}

//Function to fetch data for the second chart
async function fetchDataForSecondGraph() {
  if (!graphIdentifiers) {
    console.error("Graph identifiers not loaded yet.");
    return;
  }

  try {
    if (graphTypesForSecondChart.length === 0) {
      console.error("No graph types selected for the second chart.");
      return;
    }

    if (!graphTypesForSecondChart.includes("actualelectricityconsumption")) {
      graphTypesForSecondChart.unshift("actualelectricityconsumption");
    }

    const graphDataPromises = graphTypesForSecondChart.map(
      async (graphType) => {
        const graphData = graphIdentifiers[graphType];
        const graphId = graphData ? graphData.id : "1";

        const now = new Date();
        const timeRangeInHours = 1;
        const start = new Date(
          now.getTime() - timeRangeInHours * 60 * 60 * 1000
        );
        const end = now;

        const response = await fetch(
          `${API_BASE_URL}/data?graphType=${graphId}&start=${start.toISOString()}&end=${end.toISOString()}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch data for graph type: ${graphType}`);
        }

        const data = await response.json();
        if (!data.labels || !data.values) {
          throw new Error("Data structure for the second chart is incorrect.");
        }

        //Filtering out null values
        const filteredLabels = [];
        const filteredValues = [];

        data.values.forEach((value, index) => {
          if (value !== null) {
            filteredLabels.push(data.labels[index]);
            filteredValues.push(value);
          }
        });
        return {
          labels: filteredLabels.map((label) => new Date(label)),
          values: filteredValues,
          label: graphData.label || graphType,
          borderColor: graphData.color || "rgb(0, 0, 0)",
        };
      }
    );

    const graphDataArray = await Promise.all(graphDataPromises);
    updateSecondChart(graphDataArray);
  } catch (error) {
    console.error("Error fetching data for second chart:", error);
  }
}

//Function to update the second chart
function updateSecondChart(graphDataArray) {
  const ctx = document.getElementById("myChart2").getContext("2d");

  //Destroy the previous chart instance to prevent overlap
  if (myChartInstance2) {
    myChartInstance2.destroy();
  }

  let datasets = graphDataArray.map((graphData) => ({
    label: graphData.label,
    data: graphData.values,
    borderColor: graphData.borderColor,
    backgroundColor: graphData.borderColor.startsWith("rgb")
      ? graphData.borderColor.replace(/rgb\(([^)]+)\)/, "rgba($1, 0.8)") //Ensure transparency for background
      : "rgba(0, 0, 0, 0.8)", //Fallback to black
    tension: 0.1,
    fill: false,
    pointRadius: 0,
    pointHoverRadius: 8,
    pointHitRadius: 20,
    borderWidth: 2.5,
    pointBackgroundColor: graphData.borderColor,
    pointHoverBorderWidth: 3.5,
    pointHoverBackgroundColor: graphData.borderColor,
    pointHoverBorderColor: "#fff",
  }));

  // Exclude 'actualelectricityconsumption' from the sum
  const sumSourceData = graphDataArray.filter(
    (g, idx) => !g.label.toLowerCase().includes("actual")
  );

  if (sumSourceData.length > 1) {
    // Use the first non-actual dataset's labels as reference
    const sumLabels = sumSourceData[0].labels;
    const sumValues = sumLabels.map((_, idx) => {
      let sum = 0;
      for (let i = 0; i < sumSourceData.length; i++) {
        sum += Number(sumSourceData[i].values[idx]) || 0;
      }
      return sum;
    });
    datasets.push({
      label: "Sum",
      data: sumValues,
      borderColor: "#43a047",
      backgroundColor: "rgba(67,160,71,0.15)",
      tension: 0.1,
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 8,
      pointHitRadius: 20,
      borderWidth: 3.5,
      pointBackgroundColor: "#43a047",
      pointHoverBorderWidth: 3.5,
      pointHoverBackgroundColor: "#43a047",
      pointHoverBorderColor: "#fff",
      borderDash: [6, 4],
    });
  }

  myChartInstance2 = new Chart(ctx, {
    type: "line",
    data: {
      labels: graphDataArray[0].labels,
      datasets: datasets,
    },
    options: {
      layout: {
        padding: {
          left: 20,
        },
      },
      elements: {
        legend: {
          borderRadius: 10,
        },
      },
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          enabled: true,
          mode: "index",
          intersect: false,
        },
        verticalLine2: {},
      },
      interaction: {
        mode: "index",
        intersect: false,
      },
      scales: {
        x: {
          ticks: {
            font: {
              size: 14,
              family: "Roboto, Arial, sans-serif",
              weight: 500,
            },
          },
          type: "time",
          time: {
            unit: "hour",
            tooltipFormat: "ll HH:mm",
            displayFormats: {
              hour: "D, HH:mm",
            },
          },
        },
        y: {
          ticks: {
            font: {
              size: 14,
              family: "Roboto, Arial, sans-serif",
              weight: 500,
            },
          },
          title: {
            display: true,
            text: "MWh",
            font: {
              size: 16,
              family: "Roboto, Arial, sans-serif",
              weight: 500,
            },
          },
          beginAtZero: true,
        },
      },
    },
    plugins: [verticalLinePlugin2],
  });
}

//Checkbox event listener
document.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    const selectedCheckboxes = document.querySelectorAll(
      "input[type='checkbox']:checked"
    );
    graphTypesForSecondChart = Array.from(selectedCheckboxes).map(
      (cb) => cb.value
    );

    if (!graphTypesForSecondChart.includes("actualelectricityconsumption")) {
      graphTypesForSecondChart.unshift("actualelectricityconsumption");
    }

    fetchDataForSecondGraph();
  });
});

document.querySelector("#mobile-dropdown").addEventListener("change", () => {
  const selectedOptions = document.querySelectorAll(
    "#mobile-dropdown option:checked"
  );

  //get value of select
  const selectedValues = Array.from(selectedOptions).map(
    (option) => option.value
  );

  //actual electricity consumption always selected
  if (!selectedValues.includes("actualelectricityconsumption")) {
    selectedValues.unshift("actualelectricityconsumption");
  }

  graphTypesForSecondChart = selectedValues;

  fetchDataForSecondGraph();
});

//Funktion zum Erstellen des Graphen
function createBatteryChart() {
  const ctx = document.getElementById("batteryChart").getContext("2d");

  batteryChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Battery Level (%)",
          data: [],
          borderColor: "rgb(255, 165, 0)", //Orange
          backgroundColor: "rgba(255, 165, 0, 0.5)",
          tension: 0.1,
          fill: true,
          pointRadius: 0,
          borderWidth: 2.5,
          pointHoverRadius: 8,
          pointBackgroundColor: "rgb(255, 165, 0)",
          pointHoverBorderWidth: 3.5,
          pointHoverBackgroundColor: "rgb(255, 165, 0)",
          pointHoverBorderColor: "#fff",
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
      scales: {
        x: {
          type: "time",
          time: {
            unit: "second",
            tooltipFormat: "HH:mm:ss",
            displayFormats: { second: "HH:mm:ss" },
          },
        },
        y: {
          title: {
            display: true,
            text: "kWh",
          },
          suggestedMin: 0,
          suggestedMax: 5,
        },
      },
    },
  });
}

//Funktion zum Aktualisieren des Graphen
function updateBatteryChart(newBatteryLevel) {
  const now = new Date();

  //Add the new data point
  batteryData.push({ x: now, y: newBatteryLevel });

  //Only shift if length exceeds 60
  if (batteryData.length > 60) {
    batteryData.shift(); //Remove the oldest data point if the array exceeds 60 entries
  }

  //If chart hasn't been initialized, create it
  if (!batteryChartInstance) {
    createBatteryChart();
  }

  //Update the chart data
  batteryChartInstance.data.labels = batteryData.map((entry) => entry.x);
  batteryChartInstance.data.datasets[0].data = batteryData.map(
    (entry) => entry.y
  );

  //Re-render the chart
  batteryChartInstance.update();
}

//create hydrogen chart
function createHydrogenChart() {
  const ctx = document.getElementById("hydrogenChart").getContext("2d");

  hydrogenChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Hydrogen Level (%)",
          data: [],
          borderColor: "rgb(72, 255, 0)",
          backgroundColor: "rgba(0, 255, 34, 0.5)",
          tension: 0.1,
          fill: true,
          pointRadius: 0,
          borderWidth: 2.5,
          pointHoverRadius: 8,
          pointBackgroundColor: "rgb(72, 255, 0)",
          pointHoverBorderWidth: 3.5,
          pointHoverBackgroundColor: "rgb(72, 255, 0)",
          pointHoverBorderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
      scales: {
        x: {
          type: "time",
          time: {
            unit: "second",
            tooltipFormat: "HH:mm:ss",
            displayFormats: { second: "HH:mm:ss" },
          },
        },
        y: {
          title: {
            display: true,
            text: "g",
          },
          suggestedMin: 0,
          suggestedMax: 5,
        },
      },
    },
  });
}

function updateHydrogenChart(newHydrogenLevel) {
  const now = new Date();

  //Add the new data point
  hydrogenData.push({ x: now, y: newHydrogenLevel });

  //Only shift if length exceeds 60
  if (hydrogenData.length > 60) {
    hydrogenData.shift(); //Remove the oldest data point if the array exceeds 60 entries
  }

  //If chart hasn't been initialized, create it
  if (!hydrogenChartInstance) {
    createHydrogenChart();
  }

  //Update the chart data
  hydrogenChartInstance.data.labels = hydrogenData.map((entry) => entry.x);
  hydrogenChartInstance.data.datasets[0].data = hydrogenData.map(
    (entry) => entry.y
  ); //Ensure correct y values

  //Re-render the chart
  hydrogenChartInstance.update();
}

//monitor battery and hydrogen charts
function startMonitoring() {
  createBatteryChart();
  createHydrogenChart();

  setInterval(() => {
    const batteryLevel = parseFloat(
      document.getElementById("battery-level").textContent
    );
    if (!isNaN(batteryLevel)) {
      updateBatteryChart(batteryLevel);
    }
  }, 1000);
  setInterval(() => {
    const hydrogenLevel = parseFloat(
      document.getElementById("hydrogen-level").textContent
    );
    if (!isNaN(hydrogenLevel)) {
      updateHydrogenChart(hydrogenLevel);
    }
  }, 1000);
}

//data fetch on page load
window.onload = async () => {
  await loadGraphIdentifiers();
  startMonitoring();

  fetchData();
};

//init values
document.addEventListener("DOMContentLoaded", function () {
  const codeExpanded = document.getElementById("code-expanded");
  const codeMinimized = document.getElementById("code-minimized");
  const content = document.getElementById("corner-content");
  const toggleButton = document.getElementById("toggle-widget");

  //standard values
  content.style.height = "300px";
  content.style.width = "300px";
  toggleButton.textContent = "▲";

  //init state: minimized
  codeExpanded.style.display = "none";
  codeExpanded.style.backgroundColor = "#f8f9fa";
  codeMinimized.style.display = "block";
  codeMinimized.style.backgroundColor = "#f8f9fa";

  //On Button press expand or minimize
  toggleButton.addEventListener("click", function () {
    if (codeExpanded.style.display === "none") {
      //If it's currently minimized, expand it
      codeExpanded.style.display = "block";
      codeMinimized.style.display = "none";

      codeExpanded.style.backgroundColor = "#f8f9fa";
      codeMinimized.style.backgroundColor = "#f8f9fa";
      toggleButton.textContent = "▼";
    } else {
      //minimize
      codeExpanded.style.display = "none";
      codeMinimized.style.display = "block";

      codeExpanded.style.backgroundColor = "#f8f9fa";
      codeMinimized.style.backgroundColor = "#f8f9fa";
      toggleButton.textContent = "▲";
    }
  });

  // Quick Manual button interactivity
  const quickManualBtn = document.getElementById("quick-manual-btn");
  const quickManualInfo = document.getElementById("quick-manual-info");
  if (quickManualBtn && quickManualInfo) {
    quickManualBtn.addEventListener("click", function () {
      if (
        quickManualInfo.style.display === "none" ||
        quickManualInfo.style.display === ""
      ) {
        quickManualInfo.style.display = "block";
        quickManualBtn.textContent = "Hide Manual";
      } else {
        quickManualInfo.style.display = "none";
        quickManualBtn.textContent = "Quick Manual";
      }
    });
  }
});
