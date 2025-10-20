## Changelog

- Visual overhaul: Major UI improvements, modernized gauge visuals, sticky bar and widget consistency, and enhanced layout responsiveness.
- Performance fixes: Optimized DOM updates, improved SVG gauge rendering, and reduced unnecessary reflows for smoother simulation and UI interactions.

Hydrogen Dashboard to get data for power creation and usage from SMARD API, display it graphically and analyze it to compare it with hydrogen as fuel source.

Features Simulation with Charging Photovoltaik, Battery, Hydrogen Electrolyzer and Fuel Cell

Concept:

Essentially, this Simulation is based on buying/selling electricity when the market price reaches a set threshold and respectively converting electricity into hydrogen and converting hydrogen back into electricity
for monetary gains. This has been kept as primitive as possible including efficiency and power of machinery, yet eliminating any implementation of losses for example due to machine start-up, or any other losses tied to the actual buying and selling of electricity (for now). 

File Explanation: 

simulation.js holds the entirety of the Hydrogen Eco System tied to object-oriented programming 
server.js is responsible for all the app.get and app.post requests acting as back-end
main.js is merely used to create the various charts visible on the homepage acting as front-end
db.js connects to InfluxDB and queries the battery, hydrogen and wholesale price to the database
graphIdentifiers.json states all the possible filtering options for the power generation graph
counter.json just acts as a counter to correctly work the SMARD API

Chart.js is used to create the charts for the frontend
InfluxDB has been implemented as database service, which will probably only be useful for personal use, as for commercial use the database will be scraped entirely and the simulation will just be instanced client sided.

API:

The SMARD API (https://www.smard.de)is tricky to evaluate . The URL is filtered after power source, region and resolution, but the timestamp only changes every week at 11pm, meaning logic had to be implemented that dynamically shifts the timestamp after every week.

Data delivered by the SMARD API can be filled with null entries, which have to be filtered out in order for the automated buy and sell logic to work as intended. Furthermore the price can drop down to a negative value, meaning electricity provider pay to sell their money resulting in a negative value, which has to be accounted for when buying, elsewise money will be deducted.

WeatherAPI (https://www.weatherapi.com/) is used to check the current weather state and if the sun can charge the photovoltaik.

ElectricityMaps (https://portal.electricitymaps.com/) is used to get the current local carbon intensity.

### Thermal energy extraction and what it means

The simulation optionally recovers thermal energy from the major electrochemical machines when they operate: primarily the electrolyzer (which converts electricity to hydrogen) and the fuel cell (which converts hydrogen back to electricity). In the model we treat thermal recovery as the portion of the machines' energy throughput that cannot be converted to useful electrical work due to inefficiency and heat losses. Concretely, the code computes recoverable heat each tick from each machine by taking the machine's instantaneous electrical input or output, applying the machine efficiency, and multiplying by a configurable recoverable fraction and heat-exchanger efficiency. The resulting energy (kWh) is then routed into a small thermal storage object (with configurable capacity and losses per hour). The thermal storage level is displayed in the UI (kWh) while the half‑circle gauge fill remains percent‑based.

Important details:
- Sources: electrolyzer and fuel cell are the primary contributors of recoverable thermal energy in the current model. Other sources could be added similarly by exposing their throughput and a recoverable fraction.
- Calculation: recoverable_kWh ≈ (machine_power_kW * dt_hours) * (1 - machine_efficiency) * recoverable_fraction * exchanger_efficiency. The implementation scales rates by the simulation's time-scaling factor (speedfactor) so per‑tick values are consistent across real‑time vs accelerated runs.
- Routing & losses: recovered heat is added to `thermalStorage.level_kWh` up to its configured `capacity_kWh`. The storage experiences passive losses (loss fraction per hour) and any surplus beyond capacity is discarded (or could be routed into other consumers in future extensions).

Real‑world comparisons (for intuition):
- 10 kWh: roughly the energy needed to run a typical electric kettle (~2.2 kW) continuously for ~4.5 hours, or to drive an efficient electric car about 40–60 km depending on efficiency (roughly 150–250 Wh/km). It is also similar to the daily energy usage of a very small apartment for lighting and some appliances.
- 50 kWh: comparable to a larger home battery (many residential battery systems are in the 5–20 kWh range, so 50 kWh is several household batteries), enough to run an electric car ~200–300 km (depending on vehicle efficiency), or to power a medium sized home for a day or two depending on consumption profile.

These comparisons are approximate but help translate the abstract kWh numbers you see in the UI into everyday terms — useful when deciding how much thermal storage capacity to provision for recovered heat from electrochemical processes.


