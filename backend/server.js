// --- Feedback API endpoint ---
import nodemailer from "nodemailer";
// ...existing code...
import express from "express";
import fetch from "node-fetch"; //http req lib
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs"; //read and write files
import cors from "cors";
import compression from "compression";
import https from "https";

//Correct `__dirname` for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const counterFilePath = path.join(__dirname, "counter.json"); //Path to counter.json

const app = express(); //Initializing app on port 3000
const port = 3000;

//Path to `config.txt`
const configPath = path.join(__dirname, "config.txt");

//Middleware, to parse JSON data
app.use(express.json({ limit: "10mb" }));
app.use(compression()); // Enable gzip compression
app.use(
  cors({
    origin: "*", // In production, specify your frontend domain
    methods: ["GET", "POST"],
  })
);

// Feedback API endpoint
app.post("/api/feedback", async (req, res) => {
  const { name, feedback } = req.body;
  let transporter = nodemailer.createTransport({
    service: "outlook",
    auth: {
      user: "zinodacosta@outlook.com",
      pass: "DtUx2KqdfzZn9r0u!",
    },
  });
  try {
    await transporter.sendMail({
      from: "Hydrogen Dashboard <your_email@gmail.com>",
      to: "zino@protonik.eu",
      subject: `Dashboard Feedback from ${name}`,
      text: feedback,
    });
    res.status(200).json({ message: "Feedback sent successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send feedback." });
  }
});

// Simple in-memory cache for API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache middleware
function cacheMiddleware(duration = CACHE_DURATION) {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < duration) {
      return res.json(cached.data);
    }

    res.originalJson = res.json;
    res.json = function (data) {
      cache.set(key, { data, timestamp: Date.now() });
      res.originalJson(data);
    };

    next();
  };
}

//Path to the JSON file with graph identifiers
const graphIdentifiersPath = path.join(__dirname, "graphIdentifiers.json");

//Load graph identifiers from the JSON file
let graphIdentifiers = {};
try {
  graphIdentifiers = JSON.parse(fs.readFileSync(graphIdentifiersPath, "utf-8")); //Parsing from JSON
} catch (err) {
  console.error("Error loading graph identifiers:", err.message);
  process.exit(1);
}

//Serve static files from public folder directory
//app.use(express.static(path.join(__dirname, "public")));

//Middleware to enable CORS
app.use(cors());

//Function to initialize the counter
function initCounter() {
  let counterData = { counter: 0, lastUpdate: null };

  try {
    counterData = JSON.parse(fs.readFileSync(counterFilePath, "utf-8"));
  } catch (err) {
    console.log("init to 0");
  }

  const currentDate = new Date().toISOString().split("T")[0];

  //Check if the last update date is different from today
  if (counterData.lastUpdate !== currentDate) {
    //Increment the counter and reset it after reaching 7
    counterData.counter = counterData.counter + 1;

    if (counterData.counter > 6) {
      counterData.counter = 0;
      console.log("Counter reset");
    }
    //Update the `lastUpdate` to today
    counterData.lastUpdate = currentDate;
    console.log(
      `Counter updated to ${counterData.counter} for date: ${currentDate}`
    );
  } else {
  }

  //Save updated counter data back to `counter.json`
  fs.writeFileSync(
    counterFilePath,
    JSON.stringify(counterData, null, 2),
    "utf-8"
  );
  return counterData.counter;
}

//Function: Get the next day timestamp (adjusted)
function getNextDayTimestamp() {
  const today = new Date();
  const counter = initCounter();
  today.setUTCHours(0, 0, 0, 0); //Set time to 00:00 UTC
  today.setUTCDate(today.getUTCDate() - counter); //Move to the days before
  const nextDayTimestamp = today.getTime(); //Get timestamp in milliseconds
  const adjustedTimestamp = nextDayTimestamp - 7200000; //Adjust timestamp by 2 hour
  return adjustedTimestamp;
}

app.post("/saveBatteryStatus", async (req, res) => {
  const { batteryLevel } = req.body;

  if (
    batteryLevel === null ||
    batteryLevel === undefined ||
    isNaN(batteryLevel)
  ) {
    return res.status(400).json({ error: "Invalid battery level" });
  }

  try {
    //Save the battery level to the database
    await saveBatteryStatus(batteryLevel);
    res.status(200).json({ message: "Battery status saved successfully" });
  } catch (error) {
    console.error("Error saving battery status:", error);
    res.status(500).json({ error: "Error saving battery status" });
  }
});

app.post("/saveHydrogenStatus", async (req, res) => {
  const { hydrogenLevel } = req.body;

  try {
    //Save the hydrogen level to the database
    await saveHydrogenStatus(hydrogenLevel);
    res.status(200).json({ message: "Hydrogen status saved successfully" });
  } catch (error) {
    console.error("Error saving hydrogen status:", error);
    res.status(500).json({ error: "Error saving hydrogen status" });
  }
});

function getCurrentHourTimestamp() {
  const now = new Date(); //current time

  //set the minutes and seconds to 0
  now.setMinutes(0, 0, 0);

  //get timestamp in milliseconds
  const roundedTimestamp = now.getTime();

  console.log("getCurrentHourTimestamp debug:");
  console.log("  Current time:", now.toLocaleString());
  console.log("  Current time UTC:", now.toUTCString());
  console.log("  Rounded timestamp:", roundedTimestamp);
  console.log("  Rounded time:", new Date(roundedTimestamp).toLocaleString());

  return roundedTimestamp;
}
async function fetchCarbonIntensity() {
  try {
    const response = await fetch(
      "https://api.electricitymap.org/v3/carbon-intensity/latest?zone=DE",
      {
        method: "GET",
        headers: {
          "auth-token": "3s7tbtJMjBVReOKeQXX6",
        },
      }
    );
    const data = await response.json();
    return data.carbonIntensity;
  } catch (error) {
    console.error("Error fetching carbon intensity:", error);
  }
}

app.get(
  "/get-carbon-intensity",
  cacheMiddleware(2 * 60 * 1000),
  async (req, res) => {
    try {
      const carbonintensity = await fetchCarbonIntensity();
      res.json(carbonintensity); //Send the value as JSON
    } catch (error) {
      console.error("Error fetching carbon intensity:", error);
      res.status(500).json({ error: "Error fetching carbon intensity" });
    }
  }
);

//function to fetch and save the wholesale price
let latestWholesalePrice = { timestamp: null, value: null };

async function fetchWholesalePrice() {
  const adjustedTimestamp = getNextDayTimestamp();
  console.log(
    "getNextDayTimestamp in fetchWholesalePrice returned:",
    adjustedTimestamp
  );
  const currentTimestamp = getCurrentHourTimestamp();

  try {
    const response = await fetch(
      `https://www.smard.de/app/chart_data/4169/DE/4169_DE_hour_${adjustedTimestamp}.json`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch wholesale price from the external API");
    }

    const data = await response.json();
    if (data && data.series && Array.isArray(data.series)) {
      const validEntries = data.series.filter((entry) => entry[1] !== null);

      // Get Unix timestamp for current full hour
      const currentHourTimestamp = getCurrentHourTimestamp();

      console.log(
        "Current hour timestamp:",
        currentHourTimestamp,
        "Time:",
        new Date(currentHourTimestamp).toLocaleString()
      );
      console.log("Available timestamps in API data:");
      validEntries.slice(-5).forEach((entry) => {
        console.log(
          `  ${entry[0]} -> ${new Date(entry[0]).toLocaleString()} -> ${
            entry[1]
          } €/MWh`
        );
      });

      console.log("Full API response structure:");
      console.log("Total entries:", data.series.length);
      console.log("First entry:", data.series[0]);
      console.log("Last entry:", data.series[data.series.length - 1]);

      // Find exact match for current hour timestamp
      let targetEntry = validEntries.find(
        (entry) => entry[0] === currentHourTimestamp
      );

      // If not found, get the most recent entry
      if (!targetEntry) {
        targetEntry = validEntries[validEntries.length - 1];
        console.log("No exact match found, using most recent entry");
      } else {
        console.log("Exact match found!");
      }

      latestWholesalePrice = {
        timestamp: targetEntry[0],
        value: targetEntry[1],
      };

      console.log(
        `Wholesale price updated at ${new Date().toLocaleString()}: ${
          targetEntry[1]
        } €/MWh (data timestamp: ${new Date(targetEntry[0]).toLocaleString()})`
      );
    } else {
      throw new Error("API response structure invalid.");
    }
  } catch (error) {
    console.error("Error fetching wholesale price:", error);
  }
}

// Function to schedule hourly wholesale price updates
function scheduleHourlyWholesalePriceUpdate() {
  const now = new Date();
  const minutesUntilNextHour = 60 - now.getMinutes();
  const secondsUntilNextHour = minutesUntilNextHour * 60 - now.getSeconds();
  const millisecondsUntilNextHour = secondsUntilNextHour * 1000;

  console.log(
    `Next wholesale price update scheduled in ${minutesUntilNextHour} minutes and ${now.getSeconds()} seconds`
  );

  // Schedule the first update at the top of the next hour
  setTimeout(() => {
    fetchWholesalePrice();

    // Then set up recurring hourly updates
    setInterval(() => {
      fetchWholesalePrice();
    }, 60 * 60 * 1000); // Every hour (60 minutes * 60 seconds * 1000 milliseconds)
  }, millisecondsUntilNextHour);
}

app.get("/get-wholesale-price", (req, res) => {
  if (latestWholesalePrice.timestamp === null) {
    return res.status(404).json({ error: "No wholesale price available yet" });
  }

  res.json(latestWholesalePrice);
});

app.post("/saveWholeSalePrice", async (req, res) => {
  const { timestamp, value } = req.body;

  if (typeof timestamp !== "number") {
    return res.status(400).json({ error: "Invalid timestamp" });
  }
  if (typeof value !== "number") {
    return res.status(400).json({ error: "Invalid value" });
  }

  try {
    await saveWholeSalePrice(timestamp, value); //save in db
    res.status(200).json({ message: "Timestamp and value saved successfully" });
  } catch (error) {
    console.error("Error saving timestamp or value", error);
    res.status(500).json({ error: "Error" });
  }
});

//Endpoint: Provide API data
app.get("/data", cacheMiddleware(5 * 60 * 1000), async (req, res) => {
  try {
    //Get the graph type or ID from the query parameter
    const requestedGraphType = req.query.graphType || "wholesalePrice";

    //Reverse lookup if the graphType is provided as an ID
    let graphKey = Object.keys(graphIdentifiers).find(
      (key) => graphIdentifiers[key].id === requestedGraphType
    );

    //If the reverse lookup fails, assume the graphType is provided as a key
    if (!graphKey) {
      graphKey = requestedGraphType;
    }

    //Validate the resolved graphKey
    const graphData = graphIdentifiers[graphKey];
    if (!graphData) {
      throw new Error("Invalid graph type specified.");
    }

    //Get the ID from the selected graph data
    const graphId = graphData.id;

    //Calculate the timestamp for the next day at 00:00 UTC
    const nextTimestamp = getNextDayTimestamp();
    console.log(
      "getNextDayTimestamp in /data endpoint returned:",
      nextTimestamp
    );

    //Construct the API URL with the dynamic timestamp and graph identifier
    const dynamicApiUrl = `https://www.smard.de/app/chart_data/${graphId}/DE/${graphId}_DE_hour_${nextTimestamp}.json`;

    const response = await fetch(dynamicApiUrl); //Fetch data from the dynamic API URL
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const rawData = await response.json(); //Read the API data

    //Transform the time series data
    const transformedData = {
      labels: rawData.series.map((entry) =>
        new Date(entry[0]).toLocaleString()
      ), //Format timestamps
      values: rawData.series.map((entry) => entry[1]), //Extract values
    };

    //Save the transformed data to the database
    //saveToDatabase(graphId, nextTimestamp, rawData.series);

    res.json(transformedData); //Send data to the frontend
  } catch (error) {
    console.error("Error in /data route:", error.message);
    res.status(500).json({ error: "Error fetching data" });
  }
});

//Endpoint: Provide graph identifiers
app.get("/graphIdentifiers", cacheMiddleware(60 * 60 * 1000), (req, res) => {
  res.json(graphIdentifiers); //Send graph identifiers to the frontend
});

//get last battery status
/**
app.get("/getBatteryStatus", async (req, res) => {
  try {
    const lastBatteryStatus = await getLastBatteryStatus();
    if (!lastBatteryStatus) {
      return res.status(404).json({ error: "No battery data found" });
    }
    res.status(200).json(lastBatteryStatus);
  } catch (error) {
    console.error("Error fetching battery status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
 */

//get last hydrogen status
/**
app.get("/getHydrogenStatus", async (req, res) => {
  try {
    const lastHydrogenStatus = await getLastHydrogenStatus();
    if (!lastHydrogenStatus) {
      return res.status(404).json({ error: "No hydrogen data found" });
    }
    res.status(200).json(lastHydrogenStatus);
  } catch (error) {
    console.error("Error fetching hydrogen status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
 */

// SSL certificate paths
const sslOptions = {
  key: fs.readFileSync("/etc/letsencrypt/live/api.kitechnik.com/privkey.pem"),
  cert: fs.readFileSync(
    "/etc/letsencrypt/live/api.kitechnik.com/fullchain.pem"
  ),
};

//Start HTTPS server
https.createServer(sslOptions, app).listen(443, "0.0.0.0", async () => {
  console.log(`HTTPS Server running at https://api.kitechnik.com`);

  //price check on startup and save to db
  try {
    await fetchWholesalePrice();
    await fetchCarbonIntensity();

    // Schedule hourly wholesale price updates
    scheduleHourlyWholesalePriceUpdate();
  } catch (error) {
    console.error("Error saving price on server startup:", error);
  }
});

// Also start HTTP server for port 3000 (optional)
app.listen(port, "0.0.0.0", () => {
  console.log(`HTTP Server running at http://0.0.0.0:${port}`);
});

app.get("/test-graph", (req, res) => {
  res.json({
    filePath: graphIdentifiersPath,
    fileExists: fs.existsSync(graphIdentifiersPath),
    data: graphIdentifiers,
    keys: Object.keys(graphIdentifiers),
  });
});
