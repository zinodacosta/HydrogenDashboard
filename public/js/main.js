// --- Flowchart GSAP animation and toggle logic (moved from index.html) ---
document.addEventListener("DOMContentLoaded", function () {
  // DOM element assignments (user request)
  const codeExpanded = document.getElementById("code-expanded");
  const codeMinimized = document.getElementById("code-minimized");
  const content = document.getElementById("corner-content");
  const toggleButton = document.getElementById("toggle-widget"); // minimized
  const toggleButtonExpanded = document.getElementById(
    "toggle-widget-expanded"
  ); // expanded
  const flowchartPanel = document.getElementById("flowchart-panel");

  // GSAP animation for flowchart-panel
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    function animateFlowchartVanilla({
      distance = 100,
      direction = "vertical",
      reverse = false,
      duration = 0.8,
      ease = "power3.out",
      initialOpacity = 0,
      animateOpacity = true,
      scale = 1,
      threshold = 0.1,
      delay = 0,
      onComplete,
    } = {}) {
      const el = document.querySelector("#flowchart-panel .flowchart");
      if (!el) return;
      const axis = direction === "horizontal" ? "x" : "y";
      const offset = reverse ? -distance : distance;
      const startPct = (1 - threshold) * 100;
      gsap.set(el, {
        [axis]: offset,
        scale,
        opacity: animateOpacity ? initialOpacity : 1,
      });
      gsap.to(el, {
        [axis]: 0,
        scale: 1,
        opacity: 1,
        duration,
        ease,
        delay,
        onComplete,
        scrollTrigger: {
          trigger: el,
          start: `top ${startPct}%`,
          toggleActions: "play none none none",
          once: true,
        },
      });
    }
    // Animate on load and when flowchart-panel is shown
    animateFlowchartVanilla();
    // Optionally, re-animate when panel is shown again
    const flowchartPanel = document.getElementById("flowchart-panel");
    if (flowchartPanel) {
      const observer = new MutationObserver(() => {
        if (flowchartPanel.style.display !== "none") {
          animateFlowchartVanilla();
        }
      });
      observer.observe(flowchartPanel, {
        attributes: true,
        attributeFilter: ["style"],
      });
    }
  }
  // Toggle flowchart-panel with code-expanded
  function updateFlowchartPanelVisibility() {
    if (!flowchartPanel || !codeExpanded) return;
    if (window.getComputedStyle(codeExpanded).display !== "none") {
      flowchartPanel.style.display = "block";
      positionFlowchartPanel();
    } else {
      flowchartPanel.style.display = "none";
    }
  }
  // Listen for widget toggle and DOM changes
  if (toggleButton) {
    toggleButton.addEventListener("click", function () {
      setTimeout(updateFlowchartPanelVisibility, 20);
    });
  }
  // Also observe codeExpanded for style changes (in case other code toggles it)
  const observer = new MutationObserver(updateFlowchartPanelVisibility);
  if (codeExpanded) {
    observer.observe(codeExpanded, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }
  // On resize, reposition flowchart panel
  window.addEventListener("resize", positionFlowchartPanel);
  // Run on load
  updateFlowchartPanelVisibility();
});
// (Removed duplicate flowchart animation logic)
// --- Flowchart animation and scroll logic ---
document.addEventListener("DOMContentLoaded", function () {
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Hide flowchart when code-expanded is scrolled down, show (with animation) when at top
    const codeExpanded = document.getElementById("code-expanded");
    const flowchartContainer = document.getElementById("flowchart-container");
    if (codeExpanded && flowchartContainer) {
      function updateFlowchartOnScrollOrVisibility() {
        // Hide if code-expanded is hidden
        if (codeExpanded.style.display === "none") {
          flowchartContainer.style.display = "none";
          return;
        }
        // Hide if scrolled down
        if (codeExpanded.scrollTop > 10) {
          flowchartContainer.style.display = "none";
        } else {
          // Only animate if just becoming visible
          if (flowchartContainer.style.display === "none") {
            flowchartContainer.style.display = "";
            animateFlowchart();
          } else {
            flowchartContainer.style.display = "";
          }
        }
      }
      codeExpanded.addEventListener(
        "scroll",
        updateFlowchartOnScrollOrVisibility
      );
      // Also update on widget toggle (in case code-expanded is shown/hidden)
      const toggleWidgetBtn = document.getElementById("toggle-widget");
      if (toggleWidgetBtn) {
        toggleWidgetBtn.addEventListener("click", function () {
          setTimeout(updateFlowchartOnScrollOrVisibility, 10);
        });
      }
      // Initial check
      updateFlowchartOnScrollOrVisibility();
    }
  }
});
// Language translation logic
let currentLanguage = "en";
const translations = {
  en: {
    tradingPanelTitle: "Trading Panel",
    latestHydrogenPriceLabel: "Latest Hydrogen Price:",
    buyElectricity: "Buy Electricity",
    sellElectricity: "Sell Electricity",
    sellHydrogen: "Sell Hydrogen",
    hydrogenAmount: "Amount (g)",
    hydrogenPrice: "Price (€/kg)",
    electricityAmount: "Amount (kWh)",
    electricityPrice: "Market Price (€/kWh)",
    increment: "+",
    reset: "Reset",
    feedback: "Report Feedback",
    changelogs: "Changelogs",
    documentation: "Documentation",
    batteryStorage: "Battery Storage",
    hydrogenStorage: "Hydrogen Storage",
    realism: "Realism",
    realismInfo:
      "This simulation compresses 1 hour into 1 second. Enable checkbox to simulate realistic circumstances.",
    accountBalance: "Account Balance:",
    electricityStored: "Electricity stored:",
    hydrogenStored: "Hydrogen stored:",
    currentMarketPrice: "Current Market Price:",
    kWh: "kWh",
    g: "g",
    euro: "€",
    wholesaleTitle: "Wholesale Price",
    chart2Title: "Electricity Consumption",
    ecoTitle: "Hydrogen Eco System",
    usecaseTitle: "Select Use Case:",
    howItWorksTitle: "How it works:",
    pvEfficiencyLabel: "PV Efficiency:",
    pvPowerLabel: "Photovoltaik Power:",
    citySelectLabel: "Select Location:",
    currentLocationLabel: "Current Location:",
    pvStatusLabel: "PV Status:",
    resetSimulation: "Reset Simulation",
    howItWorksText: `<ul style="margin-top: 6px; margin-bottom: 0;">
<li>
  The <b>Hydrogen Eco System</b> aims for economic profit by using power generated from photovoltaics,<br> buying electricity at low prices, 
  converting excess electricity to hydrogen (<b>electricity to hydrogen</b>) via an electrolyzer, 
  and <br>converting hydrogen back to electricity (<b>hydrogen back to electricity</b>) via a fuel cell when prices are high.
</li>
<li>Selecting a use case changes the parameters of the machinery.</li>
<li>The application uses geolocation to determine if the selected location is sunny and charges the photovoltaics accordingly.</li>
<li>The electrolyzer operates <b>automatically</b> when battery storage is over 80%.</li>
<li>All parameters can also be adjusted <b>manually</b>.</li>
<li>Electricity can be <b>manually</b> bought and sold at market price in the topmost panel.</li>
                </ul>
                <div style="margin-top:8px;"><em>The simulation uses UTC time.</em></div>`,
    useCases: {
      offgrid: "Off-Grid Sustainable Home",
      microgrid: "Microgrid for a Remote Village",
      evcharge: "EV Charging Station with Renewable Energy",
      industrial: "Industrial Hydrogen Production Plant",
    },
    useCaseBullets: {
      offgrid: [
        "Solar panels provide electricity for daily needs.",
        "Battery stores excess electricity for nighttime use.",
        "Electrolyzer converts surplus electricity to hydrogen.",
        "Fuel cell converts hydrogen back to electricity when needed.",
      ],
      microgrid: [
        "Microgrid supplies power to a remote village.",
        "Renewable sources and battery storage stabilize supply.",
        "Hydrogen storage enables long-term energy buffering.",
        "System adapts to changing weather and demand.",
      ],
      evcharge: [
        "EV charging station powered by renewables.",
        "Battery and hydrogen storage balance peak loads.",
        "Electrolyzer stores excess energy as hydrogen.",
        "Fuel cell provides backup power for charging.",
      ],
      industrial: [
        "Large-scale hydrogen production for industry.",
        "Electrolyzer operates at high capacity.",
        "Hydrogen stored and distributed for industrial use.",
        "System optimizes for cost and efficiency.",
      ],
    },
    batteryPanel: "Battery",
    electrolyzerPanel: "Electrolyzer",
    fuelcellPanel: "Fuel Cell",
    photovoltaikPanel: "Photovoltaik",
    batteryLevel: "Battery Level:",
    batteryEfficiency: "Battery Efficiency:",
    batteryCapacity: "Battery Capacity:",
    hydrogenLevel: "Hydrogen Level:",
    electrolyzerEfficiency: "Electrolyzer Efficiency:",
    electrolyzerPower: "Electrolyzer Power:",
    electrolyzerCapacity: "Electrolyzer Capacity:",
    fuelcellEfficiency: "Fuelcell Efficiency:",
    fuelcellPower: "Fuelcell Power:",
    startElectrolyzer: "Start Electrolyzer",
    stopElectrolyzer: "Stop Electrolyzer",
  startedElectrolyzerMsg: "Started Electrolyzer!",
  stoppedElectrolyzerMsg: "Stopped Electrolyzer!",
  startedFuelCellMsg: "Started Fuel Cell!",
  stoppedFuelCellMsg: "Stopped Fuel Cell!",
  hydrogenNotInitialized: "Hydrogen system not initialized.",
  invalidHydrogenAmount: "Invalid hydrogen amount.",
  invalidHydrogenPrice: "Invalid hydrogen price.",
  notEnoughHydrogenToSell: "Not enough hydrogen to sell. You have {have} g, tried to sell {tried} g.",
  soldHydrogen: "Sold {kg}kg hydrogen for {eur} € at {price} €/kg",
  batteryFull: "Battery is full.",
  electricityBought: "Bought {amount} kWh at {price} €/kWh",
  electricitySold: "Sold {amount} kWh at {price} €/kWh",
  electricityAutoSold: "{amount} kWh automatically sold at {price} €/kWh",
  fuelcellStoppedNoHydrogen: "Fuel cell stopped: No hydrogen left.",
  cannotBuy: "Cannot buy: {reason}",
  cannotSellNotEnoughStorage: "Cannot sell: not enough storage.",
  simulationReset: "Simulation reset!",
  notEnoughBattery: "Not enough battery energy to start electrolyzer.",
  noHydrogenStored: "No hydrogen stored.",
    startFuelcell: "Start Fuelcell",
    stopFuelcell: "Stop Fuelcell",
    chargingStation: "Charging Station",
    flowPhotovoltaik: "Photovoltaik",
    flowBattery: "Battery",
    flowElectrolyzer: "Electrolyzer",
    flowHydrogenStorage: "Hydrogen Storage",
    flowFuelcell: "Fuel Cell",
    flowChargingStation: "Charging Station",
    graphBatteryStorage: "Battery Storage",
    graphHydrogenStorage: "Hydrogen Storage",
    analysisNote:
      "Note: Analysis based on 1 week of data. For seasonal patterns and long-term trends, more historical data would be needed.",
    selectPowerGen: "Select Power Generation:",
    powerGenOptions: [
      "Brown Coal",
      "Biomass",
      "Wind Offshore",
      "Wind Onshore",
      "Hydroelectric",
      "Natural Gas",
      "Black Coal",
      "Photovoltaik",
      "Other Conventional",
      "Other Renewable",
    ],
    heatConsumersTitle: "Heat consumers",
    chargeEVBtn: "Charge EV +1 kWh",
    chargeH2Btn: "Charge H2 +100 g",
    onText: "On",
    offText: "Off",
    showerTempTitle: "Shower water temperature (°C)",
    radiatorTempTitle: "Radiator supply temperature (°C)",
    tempLabel: "temp",
    powerLabel: "power",
    deliveredLabel: "delivered",
    waterLabel: "water",
    thermalStoreLabel: "Thermal store:",
  },
  de: {
    tradingPanelTitle: "Handelspanel",
    latestHydrogenPriceLabel: "Aktueller Wasserstoffpreis:",
    buyElectricity: "Strom kaufen",
    sellElectricity: "Strom verkaufen",
    sellHydrogen: "Wasserstoff verkaufen",
    hydrogenAmount: "Menge (g)",
    hydrogenPrice: "Preis (€/g)",
    electricityAmount: "Menge (kWh)",
    electricityPrice: "Marktpreis (€/kWh)",
    increment: "+",
    reset: "Zurücksetzen",
    feedback: "Feedback melden",
    changelogs: "Änderungsprotokoll",
    documentation: "Dokumentation",
    batteryStorage: "Batteriespeicher",
    hydrogenStorage: "Wasserstoffspeicher",
    realism: "Realismus",
    realismInfo:
      "Diese Simulation komprimiert 1 Stunde in 1 Sekunde. Aktivieren Sie das Kontrollkästchen für realistische Umstände.",
    selectLocation: "Standort wählen:",
    currentLocation: "Aktueller Standort:",
    pvStatusCloudy: "Es ist bewölkt. PV lädt nicht.",
    hydrogenLevel: "Wasserstoffstand:",
    electrolyzerEfficiency: "Elektrolyseur-Wirkungsgrad:",
    electrolyzerPower: "Elektrolyseur-Leistung:",
    electrolyzerCapacity: "Elektrolyseur-Kapazität:",
    hydrogenStorage: "Wasserstoffspeicher",
    batteryLevel: "Batteriestand:",
    batteryEfficiency: "Batteriewirkungsgrad:",
    batteryCapacity: "Batteriekapazität:",
    batteryStorage: "Batteriespeicher",
    accountBalance: "Kontostand:<br>",
    electricityStored: "Gespeicherter Strom:",
    hydrogenStored: "Gespeicherter Wasserstoff:",
    currentMarketPrice: "Aktueller Marktpreis:",
    kWh: "kWh",
    g: "g",
    euro: "€",
    wholesaleTitle: "Großhandelspreis",
    chart2Title: "Stromverbrauch",
    ecoTitle: "Wasserstoff-Öko-System",
    usecaseTitle: "Anwendungsfall wählen:",
    howItWorksTitle: "So funktioniert es:",
    pvEfficiencyLabel: "PV-Wirkungsgrad:",
    pvPowerLabel: "Photovoltaik-Leistung:",
    citySelectLabel: "Standort wählen:",
    currentLocationLabel: "Aktueller Standort:",
    pvStatusLabel: "PV-Status:",
    resetSimulation: "Simulation zurücksetzen",
    howItWorksText: `<ul style="margin-top: 6px; margin-bottom: 0;">
<li>
  Die <b>Wasserstoff-Öko-System</b> zielt auf wirtschaftlichen Gewinn ab, indem Strom aus Photovoltaik genutzt,<br> Strom zu niedrigen Preisen gekauft, 
  überschüssiger Strom mittels Elektrolyseur in Wasserstoff (<b>Strom zu Wasserstoff</b>) umgewandelt 
  und <br>Wasserstoff bei hohen Preisen mittels Brennstoffzelle wieder in Strom (<b>Wasserstoff zu Strom</b>) zurückverwandelt wird.
</li>
<li>Die Auswahl eines Anwendungsfalls ändert die Parameter der Maschinen.</li>
<li>Die Anwendung verwendet Geolokalisierung, um festzustellen, ob der gewählte Standort sonnig ist und lädt die Photovoltaik entsprechend.</li>
<li>Der Elektrolyseur arbeitet <b>automatisch</b>, wenn der Batteriespeicher über 80% liegt.</li>
<li>Alle Parameter können auch <b>manuell</b> angepasst werden.</li>
<li>Strom kann <b>manuell</b> zum Marktpreis im obersten Panel gekauft und verkauft werden.</li>
                </ul>
                <div style="margin-top:8px;"><em>Die Simulation verwendet UTC-Zeit.</em></div>`,
    useCases: {
      offgrid: "Netzunabhängiges nachhaltiges Zuhause",
      microgrid: "Mikronetz für ein abgelegenes Dorf",
      evcharge: "EV-Ladestation mit erneuerbarer Energie",
      industrial: "Industrielle Wasserstoffproduktionsanlage",
    },
    useCaseBullets: {
      offgrid: [
        "Solarmodule liefern Strom für den täglichen Bedarf.",
        "Batterie speichert überschüssigen Strom für die Nacht.",
        "Elektrolyseur wandelt überschüssigen Strom in Wasserstoff um.",
        "Brennstoffzelle wandelt Wasserstoff bei Bedarf wieder in Strom um.",
      ],
      microgrid: [
        "Mikronetz versorgt ein abgelegenes Dorf mit Strom.",
        "Erneuerbare Quellen und Batteriespeicher stabilisieren die Versorgung.",
        "Wasserstoffspeicher ermöglicht langfristige Energiepufferung.",
        "System passt sich Wetter und Nachfrage an.",
      ],
      evcharge: [
        "EV-Ladestation wird mit erneuerbaren Energien betrieben.",
        "Batterie- und Wasserstoffspeicher gleichen Spitzenlasten aus.",
        "Elektrolyseur speichert überschüssige Energie als Wasserstoff.",
        "Brennstoffzelle liefert Backup-Strom für das Laden.",
      ],
      industrial: [
        "Großtechnische Wasserstoffproduktion für die Industrie.",
        "Elektrolyseur arbeitet mit hoher Kapazität.",
        "Wasserstoff wird gespeichert und für industrielle Zwecke verteilt.",
        "System optimiert Kosten und Effizienz.",
      ],
    },
    batteryPanel: "Batterie",
    electrolyzerPanel: "Elektrolyseur",
    fuelcellPanel: "Brennstoffzelle",
    photovoltaikPanel: "Photovoltaik",
    batteryLevel: "Batteriestand:",
    batteryEfficiency: "Batteriewirkungsgrad:",
    batteryCapacity: "Batteriekapazität:",
    hydrogenLevel: "Wasserstoffstand:",
    electrolyzerEfficiency: "Elektrolyseur-Wirkungsgrad:",
    electrolyzerPower: "Elektrolyseur-Leistung:",
    electrolyzerCapacity: "Elektrolyseur-Kapazität:",
    fuelcellEfficiency: "Brennstoffzellen-Wirkungsgrad:",
    fuelcellPower: "Brennstoffzellen-Leistung:",
    pvStatusSunny: "Die Sonne scheint. PV lädt.",
    startElectrolyzer: "Elektrolyseur starten",
    stopElectrolyzer: "Elektrolyseur stoppen",
  startedElectrolyzerMsg: "Elektrolyseur gestartet!",
  stoppedElectrolyzerMsg: "Elektrolyseur gestoppt!",
  startedFuelCellMsg: "Brennstoffzelle gestartet!",
  stoppedFuelCellMsg: "Brennstoffzelle gestoppt!",
  hydrogenNotInitialized: "Wasserstoffsystem nicht initialisiert.",
  invalidHydrogenAmount: "Ungültige Wasserstoffmenge.",
  invalidHydrogenPrice: "Ungültiger Wasserstoffpreis.",
  notEnoughHydrogenToSell: "Nicht genügend Wasserstoff zum Verkaufen. Sie haben {have} g, versucht zu verkaufen {tried} g.",
  soldHydrogen: "{kg}kg Wasserstoff verkauft für {eur} € zu {price} €/kg",
  batteryFull: "Batterie ist voll.",
  electricityBought: "Gekauft {amount} kWh zu {price} €/kWh",
  electricitySold: "Verkauft {amount} kWh zu {price} €/kWh",
  electricityAutoSold: "{amount} kWh automatisch verkauft zu {price} €/kWh",
  fuelcellStoppedNoHydrogen: "Brennstoffzelle gestoppt: Kein Wasserstoff vorhanden.",
  cannotBuy: "Kann nicht kaufen: {reason}",
  cannotSellNotEnoughStorage: "Kann nicht verkaufen: nicht genug Speicher.",
  simulationReset: "Simulation zurückgesetzt!",
  notEnoughBattery: "Nicht genügend Batteriespeicher, um den Elektrolyseur zu starten.",
  noHydrogenStored: "Kein Wasserstoff gespeichert.",
    startFuelcell: "Brennstoffzelle starten",
    stopFuelcell: "Brennstoffzelle stoppen",
    chargingStation: "Ladestation",
    flowPhotovoltaik: "Photovoltaik",
    flowBattery: "Batterie",
    flowElectrolyzer: "Elektrolyseur",
    flowHydrogenStorage: "Wasserstoffspeicher",
    flowFuelcell: "Brennstoffzelle",
    flowChargingStation: "Ladestation",
    graphBatteryStorage: "Batteriespeicher",
    graphHydrogenStorage: "Wasserstoffspeicher",
    analysisNote:
      "Hinweis: Analyse basiert auf 1 Woche Daten. Für saisonale Muster und langfristige Trends wären mehr historische Daten nötig.",
    selectPowerGen: "Erzeugungsart wählen:",
    powerGenOptions: [
      "Braunkohle",
      "Biomasse",
      "Wind Offshore",
      "Wind Onshore",
      "Wasserkraft",
      "Erdgas",
      "Steinkohle",
      "Photovoltaik",
      "Andere konventionelle",
      "Andere erneuerbare",
    ],
    heatConsumersTitle: "Wärmeverbraucher",
    chargeEVBtn: "EV laden +1 kWh",
    chargeH2Btn: "H2 laden +100 g",
    onText: "An",
    offText: "Aus",
    showerTempTitle: "Duschwassertemperatur (°C)",
    radiatorTempTitle: "Vorlauftemperatur des Heizkörpers (°C)",
    tempLabel: "Temp",
    powerLabel: "Leistung",
    deliveredLabel: "geliefert",
    waterLabel: "Wasser",
    thermalStoreLabel: "Thermischer Speicher:",
  },
};

// Expose a tiny translation accessor for other modules
window.getTranslation = function (key) {
  try {
    if (typeof translations === "undefined") return key;
    if (!currentLanguage) currentLanguage = "en";
    const dict = translations[currentLanguage] || {};
    return dict[key] !== undefined ? dict[key] : key;
  } catch (e) {
    return key;
  }
};

// Simple translator with interpolation support: window.t('key', {var: value})
window.t = function (key, vars) {
  try {
    let txt = window.getTranslation ? window.getTranslation(key) : key;
    if (vars && typeof vars === "object") {
      for (const k in vars) {
        const v = vars[k];
        txt = txt.replace(new RegExp("\\{" + k + "\\}", "g"), v);
      }
    }
    return txt;
  } catch (e) {
    return key;
  }
};

function setLanguage(lang) {
  // Trading Panel header
  if (document.getElementById("trading-panel-title")) {
    document.getElementById("trading-panel-title").textContent =
      translations[lang].tradingPanelTitle;
  }
  // Latest Hydrogen Price label
  if (document.getElementById("latest-hydrogen-price-label")) {
    // Only replace the label text, not the value or unit
    const labelEl = document.getElementById("latest-hydrogen-price-label");
    const valueEl = document.getElementById("latest-hydrogen-price");
    let labelText = translations[lang].latestHydrogenPriceLabel;
    // Replace only the label part before the value span
    labelEl.innerHTML = `${labelText} <span id='latest-hydrogen-price'>${
      valueEl ? valueEl.textContent : "--"
    }</span> €/kg`;
  }
  // Realism label/info (if present)
  if (document.getElementById("realism-label"))
    document.getElementById("realism-label").textContent =
      translations[lang].realism;
  if (document.getElementById("realism-info"))
    document.getElementById("realism-info").textContent =
      translations[lang].realismInfo;
  // PV Status (sun is shining)
  if (
    document.getElementById("pv-status-label") &&
    document.getElementById("sun") &&
    document.getElementById("sun").textContent.toLowerCase().includes("sun")
  )
    document.getElementById("pv-status-label").childNodes[0].textContent =
      translations[lang].pvStatusLabel + " ";
  if (
    document.getElementById("sun") &&
    document.getElementById("sun").textContent.toLowerCase().includes("sun")
  )
    document.getElementById("sun").textContent =
      translations[lang].pvStatusSunny;
  // Fuelcell Efficiency, Power
  if (
    document.getElementById("fuelcell-efficiency") &&
    document.querySelector("label[for='fuelcell-efficiency']")
  )
    document.querySelector("label[for='fuelcell-efficiency']").textContent =
      translations[lang].fuelcellEfficiency;
  if (
    document.getElementById("fuelcell-power") &&
    document.querySelector("label[for='fuelcell-power']")
  )
    document.querySelector("label[for='fuelcell-power']").textContent =
      translations[lang].fuelcellPower;
  // PV Status (sun is shining)
  if (
    document.getElementById("pv-status-label") &&
    document.getElementById("sun") &&
    document.getElementById("sun").textContent.includes("sun")
  )
    document.getElementById("pv-status-label").childNodes[0].textContent =
      translations[lang].pvStatusLabel + " ";
  if (
    document.getElementById("sun") &&
    document.getElementById("sun").textContent.includes("sun")
  )
    document.getElementById("sun").textContent =
      translations[lang].pvStatusSunny;
  // Select Location label
  if (document.getElementById("city-select-label"))
    document.getElementById("city-select-label").textContent =
      translations[lang].selectLocation || translations[lang].citySelectLabel;
  // Current Location label
  if (document.getElementById("current-location-label"))
    document.getElementById(
      "current-location-label"
    ).childNodes[0].textContent =
      (translations[lang].currentLocation ||
        translations[lang].currentLocationLabel) + " ";
  // PV Status (cloudy)
  if (
    document.getElementById("pv-status-label") &&
    document.getElementById("sun") &&
    document.getElementById("sun").textContent.includes("cloudy")
  )
    document.getElementById("pv-status-label").childNodes[0].textContent =
      translations[lang].pvStatusLabel + " ";
  if (
    document.getElementById("sun") &&
    document.getElementById("sun").textContent.includes("cloudy")
  )
    document.getElementById("sun").textContent =
      translations[lang].pvStatusCloudy;
  // Hydrogen Level
  if (
    document.getElementById("hydrogen-level") &&
    document.querySelector("#electrolyzer h3")
  )
    document.querySelector("#electrolyzer h3").textContent =
      translations[lang].electrolyzerPanel;
  if (
    document.getElementById("hydrogen-level") &&
    document.getElementById("hydrogen-level").previousSibling &&
    document
      .getElementById("hydrogen-level")
      .previousSibling.textContent.includes("Hydrogen Level")
  )
    document.getElementById("hydrogen-level").previousSibling.textContent =
      translations[lang].hydrogenLevel;
  // Electrolyzer Efficiency, Power, Capacity
  if (
    document.getElementById("electrolyzer-efficiency") &&
    document.querySelector("label[for='electrolyzer-efficiency']")
  )
    document.querySelector("label[for='electrolyzer-efficiency']").textContent =
      translations[lang].electrolyzerEfficiency;
  if (
    document.getElementById("electrolyzer-power") &&
    document.querySelector("label[for='electrolyzer-power']")
  )
    document.querySelector("label[for='electrolyzer-power']").textContent =
      translations[lang].electrolyzerPower;
  if (
    document.getElementById("electrolyzer-capacity") &&
    document.querySelector("label[for='electrolyzer-capacity']")
  )
    document.querySelector("label[for='electrolyzer-capacity']").textContent =
      translations[lang].electrolyzerCapacity;
  // Hydrogen Storage
  if (
    document.getElementById("hydrogen-storage-percentage") &&
    document.querySelector("#electrolyzer .level-highlight") &&
    document.querySelector("#electrolyzer .level-highlight")
      .previousElementSibling
  )
    document.querySelector(
      "#electrolyzer .level-highlight"
    ).previousElementSibling.textContent = translations[lang].hydrogenStorage;
  // Battery Level
  if (
    document.getElementById("battery-level") &&
    document.querySelector("#battery h3")
  )
    document.querySelector("#battery h3").textContent =
      translations[lang].batteryPanel;
  if (
    document.getElementById("battery-level") &&
    document.getElementById("battery-level").previousSibling &&
    document
      .getElementById("battery-level")
      .previousSibling.textContent.includes("Battery Level")
  )
    document.getElementById("battery-level").previousSibling.textContent =
      translations[lang].batteryLevel;
  // Battery Efficiency, Capacity
  if (
    document.getElementById("battery-efficiency") &&
    document.querySelector("label[for='battery-efficiency']")
  )
    document.querySelector("label[for='battery-efficiency']").textContent =
      translations[lang].batteryEfficiency;
  if (
    document.getElementById("battery-capacity") &&
    document.querySelector("label[for='battery-capacity']")
  )
    document.querySelector("label[for='battery-capacity']").textContent =
      translations[lang].batteryCapacity;
  // Battery Storage
  if (
    document.getElementById("battery-storage-percentage") &&
    document.querySelector("#battery .level-highlight") &&
    document.querySelector("#battery .level-highlight").previousElementSibling
  )
    document.querySelector(
      "#battery .level-highlight"
    ).previousElementSibling.textContent = translations[lang].batteryStorage;
  // Machinery panels
  if (
    document.getElementById("photovoltaik") &&
    document.querySelector("#photovoltaik h3")
  )
    document.querySelector("#photovoltaik h3").textContent =
      translations[lang].photovoltaikPanel;
  if (
    document.getElementById("battery") &&
    document.querySelector("#battery h3")
  )
    document.querySelector("#battery h3").textContent =
      translations[lang].batteryPanel;
  if (
    document.getElementById("electrolyzer") &&
    document.querySelector("#electrolyzer h3")
  )
    document.querySelector("#electrolyzer h3").textContent =
      translations[lang].electrolyzerPanel;
  if (
    document.getElementById("fuelcell") &&
    document.querySelector("#fuelcell h3")
  )
    document.querySelector("#fuelcell h3").textContent =
      translations[lang].fuelcellPanel;
  // Flow chart icon titles
  document.querySelectorAll(".flow-item").forEach((el, i) => {
    const flowKeys = [
      "flowPhotovoltaik",
      "flowBattery",
      "flowElectrolyzer",
      "flowHydrogenStorage",
      "flowFuelcell",
      "flowChargingStation",
    ];
    if (el.querySelector("p") && flowKeys[i])
      el.querySelector("p").textContent = translations[lang][flowKeys[i]];
  });
  // Graph headers
  document.querySelectorAll(".graph-row h2.pretty-header").forEach((el, i) => {
    const graphKeys = ["graphBatteryStorage", "graphHydrogenStorage"];
    if (graphKeys[i]) el.textContent = translations[lang][graphKeys[i]];
  });
  // Analysis note
  if (document.querySelector(".data-limitation small"))
    document.querySelector(".data-limitation small").textContent =
      translations[lang].analysisNote;
  // Power generation selection
  if (document.querySelector("#graph-selector2 h3"))
    document.querySelector("#graph-selector2 h3").textContent =
      translations[lang].selectPowerGen;
  // Power generation options (checkboxes and dropdown)
  const powerGenLabels = translations[lang].powerGenOptions;
  document.querySelectorAll(".checkbox-group input").forEach((input, i) => {
    if (input.nextSibling && powerGenLabels[i])
      input.nextSibling.textContent = " " + powerGenLabels[i];
  });
  const dropdown = document.getElementById("mobile-dropdown");
  if (dropdown) {
    Array.from(dropdown.options).forEach((opt, i) => {
      if (powerGenLabels[i]) opt.textContent = powerGenLabels[i];
    });
  }
  // Use case bullet points
  if (
    document.getElementById("use-case") &&
    document.getElementById("bullet-points-container")
  ) {
    const useCaseSelect = document.getElementById("use-case");
    const bulletContainer = document.getElementById("bullet-points-container");
    const selected = useCaseSelect.value;
    const bullets = translations[lang].useCaseBullets[selected] || [];
    bulletContainer.innerHTML = `<ul>${bullets
      .map((b) => `<li>${b}</li>`)
      .join("")}</ul>`;
    useCaseSelect.onchange = function () {
      const selected = useCaseSelect.value;
      const bullets = translations[lang].useCaseBullets[selected] || [];
      bulletContainer.innerHTML = `<ul>${bullets
        .map((b) => `<li>${b}</li>`)
        .join("")}</ul>`;
    };
  }
  currentLanguage = lang;
  // Trade panel buttons and labels
  document.getElementById("buy-button").textContent =
    translations[lang].buyElectricity;
  document.getElementById("sell-button").textContent =
    translations[lang].sellElectricity;
  document.getElementById("sell-hydrogen-button").textContent =
    translations[lang].sellHydrogen;
  // Account balance and market price
  document.querySelector(".money-row span").textContent =
    translations[lang].accountBalance;
  document.getElementById("battery-level-top").previousSibling.textContent =
    translations[lang].electricityStored;
  document.querySelector(".trade-market-price").childNodes[0].textContent =
    translations[lang].currentMarketPrice;
  // Hydrogen stored label
  if (document.getElementById("hydrogen-level-top")) {
    document.getElementById("hydrogen-level-top").previousSibling.textContent =
      translations[lang].hydrogenStored + " ";
  }
  // Update hydrogen storage value in topmost panel
  window.setHydrogenTopPanel = function (val) {
    const el = document.getElementById("hydrogen-level-top");
    const hydrogenPanel = document.getElementById("hydrogen-level");
    if (el && hydrogenPanel) {
      el.textContent = hydrogenPanel.textContent;
    } else if (el) {
      el.textContent = `${val} g`;
    }
  };
  // Feedback, changelogs, documentation
  if (document.getElementById("feedback-btn"))
    document.getElementById("feedback-btn").textContent =
      translations[lang].feedback;
  if (document.getElementById("changelogs-btn"))
    document.getElementById("changelogs-btn").textContent =
      translations[lang].changelogs;
  if (document.getElementById("documentation-btn"))
    document.getElementById("documentation-btn").textContent =
      translations[lang].documentation;
  // Realism label/info (if present)
  if (document.getElementById("realism-label"))
    document.getElementById("realism-label").textContent =
      translations[lang].realism;
  if (document.getElementById("realism-info"))
    document.getElementById("realism-info").textContent =
      translations[lang].realismInfo;
  // Header fields
  if (document.getElementById("header-battery"))
    document.getElementById("header-battery").textContent =
      translations[lang].batteryStorage;
  if (document.getElementById("header-hydrogen"))
    document.getElementById("header-hydrogen").textContent =
      translations[lang].hydrogenStorage;
  // Major panels and static fields
  if (document.getElementById("wholesale-title"))
    document.getElementById("wholesale-title").textContent =
      translations[lang].wholesaleTitle;
  if (document.getElementById("chart2-title"))
    document.getElementById("chart2-title").textContent =
      translations[lang].chart2Title;
  if (document.getElementById("eco-title"))
    document.getElementById("eco-title").textContent =
      translations[lang].ecoTitle;
  if (document.getElementById("usecase-title"))
    document.getElementById("usecase-title").textContent =
      translations[lang].usecaseTitle;
  if (document.getElementById("how-it-works-title"))
    document.getElementById("how-it-works-title").textContent =
      translations[lang].howItWorksTitle;
  // How it works text
  if (document.getElementById("how-it-works-panel"))
    document.getElementById(
      "how-it-works-panel"
    ).innerHTML = `<strong id="how-it-works-title" style="font-size: 1.1em; color: #1976d2;">${translations[lang].howItWorksTitle}</strong><br>${translations[lang].howItWorksText}`;
  // Use case dropdown
  if (document.getElementById("use-case")) {
    const useCaseSelect = document.getElementById("use-case");
    useCaseSelect.options[0].text = translations[lang].useCases.offgrid;
    useCaseSelect.options[1].text = translations[lang].useCases.microgrid;
    useCaseSelect.options[2].text = translations[lang].useCases.evcharge;
    useCaseSelect.options[3].text = translations[lang].useCases.industrial;
  }
  if (document.getElementById("pv-efficiency-label"))
    document.getElementById("pv-efficiency-label").textContent =
      translations[lang].pvEfficiencyLabel;
  if (document.getElementById("pv-power-label"))
    document.getElementById("pv-power-label").textContent =
      translations[lang].pvPowerLabel;
  if (document.getElementById("city-select-label"))
    document.getElementById("city-select-label").textContent =
      translations[lang].citySelectLabel;
  if (document.getElementById("current-location-label"))
    document.getElementById(
      "current-location-label"
    ).childNodes[0].textContent = translations[lang].currentLocationLabel + " ";
  if (document.getElementById("pv-status-label"))
    document.getElementById("pv-status-label").childNodes[0].textContent =
      translations[lang].pvStatusLabel + " ";
  if (document.getElementById("reset"))
    document.getElementById("reset").textContent =
      translations[lang].resetSimulation;
}

// Position the flowchart panel above and aligned with the widget
function positionFlowchartPanel() {
  const panel = document.getElementById("flowchart-panel");
  const widget = document.getElementById("corner-widget");
  if (!panel || !widget) return;

  // Temporarily ensure panel is measurable
  const prevVisibility = panel.style.visibility;
  const prevDisplay = panel.style.display;
  panel.style.visibility = "hidden";
  panel.style.display = "block";

  const widgetRect = widget.getBoundingClientRect();
  const spacing = 8; // gap around panel

  // Vertical: squeeze between window top and top of widget
  const top = spacing;
  const availableHeight = Math.max(0, widgetRect.top - spacing * 2);

  panel.style.position = "fixed";
  panel.style.top = top + "px";
  if (availableHeight > 0) {
    panel.style.height = availableHeight + "px";
  }

  // Horizontal: align to the widget's right edge
  const rightOffset = Math.max(spacing, window.innerWidth - widgetRect.right);
  panel.style.right = rightOffset + "px";
  panel.style.left = "auto";
  // Width: match maximized widget width
  panel.style.width = widgetRect.width + "px";

  // Restore previous visibility
  panel.style.visibility = prevVisibility || "visible";
  panel.style.display = prevDisplay || "block";
}

document.getElementById("lang-de").addEventListener("click", function () {
  setLanguage("de");
});
document.getElementById("lang-en").addEventListener("click", function () {
  setLanguage("en");
});

window.addEventListener("DOMContentLoaded", function () {
  // Hydrogen price logic
  async function updateLatestHydrogenPrice() {
    try {
      const response = await fetch("hydrogen_price.json");
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        // Get the latest entry
        const latest = data[data.length - 1];
        // Convert €/MWh to €/kg using formula: €/kg = MWh€ × 0.0394, then €/g
        const eurPerKg = latest.price_eur_per_mwh * 0.0394;
        const eurPerG = eurPerKg / 1000;
        document.getElementById("latest-hydrogen-price").textContent =
          eurPerG.toFixed(3);
      }
    } catch (err) {
      document.getElementById("latest-hydrogen-price").textContent = "--";
    }
  }

  updateLatestHydrogenPrice();

  // Hydrogen price history chart logic
  let hydrogenPriceChartInstance = null;
  async function showHydrogenPriceHistory() {
    try {
      const response = await fetch("hydrogen_price.json");
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        // Prepare chart data
        const labels = data.map((entry) => entry.date);
        const values = data.map((entry) =>
          ((entry.price_eur_per_mwh * 0.0394) / 1000).toFixed(3)
        );
        const ctx = document
          .getElementById("hydrogenPriceChart")
          .getContext("2d");
        if (hydrogenPriceChartInstance) hydrogenPriceChartInstance.destroy();
        hydrogenPriceChartInstance = new Chart(ctx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Hydrogen Price (€/g)",
                data: values,
                borderColor: "#1976d2",
                backgroundColor: "rgba(25,118,210,0.10)",
                tension: 0.1,
                fill: true,
                pointRadius: 2,
                borderWidth: 2.5,
                pointHoverRadius: 6,
                pointBackgroundColor: "#1976d2",
                pointHoverBorderWidth: 3.5,
                pointHoverBackgroundColor: "#1976d2",
                pointHoverBorderColor: "#fff",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true },
              tooltip: { enabled: true },
            },
            scales: {
              x: {
                title: { display: true, text: "Date" },
                ticks: { font: { size: 12 } },
              },
              y: {
                title: { display: true, text: "€/g" },
                beginAtZero: false,
                ticks: { font: { size: 12 } },
              },
            },
          },
        });
      }
    } catch (err) {
      // Optionally show error
    }
  }

  // Show More button logic
  const showMoreBtn = document.getElementById("show-hydrogen-price-history");
  const historyContainer = document.getElementById(
    "hydrogen-price-history-container"
  );
  if (showMoreBtn && historyContainer) {
    let expanded = false;
    showMoreBtn.addEventListener("click", async function () {
      expanded = !expanded;
      if (expanded) {
        historyContainer.style.display = "block";
        showMoreBtn.textContent = "Hide";
        await showHydrogenPriceHistory();
      } else {
        historyContainer.style.display = "none";
        showMoreBtn.textContent = "Show More";
      }
    });
  }
  setLanguage(currentLanguage);
});

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
let movingAverageWindow = 4; // Default moving average window size (optimized for 1 week of data)

// Indicator visibility states
let showEMA = false;
let showBollinger = false;
let showOscillator = false;

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
    //console.log("[INFO] Graph identifiers loaded:", graphIdentifiers);
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

    const graphData = graphIdentifiers[graphType]; //Resolve graphType to ID
    const graphId = graphData ? graphData.id : "1"; //Fallback to ID 1

    //Construct dynamic API URL
    const response = await fetchWithRetry(
      `${API_BASE_URL}/data?graphType=${graphId}&start=${encodeURIComponent(
        startISOString
      )}&end=${encodeURIComponent(endISOString)}`
    );

    const data = await response.json();

    if (!data.labels || !data.values) {
      console.error(
        "[ERROR] Data structure is incorrect. Full response:",
        data
      );
      // Optionally show a user-friendly message in the UI
      const chartErrorElem = document.getElementById("chart-error");
      if (chartErrorElem) {
        chartErrorElem.textContent =
          "Fehler beim Laden der Daten: Unerwartete Datenstruktur.";
        chartErrorElem.style.display = "block";
      }
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
    const chartErrorElem = document.getElementById("chart-error");
    if (chartErrorElem) {
      chartErrorElem.textContent =
        "Fehler beim Laden der Daten: " + error.message;
      chartErrorElem.style.display = "block";
    }
  }
}, 300);

//Function to calculate exponential moving average
function calculateEMA(values, period = 5) {
  if (!values || values.length === 0) return [];

  const ema = [];
  const multiplier = 2 / (period + 1);

  // First EMA value is the same as SMA
  let sum = 0;
  for (let i = 0; i < Math.min(period, values.length); i++) {
    sum += values[i] || 0;
  }
  ema.push(sum / Math.min(period, values.length));

  // Calculate EMA for remaining values
  for (let i = 1; i < values.length; i++) {
    const currentEMA = values[i] * multiplier + ema[i - 1] * (1 - multiplier);
    ema.push(currentEMA);
  }

  return ema;
}

//Function to calculate Bollinger Bands
function calculateBollingerBands(values, period = 20, stdDev = 2) {
  if (!values || values.length === 0)
    return { upper: [], middle: [], lower: [] };

  const bands = { upper: [], middle: [], lower: [] };

  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - period + 1);
    const window = values.slice(start, i + 1);

    // Calculate SMA (middle band)
    const sma =
      window.reduce((sum, val) => sum + (val || 0), 0) / window.length;

    // Calculate standard deviation
    const variance =
      window.reduce((sum, val) => {
        return sum + Math.pow((val || 0) - sma, 2);
      }, 0) / window.length;
    const standardDeviation = Math.sqrt(variance);

    bands.middle.push(sma);
    bands.upper.push(sma + standardDeviation * stdDev);
    bands.lower.push(sma - standardDeviation * stdDev);
  }

  return bands;
}

//Function to calculate Price Oscillator
function calculatePriceOscillator(values) {
  if (!values || values.length === 0) return [];

  const weekHigh = Math.max(...values);
  const weekLow = Math.min(...values);
  const range = weekHigh - weekLow;

  if (range === 0) return values.map(() => 50); // If no range, return neutral

  return values.map((price) => {
    return ((price - weekLow) / range) * 100;
  });
}

//Function to create the first chart
function createChart(canvasId, labels, values, labelName, borderColor) {
  const ctx = document.getElementById(canvasId).getContext("2d");

  const formattedLabels = labels.map((label) =>
    typeof label === "string" ? new Date(label) : label
  );

  // Calculate moving average for wholesale price
  let datasets = [
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
  ];

  // Add indicators for wholesale price
  if (labelName === "Wholesale Price" && values.length > 0) {
    // Add EMA
    if (showEMA) {
      const emaValues = calculateEMA(values, movingAverageWindow);
      const getPeriodDescription = (period) => {
        if (period <= 3) return "Very Short-term";
        if (period <= 5) return "Short-term";
        return "Medium-term";
      };

      datasets.push({
        label: `EMA (${movingAverageWindow}) - ${getPeriodDescription(
          movingAverageWindow
        )}`,
        data: emaValues,
        borderColor: "rgb(255, 0, 0)", // Red color for EMA
        backgroundColor: "rgba(255, 0, 0, 0.1)",
        tension: 0.1,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 8,
        pointHitRadius: 20,
        borderWidth: 2,
        pointBackgroundColor: "rgb(255, 0, 0)",
        pointHoverBorderWidth: 3.5,
        pointHoverBackgroundColor: "rgb(255, 0, 0)",
        pointHoverBorderColor: "#fff",
        borderDash: [5, 5], // Dashed line for EMA
      });
    }

    // Add Bollinger Bands
    if (showBollinger) {
      const bollingerBands = calculateBollingerBands(
        values,
        Math.min(20, values.length),
        2
      );

      datasets.push({
        label: "Bollinger Upper Band",
        data: bollingerBands.upper,
        borderColor: "rgba(0, 128, 255, 0.6)", // Light blue
        backgroundColor: "rgba(0, 128, 255, 0.1)",
        tension: 0.1,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 8,
        pointHitRadius: 20,
        borderWidth: 1.5,
        pointBackgroundColor: "rgba(0, 128, 255, 0.6)",
        pointHoverBorderWidth: 3.5,
        pointHoverBackgroundColor: "rgba(0, 128, 255, 0.6)",
        pointHoverBorderColor: "#fff",
        borderDash: [3, 3], // Dotted line
      });

      datasets.push({
        label: "Bollinger Lower Band",
        data: bollingerBands.lower,
        borderColor: "rgba(0, 128, 255, 0.6)", // Light blue
        backgroundColor: "rgba(0, 128, 255, 0.1)",
        tension: 0.1,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 8,
        pointHitRadius: 20,
        borderWidth: 1.5,
        pointBackgroundColor: "rgba(0, 128, 255, 0.6)",
        pointHoverBorderWidth: 3.5,
        pointHoverBackgroundColor: "rgba(0, 128, 255, 0.6)",
        pointHoverBorderColor: "#fff",
        borderDash: [3, 3], // Dotted line
      });
    }

    // Add Price Oscillator (secondary axis)
    if (showOscillator) {
      const oscillatorValues = calculatePriceOscillator(values);
      datasets.push({
        label: "Price Oscillator",
        data: oscillatorValues,
        borderColor: "rgb(255, 165, 0)", // Orange
        backgroundColor: "rgba(255, 165, 0, 0.1)",
        tension: 0.1,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 8,
        pointHitRadius: 20,
        borderWidth: 2,
        pointBackgroundColor: "rgb(255, 165, 0)",
        pointHoverBorderWidth: 3.5,
        pointHoverBackgroundColor: "rgb(255, 165, 0)",
        pointHoverBorderColor: "#fff",
        yAxisID: "oscillator", // Use secondary axis
      });
    }
  }

  myChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: formattedLabels,
      datasets: datasets,
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
          display: true,
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              family: "Roboto, Arial, sans-serif",
            },
          },
        },
        tooltip: {
          enabled: true,
          mode: "index",
          intersect: false,
          callbacks: {
            label: (context) => {
              const label = context.dataset.label;
              const value = context.raw.toFixed(2);

              if (label.includes("Price Oscillator")) {
                return `${label}: ${value}%`;
              } else if (label.includes("Bollinger")) {
                return `${label}: ${value} €/MWh`;
              } else {
                return `${label}: ${value} €/MWh`;
              }
            },
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
        oscillator: {
          type: "linear",
          display: showOscillator,
          position: "right",
          ticks: {
            font: {
              size: 12,
              family: "Roboto, Arial, sans-serif",
              weight: 500,
            },
            max: 100,
            min: 0,
            callback: function (value) {
              return value + "%";
            },
          },
          title: {
            display: showOscillator,
            text: "Price Oscillator (%)",
            font: {
              size: 14,
              family: "Roboto, Arial, sans-serif",
              weight: 500,
            },
          },
          grid: {
            drawOnChartArea: false,
          },
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
      // Arrow logic for electrolyzer
      const staticArrow = document.getElementById("electrolyzer-static-arrow");
      const animatedArrow = document.getElementById(
        "electrolyzer-animated-arrow"
      );
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
  // Documentation modal logic
  const documentationBtn = document.getElementById("documentation-btn");
  const documentationModal = document.getElementById("documentation-modal");
  if (documentationBtn && documentationModal) {
    documentationBtn.addEventListener("click", function () {
      documentationModal.style.display = "block";
    });
    // Close documentation modal when clicking outside
    window.addEventListener("mousedown", function (event) {
      if (
        documentationModal.style.display === "block" &&
        !documentationModal.contains(event.target) &&
        event.target !== documentationBtn
      ) {
        documentationModal.style.display = "none";
      }
    });
  }
  // Language toggle logic
  const langDeBtn = document.getElementById("lang-de");
  const langEnBtn = document.getElementById("lang-en");
  let currentLang = "EN";

  function setLanguage(lang) {
    currentLang = lang;
    if (lang === "DE") {
      langDeBtn.classList.add("lang-on");
      langDeBtn.classList.remove("lang-off");
      langEnBtn.classList.add("lang-off");
      langEnBtn.classList.remove("lang-on");
      // TODO: Add logic to switch dashboard text to German
    } else {
      langEnBtn.classList.add("lang-on");
      langEnBtn.classList.remove("lang-off");
      langDeBtn.classList.add("lang-off");
      langDeBtn.classList.remove("lang-on");
      // TODO: Add logic to switch dashboard text to English
    }
  }

  if (langDeBtn && langEnBtn) {
    langDeBtn.addEventListener("click", function () {
      if (currentLang !== "DE") setLanguage("DE");
    });
    langEnBtn.addEventListener("click", function () {
      if (currentLang !== "EN") setLanguage("EN");
    });
    // Set initial state
    setLanguage("EN");
  }
  // Modal logic for changelogs and feedback
  const changelogsBtn = document.getElementById("changelogs-btn");
  const changelogsModal = document.getElementById("changelogs-modal");
  const feedbackBtn = document.getElementById("feedback-btn");
  const feedbackModal = document.getElementById("feedback-modal");
  const feedbackForm = document.getElementById("feedback-form");
  const feedbackSuccess = document.getElementById("feedback-success");

  if (changelogsBtn && changelogsModal) {
    changelogsBtn.addEventListener("click", function () {
      changelogsModal.style.display = "block";
    });
    // Close changelogs modal when clicking outside
    window.addEventListener("mousedown", function (event) {
      if (
        changelogsModal.style.display === "block" &&
        !changelogsModal.contains(event.target) &&
        event.target !== changelogsBtn
      ) {
        changelogsModal.style.display = "none";
      }
    });
  }
  if (feedbackBtn && feedbackModal) {
    feedbackBtn.addEventListener("click", function () {
      feedbackModal.style.display = "block";
    });
    // Close feedback modal when clicking outside
    window.addEventListener("mousedown", function (event) {
      if (
        feedbackModal.style.display === "block" &&
        !feedbackModal.contains(event.target) &&
        event.target !== feedbackBtn
      ) {
        feedbackModal.style.display = "none";
      }
    });
  }
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const name = document.getElementById("feedback-name").value;
      const feedback = document.getElementById("feedback-text").value;

      const service_id = "service_dwbojs8";
      const template_id = "template_z7m00z1";
      const user_id = "bUrvh02pPSKz9XPKG";
      try {
        const response = await fetch(
          "https://api.emailjs.com/api/v1.0/email/send",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              service_id,
              template_id,
              user_id,
              template_params: {
                name,
                message: feedback,
              },
            }),
          }
        );
        if (response.ok) {
          if (feedbackModal) feedbackModal.style.display = "none";
          feedbackForm.reset();
          showFeedbackPopup("Thank you for your feedback!");
        } else {
          alert("Failed to send feedback. Please try again later.");
        }
      } catch (err) {
        alert("Error sending feedback. Please check your connection.");
      }
    });

    // Function to show a styled popup message
    function showFeedbackPopup(message) {
      let popup = document.createElement("div");
      popup.textContent = message;
      popup.style.position = "fixed";
      popup.style.top = "20px";
      popup.style.left = "50%";
      popup.style.transform = "translateX(-50%)";
      popup.style.background = "#43a047";
      popup.style.color = "#fff";
      popup.style.padding = "16px 32px";
      popup.style.borderRadius = "8px";
      popup.style.fontSize = "1.15em";
      popup.style.fontWeight = "bold";
      popup.style.zIndex = "9999";
      popup.style.boxShadow = "0 2px 12px rgba(67,160,71,0.18)";
      document.body.appendChild(popup);
      setTimeout(() => {
        popup.remove();
      }, 2500);
    }
  }
  const codeExpanded = document.getElementById("code-expanded");
  const codeMinimized = document.getElementById("code-minimized");
  const content = document.getElementById("corner-content");
  const toggleButton = document.getElementById("toggle-widget");
  const toggleButtonExpanded = document.getElementById(
    "toggle-widget-expanded"
  );

  // Moving average configuration
  const movingAverageWindowSlider = document.getElementById(
    "moving-average-window"
  );
  const movingAverageWindowValue = document.getElementById(
    "moving-average-window-value"
  );

  // Indicator visibility controls
  const showEMACheckbox = document.getElementById("show-ema");
  const showBollingerCheckbox = document.getElementById("show-bollinger");
  const showOscillatorCheckbox = document.getElementById("show-oscillator");

  if (movingAverageWindowSlider && movingAverageWindowValue) {
    movingAverageWindowSlider.addEventListener("input", function () {
      movingAverageWindow = parseInt(this.value);
      movingAverageWindowValue.textContent = movingAverageWindow;
      // Auto-update the chart when slider changes
      if (graphType === "wholesalePrice") {
        fetchData();
      }
    });
  }

  // Add event listeners for indicator checkboxes
  if (showEMACheckbox) {
    showEMACheckbox.addEventListener("change", function () {
      showEMA = this.checked;

      // Show/hide EMA configuration
      const emaConfig = document.getElementById("ema-config");
      if (emaConfig) {
        emaConfig.style.display = showEMA ? "flex" : "none";
      }

      if (graphType === "wholesalePrice") {
        fetchData();
      }
    });
  }

  if (showBollingerCheckbox) {
    showBollingerCheckbox.addEventListener("change", function () {
      showBollinger = this.checked;
      if (graphType === "wholesalePrice") {
        fetchData();
      }
    });
  }

  if (showOscillatorCheckbox) {
    showOscillatorCheckbox.addEventListener("change", function () {
      showOscillator = this.checked;
      if (graphType === "wholesalePrice") {
        fetchData();
      }
    });
  }

  // Add event listeners for info buttons
  const emaInfoBtn = document.getElementById("ema-info-btn");
  const bollingerInfoBtn = document.getElementById("bollinger-info-btn");
  const oscillatorInfoBtn = document.getElementById("oscillator-info-btn");

  if (emaInfoBtn) {
    emaInfoBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      alert(
        "EMA (Exponential Moving Average):\n\n• Shows trend direction and strength\n• More responsive than simple moving averages\n• Gives more weight to recent prices\n• Red dashed line on the chart\n• Higher values = stronger uptrend\n• Lower values = stronger downtrend"
      );
    });
  }

  if (bollingerInfoBtn) {
    bollingerInfoBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      alert(
        "Bollinger Bands:\n\n• Shows price volatility and potential reversal points\n• Upper/lower bands based on standard deviation\n• Blue dotted lines on the chart\n• Price touching upper band = overbought (consider selling)\n• Price touching lower band = oversold (consider buying)\n• Bands narrowing = low volatility, prepare for breakout"
      );
    });
  }

  if (oscillatorInfoBtn) {
    oscillatorInfoBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      alert(
        "Price Oscillator:\n\n• Shows relative price position within the week (0-100%)\n• Orange line on secondary Y-axis\n• 0% = week's lowest price (cheapest)\n• 100% = week's highest price (most expensive)\n• 0-20% = very cheap, good time to buy\n• 80-100% = very expensive, good time to sell\n• 20-80% = normal range, monitor for opportunities"
      );
    });
  }

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
  function handleToggleWidget() {
    if (codeExpanded.style.display === "none") {
      codeExpanded.style.display = "block";
      codeMinimized.style.display = "none";
      codeExpanded.style.backgroundColor = "#f8f9fa";
      codeMinimized.style.backgroundColor = "#f8f9fa";
      if (toggleButtonExpanded && codeExpanded.style.display !== "none") {
        toggleButtonExpanded.textContent = "▼";
      }
      if (toggleButton && codeExpanded.style.display === "none") {
        toggleButton.textContent = "▲";
      }
    } else {
      codeExpanded.style.display = "none";
      codeMinimized.style.display = "block";
      codeExpanded.style.backgroundColor = "#f8f9fa";
      codeMinimized.style.backgroundColor = "#f8f9fa";
      if (toggleButtonExpanded && codeExpanded.style.display === "none") {
        toggleButtonExpanded.textContent = "▲";
      }
      if (toggleButton && codeExpanded.style.display !== "none") {
        toggleButton.textContent = "▼";
      }
    }
  }
  if (toggleButton) toggleButton.addEventListener("click", handleToggleWidget);
  if (toggleButtonExpanded)
    toggleButtonExpanded.addEventListener("click", handleToggleWidget);

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
