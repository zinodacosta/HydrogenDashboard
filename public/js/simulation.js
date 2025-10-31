if (typeof window.money !== "number") {
  window.money = 0;
}

document.addEventListener("DOMContentLoaded", function () {
  try {
    const urlParams =
      typeof window !== "undefined" && window.location
        ? new URLSearchParams(window.location.search)
        : null;

    const embedFlag =
      window.__WIDGET_EMBED ||
      (urlParams &&
        (urlParams.get("embed") === "1" || urlParams.get("embed") === "true"));

    if (embedFlag) {
      document.documentElement.classList.add("embed-mode");
      document.body.classList.add("embed-mode");
      const cfg = Object.assign({}, window.__WIDGET_CONFIG || {});
      if (urlParams) {
        ["hideFlowchart", "hideStickyBar", "chrome"].forEach((k) => {
          if (urlParams.has(k)) cfg[k] = urlParams.get(k);
        });
      }

      const chromeMode = (cfg.chrome || "").toLowerCase();
      const hideFlowchart = !(
        cfg.hideFlowchart === "0" ||
        cfg.hideFlowchart === "false" ||
        chromeMode === "full"
      );
      const hideStickyBar = !(
        cfg.hideStickyBar === "0" ||
        cfg.hideStickyBar === "false" ||
        chromeMode === "full"
      );

      const toHide = [];
      if (hideFlowchart) toHide.push("#flowchart-panel");
      if (hideStickyBar) toHide.push(".sticky-bar");
      toHide.push(".header", ".footer", ".sidebar");

      if (toHide.length) {
        document.querySelectorAll(toHide.join(",")).forEach(function (el) {
          try {
            el.style.display = "none";
          } catch (e) {}
        });
      }
      try {
        document.documentElement.style.margin = "0";
        document.body.style.margin = "0";
        document.body.style.backgroundImage = "none";
        document.body.style.backgroundColor = "transparent";
        document.documentElement.style.background = "transparent";
      } catch (e) {}
    }
  } catch (e) {
    console.warn("embed-mode init failed", e);
  }
});
window.addEventListener(
  "message",
  function (ev) {
    try {
      const msg = ev && ev.data ? ev.data : null;
      if (!msg || msg.type !== "setConfig" || !msg.cfg) return;
      const cfg = Object.assign({}, msg.cfg || {});
      const chromeMode = (cfg.chrome || "").toLowerCase();
      const hideFlowchart = !(
        cfg.hideFlowchart === "0" ||
        cfg.hideFlowchart === "false" ||
        chromeMode === "full"
      );
      const hideStickyBar = !(
        cfg.hideStickyBar === "0" ||
        cfg.hideStickyBar === "false" ||
        chromeMode === "full"
      );
      const toHide = [];
      if (hideFlowchart) toHide.push("#flowchart-panel");
      if (hideStickyBar) toHide.push(".sticky-bar");
      if (
        !(cfg.showHeader || cfg.showHeader === "1" || cfg.showHeader === true)
      ) {
        toHide.push(".header", ".footer", ".sidebar");
      }
      try {
        document
          .querySelectorAll(
            ".header, .footer, .sidebar, #flowchart-panel, .sticky-bar"
          )
          .forEach(function (el) {
            try {
              el.style.display = "";
            } catch (e) {}
          });
      } catch (e) {}
      if (toHide.length) {
        document.querySelectorAll(toHide.join(",")).forEach(function (el) {
          try {
            el.style.display = "none";
          } catch (e) {}
        });
      }
      try {
        document.documentElement.style.margin = "0";
        document.body.style.margin = "0";
        if (cfg.transparent !== false) {
          document.body.style.backgroundImage = "none";
          document.body.style.backgroundColor = "transparent";
          document.documentElement.style.background = "transparent";
        }
      } catch (e) {}
      try {
        if (ev && ev.source && typeof ev.source.postMessage === "function") {
          const reply = { type: "configApplied", ok: true, cfg: cfg };
          try {
            ev.source.postMessage(reply, ev.origin || "*");
          } catch (e) {}
        }
      } catch (e) {}
    } catch (e) {}
  },
  false
);
function updateFuelCellArrow(isWorking) {
  const staticArrow = document.getElementById("fuelcell-static-arrow");
  const animatedArrow = document.getElementById("fuelcell-animated-arrow");
  if (staticArrow && animatedArrow) {
    staticArrow.style.display = isWorking ? "none" : "block";
    animatedArrow.style.display = isWorking ? "block" : "none";
  }
}

function sellHydrogen(amount, pricePerGram) {
  if (!window.hydro || typeof window.money === "undefined") {
    showNotification(
      window.t
        ? window.t("hydrogenNotInitialized")
        : "Hydrogen system not initialized.",
      "sell"
    );
    return false;
  }
  const amt = parseFloat(amount);

  const amtKg = amt / 1000;
  const pricePerKg = parseFloat(pricePerGram);
  if (isNaN(amt) || amt <= 0) {
    showNotification(
      window.t ? window.t("invalidHydrogenAmount") : "Invalid hydrogen amount.",
      "sell"
    );
    return false;
  }
  if (isNaN(pricePerKg) || pricePerKg <= 0) {
    showNotification(
      window.t ? window.t("invalidHydrogenPrice") : "Invalid hydrogen price.",
      "sell"
    );
    return false;
  }
  if (window.hydro.storage < amt) {
    showNotification(
      window.t
        ? window.t("notEnoughHydrogenToSell", {
            have: window.hydro.storage.toFixed(2),
            tried: amt,
          })
        : `Not enough hydrogen to sell. You have ${window.hydro.storage.toFixed(
            2
          )} g, tried to sell ${amt} g.`,
      "sell"
    );
    return false;
  }
  window.hydro.storage -= amt;
  window.money += amtKg * pricePerKg;

  const hydrogenLevelElem = document.getElementById("hydrogen-level");
  if (hydrogenLevelElem)
    hydrogenLevelElem.innerHTML = window.hydro.storage.toFixed(2) + " g";
  const moneyElem = document.getElementById("money");
  if (moneyElem) moneyElem.innerHTML = window.money.toFixed(2) + " €";
  if (window.setHydrogenTopPanel)
    window.setHydrogenTopPanel(window.hydro.storage.toFixed(2));
  showNotification(
    window.t
      ? window.t("soldHydrogen", {
          kg: amtKg.toFixed(3),
          eur: (amtKg * pricePerKg).toFixed(2),
          price: pricePerKg.toFixed(2),
        })
      : `Sold ${amtKg.toFixed(3)}kg hydrogen for ${(amtKg * pricePerKg).toFixed(
          2
        )} € at ${pricePerKg.toFixed(2)} €/kg`,
    "sell"
  );
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
let electrolyzerManuallyStopped = false;
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
  const speedSlider = document.getElementById("simulation-speed-slider");
  const speedIndicator = document.getElementById("simulation-speed-indicator");

  const fcStaticArrow = document.getElementById("fuelcell-static-arrow");
  const fcAnimatedArrow = document.getElementById("fuelcell-animated-arrow");
  if (fcStaticArrow && fcAnimatedArrow) {
    fcStaticArrow.style.display = "block";
    fcAnimatedArrow.style.display = "none";
  }
  function updateSpeedIndicator() {
    if (speedSlider.value === "2") {
      speedIndicator.textContent = "Fastest";
      realism = 1;
    } else {
      speedIndicator.textContent = "Real-Time";
      realism = 3600;
    }
    speedfactor = 1 / realism;
  }
  if (speedSlider && speedIndicator) {
    speedSlider.value = "2";
    updateSpeedIndicator();
    speedSlider.addEventListener("input", updateSpeedIndicator);
  }

  const sellHydrogenPriceInput = document.getElementById("sell-hydrogen-price");

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
      storageSpan.textContent = `Hydrogen stored: ${(
        parseFloat(storage) / 1000
      ).toFixed(3)} kg`;
    }
  }

  updateHydrogenStorageDisplay();
  setInterval(updateHydrogenStorageDisplay, 1000);
  const citySelect = document.getElementById("city-select");
  const locationDisplay = document.getElementById("location");
  if (!citySelect || !locationDisplay) return;

  city = citySelect.value;
  locationDisplay.innerHTML = city;

  setTimeout(() => {
    pv.checkforSun();
  }, 1000);

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

  const useCaseSelect = document.getElementById("use-case");
  if (useCaseSelect) {
    useCaseSelect.addEventListener("change", function () {
      try {
        applyUseCase(useCaseSelect.value);
      } catch (e) {
        console.warn("applyUseCase failed", e);
      }
    });
    try {
      applyUseCase(useCaseSelect.value || "offgrid");
    } catch (e) {
      console.warn("initial applyUseCase failed", e);
    }
  }

  document
    .querySelectorAll(
      '.trade-increment[data-target="buy-amount"], .trade-increment[data-target="sell-amount"]'
    )
    .forEach((btn) => {
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

window.setBatteryTopPanel = function (storage_kwh, capacity_kwh) {
  try {
    const batteryLevelElem = document.getElementById("battery-level");
    if (batteryLevelElem)
      batteryLevelElem.innerHTML = storage_kwh.toFixed(2) + " kWh";
    const batteryLevelTop = document.getElementById("battery-level-top");
    if (batteryLevelTop)
      batteryLevelTop.innerHTML = storage_kwh.toFixed(2) + " kWh";
    const batteryStoragePercent = document.getElementById(
      "battery-storage-percentage"
    );
    if (batteryStoragePercent && capacity_kwh > 0) {
      const percent = (storage_kwh / capacity_kwh) * 100;
      batteryStoragePercent.textContent = percent.toFixed(1) + "%";
    }

    const batteryGaugePercentage = document.getElementById(
      "battery-gauge-percentage"
    );
    if (batteryGaugePercentage && capacity_kwh > 0)
      batteryGaugePercentage.innerHTML =
        ((storage_kwh / capacity_kwh) * 100).toFixed(1) + " %";
    const stickyBatteryGaugePercentage = document.getElementById(
      "sticky-battery-gauge-percentage"
    );
    if (stickyBatteryGaugePercentage && capacity_kwh > 0)
      stickyBatteryGaugePercentage.innerHTML =
        ((storage_kwh / capacity_kwh) * 100).toFixed(1) + " %";
  } catch (e) {
    console.error("setBatteryTopPanel error", e);
  }
};

let isNotificationVisible = false;
//fade in notification signalizing trade of electricity
function showNotification(message, type) {
  const notification = document.getElementById("notification");
  if (!notification) return;

  notification.classList.remove("notification-buy", "notification-sell");
  if (type === "buy") {
    notification.classList.add("notification-buy");
  } else {
    notification.classList.add("notification-sell");
  }

  notification.textContent = message;
  notification.style.display = "block";
  notification.style.animation = "none";

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
    this.lastSunStatus = false;
  }
  updatePVEfficiency(amount) {
    this.efficiency = amount;
  }
  updatePVPower(amount) {
    this.power = amount;
  }
  async checkforSun() {
    document.getElementById("location").innerHTML = city;
    let sun = false;
    const sunElem = document.getElementById("sun");
    const citySelectElem = document.getElementById("city-select");
    if (city === "Always Sunny") {
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
      this.lastSunStatus = sun;
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

    if (typeof window.setBatteryTopPanel === "function") {
      window.setBatteryTopPanel(this.storage, this.capacity);
    } else {
      const batteryLevelElem = document.getElementById("battery-level");
      if (batteryLevelElem)
        batteryLevelElem.innerHTML = this.storage.toFixed(2) + " kWh";
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
    }
    let batteryPercentage = (this.storage / this.capacity) * 100;
    const batteryGaugePercentElem = document.getElementById(
      "battery-gauge-percentage"
    );
    if (batteryGaugePercentElem) {
      batteryGaugePercentElem.textContent = batteryPercentage.toFixed(1) + " %";
      batteryGaugePercentElem.setAttribute("fill", "#222");

      const stickyBatteryGaugePercentElem = document.getElementById(
        "sticky-battery-gauge-percentage"
      );
      if (stickyBatteryGaugePercentElem) {
        stickyBatteryGaugePercentElem.textContent =
          batteryPercentage.toFixed(1) + " %";
      }
      const stickyBatteryGaugeFill = document.getElementById(
        "sticky-battery-gauge-fill"
      );
      if (stickyBatteryGaugeFill) {
        const totalLength = 157;
        const offset = totalLength * (1 - batteryPercentage / 100);
        stickyBatteryGaugeFill.setAttribute("stroke-dashoffset", offset);
      }
    }

    const batteryGaugeFill = document.getElementById("battery-gauge-fill");
    if (batteryGaugeFill) {
      const totalLength = 157;
      const offset = totalLength * (1 - batteryPercentage / 100);
      batteryGaugeFill.setAttribute("stroke-dashoffset", offset);
    }
    const batteryGaugeLevelElem = document.getElementById(
      "battery-gauge-level"
    );
    if (batteryGaugeLevelElem)
      batteryGaugeLevelElem.style.width = batteryPercentage.toFixed(1) + "%";

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
          (this.efficiency / 100) *
          (this.power / 1000) *
          speedfactor) /
        33.3;

      let availableCapacity = charge.capacity - charge.storage;
      if (availableCapacity <= 0) {
        if (
          typeof fuelCellInterval !== "undefined" &&
          fuelCellInterval !== null
        ) {
          clearInterval(fuelCellInterval);
          fuelCellInterval = null;
        }
        showNotification(
          window.t ? window.t("batteryFull") : "Battery is full.",
          "sell"
        );
        return;
      }
      let actualPowerProduced = Math.min(powerProduced, availableCapacity);
      charge.updateBatteryStorage(actualPowerProduced);
      hydro.storage -= actualPowerProduced;

      if (hydro.storage <= 0) {
        hydro.storage = 0;
        if (
          typeof fuelCellInterval !== "undefined" &&
          fuelCellInterval !== null
        ) {
          clearInterval(fuelCellInterval);
          fuelCellInterval = null;
        }
        updateFuelCellArrow(false);
        showNotification(
          window.t
            ? window.t("fuelcellStoppedNoHydrogen")
            : "Fuel cell stopped: No hydrogen left.",
          "sell"
        );
      }

      if (typeof window.setBatteryTopPanel === "function") {
        window.setBatteryTopPanel(charge.storage, charge.capacity);
      }
      if (window.setHydrogenTopPanel)
        window.setHydrogenTopPanel(hydro.storage.toFixed(2));
      let batteryPercentage = (charge.storage / charge.capacity) * 100;
      const batteryGaugeLevel = document.getElementById("battery-gauge-level");
      if (batteryGaugeLevel)
        batteryGaugeLevel.style.width = batteryPercentage.toFixed(1) + "%";
      document.getElementById("hydrogen-level").innerHTML =
        hydro.storage.toFixed(2) + " g";
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
    try {
      const dtSeconds = 1;
      const sf = typeof speedfactor !== "undefined" ? Number(speedfactor) : 1;
      const available_kWh = Number(charge.storage || 0);
      const power_kW = ((Number(this.power) || 0) / 1000) * sf;
      const energyNeeded_kWh = (power_kW * dtSeconds) / 3600;

      if (available_kWh <= 0 || energyNeeded_kWh <= 0) {
        const hydrogenLevelElem = document.getElementById("hydrogen-level");
        if (hydrogenLevelElem)
          hydrogenLevelElem.innerHTML = this.storage.toFixed(2) + " g";
        errorCheck();
        return;
      }

      //maximum hydrogen that fits into electrolyzer storage (grams)
      const maxHydrogen = Math.max(0, this.capacity - this.storage);

      //possibleHydrogenProduced estimation using user's provided formula
      //units/scale per the project's historical constants
      const possibleHydrogenProduced =
        (charge.storage *
          55.5 *
          (this.efficiency / 100) *
          (this.power / 1000) *
          speedfactor) /
        10000;

      const actualHydrogenProduced = Math.min(
        possibleHydrogenProduced,
        maxHydrogen
      );

      const actualBatteryConsumption =
        actualHydrogenProduced * (1 / (this.efficiency / 100));

      if (
        charge.storage >= actualBatteryConsumption &&
        actualHydrogenProduced > 0
      ) {
        charge.updateBatteryStorage(-actualBatteryConsumption);
        this.storage = Number(
          Math.min(
            this.capacity,
            this.storage + actualHydrogenProduced
          ).toFixed(6)
        );
      } else {
        return;
      }

      const hydrogenLevelElem = document.getElementById("hydrogen-level");
      if (hydrogenLevelElem)
        hydrogenLevelElem.innerHTML = this.storage.toFixed(2) + " g";
      const hydrogenPercentage = (this.storage / this.capacity) * 100;

      const hydrogenGaugeFill = document.getElementById("hydrogen-gauge-fill");
      if (hydrogenGaugeFill) {
        const totalLength = 157;
        const offset = totalLength * (1 - hydrogenPercentage / 100);
        hydrogenGaugeFill.setAttribute("stroke-dashoffset", offset);
      }
      const stickyHydrogenGaugeFill = document.getElementById(
        "sticky-hydrogen-gauge-fill"
      );
      if (stickyHydrogenGaugeFill) {
        const stickyTotalLength = 157;
        const stickyOffset = stickyTotalLength * (1 - hydrogenPercentage / 100);
        stickyHydrogenGaugeFill.setAttribute("stroke-dashoffset", stickyOffset);
      }

      const hydrogenStoragePercentElem = document.getElementById(
        "hydrogen-storage-percentage"
      );
      if (hydrogenStoragePercentElem && this.capacity > 0) {
        hydrogenStoragePercentElem.textContent =
          ((this.storage / this.capacity) * 100).toFixed(1) + "%";
      }
      const hydrogenGaugeLevelElem = document.getElementById(
        "hydrogen-gauge-level"
      );
      if (hydrogenGaugeLevelElem) {
        hydrogenGaugeLevelElem.style.width =
          hydrogenPercentage.toFixed(1) + "%";
      }

      const hydrogenGaugePercentElem = document.getElementById(
        "hydrogen-gauge-percentage"
      );
      if (hydrogenGaugePercentElem) {
        hydrogenGaugePercentElem.textContent =
          hydrogenPercentage.toFixed(1) + " %";
        hydrogenGaugePercentElem.setAttribute("fill", "#222");
        const stickyHydrogenGaugePercentElem = document.getElementById(
          "sticky-hydrogen-gauge-percentage"
        );
        if (stickyHydrogenGaugePercentElem)
          stickyHydrogenGaugePercentElem.textContent =
            hydrogenPercentage.toFixed(1) + " %";
      }

      if (window.setHydrogenTopPanel)
        window.setHydrogenTopPanel(this.storage.toFixed(2));

      const simStateElem = document.getElementById("simulation-state");
      if (simStateElem) {
        if (simStateElem.innerHTML === "Charge Mode")
          simStateElem.innerHTML = "Charge Mode + Hydrogen Mode ";
        else simStateElem.innerHTML = "Hydrogen Mode ";
      }

      errorCheck();
    } catch (e) {
      console.warn("produceHydrogen error", e);
    }
  }
}

export class heater {
  constructor() {
    this.config = {
      electrolyzerRecoverableFraction: 0.2,
      electrolyzerExchangerEff: 0.8,
      fuelcellRecoverableFraction: 0.85,
      fuelcellExchangerEff: 0.9,
    };
  }

  /**
   * Compute recoverable heat from a device given input power and electrical efficiency.
   * @param {number} inputPowerW - input electrical power in Watts (W)
   * @param {number} elecEffPct - electrical efficiency in percent (e.g. 70 for 70%)
   * @param {number} recoverableFraction - fraction of raw heat that is captureable (0..1)
   * @param {number} exchangerEff - heat exchanger efficiency (0..1)
   * @param {number} dtSeconds - timestep in seconds (optional, default 1s)
   * @returns {object} { rawHeat_kW, recoverable_kW, recoverable_kWh }
   */
  computeRecoverableHeat(
    inputPowerW,
    elecEffPct,
    recoverableFraction,
    exchangerEff,
    dtSeconds = 1
  ) {
    const input_kW = ((Number(inputPowerW) || 0) / 1000) * speedfactor;
    const elecEff = (Number(elecEffPct) || 0) / 100;
    const rawHeat_kW = input_kW * Math.max(0, 1 - elecEff);
    const recoverable_kW =
      rawHeat_kW * (recoverableFraction || 0) * (exchangerEff || 1);
    const recoverable_kWh = recoverable_kW * (dtSeconds / 3600);
    return {
      rawHeat_kW,
      recoverable_kW,
      recoverable_kWh,
    };
  }

  /**
   * Extract recoverable heat from an electrolyzer instance or explicit values.
   * @param {object} el - electrolyzer instance (optional if passing power/eff)
   * @param {number} options.currentPowerW - current electrical input power in W (optional)
   * @param {number} options.efficiencyPct - electrolyzer electrical efficiency in % (optional)
   * @param {number} options.dtSeconds - timestep in seconds (optional)
   */
  extractElectrolyzerHeat(
    el,
    { currentPowerW = null, efficiencyPct = null, dtSeconds = 1 } = {}
  ) {
    const device = el || window.hydro;
    const powerW =
      currentPowerW !== null ? currentPowerW : (device && device.power) || 0;
    const eff =
      efficiencyPct !== null
        ? efficiencyPct
        : (device && device.efficiency) || 0;
    return this.computeRecoverableHeat(
      powerW,
      eff,
      this.config.electrolyzerRecoverableFraction,
      this.config.electrolyzerExchangerEff,
      dtSeconds
    );
  }

  /**
   * Extract recoverable heat from a fuel cell instance or explicit values.
   * @param {object} fc - fuel cell instance (optional if passing power/eff)
   * @param {number} options.currentPowerW - current electrical output power in W (optional)
   * @param {number} options.efficiencyPct - fuel cell electrical efficiency in % (optional)
   * @param {number} options.dtSeconds - timestep in seconds (optional)
   */
  extractFuelcellHeat(
    fc,
    { currentPowerW = null, efficiencyPct = null, dtSeconds = 1 } = {}
  ) {
    const device = fc || (typeof window !== "undefined" && window.fc) || null;
    const powerW =
      currentPowerW !== null ? currentPowerW : (device && device.power) || 0;
    const eff =
      efficiencyPct !== null
        ? efficiencyPct
        : (device && device.efficiency) || 0;
    return this.computeRecoverableHeat(
      powerW,
      eff,
      this.config.fuelcellRecoverableFraction,
      this.config.fuelcellExchangerEff,
      dtSeconds
    );
  }

  produceHeat() {
    return {
      electrolyzer: this.extractElectrolyzerHeat(),
      fuelcell: this.extractFuelcellHeat(),
    };
  }
}

const thermalStorage = {
  capacity_kWh: 50,
  level_kWh: 0,
  lossFractionPerHour: 0.01, //1% per hour
};

function routeRecoveredHeat_kWh(recovered_kWh, dtHours = 1 / 3600) {
  const free = Math.max(
    0,
    thermalStorage.capacity_kWh - thermalStorage.level_kWh
  );
  const toStore = Math.min(recovered_kWh, free);
  thermalStorage.level_kWh += toStore;
  const dumped = Math.max(0, recovered_kWh - toStore);

  const loss =
    thermalStorage.level_kWh * (thermalStorage.lossFractionPerHour * dtHours);
  thermalStorage.level_kWh = Math.max(0, thermalStorage.level_kWh - loss);
  return { stored_kWh: toStore, dumped_kWh: dumped, loss_kWh: loss };
}

function formatKWh(v) {
  return Number(v || 0).toFixed(3) + " kWh";
}

function updateThermalGaugeUI() {
  const percent = Math.min(
    100,
    (thermalStorage.level_kWh / Math.max(1, thermalStorage.capacity_kWh)) * 100
  );
  const stickyThermalPercentageElem = document.getElementById(
    "sticky-thermal-gauge-percentage"
  );

  if (stickyThermalPercentageElem)
    stickyThermalPercentageElem.textContent = formatKWh(
      thermalStorage.level_kWh
    );
  const stickyThermalGaugeFill = document.getElementById(
    "sticky-thermal-gauge-fill"
  );
  if (stickyThermalGaugeFill) {
    const totalLengthSticky = 157;
    const offsetSticky = totalLengthSticky * (1 - percent / 100);
    stickyThermalGaugeFill.setAttribute("stroke-dashoffset", offsetSticky);
  }
}

function updateHeatBreakdownUI(heat) {
  return;
}

class HeatConsumer {
  constructor(id, name, type = "constant", power_kW = 1, options = {}) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.power_kW = Number(power_kW) || 0;
    this.enabled = options.enabled !== false;
    this.delivered_kWh = 0;
    this.currentTemp = options.currentTemp || 20;
    this.targetTemp = options.targetTemp || 21;
    this.thermalMass_kWhPerDeg = options.thermalMass_kWhPerDeg || 0.25;
    this.priority = options.priority || 1;

    this.waterLiters = 0;
    this.showerDeltaT = options.showerDeltaT || 35;
    this.supplyTemp =
      options.supplyTemp ||
      (this.id === "radiator" ? 45 : this.id === "shower" ? 45 : undefined);
  }

  consume(dtHours = 1 / 3600) {
    if (!this.enabled || dtHours <= 0) return 0;
    if (this.type === "constant") {
      const sf = typeof speedfactor !== "undefined" ? Number(speedfactor) : 1;
      const need = this.power_kW * dtHours * sf;
      const provided = Math.min(thermalStorage.level_kWh, need);
      thermalStorage.level_kWh = Math.max(
        0,
        thermalStorage.level_kWh - provided
      );
      this.delivered_kWh += provided;
      if (this.id === "radiator" && provided > 0) {
        const room = getHeatConsumers().find((x) => x.id === "room");
        if (room) {
          const degIncrease = provided / (room.thermalMass_kWhPerDeg || 0.25);
          room.currentTemp = Number(
            (room.currentTemp + degIncrease).toFixed(3)
          );
        }
      }
      if (this.id === "shower" && provided > 0) {
        const kWhPerLPerDeg = 0.00116278;
        const deltaT = this.showerDeltaT || 35;
        const liters = provided / (kWhPerLPerDeg * deltaT);
        this.waterLiters = Number((this.waterLiters + liters).toFixed(3));
      }
      return provided;
    }
    if (this.type === "thermostat") {
      const delta = this.targetTemp - this.currentTemp;
      if (delta <= 0) return 0;
      const sf = typeof speedfactor !== "undefined" ? Number(speedfactor) : 1;
      const need = delta * this.thermalMass_kWhPerDeg * sf;
      const provided = Math.min(thermalStorage.level_kWh, need);
      thermalStorage.level_kWh = Math.max(
        0,
        thermalStorage.level_kWh - provided
      );
      this.currentTemp += provided / this.thermalMass_kWhPerDeg;
      this.delivered_kWh += provided;
      return provided;
    }
    return 0;
  }

  setEnabled(v) {
    this.enabled = !!v;
  }

  status() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      enabled: this.enabled,
      delivered_kWh: Number(this.delivered_kWh || 0),
      currentTemp: Number(this.currentTemp || 0),
      targetTemp: Number(this.targetTemp || 0),
      power_kW: Number(this.power_kW || 0),
      waterLiters: Number(this.waterLiters || 0),
    };
  }
}

class Consumers {
  constructor() {
    this.map = new Map();
  }

  add(consumer) {
    if (!consumer || !consumer.id) return null;
    this.map.set(consumer.id, consumer);
    return consumer;
  }

  get(id) {
    return this.map.get(id);
  }

  list() {
    return Array.from(this.map.values());
  }

  statusAll() {
    return this.list().map((c) =>
      typeof c.status === "function"
        ? c.status()
        : Object.assign({ id: c.id, name: c.name }, c)
    );
  }

  updateTopPanels() {
    try {
      const ev = this.get("charging_electric");
      if (
        ev &&
        typeof window.setChargingStationElectricTopPanel === "function"
      ) {
        const level = ev.level_kWh || 0;
        const cap = ev.capacity_kWh || 1;
        window.setChargingStationElectricTopPanel(level, cap);
      }
      const hydroSt = this.get("charging_hydrogen");
      if (
        hydroSt &&
        typeof window.setChargingStationHydrogenTopPanel === "function"
      ) {
        const level = hydroSt.level_g || 0;
        const cap = hydroSt.capacity_g || 1;
        window.setChargingStationHydrogenTopPanel(level, cap);
      }
    } catch (e) {
      console.warn("Consumers.updateTopPanels failed", e);
    }
  }
}

window.consumerState = {
  room: {
    id: "room",
    name: "Living room",
    type: "thermostat",
    currentTemp: 18,
    targetTemp: 21,
    thermalMass_kWhPerDeg: 0.25,
    area_m2: 20,
    delivered_kWh: 0,
    priority: 1,
  },
  shower: {
    id: "shower",
    name: "Shower",
    type: "constant",
    enabled: false,
    supplyTemp: 45,
    showerDeltaT: 35,
    flow_l_per_s: 0.12,
    power_kW: 6,
    delivered_kWh: 0,
    waterLiters: 0,
    priority: 0,
  },
  radiator: {
    id: "radiator",
    name: "Radiator",
    type: "constant",
    enabled: false,
    supplyTemp: 45,
    power_kW: 2,
    delivered_kWh: 0,
    priority: 2,
  },
  charging_electric: {
    id: "charging_electric",
    name: "EV Charging Station",
    level_kWh: 0,
    capacity_kWh: 100,
  },
  charging_hydrogen: {
    id: "charging_hydrogen",
    name: "H2 Charging Station",
    level_g: 0,
    capacity_g: 10000,
  },
};

/**
 * Apply a named use case which adjusts the primary room's name, area (m^2)
 * and thermalMass (kWh required to raise room by 1°C) so room size influences
 * how fast it heats up. Call updateHeatConsumersUI() after applying.
 *
 * Mapping (per product manager):
 * - offgrid -> Living room, 20 m²
 * - microgrid -> Storage room, 100 m²
 * - evcharge -> Storage hall, 1000 m²
 * - industrial -> Storage hall (Large), 5000 m²
 */
function applyUseCase(usecaseKey) {
  const mapping = {
    offgrid: { name: "Living room", area: 20 },
    microgrid: { name: "Storage room", area: 100 },
    evcharge: { name: "Storage hall", area: 1000 },
    industrial: { name: "Storage hall (Large)", area: 5000 },
  };
  const m = mapping[usecaseKey] || mapping.offgrid;
  const room = window.consumerState && window.consumerState.room;
  if (!room) return;
  room.name = m.name;
  room.area_m2 = m.area;
  room.thermalMass_kWhPerDeg = Number((m.area * 0.0125).toFixed(4));
  const bp = document.getElementById("bullet-points-container");
  if (bp) {
    bp.innerHTML = `<div style="margin-top:8px;font-size:0.98em;">Selected room: <strong>${room.name}</strong> — area: <strong>${room.area_m2} m²</strong>. Larger rooms require more energy to raise temperature (slower warm-up).</div>`;
  }
  if (typeof updateHeatConsumersUI === "function") updateHeatConsumersUI();

  try {
    if (typeof charge !== "undefined" && charge) {
      charge.storage = 0;
      if (typeof window.setBatteryTopPanel === "function")
        window.setBatteryTopPanel(0, charge.capacity);
      const batteryLevelElem = document.getElementById("battery-level");
      if (batteryLevelElem) batteryLevelElem.innerText = "0 kWh";
      const batteryStoragePercent = document.getElementById(
        "battery-storage-percentage"
      );
      if (batteryStoragePercent) batteryStoragePercent.textContent = "0%";
    }
  } catch (e) {
    console.warn("Failed to reset battery storage on usecase change", e);
  }

  try {
    const batteryGaugeFill = document.getElementById("battery-gauge-fill");
    if (batteryGaugeFill) {
      const totalLength = 157;
      batteryGaugeFill.setAttribute("stroke-dashoffset", totalLength);
    }
    const batteryGaugeLevelElem = document.getElementById(
      "battery-gauge-level"
    );
    if (batteryGaugeLevelElem) batteryGaugeLevelElem.style.width = "0%";
    const batteryGaugePercentElem = document.getElementById(
      "battery-gauge-percentage"
    );
    if (batteryGaugePercentElem) batteryGaugePercentElem.textContent = "0 %";
    const stickyBatteryGaugeFill = document.getElementById(
      "sticky-battery-gauge-fill"
    );
    if (stickyBatteryGaugeFill)
      stickyBatteryGaugeFill.setAttribute("stroke-dashoffset", 157);
    const stickyBatteryGaugePercent = document.getElementById(
      "sticky-battery-gauge-percentage"
    );
    if (stickyBatteryGaugePercent)
      stickyBatteryGaugePercent.textContent = "0 %";
    const waveLoader1 = document.querySelector(".wave-loader1");
    if (waveLoader1) {
      waveLoader1.style.setProperty("--before-top", -15 + "%");
      waveLoader1.style.setProperty("--after-top", -15 + "%");
    }
  } catch (e) {
    console.warn("Failed to reset battery gauge visuals", e);
  }

  try {
    if (typeof hydro !== "undefined" && hydro) {
      hydro.storage = 0;
      const hydrogenLevelElem = document.getElementById("hydrogen-level");
      if (hydrogenLevelElem) hydrogenLevelElem.innerText = "0.00 g";
      const hydrogenStoragePercentElem = document.getElementById(
        "hydrogen-storage-percentage"
      );
      if (hydrogenStoragePercentElem)
        hydrogenStoragePercentElem.textContent = "0%";
      const hydrogenGaugePercentElem = document.getElementById(
        "hydrogen-gauge-percentage"
      );
      if (hydrogenGaugePercentElem) hydrogenGaugePercentElem.innerText = "0 %";
      const hydrogenGaugeLevelElem = document.getElementById(
        "hydrogen-gauge-level"
      );
      if (hydrogenGaugeLevelElem) hydrogenGaugeLevelElem.style.width = "0%";
    }
  } catch (e) {
    console.warn("Failed to reset hydrogen storage on usecase change", e);
  }

  try {
    if (typeof thermalStorage !== "undefined" && thermalStorage) {
      thermalStorage.level_kWh = 0;
      updateThermalGaugeUI();
    }
  } catch (e) {
    console.warn("Failed to reset thermal storage on usecase change", e);
  }
}

function getHeatConsumers() {
  if (window.consumerState)
    return [
      window.consumerState.room,
      window.consumerState.shower,
      window.consumerState.radiator,
    ];
  return Array.isArray(window.heatConsumers) ? window.heatConsumers : [];
}

window.heatConsumers = getHeatConsumers();

function consumePlainConsumer(c, dtHours = 1 / 3600) {
  if (!c) return 0;
  if (c.enabled === false || dtHours <= 0) return 0;
  const type = c.type || "constant";
  if (type === "constant") {
    const sf = typeof speedfactor !== "undefined" ? Number(speedfactor) : 1;
    const power_kW = Number(c.power_kW) || 0;
    const need = power_kW * dtHours * sf;
    const provided = Math.min(thermalStorage.level_kWh, need);
    thermalStorage.level_kWh = Math.max(0, thermalStorage.level_kWh - provided);
    c.delivered_kWh = Number(((c.delivered_kWh || 0) + provided).toFixed(6));
    if (c.id === "radiator" && provided > 0) {
      const room = getHeatConsumers().find((x) => x.id === "room");
      if (room) {
        const degIncrease = provided / (room.thermalMass_kWhPerDeg || 0.25);
        room.currentTemp = Number((room.currentTemp + degIncrease).toFixed(3));
      }
    }
    if (c.id === "shower" && provided > 0) {
      const kWhPerLPerDeg = 0.00116278;
      const deltaT = c.showerDeltaT || 35;
      const liters = provided / (kWhPerLPerDeg * deltaT);
      c.waterLiters = Number(((c.waterLiters || 0) + liters).toFixed(3));
    }
    return provided;
  }
  if (type === "thermostat") {
    const sf2 = typeof speedfactor !== "undefined" ? Number(speedfactor) : 1;
    const delta = (c.targetTemp || 0) - (c.currentTemp || 0);
    if (delta <= 0) return 0;
    const thermalMass = c.thermalMass_kWhPerDeg || 0.25;
    const need = delta * thermalMass * sf2;
    const provided = Math.min(thermalStorage.level_kWh, need);
    thermalStorage.level_kWh = Math.max(0, thermalStorage.level_kWh - provided);
    c.currentTemp = Number(
      ((c.currentTemp || 0) + provided / thermalMass).toFixed(6)
    );
    c.delivered_kWh = Number(((c.delivered_kWh || 0) + provided).toFixed(6));
    return provided;
  }
  return 0;
}

window.consumers = new Consumers();
window.consumers.add(window.consumerState.charging_electric);
window.consumers.add(window.consumerState.charging_hydrogen);

const chargingElectric = {
  id: "charging_electric",
  name: "EV Charging Station",
  level_kWh: 0,
  capacity_kWh: 100,
};
window.consumers.add(chargingElectric);

const chargingHydrogen = {
  id: "charging_hydrogen",
  name: "H2 Charging Station",
  level_g: 0,
  capacity_g: 10000,
};
window.consumers.add(chargingHydrogen);

window.setChargingStationElectricTopPanel = function (level_kWh, capacity_kWh) {
  const elem = document.getElementById("charging-electric-level");
  if (elem) elem.innerText = `${Number(level_kWh || 0).toFixed(2)} kWh`;
};

window.setChargingStationHydrogenTopPanel = function (level_g, capacity_g) {
  const elem = document.getElementById("charging-hydrogen-level");
  if (elem) elem.innerText = `${Number(level_g || 0).toFixed(2)} g`;
};

function updateHeatConsumersUI() {
  let container = document.getElementById("heat-consumers");
  const preferred = document.getElementById("consumer-panel-content");
  if (!container) {
    container = document.createElement("div");
    container.id = "heat-consumers";
    container.style.fontSize = "14px";
    container.style.marginTop = "6px";
    container.style.color = "#222";
    if (preferred) {
      preferred.appendChild(container);
    } else {
      const sticky = document.getElementById("sticky-thermal-gauge-percentage");
      (sticky && sticky.parentNode
        ? sticky.parentNode
        : document.body
      ).appendChild(container);
    }
  }

  if (window.heatConsumerInteracting) {
    try {
      for (const c of getHeatConsumers()) {
        const stats = document.getElementById(`heat-stats-${c.id}`);
        if (stats) {
          if (c.id === "shower") {
            const tlabel_p = window.getTranslation
              ? window.getTranslation("tempLabel")
              : "temp";
            const plabel_p = window.getTranslation
              ? window.getTranslation("powerLabel")
              : "power";
            const dlabel_p = window.getTranslation
              ? window.getTranslation("deliveredLabel")
              : "delivered";
            const wlabel_p = window.getTranslation
              ? window.getTranslation("waterLabel")
              : "water";
            stats.textContent = `${c.name}: ${tlabel_p} ${Number(
              c.supplyTemp || 0
            )}°C | ${plabel_p} ${Number(c.power_kW || 0).toFixed(
              3
            )} kW | ${dlabel_p} ${Number(c.delivered_kWh || 0).toFixed(
              3
            )} kWh | ${wlabel_p} ${Number(c.waterLiters || 0).toFixed(3)} L`;
          } else if (c.id === "radiator") {
            const tlabel_p2 = window.getTranslation
              ? window.getTranslation("tempLabel")
              : "temp";
            const plabel_p2 = window.getTranslation
              ? window.getTranslation("powerLabel")
              : "power";
            const dlabel_p2 = window.getTranslation
              ? window.getTranslation("deliveredLabel")
              : "delivered";
            stats.textContent = `${c.name}: ${tlabel_p2} ${Number(
              c.supplyTemp || 0
            )}°C | ${plabel_p2} ${Number(c.power_kW || 0).toFixed(
              3
            )} kW | ${dlabel_p2} ${Number(c.delivered_kWh || 0).toFixed(
              3
            )} kWh`;
          }
        }
      }

      const footer = document.getElementById("heat-consumers-footer");
      if (footer) {
        const tStore = window.getTranslation
          ? window.getTranslation("thermalStoreLabel")
          : "Thermal store:";
        footer.textContent = `${tStore} ${formatKWh(
          thermalStorage.level_kWh
        )} / ${thermalStorage.capacity_kWh} kWh`;
      }

      if (
        window.consumers &&
        typeof window.consumers.updateTopPanels === "function"
      )
        window.consumers.updateTopPanels();
    } catch (e) {
      console.warn("partial heat UI update failed", e);
    }
    return;
  }

  const leftTarget =
    document.getElementById("consumer-panel-left") || container;
  const rightTarget =
    document.getElementById("consumer-panel-right") || container;

  if (leftTarget === rightTarget) {
    leftTarget.innerHTML = "";
  } else {
    leftTarget.innerHTML = "";
    rightTarget.innerHTML = "";
  }

  const stationControls = document.createElement("div");
  stationControls.style.display = "flex";
  stationControls.style.gap = "12px";
  stationControls.style.marginTop = "8px";

  const ev = window.consumers
    ? window.consumers.get("charging_electric")
    : null;
  const h2 = window.consumers
    ? window.consumers.get("charging_hydrogen")
    : null;

  if (ev) {
    const evBox = document.createElement("div");
    evBox.style.display = "flex";
    evBox.style.flexDirection = "column";
    evBox.style.alignItems = "center";
    evBox.style.padding = "8px";
    evBox.style.border = "1px solid #eee";
    evBox.style.borderRadius = "8px";
    const evLabel = document.createElement("div");
    evLabel.textContent = `${ev.name}`;
    evLabel.style.fontWeight = "700";
    const evLevel = document.createElement("div");
    evLevel.id = "consumer-ev-level";
    evLevel.className = "consumer-level";
    evLevel.textContent = `${Number(ev.level_kWh || 0).toFixed(2)} kWh`;
    evLevel.style.margin = "6px 0";
    const evChargeBtn = document.createElement("button");
    evChargeBtn.textContent = window.getTranslation
      ? window.getTranslation("chargeEVBtn")
      : "Charge EV +1 kWh";
    evChargeBtn.className = "start-btn";
    evChargeBtn.addEventListener("click", function () {
      window.chargeEV(1);
    });
    evBox.appendChild(evLabel);
    evBox.appendChild(evLevel);
    evBox.appendChild(evChargeBtn);
    stationControls.appendChild(evBox);
  }

  if (h2) {
    const h2Box = document.createElement("div");
    h2Box.style.display = "flex";
    h2Box.style.flexDirection = "column";
    h2Box.style.alignItems = "center";
    h2Box.style.padding = "8px";
    h2Box.style.border = "1px solid #eee";
    h2Box.style.borderRadius = "8px";
    const h2Label = document.createElement("div");
    h2Label.textContent = `${h2.name}`;
    h2Label.style.fontWeight = "700";
    const h2Level = document.createElement("div");
    h2Level.id = "consumer-h2-level";
    h2Level.className = "consumer-level";
    h2Level.textContent = `${Number(h2.level_g || 0).toFixed(2)} g`;
    h2Level.style.margin = "6px 0";
    const h2ChargeBtn = document.createElement("button");
    h2ChargeBtn.textContent = window.getTranslation
      ? window.getTranslation("chargeH2Btn")
      : "Charge H2 +100 g";
    h2ChargeBtn.className = "start-btn";
    h2ChargeBtn.addEventListener("click", function () {
      window.chargeH2(100);
    });
    h2Box.appendChild(h2Label);
    h2Box.appendChild(h2Level);
    h2Box.appendChild(h2ChargeBtn);
    stationControls.appendChild(h2Box);
  }

  if (stationControls.childElementCount > 0)
    leftTarget.appendChild(stationControls);

  const title = document.createElement("div");
  const heatTitle = window.getTranslation
    ? window.getTranslation("heatConsumersTitle")
    : "Heat consumers";
  title.innerHTML = `<strong>${heatTitle}</strong>`;
  rightTarget.appendChild(title);

  const roomTempDisplay = document.createElement("div");
  roomTempDisplay.id = "room-temp-display";
  roomTempDisplay.style.marginTop = "6px";
  roomTempDisplay.style.fontSize = "1.05em";
  roomTempDisplay.style.fontWeight = "700";
  const room = getHeatConsumers().find((x) => x.id === "room");
  if (room) {
    const areaText = room.area_m2 ? ` (${room.area_m2} m²)` : "";
    roomTempDisplay.textContent = `${
      room.name
    }${areaText}: ${room.currentTemp.toFixed(
      2
    )}°C (target ${room.targetTemp.toFixed(1)}°C)`;
  }
  rightTarget.appendChild(roomTempDisplay);

  const list = document.createElement("div");
  list.style.marginTop = "8px";

  for (const c of getHeatConsumers()) {
    const s =
      typeof c.status === "function"
        ? c.status()
        : Object.assign({ id: c.id, name: c.name }, c);
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.justifyContent = "space-between";
    row.style.marginBottom = "8px";

    const left = document.createElement("div");
    left.style.flex = "1";
    left.style.paddingRight = "8px";
    if (s.type === "thermostat") {
      const onText = window.getTranslation
        ? window.getTranslation("onText")
        : "On";
      const offText = window.getTranslation
        ? window.getTranslation("offText")
        : "Off";
      const tlabel_tt = window.getTranslation
        ? window.getTranslation("tempLabel")
        : "temp";
      const dlabel_tt = window.getTranslation
        ? window.getTranslation("deliveredLabel")
        : "delivered";
      left.textContent = `${s.name}: ${
        s.enabled ? onText : offText
      } | ${tlabel_tt} ${s.currentTemp.toFixed(1)}°C → ${s.targetTemp.toFixed(
        1
      )}°C | ${dlabel_tt} ${s.delivered_kWh.toFixed(3)} kWh`;
      row.appendChild(left);
    } else {
      left.textContent = `${s.name}`;
      row.appendChild(left);

      const controlsWrap = document.createElement("div");
      controlsWrap.style.display = "flex";
      controlsWrap.style.flexDirection = "column";
      controlsWrap.style.alignItems = "flex-end";
      controlsWrap.style.gap = "6px";
      controlsWrap.style.minWidth = "140px";

      const sliderRow = document.createElement("div");
      sliderRow.style.display = "flex";
      sliderRow.style.alignItems = "center";
      sliderRow.style.justifyContent = "flex-end";
      sliderRow.style.width = "100%";

      if (s.id === "shower") {
        const stats = document.createElement("div");
        stats.style.fontSize = "0.95em";
        stats.style.marginBottom = "6px";
        stats.style.textAlign = "right";
        stats.id = `heat-stats-${c.id}`;
        const tlabel = window.getTranslation
          ? window.getTranslation("tempLabel")
          : "temp";
        const plabel = window.getTranslation
          ? window.getTranslation("powerLabel")
          : "power";
        const dlabel = window.getTranslation
          ? window.getTranslation("deliveredLabel")
          : "delivered";
        const wlabel = window.getTranslation
          ? window.getTranslation("waterLabel")
          : "water";
        stats.textContent = `${s.name}: ${tlabel} ${
          c.supplyTemp
        }°C | ${plabel} ${c.power_kW.toFixed(
          3
        )} kW | ${dlabel} ${c.delivered_kWh.toFixed(
          3
        )} kWh | ${wlabel} ${c.waterLiters.toFixed(3)} L`;
        controlsWrap.appendChild(stats);

        const slider = document.createElement("input");
        slider.type = "range";
        slider.min = 30;
        slider.max = 55;
        slider.step = 0.5;
        slider.value = c.supplyTemp || 45;
        slider.title = window.getTranslation
          ? window.getTranslation("showerTempTitle")
          : "Shower water temperature (°C)";
        slider.style.width = "200px";
        //assumptions: flow ~ 0.12 kg/s (7.2 L/min), water density ~1 kg/L, specific heat 4.186 kJ/kg°C
        const flow_l_per_s = 0.12;
        const kWhPerLPerDeg = 0.00116278; //same as used for compute liters
        const updateShowerPower = () => {
          const inletTemp = 10; //assumed cold inlet
          const deltaT = Math.max(1, (c.supplyTemp || 45) - inletTemp);
          //power_kW = flow_l_per_s * liters/sec * specific heat * deltaT -> convert kJ to kWh
          //liters per second = flow_l_per_s; energy per second (kW) = flow_l_per_s * kWhPerLPerDeg * deltaT * 3600?
          //Simpler: kW = flow_l_per_s * 4.186 * deltaT / 1000 -> since 4.186 kJ/kg°C
          const power_kW = (flow_l_per_s * 4.186 * deltaT) / 1.0; //kW approx
          c.power_kW = Number(power_kW.toFixed(3));
        };
        slider.addEventListener("pointerdown", function () {
          window.heatConsumerInteracting = true;
        });
        slider.addEventListener("pointerup", function () {
          setTimeout(() => {
            window.heatConsumerInteracting = false;
            updateHeatConsumersUI();
          }, 150);
        });
        slider.addEventListener("pointercancel", function () {
          window.heatConsumerInteracting = false;
        });
        slider.addEventListener("input", function () {
          c.supplyTemp = Number(slider.value);
          updateShowerPower();
          const tlabel_i = window.getTranslation
            ? window.getTranslation("tempLabel")
            : "temp";
          const plabel_i = window.getTranslation
            ? window.getTranslation("powerLabel")
            : "power";
          const dlabel_i = window.getTranslation
            ? window.getTranslation("deliveredLabel")
            : "delivered";
          const wlabel_i = window.getTranslation
            ? window.getTranslation("waterLabel")
            : "water";
          const txt = `${s.name}: ${tlabel_i} ${
            c.supplyTemp
          }°C | ${plabel_i} ${c.power_kW.toFixed(
            3
          )} kW | ${dlabel_i} ${c.delivered_kWh.toFixed(
            3
          )} kWh | ${wlabel_i} ${c.waterLiters.toFixed(3)} L`;
          stats.textContent = txt;
        });
        updateShowerPower();
        stats.textContent = `${s.name}: ${tlabel} ${
          c.supplyTemp
        }°C | ${plabel} ${c.power_kW.toFixed(
          3
        )} kW | ${dlabel} ${c.delivered_kWh.toFixed(
          3
        )} kWh | ${wlabel} ${c.waterLiters.toFixed(3)} L`;
        left.textContent = `${s.name}`;
        sliderRow.appendChild(slider);
      }

      if (s.id === "radiator") {
        const stats = document.createElement("div");
        stats.style.fontSize = "0.95em";
        stats.style.marginBottom = "6px";
        stats.style.textAlign = "right";
        stats.id = `heat-stats-${c.id}`;
        const tlabelR = window.getTranslation
          ? window.getTranslation("tempLabel")
          : "temp";
        const plabelR = window.getTranslation
          ? window.getTranslation("powerLabel")
          : "power";
        const dlabelR = window.getTranslation
          ? window.getTranslation("deliveredLabel")
          : "delivered";
        stats.textContent = `${s.name}: ${tlabelR} ${
          c.supplyTemp
        }°C | ${plabelR} ${c.power_kW.toFixed(
          3
        )} kW | ${dlabelR} ${c.delivered_kWh.toFixed(3)} kWh`;
        controlsWrap.appendChild(stats);

        const slider = document.createElement("input");
        slider.type = "range";
        slider.min = 35;
        slider.max = 80;
        slider.step = 1;
        slider.value = c.supplyTemp || 45;
        slider.title = window.getTranslation
          ? window.getTranslation("radiatorTempTitle")
          : "Radiator supply temperature (°C)";
        slider.style.width = "200px";
        const room = getHeatConsumers().find((x) => x.id === "room");
        const updateRadiatorPower = () => {
          const roomTemp = room ? room.currentTemp || 18 : 18;
          const deltaT = Math.max(1, (c.supplyTemp || 45) - roomTemp);
          const refDelta = 45 - 18;
          const refPower = 2; //kW at refDelta
          const power_kW = (deltaT / refDelta) * refPower;
          c.power_kW = Number(Math.max(0, power_kW).toFixed(3));
        };
        slider.addEventListener("pointerdown", function () {
          window.heatConsumerInteracting = true;
        });
        slider.addEventListener("pointerup", function () {
          setTimeout(() => {
            window.heatConsumerInteracting = false;
            updateHeatConsumersUI();
          }, 150);
        });
        slider.addEventListener("pointercancel", function () {
          window.heatConsumerInteracting = false;
        });
        slider.addEventListener("input", function () {
          c.supplyTemp = Number(slider.value);
          updateRadiatorPower();
          const tlabel_rr = window.getTranslation
            ? window.getTranslation("tempLabel")
            : "temp";
          const plabel_rr = window.getTranslation
            ? window.getTranslation("powerLabel")
            : "power";
          const dlabel_rr = window.getTranslation
            ? window.getTranslation("deliveredLabel")
            : "delivered";
          const txt = `${s.name}: ${tlabel_rr} ${
            c.supplyTemp
          }°C | ${plabel_rr} ${c.power_kW.toFixed(
            3
          )} kW | ${dlabel_rr} ${c.delivered_kWh.toFixed(3)} kWh`;
          stats.textContent = txt;
        });
        updateRadiatorPower();
        stats.textContent = `${s.name}: ${tlabelR} ${
          c.supplyTemp
        }°C | ${plabelR} ${c.power_kW.toFixed(
          3
        )} kW | ${dlabelR} ${c.delivered_kWh.toFixed(3)} kWh`;
        left.textContent = `${s.name}`;
        sliderRow.appendChild(slider);
      }

      const btnRow = document.createElement("div");
      btnRow.style.display = "flex";
      btnRow.style.justifyContent = "flex-end";

      const btn = document.createElement("button");
      btn.id = `heat-toggle-${s.id}`;
      btn.dataset.target = s.id;
      btn.style.minWidth = "88px";
      btn.style.fontWeight = "600";
      if (s.enabled) {
        btn.className = "start-btn";
        btn.textContent = window.getTranslation
          ? window.getTranslation("onText")
          : "On";
      } else {
        btn.className = "stop-btn";
        btn.textContent = window.getTranslation
          ? window.getTranslation("offText")
          : "Off";
      }
      btn.addEventListener("click", function (ev) {
        ev.preventDefault();
        toggleHeatConsumer(s.id, !s.enabled);
      });
      btnRow.appendChild(btn);

      controlsWrap.appendChild(sliderRow);
      controlsWrap.appendChild(btnRow);
      row.appendChild(controlsWrap);
    }

    list.appendChild(row);
  }

  const footer = document.createElement("div");
  footer.style.marginTop = "6px";
  footer.style.fontWeight = "600";

  rightTarget.appendChild(list);
  rightTarget.appendChild(footer);

  const updatedRoom = getHeatConsumers().find((x) => x.id === "room");
  if (updatedRoom) {
    const d = document.getElementById("room-temp-display");
    if (d) {
      const areaText = updatedRoom.area_m2
        ? ` (${updatedRoom.area_m2} m²)`
        : "";
      d.textContent = `${
        updatedRoom.name
      }${areaText}: ${updatedRoom.currentTemp.toFixed(
        2
      )}°C (target ${updatedRoom.targetTemp.toFixed(1)}°C)`;
    }
  }
}

window.chargeEV = function (kwh) {
  try {
    const ev = window.consumers.get("charging_electric");
    if (!ev) return;
    const amount = Number(kwh) || 0;
    const fromBattery = Math.min(amount, Math.max(0, charge.storage - 0));
    if (fromBattery > 0) charge.updateBatteryStorage(-fromBattery);
    ev.level_kWh = Math.min(ev.capacity_kWh, (ev.level_kWh || 0) + fromBattery);
    const evElem = document.getElementById("consumer-ev-level");
    if (evElem)
      evElem.textContent = `${Number(ev.level_kWh || 0).toFixed(2)} kWh`;
    if (
      window.consumers &&
      typeof window.consumers.updateTopPanels === "function"
    )
      window.consumers.updateTopPanels();
    try {
      const s = document.getElementById("electrolyzer-to-ev-static-arrow");
      const a = document.getElementById("electrolyzer-to-ev-animated-arrow");
      if (s && a) {
        s.style.display = "none";
        a.style.display = "block";
        setTimeout(() => {
          a.style.display = "none";
          s.style.display = "block";
        }, 900);
      }
    } catch (e) {
      console.warn("ev arrow animation failed", e);
    }
  } catch (e) {
    console.warn("chargeEV failed", e);
  }
};

window.chargeH2 = function (g) {
  try {
    const st = window.consumers.get("charging_hydrogen");
    if (!st) return;
    const grams = Number(g) || 0;
    const available = Math.max(0, hydro.storage || 0);
    const taken = Math.min(available, grams);
    if (taken > 0) {
      hydro.storage = Math.max(0, hydro.storage - taken);
      st.level_g = Math.min(st.capacity_g, (st.level_g || 0) + taken);
    }
    const h2Elem = document.getElementById("consumer-h2-level");
    if (h2Elem) h2Elem.textContent = `${Number(st.level_g || 0).toFixed(2)} g`;
    if (
      window.consumers &&
      typeof window.consumers.updateTopPanels === "function"
    )
      window.consumers.updateTopPanels();
    try {
      const s = document.getElementById("fuelcell-to-h2-static-arrow");
      const a = document.getElementById("fuelcell-to-h2-animated-arrow");
      if (s && a) {
        s.style.display = "none";
        a.style.display = "block";
        setTimeout(() => {
          a.style.display = "none";
          s.style.display = "block";
        }, 900);
      }
    } catch (e) {
      console.warn("h2 arrow animation failed", e);
    }
  } catch (e) {
    console.warn("chargeH2 failed", e);
  }
};

function distributeHeatToConsumers(dtHours = 1 / 3600) {
  const hc = getHeatConsumers();
  if (!Array.isArray(hc) || hc.length === 0) return 0;
  const consumers = hc
    .slice()
    .sort((a, b) => (a.priority || 1) - (b.priority || 1));
  let totalProvided = 0;
  for (const c of consumers) {
    const provided =
      typeof c.consume === "function"
        ? c.consume(dtHours)
        : consumePlainConsumer(c, dtHours);
    totalProvided += provided;
    if (thermalStorage.level_kWh <= 0) break;
  }
  updateHeatConsumersUI();
  updateThermalGaugeUI();
  return totalProvided;
}

window.toggleHeatConsumer = function (id, enabled) {
  const c =
    getHeatConsumers().find((x) => x.id === id) ||
    (window.consumers ? window.consumers.get(id) : null);
  if (!c) return;
  if (typeof c.setEnabled === "function") c.setEnabled(enabled);
  else c.enabled = !!enabled;
  updateHeatConsumersUI();
  const btn = document.getElementById(`heat-toggle-${id}`);
  if (btn) {
    if (enabled) {
      btn.className = "start-btn";
      btn.textContent = window.getTranslation
        ? window.getTranslation("onText")
        : "On";
    } else {
      btn.className = "stop-btn";
      btn.textContent = window.getTranslation
        ? window.getTranslation("offText")
        : "Off";
    }
  }
};

setInterval(() => {
  try {
    const heat =
      typeof heaterInstance !== "undefined" && heaterInstance
        ? heaterInstance.produceHeat()
        : null;
    if (heat) updateHeatBreakdownUI(heat);
    distributeHeatToConsumers(1 / 3600);
  } catch (e) {
    console.error("Heat UI loop error", e);
  }
}, 1000);

function computeRecoverableAtRated_kW({
  electrolyzerPower_kW = 5,
  electrolyzerEff_pct = 60,
  fuelcellPower_kW = 3,
  fuelcellEff_pct = 50,
} = {}) {
  const elEff = Math.max(0.01, Math.min(1, Number(electrolyzerEff_pct) / 100));
  const fcEff = Math.max(0.01, Math.min(1, Number(fuelcellEff_pct) / 100));

  const elRecoverableFraction = 0.2;
  const elExchangerEff = 0.8;
  const fcRecoverableFraction = 0.85;
  const fcExchangerEff = 0.9;

  const raw_el_kW = electrolyzerPower_kW * Math.max(0, 1 - elEff);
  const recoverable_el_kW = raw_el_kW * elRecoverableFraction * elExchangerEff;

  const raw_fc_kW = fuelcellPower_kW * (1 / fcEff - 1);
  const recoverable_fc_kW = raw_fc_kW * fcRecoverableFraction * fcExchangerEff;

  const totalRecoverable_kW = Math.max(
    0,
    recoverable_el_kW + recoverable_fc_kW
  );
  const sf = typeof speedfactor !== "undefined" ? Number(speedfactor) : 1;
  return {
    recoverable_el_kW: recoverable_el_kW * sf,
    recoverable_fc_kW: recoverable_fc_kW * sf,
    totalRecoverable_kW: totalRecoverable_kW * sf,
  };
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function toKWFromInput(value) {
  const n = Number(value) || 0;
  return n > 10 ? n / 1000 : n;
}

function computeRecommendedThermalCapacity_kWh() {
  const pvRaw = document.getElementById("PV-power")
    ? document.getElementById("PV-power").value
    : 10;
  const batteryRaw = document.getElementById("battery-capacity")
    ? document.getElementById("battery-capacity").value
    : 20;
  const elPowerRaw = document.getElementById("electrolyzer-power")
    ? document.getElementById("electrolyzer-power").value
    : 5000;
  const elEffRaw = document.getElementById("electrolyzer-efficiency")
    ? document.getElementById("electrolyzer-efficiency").value
    : 60;
  const fcPowerRaw = document.getElementById("fuelcell-power")
    ? document.getElementById("fuelcell-power").value
    : 3000;
  const fcEffRaw = document.getElementById("fuelcell-efficiency")
    ? document.getElementById("fuelcell-efficiency").value
    : 50;

  const pv_kW = toKWFromInput(pvRaw);
  const battery_kWh = Number(batteryRaw) || 0;
  const el_kW = toKWFromInput(elPowerRaw);
  const fc_kW = toKWFromInput(fcPowerRaw);

  const rec = computeRecoverableAtRated_kW({
    electrolyzerPower_kW: el_kW,
    electrolyzerEff_pct: elEffRaw,
    fuelcellPower_kW: fc_kW,
    fuelcellEff_pct: fcEffRaw,
  });

  const baseHours = clamp(Math.round(battery_kWh / 5), 6, 48);

  const safeRecoverable = Math.max(rec.totalRecoverable_kW, 0.25);
  let recommended_kWh = Math.round(safeRecoverable * baseHours);
  recommended_kWh = clamp(recommended_kWh, 10, 200);
  return {
    recommended_kWh,
    totalRecoverable_kW: rec.totalRecoverable_kW,
    baseHours,
  };
}

function updateStickyThermalCapacityUI() {
  const el = document.getElementById("sticky-thermal-gauge-percentage");
  const { recommended_kWh } = computeRecommendedThermalCapacity_kWh();
  thermalStorage.capacity_kWh = recommended_kWh;
}

function attachThermalRecommendationListeners() {
  const ids = [
    "PV-power",
    "battery-capacity",
    "electrolyzer-power",
    "electrolyzer-efficiency",
    "fuelcell-power",
    "fuelcell-efficiency",
  ];
  ids.forEach((id) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.addEventListener("input", updateStickyThermalCapacityUI);
    node.addEventListener("change", updateStickyThermalCapacityUI);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  try {
    attachThermalRecommendationListeners();
    updateStickyThermalCapacityUI();
  } catch (e) {
    console.warn("thermal recommendation init failed", e);
  }
});
const pv = new photovoltaik();
const charge = new battery();
const hydro = new electrolyzer();
window.hydro = hydro;
const fc = new fuelcell();
window.fc = fc;

const heaterInstance = new heater();
window.heaterInstance = heaterInstance;

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
      if (typeof window.setBatteryTopPanel === "function") {
        window.setBatteryTopPanel(data.level, charge.capacity);
      }
      let batteryPercentage = (charge.storage / charge.capacity) * 100;
      const batteryGaugeLevel = document.getElementById("battery-gauge-level");
      if (batteryGaugeLevel)
        batteryGaugeLevel.style.width = batteryPercentage + "%";
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
  }

  async buyElectricity() {
    await this.priceCheck();
    const amount = getBuyAmount();
    const pricePerKWh = this.electricityPrice / 1000;

    const enoughMoney = pricePerKWh < 0 || this.money >= pricePerKWh * amount;
    const enoughCapacity = charge.storage + amount <= charge.capacity;
    if (enoughMoney && enoughCapacity) {
      this.money -= pricePerKWh * amount;
      charge.updateBatteryStorage(amount);
      showNotification(
        window.t
          ? window.t("electricityBought", {
              amount: amount,
              price: pricePerKWh.toFixed(3),
            })
          : `${amount} kWh Electricity bought at ${pricePerKWh.toFixed(
              3
            )} €/kWh!`,
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
      showNotification(
        window.t
          ? window.t("cannotBuy", { reason: reason.trim() })
          : `Cannot buy: ${reason.trim()}`,
        "sell"
      );
    }
  }
  async sellElectricity() {
    await this.priceCheck();
    const amount = getSellAmount();
    if (charge.storage >= amount) {
      const pricePerKWh = this.electricityPrice / 1000;
      this.money += pricePerKWh * amount;
      charge.updateBatteryStorage(-amount);
      showNotification(
        window.t
          ? window.t("electricitySold", {
              amount: amount,
              price: pricePerKWh.toFixed(3),
            })
          : `${amount} kWh Electricity sold at ${pricePerKWh.toFixed(
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
    } else {
      showNotification(
        window.t
          ? window.t("cannotSellNotEnoughStorage")
          : `Cannot sell: not enough storage.`,
        "buy"
      );
    }
  }

  async sellCustomAmount(amount) {
    await this.priceCheck();
    if (charge.storage >= amount && amount > 0) {
      const pricePerKWh = this.electricityPrice / 1000;
      this.money += pricePerKWh * amount;
      charge.updateBatteryStorage(-amount);
      showNotification(
        window.t
          ? window.t("electricityAutoSold", {
              amount: amount,
              price: pricePerKWh.toFixed(3),
            })
          : `${amount} kWh Electricity automatically sold at ${pricePerKWh.toFixed(
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

function pollWeather() {
  pv.checkforSun();
}
setInterval(pollWeather, 5 * 60 * 1000);
pollWeather();

function scheduleHourlyPriceUpdate() {
  const now = new Date();
  const minutesUntilNextHour = 60 - now.getMinutes();
  const secondsUntilNextHour = minutesUntilNextHour * 60 - now.getSeconds();
  const millisecondsUntilNextHour = secondsUntilNextHour * 1000;

  console.log(
    `Next client-side price update scheduled in ${minutesUntilNextHour} minutes and ${now.getSeconds()} seconds`
  );

  setTimeout(() => {
    if (typeof trade !== "undefined" && trade.priceCheck) {
      console.log("Updating market price at:", new Date().toLocaleTimeString());
      trade.priceCheck();
    }

    setInterval(() => {
      if (typeof trade !== "undefined" && trade.priceCheck) {
        console.log(
          "Updating market price at:",
          new Date().toLocaleTimeString()
        );
        trade.priceCheck();
      }
    }, 3600000);
  }, millisecondsUntilNextHour);
}

scheduleHourlyPriceUpdate();

async function updateSimulation() {
  let sun = pv.lastSunStatus || false;

  try {
  } catch (e) {}
  if (sun) {
    try {
      const pvPower = Number(pv.power) || 0;
      const pvEff = Number(pv.efficiency) || 0;
      const battEff = Number(charge.efficiency) || 0;
      const cap = Number(charge.capacity) || 0;
      const stored = Number(charge.storage) || 0;
      const sf = typeof speedfactor !== "undefined" ? Number(speedfactor) : 1;
      const powergenerated =
        ((pvEff / 100) * pvPower * (battEff / 100) * sf) / 1000;

      if (powergenerated > 0 && powergenerated + stored <= cap) {
        charge.updateBatteryStorage(powergenerated);
      } else if (powergenerated > 0 && stored < cap) {
        const free = Math.max(0, cap - stored);
        charge.updateBatteryStorage(Math.min(powergenerated, free));
      }
    } catch (err) {
      console.error("Error in PV charging block", err);
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
    hydro.storage < hydro.capacity &&
    !electrolyzerManuallyStopped
  ) {
    try {
      hydro.produceHydrogen();
    } catch (err) {}
  }

  try {
    const dtSeconds = 1; //updateSimulation called every 1s
    const dtHours = dtSeconds / 3600;
    const heat = heaterInstance ? heaterInstance.produceHeat() : null;
    if (heat) {
      let totalRecovered_kWh = 0;
      if (heat.electrolyzer && heat.electrolyzer.recoverable_kWh)
        totalRecovered_kWh += heat.electrolyzer.recoverable_kWh;
      if (heat.fuelcell && heat.fuelcell.recoverable_kWh)
        totalRecovered_kWh += heat.fuelcell.recoverable_kWh;
      if (totalRecovered_kWh > 0) {
        routeRecoveredHeat_kWh(totalRecovered_kWh, dtHours);
        updateThermalGaugeUI();
      }
    }
  } catch (e) {
    console.error("Thermal recovery error", e);
  }
}

function resetSimulation() {
  console.log("Reset");
  charge.storage = 0;
  hydro.storage = 0;
  trade.money = 0;

  try {
    thermalStorage.level_kWh = 0;
  } catch (e) {
    console.warn("thermalStorage reset failed", e);
  }

  if (electrolyzerInterval !== null) {
    clearInterval(electrolyzerInterval);
    electrolyzerInterval = null;
  }

  if (fuelCellInterval !== null) {
    clearInterval(fuelCellInterval);
    fuelCellInterval = null;
  }

  if (typeof window.setBatteryTopPanel === "function") {
    window.setBatteryTopPanel(0, charge.capacity);
  } else {
    const batteryLevelElem = document.getElementById("battery-level");
    if (batteryLevelElem) batteryLevelElem.innerText = " 0 kWh";
  }

  const hydrogenLevelElem = document.getElementById("hydrogen-level");
  if (hydrogenLevelElem) hydrogenLevelElem.innerText = "0.00 g";

  const hydrogenStoragePercentElem = document.getElementById(
    "hydrogen-storage-percentage"
  );
  if (hydrogenStoragePercentElem) hydrogenStoragePercentElem.textContent = "0%";

  const hydrogenGaugePercentElem = document.getElementById(
    "hydrogen-gauge-percentage"
  );
  if (hydrogenGaugePercentElem) hydrogenGaugePercentElem.innerText = "0 %";
  const hydrogenGaugeLevelElem = document.getElementById(
    "hydrogen-gauge-level"
  );
  if (hydrogenGaugeLevelElem) hydrogenGaugeLevelElem.style.width = "0%";

  const hydrogenGaugeFill = document.getElementById("hydrogen-gauge-fill");
  if (hydrogenGaugeFill) {
    try {
      const totalLength = 157;
      hydrogenGaugeFill.setAttribute("stroke-dashoffset", totalLength);
    } catch (e) {
      /* ignore */
    }
  }
  const stickyHydrogenGaugeFill = document.getElementById(
    "sticky-hydrogen-gauge-fill"
  );
  if (stickyHydrogenGaugeFill) {
    try {
      const totalLength = 157;
      stickyHydrogenGaugeFill.setAttribute("stroke-dashoffset", totalLength);
    } catch (e) {
      /* ignore */
    }
  }
  const stickyHydrogenPercent = document.getElementById(
    "sticky-hydrogen-gauge-percentage"
  );
  if (stickyHydrogenPercent) stickyHydrogenPercent.textContent = "0 %";
  const moneyElem = document.getElementById("money");
  if (moneyElem) moneyElem.innerText = "  0 €";

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

  showNotification(
    window.t ? window.t("simulationReset") : "Simulation reset!",
    "buy"
  );
  try {
    const hc = getHeatConsumers();
    for (const h of hc) {
      h.delivered_kWh = 0;
      if (Object.prototype.hasOwnProperty.call(h, "waterLiters"))
        h.waterLiters = 0;
      if (h.id === "room") h.currentTemp = 18;
      if (h.id === "shower" || h.id === "radiator") h.enabled = false;
    }
    updateHeatConsumersUI();
    updateThermalGaugeUI();
  } catch (e) {
    console.warn("Failed to reset heat consumers", e);
  }
  try {
    if (window.consumers) {
      const ev = window.consumers.get("charging_electric");
      if (ev) {
        ev.level_kWh = 0;
      }
      const h2 = window.consumers.get("charging_hydrogen");
      if (h2) {
        h2.level_g = 0;
      }
      if (
        window.consumers &&
        typeof window.consumers.updateTopPanels === "function"
      )
        window.consumers.updateTopPanels();
      const evElem = document.getElementById("consumer-ev-level");
      if (evElem) evElem.textContent = "0.00 kWh";
      const h2Elem = document.getElementById("consumer-h2-level");
      if (h2Elem) h2Elem.textContent = "0.00 g";
      updateHeatConsumersUI();
      updateThermalGaugeUI();
      const stickyThermal = document.getElementById(
        "sticky-thermal-gauge-percentage"
      );
      if (stickyThermal)
        stickyThermal.textContent = formatKWh(thermalStorage.level_kWh);
    }
  } catch (e) {
    console.warn("Failed to reset charging stations", e);
  }
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
      trade.sellElectricity();
    });
  }
  if (resetButton) {
    resetButton.addEventListener("click", resetSimulation);
  }

  if (buyButton) {
    buyButton.addEventListener("click", function (e) {
      e.preventDefault();
      isNotificationVisible = false;
      if (typeof trade.money === "undefined") {
        trade.money = window.money;
      }
      trade.buyElectricity();
      window.money = trade.money;
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

      pv.lastSunStatus = true;
      const sunElem = document.getElementById("sun");
      if (sunElem)
        sunElem.innerHTML =
          '<span class="pv-sun-highlight">Sun is shining</span>';
      document.getElementById("simulation-state").innerHTML = "Charge Mode";

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

      hydro.updateElectrolyzerPower(100000);
      electrolyzerPowerValueDisplay.textContent = 200 + "kW";
      electrolyzerPowerSlider.value = 100000;
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
  try {
    const minBatteryThreshold = 0.1; //kWh minimal required to start
    if (!charge || Number(charge.storage || 0) <= minBatteryThreshold) {
      try {
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
      } catch (e) {
        console.warn("Failed to set arrows static", e);
      }

      const msg = window.getTranslation
        ? window.getTranslation("notEnoughBattery")
        : "Not enough battery energy to start electrolyzer.";
      showNotification(msg, "sell");
      return;
    }

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
    electrolyzerManuallyStopped = false;
    if (electrolyzerInterval === null) {
      electrolyzerInterval = setInterval(() => {
        hydro.produceHydrogen();
      }, 1000);
      console.log("Electrolyzer started");
      try {
        const startMsg = window.getTranslation
          ? window.getTranslation("startElectrolyzer")
          : "Started Electrolyzer!";
        showNotification(startMsg, "buy");
      } catch (e) {
        console.warn("notify start electrolyzer failed", e);
      }
      if (!(charge && charge.storage > 0)) {
        const noBatMsg = window.getTranslation
          ? window.getTranslation("notEnoughBattery")
          : "Electrolyzer started but no battery energy available.";
        showNotification(noBatMsg, "sell");
      }
    }
  } catch (e) {
    console.warn("Failed to start electrolyzer", e);
  }
});

document
  .getElementById("convert-to-electricity")
  .addEventListener("click", () => {
    if (hydro.storage > 0) {
      document.getElementById("simulation-state").innerHTML =
        " Fuel Cell Mode ";
      updateFuelCellArrow(true);
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
      showNotification(
        window.t ? window.t("startedFuelCellMsg") : "Started Fuel Cell!",
        "buy"
      );
      //Starte die Umwandlung im Elektrolyseur, wenn noch kein Intervall läuft
      if (fuelCellInterval === null) {
        fuelCellInterval = setInterval(() => {
          fc.produceElectricity(); //Wasserstoffproduktion schrittweise
        }, 1000); //Alle Sekunde
        console.log("Fuel Cell started");
      }
    } else {
      showNotification(
        window.t ? window.t("noHydrogenStored") : "No hydrogen stored.",
        "sell"
      );
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
      electrolyzerManuallyStopped = true;
      clearInterval(electrolyzerInterval); //Stoppe den Elektrolyseur
      electrolyzerInterval = null;
      console.log("Electrolyzer stopped");
      try {
        const stopMsg = window.getTranslation
          ? window.getTranslation("stopElectrolyzer")
          : "Stopped Electrolyzer!";
        showNotification(stopMsg, "sell");
      } catch (e) {
        console.warn("notify stop electrolyzer failed", e);
      }
    } else {
      electrolyzerManuallyStopped = false;
    }
  });

document
  .getElementById("convert-to-electricity-stop")
  .addEventListener("click", () => {
    document.getElementById("simulation-state").innerHTML = " ";
    updateFuelCellArrow(false);
    showNotification(
      window.t ? window.t("stoppedFuelCellMsg") : "Stopped Fuel Cell!",
      "sell"
    );
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

document.addEventListener("DOMContentLoaded", function () {
  const sellHydrogenAmountInput = document.getElementById(
    "sell-hydrogen-amount"
  );
  const sellHydrogenAmountUnit = document.getElementById(
    "sell-hydrogen-amount-unit"
  );
  const sellHydrogenButton = document.getElementById("sell-hydrogen-button");
  const sellHydrogenPriceSlider = document.getElementById(
    "sell-hydrogen-price-slider"
  );
  const sellHydrogenPriceValue = document.getElementById(
    "sell-hydrogen-price-value"
  );
  const resetSellHydrogenAmountBtn = document.getElementById(
    "reset-sell-hydrogen-amount"
  );
  if (sellHydrogenPriceSlider && sellHydrogenPriceValue) {
    sellHydrogenPriceSlider.addEventListener("input", function () {
      sellHydrogenPriceValue.textContent = sellHydrogenPriceSlider.value;
    });
    sellHydrogenPriceValue.textContent = sellHydrogenPriceSlider.value;
  }
  document
    .querySelectorAll('.trade-increment[data-target="sell-hydrogen-amount"]')
    .forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        const inc = parseFloat(btn.getAttribute("data-inc"));
        if (sellHydrogenAmountInput) {
          let val = parseFloat(sellHydrogenAmountInput.value) || 0;
          val += inc;
          if (val < 0.1) val = 0.1;
          sellHydrogenAmountInput.value = val;
        }
      });
    });
  if (resetSellHydrogenAmountBtn && sellHydrogenAmountInput) {
    resetSellHydrogenAmountBtn.addEventListener("click", function (e) {
      e.preventDefault();
      sellHydrogenAmountInput.value = 0;
    });
  }
  if (sellHydrogenButton && sellHydrogenAmountInput) {
    sellHydrogenButton.addEventListener("click", function () {
      const amount = sellHydrogenAmountInput.value;
      let price = null;
      if (
        typeof sellHydrogenPriceInput !== "undefined" &&
        sellHydrogenPriceInput &&
        sellHydrogenPriceInput.value
      ) {
        price = sellHydrogenPriceInput.value;
      } else {
        const priceEl = document.getElementById("latest-hydrogen-price");
        if (priceEl && priceEl.textContent) {
          price = priceEl.textContent;
        }
      }
      const result = sellHydrogen(amount, price);
      if (result) {
        updateHydrogenStorageDisplay();
      }
    });
  }

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

  updateHydrogenStorageDisplay();
  setInterval(updateHydrogenStorageDisplay, 1000);
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

document.addEventListener("DOMContentLoaded", function () {
  try {
    const heat =
      typeof heaterInstance !== "undefined" && heaterInstance
        ? heaterInstance.produceHeat()
        : null;
    if (heat) updateHeatBreakdownUI(heat);
    updateHeatConsumersUI();
  } catch (e) {
    console.warn("init heat UI failed", e);
  }
});

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

document.addEventListener("DOMContentLoaded", function () {
  try {
    const toggle = document.getElementById("flowchart-toggle");
    if (!toggle) return;
    const flowchart =
      toggle.closest(".flowchart") || document.querySelector(".flowchart");
    if (!flowchart) return;
    function positionFlowSubItems() {
      try {
        const evBlock = document.getElementById("flow-ev-block");
        const h2Block = document.getElementById("flow-h2-block");
        if (!evBlock && !h2Block) return;
        const el = flowchart.querySelector(
          '.flow-item img[alt="Electrolyzer"]'
        );
        const fc = flowchart.querySelector('.flow-item img[alt="Fuel Cell"]');
        const containerRect = flowchart.getBoundingClientRect();
        if (el && evBlock) {
          const r = el.getBoundingClientRect();
          const centerX = r.left + r.width / 2 - containerRect.left - 20;
          evBlock.style.left = Math.round(centerX) + "px";
        }
        if (fc && h2Block) {
          const r2 = fc.getBoundingClientRect();
          const centerX2 = r2.left + r2.width / 2 - containerRect.left - 20;
          h2Block.style.left = Math.round(centerX2) + "px";
        }
      } catch (e) {
        console.warn("positionFlowSubItems failed", e);
      }
    }

    toggle.addEventListener("click", function () {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      if (!expanded) {
        flowchart.classList.add("expanded");
        toggle.setAttribute("aria-expanded", "true");
        toggle.textContent = "▲";

        setTimeout(positionFlowSubItems, 80);
      } else {
        flowchart.classList.remove("expanded");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "▼";
      }
    });

    window.addEventListener("resize", function () {
      if (flowchart.classList.contains("expanded")) positionFlowSubItems();
    });
    setTimeout(() => {
      if (flowchart.classList.contains("expanded")) positionFlowSubItems();
    }, 120);
  } catch (e) {
    console.warn("flowchart toggle init failed", e);
  }
});
