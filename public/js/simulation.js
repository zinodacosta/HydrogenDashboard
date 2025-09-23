// Standalone hydrogen selling function for UI integration
if (typeof window.money !== "number") {
  window.money = 0;
}
export function sellHydrogen(amount, pricePerGram) {
  if (!window.hydro || typeof window.money === "undefined") {
    showNotification("Hydrogen system not initialized.", "sell");
    return false;
  }
  amount = parseFloat(amount);
  console.log("Sell Hydrogen called with:", { amount, pricePerGram });
  // If pricePerGram is not provided or invalid, get latest price from DOM
  let price = parseFloat(pricePerGram);
  if (isNaN(price) || price <= 0) {
    const priceEl = document.getElementById("latest-hydrogen-price");
    if (priceEl && !isNaN(parseFloat(priceEl.textContent))) {
      price = parseFloat(priceEl.textContent);
      console.log("Using latest hydrogen price from DOM:", price);
    }
  }
  if (isNaN(amount) || amount <= 0) {
    showNotification("Invalid hydrogen amount.", "sell");
    console.log("Invalid hydrogen amount", amount);
    return false;
  }
  if (isNaN(price) || price <= 0) {
    showNotification("Invalid price per gram.", "sell");
    console.log("Invalid price per gram", price);
    return false;
  }
  if (window.hydro.storage < amount) {
    showNotification(
      `Not enough hydrogen to sell. You have ${window.hydro.storage.toFixed(
        2
      )} g, tried to sell ${amount} g.`,
      "sell"
    );
    console.log("Not enough hydrogen to sell", window.hydro.storage, amount);
    return false;
  }
  const totalRevenue = amount * price;
  window.hydro.storage -= amount;
  window.money += totalRevenue;
  console.log(
    `Sold ${amount}g hydrogen for ${totalRevenue.toFixed(
      2
    )} € at ${price.toFixed(2)} €/g. New storage: ${
      window.hydro.storage
    }, New money: ${window.money}`
  );
  // Update UI
  const hydrogenLevelElem = document.getElementById("hydrogen-level");
  if (hydrogenLevelElem)
    hydrogenLevelElem.innerHTML = window.hydro.storage.toFixed(2) + " g";
  const moneyElem = document.getElementById("money");
  if (moneyElem) moneyElem.innerHTML = window.money.toFixed(2) + " €";
  // Update top panel hydrogen value
  if (window.setHydrogenTopPanel)
    window.setHydrogenTopPanel(window.hydro.storage.toFixed(2));
  showNotification(
    `Sold ${amount}g hydrogen for ${totalRevenue.toFixed(
      2
    )} € at ${price.toFixed(2)} €/g`,
    "sell"
  );
  // Update hydrogen gauge
  const hydrogenStoragePercent = document.getElementById(
    "hydrogen-storage-percentage"
  );
  if (hydrogenStoragePercent && window.hydro.capacity > 0) {
    hydrogenStoragePercent.textContent =
      ((window.hydro.storage / window.hydro.capacity) * 100).toFixed(1) + "%";
  }
  const hydrogenGaugeLevel = document.getElementById("hydrogen-gauge-level");
  if (hydrogenGaugeLevel && window.hydro.capacity > 0) {
    hydrogenGaugeLevel.style.width =
      (window.hydro.storage / window.hydro.capacity) * 100 + "%";
  }
  return true;
}
let electrolyzerInterval = null;
let fuelCellInterval = null;
let realism = 1;
let speedfactor = 1 / realism;

const API_BASE_URL = "https://api.kitechnik.com";

const apiKey = "e7c7b0c5b06544339dd03539253001";
let city = "Always Sunny";
let waveLoader1, waveLoader2;
let batteryLevelElem, batteryGaugePercentageElem, batteryGaugeLevelElem;
let hydrogenLevelElem, hydrogenGaugePercentageElem, hydrogenGaugeLevelElem;
//js for dropdown menu of location
document.addEventListener("DOMContentLoaded", function () {
  // Add hydrogen storage display next to current market price
  function updateHydrogenStorageDisplay() {
    const marketPriceLabel = document.getElementById(
      "latest-hydrogen-price-label"
    );
    if (marketPriceLabel) {
      let storage =
        window.hydro && window.hydro.storage ? window.hydro.storage : 0;
      let storageSpan = document.getElementById("hydrogen-storage-inline");
      if (!storageSpan) {
        storageSpan = document.createElement("span");
        storageSpan.id = "hydrogen-storage-inline";
        storageSpan.style.marginLeft = "16px";
        storageSpan.style.color = "#1976d2";
        marketPriceLabel.appendChild(storageSpan);
      }
      storageSpan.textContent = `Hydrogen stored: ${parseFloat(storage).toFixed(
        2
      )} g`;
    }
  }

  // Initial update and periodic refresh
  updateHydrogenStorageDisplay();
  setInterval(updateHydrogenStorageDisplay, 1000);
  const citySelect = document.getElementById("city-select");
  const locationDisplay = document.getElementById("location");
  if (!citySelect || !locationDisplay) return;

  // Set city to the selected value from dropdown on initial load
  city = citySelect.value;
  locationDisplay.innerHTML = city;

  // Set PV Status to current value on page load (do not force 'Sun is shining')
  pv.checkforSun();

  if (citySelect) {
    citySelect.classList.remove("flashing-border");
    citySelect.classList.remove("flashing-border-green");
  }
  pv.checkforSun();

  if (citySelect) {
    citySelect.addEventListener("change", function () {
      citySelect.classList.remove("flashing-border");
      citySelect.classList.remove("flashing-border-green");
      city = citySelect.value;
      locationDisplay.innerHTML = city;
      pv.checkforSun();
    });
  }

  document.querySelectorAll(".trade-increment").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = btn.getAttribute("data-target");
      const inc = parseFloat(btn.getAttribute("data-inc"));
      const input = document.getElementById(targetId);
      if (input) {
        let val = parseFloat(input.value) || 0;
        val += inc;
        if (val < 0.1) val = 0.1;
        input.value = val;
        if (targetId === "sell-amount") updateSellUnit();
        if (targetId === "buy-amount") updateBuyUnit();
      }
    });
  });

  const resetSellBtn = document.getElementById("reset-sell-amount");
  const sellAmountInput = document.getElementById("sell-amount");
  if (resetSellBtn && sellAmountInput) {
    resetSellBtn.addEventListener("click", function (e) {
      e.preventDefault();
      sellAmountInput.value = 0;
      if (typeof updateSellUnit === "function") updateSellUnit();
    });
  }
  const resetBuyBtn = document.getElementById("reset-buy-amount");
  const buyAmountInput = document.getElementById("buy-amount");
  if (resetBuyBtn && buyAmountInput) {
    resetBuyBtn.addEventListener("click", function (e) {
      e.preventDefault();
      buyAmountInput.value = 0;
      if (typeof updateBuyUnit === "function") updateBuyUnit();
    });
  }

  if (sellAmountInput) {
    sellAmountInput.addEventListener("input", updateSellUnit);
  }
  if (buyAmountInput) {
    buyAmountInput.addEventListener("input", updateBuyUnit);
  }

  waveLoader1 = document.querySelector(".wave-loader1");
  waveLoader2 = document.querySelector(".wave-loader2");
  batteryLevelElem = document.getElementById("battery-level");
  batteryGaugePercentageElem = document.getElementById(
    "battery-gauge-percentage"
  );
  batteryGaugeLevelElem = document.getElementById("battery-gauge-level");
  hydrogenLevelElem = document.getElementById("hydrogen-level");
  hydrogenGaugePercentageElem = document.getElementById(
    "hydrogen-gauge-percentage"
  );
  hydrogenGaugeLevelElem = document.getElementById("hydrogen-gauge-level");

  pv.checkforSun();
});

let isNotificationVisible = false;
//fade in notification signalizing trade of electricity
function showNotification(message, type) {
  const notification = document.getElementById("notification");
  if (!notification) return;

  // Remove both classes first
  notification.classList.remove("notification-buy", "notification-sell");
  if (type === "buy") {
    notification.classList.add("notification-buy");
  } else {
    notification.classList.add("notification-sell");
  }

  notification.textContent = message;
  notification.style.display = "block";
  // Restart animation
  notification.style.animation = "none";
  // Force reflow
  void notification.offsetWidth;
  notification.style.animation = "";

  setTimeout(() => {
    notification.style.display = "none";
    notification.classList.remove("notification-buy", "notification-sell");
  }, 3000);
}

export class photovoltaik {
  constructor() {
    this.power = 250; //Watt
    this.efficiency = 20;
    this.lastSunStatus = false; // Cache for sun status
  }
  updatePVEfficiency(amount) {
    this.efficiency = amount;
  }
  updatePVPower(amount) {
    this.power = amount;
  }
  async checkforSun() {
    // Ensure PV charges if 'Always Sunny' is selected
    document.getElementById("location").innerHTML = city;
    let sun = false;
    const sunElem = document.getElementById("sun");
    const citySelectElem = document.getElementById("city-select");
    if (city === "Always Sunny") {
      // Force sunny state
      if (sunElem) {
        sunElem.innerHTML =
          '<span class="pv-sun-highlight">Sun is shining</span>';
      }
      document.getElementById("simulation-state").innerHTML = "Charge Mode";
      document.getElementById("pv-static-arrow").style.display = "none";
      document.getElementById("pv-animated-arrow").style.display = "block";
      sun = true;
      if (citySelectElem) {
        citySelectElem.classList.remove("flashing-border");
        citySelectElem.classList.remove("flashing-border-green");
      }
      this.lastSunStatus = sun;
      return sun;
    }
    // ...existing code for API/weather-based charging...
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`
      );
      const data = await response.json();
      const cloudiness = data.current.cloud;
      const daytime = data.current.is_day;
      if (daytime) {
        if (cloudiness < 50) {
          if (sunElem) {
            sunElem.innerHTML =
              '<span class="pv-sun-highlight">Sun is shining</span>';
          }
          document.getElementById("simulation-state").innerHTML =
            " Charge Mode ";
          document.getElementById("pv-static-arrow").style.display = "none";
          document.getElementById("pv-animated-arrow").style.display = "block";
          sun = true;
          if (citySelectElem) {
            citySelectElem.classList.remove("flashing-border");
            citySelectElem.classList.remove("flashing-border-green");
          }
        } else {
          document.getElementById("simulation-state").innerHTML =
            "Stand-By Mode";
          if (sunElem) sunElem.textContent = "It is cloudy. PV not charging";
          document.getElementById("pv-animated-arrow").style.display = "none";
          document.getElementById("pv-static-arrow").style.display = "block";
          sun = false;
          if (citySelectElem) {
            citySelectElem.classList.remove("flashing-border-green");
            citySelectElem.classList.add("flashing-border");
          }
          if (sunElem) sunElem.classList.remove("pv-sun-highlight");
        }
      } else {
        if (sunElem) sunElem.textContent = "It is night-time. PV not charging";
        document.getElementById("pv-animated-arrow").style.display = "none";
        document.getElementById("pv-static-arrow").style.display = "block";
        sun = false;
        if (citySelectElem) {
          citySelectElem.classList.remove("flashing-border-green");
          citySelectElem.classList.add("flashing-border");
        }
        if (sunElem) sunElem.classList.remove("pv-sun-highlight");
      }
      this.lastSunStatus = sun; // Cache the sun status
      return sun;
    } catch (error) {
      console.error("Error", error);
      const citySelectElem = document.getElementById("city-select");
      if (citySelectElem) {
        citySelect.classList.remove("flashing-border-green");
        citySelect.classList.add("flashing-border");
      }
      const sunElem = document.getElementById("sun");
      if (sunElem) sunElem.classList.remove("pv-sun-highlight");
    }
  }
}

export class battery {
  constructor() {
    this.capacity = 100; //kWh max val
    this.storage = 0; //kWh current val
    this.efficiency = 100;
  }

  updateBatteryEfficiency(amount) {
    this.efficiency = amount;
  }

  updateBatteryCapacity(amount) {
    this.capacity = amount;
  }

  updateBatteryStorage(amount) {
    if (amount > 0 && this.storage < this.capacity) {
      this.storage += amount;
    } else if (amount < 0 && this.storage > 0) {
      this.storage += amount;
    }

    //Update the battery level and gauge
    document.getElementById("battery-level").innerHTML =
      this.storage.toFixed(2) + " kWh";
    const batteryLevelTop = document.getElementById("battery-level-top");
    if (batteryLevelTop)
      batteryLevelTop.innerHTML = this.storage.toFixed(2) + " kWh";
    const batteryStoragePercent = document.getElementById(
      "battery-storage-percentage"
    );
    if (batteryStoragePercent && this.capacity > 0) {
      const percent = (this.storage / this.capacity) * 100;
      batteryStoragePercent.textContent = percent.toFixed(1) + "%";
    }
    let batteryPercentage = (this.storage / this.capacity) * 100;
    document.getElementById("battery-gauge-percentage").innerHTML =
      batteryPercentage.toFixed(1) + " %";
    document.getElementById("battery-gauge-level").style.width =
      batteryPercentage.toFixed(1) + "%";

    // Electrolyzer arrow logic: animated only when electrolyzer is running
    const staticArrow = document.getElementById("electrolyzer-static-arrow");
    const animatedArrow = document.getElementById(
      "electrolyzer-animated-arrow"
    );
    const outStaticArrow = document.getElementById(
      "electrolyzer-output-static-arrow"
    );
    const outAnimatedArrow = document.getElementById(
      "electrolyzer-output-animated-arrow"
    );
    let shouldBeAnimated =
      electrolyzerInterval !== null || batteryPercentage >= 80;
    // Fix: Only update battery->electrolyzer arrow if state changes
    if (staticArrow && animatedArrow) {
      if (typeof this.lastBatteryElectrolyzerArrowState === "undefined") {
        this.lastBatteryElectrolyzerArrowState = null;
      }
      if (this.lastBatteryElectrolyzerArrowState !== shouldBeAnimated) {
        staticArrow.style.display = shouldBeAnimated ? "none" : "block";
        animatedArrow.style.display = shouldBeAnimated ? "block" : "none";
        this.lastBatteryElectrolyzerArrowState = shouldBeAnimated;
      }
    }
    // Output arrow always updates (no flicker issue)
    if (outStaticArrow && outAnimatedArrow) {
      outStaticArrow.style.display = shouldBeAnimated ? "none" : "block";
      outAnimatedArrow.style.display = shouldBeAnimated ? "block" : "none";
    }
    errorCheck();
  }
}

export class fuelcell {
  constructor() {
    this.efficiency = 0.9; //%
    this.power = 500; //W
    this.fuelcellflag = false;
  }

  updateFuelCellEfficiency(amount) {
    this.efficiency = amount;
  }

  updateFuelCellPower(amount) {
    this.power = amount;
  }

  produceElectricity() {
    if (hydro.storage > 0) {
      let powerProduced =
        (hydro.storage *
          33.3 *
          (this.efficiency / 100) *
          (this.power / 1000) *
          speedfactor) /
        100;
      //Wasserstoffspeicher * 33.3kwH/kg * Brennstoffzelle Wirkungsgrad * Brennstoffzelle Leistung
      charge.updateBatteryStorage(powerProduced);
      hydro.storage -= powerProduced;

      document.getElementById("battery-level").innerHTML =
        charge.storage.toFixed(2) + " kWh";
      if (window.setHydrogenTopPanel)
        window.setHydrogenTopPanel(hydro.storage.toFixed(2));
      const batteryLevelTop = document.getElementById("battery-level-top");
      if (batteryLevelTop)
        batteryLevelTop.innerHTML = charge.storage.toFixed(2) + " kWh";
      let batteryPercentage = (this.storage / this.capacity) * 100;
      document.getElementById("battery-gauge-percentage").innerHTML =
        batteryPercentage.toFixed(1) + " %";
      document.getElementById("battery-gauge-level").style.width =
        batteryPercentage.toFixed(1) + "%";
      document.getElementById("hydrogen-level").innerHTML =
        hydro.storage.toFixed(2) + " g";
    } else {
    }
  }
}
export class electrolyzer {
  constructor() {
    this.efficiency = 70; //%
    this.power = 200; //W
    this.storage = 0;
    this.capacity = 100; //g
    this.hydrogenflag = false;
  }

  updateElectrolyzerEfficiency(amount) {
    this.efficiency = amount;
  }

  updateElectrolyzerCapacity(amount) {
    this.capacity = amount;
  }

  updateElectrolyzerPower(amount) {
    this.power = amount;
  }

  produceHydrogen() {
    if (charge.storage > 0.1) {
      //max hydrogen possible under current battery level
      let maxHydrogen = this.capacity - this.storage;
      let possibleHydrogenProduced =
        (charge.storage *
          55.5 *
          (this.efficiency / 100) *
          (this.power / 1000) *
          speedfactor) /
        10000;
      //Batteriespeicher * 55.5kg/kWh * Elektrolyse Wirkungsgrad * Elektrolyse Leistung

      //only produce whats possible under both constraints
      let actualHydrogenProduced = Math.min(
        possibleHydrogenProduced,
        maxHydrogen
      );

      let actualBatteryConsumption =
        actualHydrogenProduced * (1 / (this.efficiency / 100));

      if (
        charge.storage >= actualBatteryConsumption &&
        actualHydrogenProduced > 0
      ) {
        this.storage += actualHydrogenProduced;
        charge.updateBatteryStorage(-actualBatteryConsumption);

        document.getElementById("hydrogen-level").innerHTML =
          this.storage.toFixed(2) + " g";
        let hydrogenPercentage = (this.storage / this.capacity) * 100;
        const hydrogenStoragePercent = document.getElementById(
          "hydrogen-storage-percentage"
        );
        if (hydrogenStoragePercent && this.capacity > 0) {
          hydrogenStoragePercent.textContent =
            hydrogenPercentage.toFixed(1) + "%";
        }

        if (
          document.getElementById("simulation-state").innerHTML ===
          "Charge Mode"
        ) {
          document.getElementById("simulation-state").innerHTML =
            "Charge Mode + Hydrogen Mode ";
        } else {
          document.getElementById("simulation-state").innerHTML =
            "Hydrogen Mode ";
        }

        document.getElementById("hydrogen-gauge-percentage").innerHTML =
          hydrogenPercentage.toFixed(1) + " %";
        document.getElementById("hydrogen-gauge-level").style.width =
          hydrogenPercentage + "%";
        errorCheck();
      } else {
        document.getElementById("hydrogen-level").innerHTML =
          "Not enough battery for hydrogen production";
      }
    } else {
      document.getElementById("hydrogen-level").innerHTML =
        this.storage.toFixed(2) + " g";
      let hydrogenPercentage = (this.storage / this.capacity) * 100;
      document.getElementById("hydrogen-gauge-percentage").innerHTML =
        hydrogenPercentage.toFixed(1) + " %";
      document.getElementById("hydrogen-gauge-level").style.width =
        hydrogenPercentage + "%";
      errorCheck();
    }
  }
}

export class heater {
  constructor() {
    this.efficiency = 55;
    this.power = 200;
    this.temperature = 18;
    this.ambientTemperature = 18;
  }

  produceHeat() {
    if (hydro.storage > 0.1) {
      let heatProduced =
        (((this.power * (1 / (this.efficiency / 100) - 1)) / 1005) *
          50 *
          speedfactor) /
        10000; //Q = Pel*(1/Wirkungsgrad - 1) / Wärmekapazität Luft * Volumen Luft
    }
  }
}
const pv = new photovoltaik();
const charge = new battery();
const hydro = new electrolyzer();
window.hydro = hydro;
const fc = new fuelcell();

async function fetchHydrogenLevel() {
  //database fetch might get discontinued
  try {
    const response = await fetch(`${API_BASE_URL}/getHydrogenStatus`);
    const data = await response.json();

    if (data.level !== undefined && data.level !== null) {
      hydro.storage = data.level;
      document.getElementById(
        "hydrogen-level"
      ).innerText = ` ${hydro.storage.toFixed(2)} g`;
    } else {
      document.getElementById("hydrogen-level").innerText =
        "No hydrogen data available";
    }
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("hydrogen-level").innerText =
      "Error fetching hydrogen data";
  }
}

export class powersource {
  constructor() {
    this.totalpower = 1000; //W
  }
  async totalWattConsumption() {
    let powerconsumption = this.totalpower - hydro.power;
    document.getElementById("power-consumption").innerHTML =
      powerconsumption.toFixed(2) + "W";
  }
}

async function getLastWholeSalePrice() {
  try {
    console.log(
      "Fetching wholesale price at:",
      new Date().toLocaleTimeString()
    );
    const response = await fetch(
      "https://api.kitechnik.com/get-wholesale-price"
    );
    const data = await response.json();
    console.log("Received price data:", data);
    return data.value;
  } catch (error) {
    console.error("Error fetching Last Price", error);
    return null;
  }
}

//API fetch for carbon intensity
async function getCarbonIntensity() {
  try {
    const response = await fetch(`${API_BASE_URL}/get-carbon-intensity`);
    const data = await response.json();
    console.log("intensity", data);
    document.getElementById("carbon-intensity").innerHTML = data + " gCO₂/kWh";
  } catch (error) {
    console.error("Error fetching Carbon Intensity", error);
    return null;
  }
}

//db fetch for battery level
async function fetchBatteryLevel() {
  try {
    const response = await fetch("https://api.kitechnik.com/getBatteryStatus");
    const data = await response.json();

    if (data.level !== undefined) {
      charge.storage = data.level; //Batterie-Speicher synchronisieren
      document.getElementById(
        "battery-level"
      ).innerText = ` ${data.level.toFixed(2)} kWh`;
      const batteryLevelTop = document.getElementById("battery-level-top");
      if (batteryLevelTop)
        batteryLevelTop.innerText = ` ${data.level.toFixed(2)} kWh`;
      let batteryPercentage = (charge.storage / charge.capacity) * 100;
      document.getElementById("battery-gauge-percentage").innerHTML =
        batteryPercentage.toFixed(1) + " %";
      document.getElementById("battery-gauge-level").style.width =
        batteryPercentage + "%";
    }
  } catch (error) {
    console.error("error:", error);
  }
}

function getBuyThreshold() {
  const input = document.getElementById("buy-threshold");
  const value = input && input.value ? parseFloat(input.value) : NaN;
  return !isNaN(value) && value > 0 ? value : 80;
}
function getSellThreshold() {
  const input = document.getElementById("sell-threshold");
  const value = input && input.value ? parseFloat(input.value) : NaN;
  return !isNaN(value) && value > 0 ? value : 150;
}
function getBuyAmount() {
  const input = document.getElementById("buy-amount");
  const value = input && input.value ? parseFloat(input.value) : NaN;
  return !isNaN(value) && value > 0 ? value : 1;
}
function getSellAmount() {
  const input = document.getElementById("sell-amount");
  const value = input && input.value ? parseFloat(input.value) : NaN;
  return !isNaN(value) && value > 0 ? value : 1;
}

export class tradeElectricity {
  constructor() {
    this.electricityPrice = null;
    this.money = 0;
    this.init();
  }

  async init() {
    await this.priceCheck();
  }
  async priceCheck() {
    this.electricityPrice = await getLastWholeSalePrice();
    console.log("Preis in der Simulation geladen", this.electricityPrice);

    const currentPriceElement = document.getElementById("current-price");
    if (currentPriceElement) {
      currentPriceElement.innerHTML = this.electricityPrice;
    }
    document.getElementById("current-price").innerHTML = this.electricityPrice;

    const marketPriceSell = document.getElementById(
      "current-market-price-sell"
    );
    const marketPriceBuy = document.getElementById("current-market-price-buy");
    if (marketPriceSell) marketPriceSell.textContent = this.electricityPrice;
    if (marketPriceBuy) marketPriceBuy.textContent = this.electricityPrice;
    console.log("Set DOM market price to:", this.electricityPrice);
  }

  async buyElectricity() {
    await this.priceCheck();
    const amount = getBuyAmount();
    const pricePerKWh = this.electricityPrice / 1000;
    // Allow buying if price is negative, regardless of balance
    const enoughMoney = pricePerKWh < 0 || this.money >= pricePerKWh * amount;
    const enoughCapacity = charge.storage + amount <= charge.capacity;
    if (enoughMoney && enoughCapacity) {
      this.money -= pricePerKWh * amount;
      charge.updateBatteryStorage(amount);
      showNotification(
        `${amount} kWh Electricity bought at ${pricePerKWh.toFixed(3)} €/kWh!`,
        "buy"
      );
      const moneyElem = document.getElementById("money");
      if (moneyElem) {
        moneyElem.innerHTML = this.money.toFixed(2) + " €";
      }
    } else {
      let reason = "";
      if (!enoughMoney) reason += "not enough money. ";
      if (!enoughCapacity) reason += "not enough battery capacity.";
      showNotification(`Cannot buy: ${reason.trim()}`, "sell");
    }
  }
  async sellElectricity() {
    await this.priceCheck();
    const amount = getSellAmount();
    if (charge.storage >= amount) {
      // electricityPrice is in €/MWh, so per kWh is electricityPrice / 1000
      const pricePerKWh = this.electricityPrice / 1000;
      this.money += pricePerKWh * amount;
      charge.updateBatteryStorage(-amount);
      showNotification(
        `${amount} kWh Electricity sold at ${pricePerKWh.toFixed(3)} €/kWh!`,
        "sell"
      );
      const moneyElem = document.getElementById("money");
      if (moneyElem) {
        moneyElem.innerHTML = this.money.toFixed(2) + " €";
        moneyElem.classList.add("money-pop");
        setTimeout(() => moneyElem.classList.remove("money-pop"), 700);
      }
    } else {
      showNotification(`Cannot sell: not enough storage.`, "buy");
    }
  }

  // New method to sell a custom amount (for auto-sell)
  async sellCustomAmount(amount) {
    await this.priceCheck();
    if (charge.storage >= amount && amount > 0) {
      const pricePerKWh = this.electricityPrice / 1000;
      this.money += pricePerKWh * amount;
      charge.updateBatteryStorage(-amount);
      showNotification(
        `${amount} kWh Electricity automatically sold at ${pricePerKWh.toFixed(
          3
        )} €/kWh!`,
        "sell"
      );
      const moneyElem = document.getElementById("money");
      if (moneyElem) {
        moneyElem.innerHTML = this.money.toFixed(2) + " €";
        moneyElem.classList.add("money-pop");
        setTimeout(() => moneyElem.classList.remove("money-pop"), 700);
      }
    }
  }
}
let trade = new tradeElectricity();

// --- Weather API polling every 5 minutes ---
function pollWeather() {
  pv.checkforSun();
}
setInterval(pollWeather, 5 * 60 * 1000);
pollWeather();

// --- Regularly update current market price at the top of each hour ---
function scheduleHourlyPriceUpdate() {
  const now = new Date();
  const minutesUntilNextHour = 60 - now.getMinutes();
  const secondsUntilNextHour = minutesUntilNextHour * 60 - now.getSeconds();
  const millisecondsUntilNextHour = secondsUntilNextHour * 1000;

  console.log(
    `Next client-side price update scheduled in ${minutesUntilNextHour} minutes and ${now.getSeconds()} seconds`
  );

  // Schedule the first update at the top of the next hour
  setTimeout(() => {
    if (typeof trade !== "undefined" && trade.priceCheck) {
      console.log("Updating market price at:", new Date().toLocaleTimeString());
      trade.priceCheck();
    }

    // Then set up recurring hourly updates
    setInterval(() => {
      if (typeof trade !== "undefined" && trade.priceCheck) {
        console.log(
          "Updating market price at:",
          new Date().toLocaleTimeString()
        );
        trade.priceCheck();
      }
    }, 3600000); // Update every hour (3,600,000 ms)
  }, millisecondsUntilNextHour);
}

// Start the hourly price update scheduling
scheduleHourlyPriceUpdate();

async function updateSimulation() {
  // Use the cached sun status instead of checking every second
  let sun = pv.lastSunStatus || false;
  if (sun && charge.storage < charge.capacity) {
    let powergenerated =
      ((pv.efficiency / 100) *
        pv.power *
        (charge.efficiency / 100) *
        speedfactor) /
      1000;
    //PV Leistung * PV Wirkungsgrad * Batterie Wirkungsgrad / 1000

    if (powergenerated + charge.storage <= charge.capacity) {
      charge.updateBatteryStorage(powergenerated);
    }
  }
  const waveLoader1 = document.querySelector(".wave-loader1");
  if (waveLoader1) {
    waveLoader1.style.setProperty(
      "--before-top",
      (charge.storage / charge.capacity) * 100 * -1 - 15 + "%"
    );
    waveLoader1.style.setProperty(
      "--after-top",
      (charge.storage / charge.capacity) * 100 * -1 - 15 + "%"
    );
  }
  const waveLoader2 = document.querySelector(".wave-loader2");
  if (waveLoader2) {
    waveLoader2.style.setProperty(
      "--before-top",
      (hydro.storage / hydro.capacity) * 100 * -1 - 15 + "%"
    );
    waveLoader2.style.setProperty(
      "--after-top",
      (hydro.storage / hydro.capacity) * 100 * -1 - 15 + "%"
    );
  }

  if (
    charge.storage / charge.capacity >= 0.8 &&
    charge.storage > 0 &&
    hydro.storage < hydro.capacity
  ) {
    hydro.produceHydrogen();
  }
}

function resetSimulation() {
  console.log("Reset");
  charge.storage = 0;
  hydro.storage = 0;
  trade.money = 0;

  if (electrolyzerInterval !== null) {
    clearInterval(electrolyzerInterval);
    electrolyzerInterval = null;
  }

  if (fuelCellInterval !== null) {
    clearInterval(fuelCellInterval);
    fuelCellInterval = null;
  }

  document.getElementById("battery-level").innerText = " 0 kWh";
  const batteryLevelTop = document.getElementById("battery-level-top");
  if (batteryLevelTop) batteryLevelTop.innerText = " 0 kWh";
  document.getElementById("battery-gauge-percentage").innerText = " 0 %";
  document.getElementById("battery-gauge-level").style.width = 0;

  document.getElementById("hydrogen-level").innerText = " 0 g";

  document.getElementById("hydrogen-gauge-percentage").innerText = " 0 %";
  document.getElementById("hydrogen-gauge-level").style.width = 0;
  document.getElementById("money").innerText = "  0 €";

  // Ensure Fuel Cell -> Charging Station arrow is static after reset
  const fc2cStatic = document.getElementById(
    "fuelcell-to-charging-static-arrow"
  );
  const fc2cAnim = document.getElementById(
    "fuelcell-to-charging-animated-arrow"
  );
  if (fc2cStatic && fc2cAnim) {
    fc2cStatic.style.display = "block";
    fc2cAnim.style.display = "none";
  }

  // Show notification
  showNotification("Simulation reset!", "buy");
}

//Slider für Simulation
document.addEventListener("DOMContentLoaded", function () {
  const sellButton = document.getElementById("sell-button");
  const buyButton = document.getElementById("buy-button");
  const resetButton = document.getElementById("reset");

  const batteryEfficiencySlider = document.getElementById("battery-efficiency");
  const batteryEfficiencyValueDisplay = document.getElementById(
    "battery-efficiency-value"
  );

  const batteryCapacitySlider = document.getElementById("battery-capacity");
  const batteryCapacityValueDisplay = document.getElementById(
    "battery-capacity-value"
  );

  const electrolyzerEfficiencySlider = document.getElementById(
    "electrolyzer-efficiency"
  );
  const electrolyzerEfficiencyValueDisplay = document.getElementById(
    "electrolyzer-efficiency-value"
  );

  const electrolyzerPowerSlider = document.getElementById("electrolyzer-power");
  const electrolyzerPowerValueDisplay = document.getElementById(
    "electrolyzer-power-value"
  );

  const electrolyzerCapacitySlider = document.getElementById(
    "electrolyzer-capacity"
  );
  const electrolyzerCapacityValueDisplay = document.getElementById(
    "electrolyzer-capacity-value"
  );

  const fuelcellPowerSlider = document.getElementById("fuelcell-power");
  const fuelcellPowerValueDisplay = document.getElementById(
    "fuelcell-power-value"
  );

  const fuelcellEfficiencySlider = document.getElementById(
    "fuelcell-efficiency"
  );
  const fuelcellEfficiencyValueDisplay = document.getElementById(
    "fuelcell-efficiency-value"
  );

  const PVEfficiencySlider = document.getElementById("PV-efficiency");
  const PVEfficiencyValueDisplay = document.getElementById(
    "PV-efficiency-value"
  );

  const PVPowerSlider = document.getElementById("PV-power");
  const PVPowerValueDisplay = document.getElementById("PV-power-value");

  // Realism checkbox functionality
  const realismCheckbox = document.getElementById("realism-checkbox");
  if (realismCheckbox) {
    realismCheckbox.addEventListener("change", function () {
      if (this.checked) {
        realism = 3600;
      } else {
        realism = 1;
      }
      speedfactor = 1 / realism;
      console.log("Realism changed to:", realism);
    });
  }

  batteryEfficiencySlider.addEventListener("input", function () {
    const efficiency = parseFloat(batteryEfficiencySlider.value);
    batteryEfficiencyValueDisplay.textContent = efficiency + "%";
    charge.updateBatteryEfficiency(efficiency);
  });

  batteryCapacitySlider.addEventListener("input", function () {
    const capacity = parseFloat(batteryCapacitySlider.value);
    batteryCapacityValueDisplay.textContent = capacity + "kWh";
    charge.updateBatteryCapacity(capacity);
  });

  electrolyzerEfficiencySlider.addEventListener("input", function () {
    const efficiency = parseFloat(electrolyzerEfficiencySlider.value);
    electrolyzerEfficiencyValueDisplay.textContent = efficiency + "%";
    hydro.updateElectrolyzerEfficiency(efficiency);
  });

  electrolyzerPowerSlider.addEventListener("input", function () {
    const power = parseFloat(electrolyzerPowerSlider.value);
    electrolyzerPowerValueDisplay.textContent = power + " Watt";
    hydro.updateElectrolyzerPower(power);
  });

  electrolyzerCapacitySlider.addEventListener("input", function () {
    const capacity = parseFloat(electrolyzerCapacitySlider.value);
    electrolyzerCapacityValueDisplay.textContent = capacity + " g";
    hydro.updateElectrolyzerCapacity(capacity);
  });

  fuelcellPowerSlider.addEventListener("input", function () {
    const power = parseFloat(fuelcellPowerSlider.value);
    fuelcellPowerValueDisplay.textContent = power + " Watt";
    fc.updateFuelCellPower(power);
  });

  fuelcellEfficiencySlider.addEventListener("input", function () {
    const efficiency = parseFloat(fuelcellEfficiencySlider.value);
    fuelcellEfficiencyValueDisplay.textContent = efficiency + "%";
    fc.updateFuelCellEfficiency(efficiency);
  });

  PVEfficiencySlider.addEventListener("input", function () {
    const efficiency = parseFloat(PVEfficiencySlider.value);
    PVEfficiencyValueDisplay.textContent = efficiency + "%";
    pv.updatePVEfficiency(efficiency);
  });

  PVPowerSlider.addEventListener("input", function () {
    const power = parseFloat(PVPowerSlider.value);
    PVPowerValueDisplay.textContent = power + " Watt";
    pv.updatePVPower(power);
  });

  if (sellButton) {
    sellButton.addEventListener("click", function (e) {
      e.preventDefault();
      isNotificationVisible = false;
      // Get amount and price from UI
      const amountInput = document.getElementById("sell-amount");
      const priceInput = document.getElementById("latest-hydrogen-price");
      const amount = amountInput ? amountInput.value : 0;
      const price = priceInput ? priceInput.textContent : undefined;
      sellHydrogen(amount, price);
    });
  }
  if (resetButton) {
    resetButton.addEventListener("click", resetSimulation);
  }

  if (buyButton) {
    buyButton.addEventListener("click", function (e) {
      e.preventDefault();
      isNotificationVisible = false;
      trade.buyElectricity();
    });
  }

  const usecase = document.getElementById("use-case");

  usecase.addEventListener("change", function () {
    //Update values when selection changes
    const bulletPointsContainer = document.getElementById(
      "bullet-points-container"
    );
    bulletPointsContainer.innerHTML = "";

    let bulletPoints = [];

    if (usecase.value === "offgrid") {
      bulletPoints = [
        "A house powered by solar panels, with a battery for short-term storage and a hydrogen system for long-term energy storage.",

        "During the day, excess solar power is used to generate hydrogen via electrolysis.",

        "At night or on cloudy days, the fuel cell converts hydrogen back into electricity.",

        "The system sells excess electricity to the grid when prices are high and buys when prices are low.",
      ];
      resetSimulation();
      pv.updatePVPower(10000);
      PVPowerValueDisplay.textContent = 10 + "kW";
      PVPowerSlider.value = 10000;
      pv.updatePVEfficiency(22);
      PVEfficiencyValueDisplay.textContent = 22 + "%";
      PVEfficiencySlider.value = 22;

      charge.updateBatteryEfficiency(95);
      batteryEfficiencyValueDisplay.textContent = 95 + "%";
      batteryEfficiencySlider.value = 95;
      charge.updateBatteryCapacity(20);
      batteryCapacityValueDisplay.textContent = 20 + "kWh";
      batteryCapacitySlider.value = 20;

      hydro.updateElectrolyzerPower(5000);
      electrolyzerPowerValueDisplay.textContent = 5000 + "W";
      electrolyzerPowerSlider.value = 5000;
      hydro.updateElectrolyzerEfficiency(70);
      electrolyzerEfficiencyValueDisplay.textContent = 70 + "%";
      electrolyzerEfficiencySlider.value = 70;
      hydro.updateElectrolyzerCapacity(300);
      electrolyzerCapacityValueDisplay.textContent = 300 + "g";
      electrolyzerCapacitySlider.value = 300;

      fc.updateFuelCellPower(3000);
      fuelcellPowerSlider.value = 3000;
      fuelcellPowerValueDisplay.textContent = 3000 + "W";
      fc.updateFuelCellEfficiency(60);
      fuelcellEfficiencyValueDisplay.textContent = 60 + "%";
      fuelcellEfficiencySlider.value = 60;
    }

    if (usecase.value === "microgrid") {
      bulletPoints = [
        "A small community with unreliable grid access uses solar panels, batteries, and hydrogen storage for 24/7 power.",

        "The system optimizes energy flow, prioritizing battery storage for short-term demand and hydrogen for seasonal storage.",

        "Villagers share a common energy trading system, where surplus power is bought and sold dynamically.",
      ];
      resetSimulation();
      pv.updatePVPower(200000);
      PVPowerValueDisplay.textContent = 200 + "kW";
      PVPowerSlider.value = 200000;
      pv.updatePVEfficiency(22);
      PVEfficiencyValueDisplay.textContent = 22 + "%";
      PVEfficiencySlider.value = 22;

      charge.updateBatteryEfficiency(95);
      batteryEfficiencyValueDisplay.textContent = 95 + "%";
      batteryEfficiencySlider.value = 95;
      charge.updateBatteryCapacity(500);
      batteryCapacityValueDisplay.textContent = 500 + "kWh";
      batteryCapacitySlider.value = 500;

      hydro.updateElectrolyzerPower(100000);
      electrolyzerPowerValueDisplay.textContent = 100 + "kW";
      electrolyzerPowerSlider.value = 100000;
      hydro.updateElectrolyzerEfficiency(70);
      electrolyzerEfficiencyValueDisplay.textContent = 70 + "%";
      electrolyzerEfficiencySlider.value = 70;
      hydro.updateElectrolyzerCapacity(3000);
      electrolyzerCapacityValueDisplay.textContent = 3000 + "g";
      electrolyzerCapacitySlider.value = 3000;

      fc.updateFuelCellPower(80000);
      fuelcellPowerSlider.value = 80000;
      fuelcellPowerValueDisplay.textContent = 80 + "kW";
      fc.updateFuelCellEfficiency(60);
      fuelcellEfficiencyValueDisplay.textContent = 60 + "%";
      fuelcellEfficiencySlider.value = 60;
    }

    if (usecase.value === "evcharge") {
      bulletPoints = [
        "A charging station for electric vehicles powered by solar energy, with a battery for quick power delivery and hydrogen for backup.",

        "When there's surplus solar power, it's used to generate hydrogen instead of wasting energy.",

        "The station dynamically adjusts pricing based on energy availability and grid prices.",
      ];
      resetSimulation();
      pv.updatePVPower(500000);
      PVPowerValueDisplay.textContent = 500 + "kW";
      PVPowerSlider.value = 500000;
      pv.updatePVEfficiency(22);
      PVEfficiencyValueDisplay.textContent = 22 + "%";
      PVEfficiencySlider.value = 22;

      charge.updateBatteryEfficiency(95);
      batteryEfficiencyValueDisplay.textContent = 95 + "%";
      batteryEfficiencySlider.value = 95;
      charge.updateBatteryCapacity(1000);
      batteryCapacityValueDisplay.textContent = 1000 + "kWh";
      batteryCapacitySlider.value = 1000;

      hydro.updateElectrolyzerPower(200000);
      electrolyzerPowerValueDisplay.textContent = 200 + "kW";
      electrolyzerPowerSlider.value = 200000;
      hydro.updateElectrolyzerEfficiency(70);
      electrolyzerEfficiencyValueDisplay.textContent = 70 + "%";
      electrolyzerEfficiencySlider.value = 70;
      hydro.updateElectrolyzerCapacity(12000);
      electrolyzerCapacityValueDisplay.textContent = 12000 + "g";
      electrolyzerCapacitySlider.value = 12000;

      fc.updateFuelCellPower(200000);
      fuelcellPowerSlider.value = 200000;
      fuelcellPowerValueDisplay.textContent = 200 + "kW";
      fc.updateFuelCellEfficiency(60);
      fuelcellEfficiencyValueDisplay.textContent = 60 + "%";
      fuelcellEfficiencySlider.value = 60;
    }

    if (usecase.value === "industrial") {
      bulletPoints = [
        "A factory with high energy demand uses solar power to generate hydrogen, which is stored for later use in production or fuel cells.",

        "When electricity prices are low, the factory buys from the grid; when high, it switches to stored hydrogen.",

        "The plant sells excess hydrogen or electricity back to the grid for profit.",
      ];
      resetSimulation();
      pv.updatePVPower(1000000);
      PVPowerValueDisplay.textContent = 1 + "MW";
      PVPowerSlider.value = 1000000;
      pv.updatePVEfficiency(22);
      PVEfficiencyValueDisplay.textContent = 22 + "%";
      PVEfficiencySlider.value = 22;

      charge.updateBatteryEfficiency(95);
      batteryEfficiencyValueDisplay.textContent = 95 + "%";
      batteryEfficiencySlider.value = 95;
      charge.updateBatteryCapacity(10000000);
      batteryCapacityValueDisplay.textContent = 10 + "MWh";
      batteryCapacitySlider.value = 1000000;

      hydro.updateElectrolyzerPower(1000000);
      electrolyzerPowerValueDisplay.textContent = 1 + "MW";
      electrolyzerPowerSlider.value = 1000000;
      hydro.updateElectrolyzerEfficiency(70);
      electrolyzerEfficiencyValueDisplay.textContent = 70 + "%";
      electrolyzerEfficiencySlider.value = 70;
      hydro.updateElectrolyzerCapacity(500000);
      electrolyzerCapacityValueDisplay.textContent = 500 + "kg";
      electrolyzerCapacitySlider.value = 500000;

      fc.updateFuelCellPower(1000000);
      fuelcellPowerSlider.value = 1000000;
      fuelcellPowerValueDisplay.textContent = 1 + "MW";
      fc.updateFuelCellEfficiency(60);
      fuelcellEfficiencyValueDisplay.textContent = 60 + "%";
      fuelcellEfficiencySlider.value = 60;
    }

    const ul = document.createElement("ul");

    bulletPoints.forEach((point) => {
      const li = document.createElement("li");
      li.textContent = point;
      ul.appendChild(li);
    });

    //Append the bullet points to the container
    bulletPointsContainer.appendChild(ul);
  });

  //Trigger change event on page load to set initial values
  usecase.dispatchEvent(new Event("change"));
});

//Buttons für die Simulation
document.getElementById("convert-to-hydrogen").addEventListener("click", () => {
  if (hydro.storage > 0) {
    document.getElementById("simulation-state").innerHTML = " Hydrogen Mode ";
    document.getElementById("electrolyzer-static-arrow").style.display = "none";
    document.getElementById("electrolyzer-animated-arrow").style.display =
      "block";
    const outStatic = document.getElementById(
      "electrolyzer-output-static-arrow"
    );
    const outAnim = document.getElementById(
      "electrolyzer-output-animated-arrow"
    );
    if (outStatic && outAnim) {
      outStatic.style.display = "none";
      outAnim.style.display = "block";
    }
    //Starte die Umwandlung im Elektrolyseur, wenn noch kein Intervall läuft
    if (electrolyzerInterval === null) {
      electrolyzerInterval = setInterval(() => {
        hydro.produceHydrogen(); //Wasserstoffproduktion schrittweise
      }, 1000); //Alle Sekunde
      console.log("Electrolyzer started");
    }
  }
});

document
  .getElementById("convert-to-electricity")
  .addEventListener("click", () => {
    if (hydro.storage > 0) {
      document.getElementById("simulation-state").innerHTML =
        " Fuel Cell Mode ";
      document.getElementById("fuelcell-static-arrow").style.display = "none";
      document.getElementById("fuelcell-animated-arrow").style.display =
        "block";
      const h2fStatic = document.getElementById(
        "hydrogen-to-fuelcell-static-arrow"
      );
      const h2fAnim = document.getElementById(
        "hydrogen-to-fuelcell-animated-arrow"
      );
      if (h2fStatic && h2fAnim) {
        h2fStatic.style.display = "none";
        h2fAnim.style.display = "block";
      }
      // Animate Fuel Cell -> Charging Station arrow while fuel cell runs
      const fc2cStatic = document.getElementById(
        "fuelcell-to-charging-static-arrow"
      );
      const fc2cAnim = document.getElementById(
        "fuelcell-to-charging-animated-arrow"
      );
      if (fc2cStatic && fc2cAnim) {
        fc2cStatic.style.display = "none";
        fc2cAnim.style.display = "block";
      }
      showNotification("Started Fuel Cell!", "buy");
      //Starte die Umwandlung im Elektrolyseur, wenn noch kein Intervall läuft
      if (fuelCellInterval === null) {
        fuelCellInterval = setInterval(() => {
          fc.produceElectricity(); //Wasserstoffproduktion schrittweise
        }, 1000); //Alle Sekunde
        console.log("Fuel Cell started");
      }
    }
  });

document
  .getElementById("convert-to-hydrogen-stop")
  .addEventListener("click", () => {
    document.getElementById("simulation-state").innerHTML = " ";
    document.getElementById("electrolyzer-static-arrow").style.display =
      "block";
    document.getElementById("electrolyzer-animated-arrow").style.display =
      "none";
    const outStatic = document.getElementById(
      "electrolyzer-output-static-arrow"
    );
    const outAnim = document.getElementById(
      "electrolyzer-output-animated-arrow"
    );
    if (outStatic && outAnim) {
      outStatic.style.display = "block";
      outAnim.style.display = "none";
    }
    if (electrolyzerInterval !== null) {
      clearInterval(electrolyzerInterval); //Stoppe den Elektrolyseur
      electrolyzerInterval = null;
      console.log("Electrolyzer stopped");
    }
  });

document
  .getElementById("convert-to-electricity-stop")
  .addEventListener("click", () => {
    document.getElementById("simulation-state").innerHTML = " ";
    document.getElementById("fuelcell-static-arrow").style.display = "block";
    document.getElementById("fuelcell-animated-arrow").style.display = "none";
    showNotification("Stopped Fuel Cell!", "sell");
    const h2fStatic = document.getElementById(
      "hydrogen-to-fuelcell-static-arrow"
    );
    const h2fAnim = document.getElementById(
      "hydrogen-to-fuelcell-animated-arrow"
    );
    if (h2fStatic && h2fAnim) {
      h2fStatic.style.display = "block";
      h2fAnim.style.display = "none";
    }
    // Set Fuel Cell -> Charging Station arrow to static when stopping
    const fc2cStatic = document.getElementById(
      "fuelcell-to-charging-static-arrow"
    );
    const fc2cAnim = document.getElementById(
      "fuelcell-to-charging-animated-arrow"
    );
    if (fc2cStatic && fc2cAnim) {
      fc2cStatic.style.display = "block";
      fc2cAnim.style.display = "none";
    }
    if (fuelCellInterval !== null) {
      clearInterval(fuelCellInterval); //Stoppe die Brennstoffzelle
      fuelCellInterval = null;
      console.log("Fuel Cell stopped");
    }
  });

const priceContainer = document.getElementById("price-container");
const co2Container = document.getElementById("co2-container");

let isPriceVisible = true;

function togglePrices() {
  if (isPriceVisible) {
    //Slide price container out to the left and CO2 container in from the right
    priceContainer.style.transform = "translateX(-100%)";
    co2Container.style.transform = "translateX(0)";
  } else {
    //Slide CO2 container out to the left and price container back in from the right
    co2Container.style.transform = "translateX(100%)";
    priceContainer.style.transform = "translateX(0)";
  }

  //Toggle visibility for the next cycle
  isPriceVisible = !isPriceVisible;
}

setInterval(togglePrices, 10000);

//Start-Synchronisation nur einmal beim Laden
getCarbonIntensity();

//Regelmäßige Updates laufen nur über updateSimulation()
setInterval(updateSimulation, 1000);

//TODO- farbschema an website anpassen

function updateSellUnit() {
  const input = document.getElementById("sell-amount");
  const unitSpan = document.getElementById("sell-amount-unit");
  if (input && unitSpan) {
    const val = parseFloat(input.value) || 0;
    if (val >= 1000) {
      unitSpan.textContent = "MWh";
    } else {
      unitSpan.textContent = "kWh";
    }
  }
}
function updateBuyUnit() {
  const input = document.getElementById("buy-amount");
  const unitSpan = document.getElementById("buy-amount-unit");
  if (input && unitSpan) {
    const val = parseFloat(input.value) || 0;
    if (val >= 1000) {
      unitSpan.textContent = "MWh";
    } else {
      unitSpan.textContent = "kWh";
    }
  }
}

function errorCheck() {
  if (charge.storage < 0) {
    resetSimulation();
  }
  if (hydro.storage < 0) {
    resetSimulation();
  }
}
