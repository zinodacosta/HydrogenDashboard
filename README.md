## Hydrogen Ecosystem Simulation Platform

Full-Stack Hydrogen Energy System Simulator
Live Demo: https://hydrogenfrontend.vercel.app/

This project is a full-stack web simulation platform that models hydrogen-based energy systems, including photovoltaic generation, battery storage, electrolyzer and fuel-cell operation, thermal recovery, and real-time electricity market interaction.
The simulator has been presented at a hydrogen-technology congress and delivered to an industrial client.

## Features

Interactive simulation of:

Photovoltaic charging

Battery storage

Hydrogen electrolyzer

Hydrogen fuel cell

Thermal energy recovery

Automated electricity trading based on real-time market prices

Smart logic for buying/selling electricity depending on user-defined thresholds

Real-time external data integration:

SMARD API for electricity prices & generation

WeatherAPI for PV conditions

ElectricityMaps for CO₂ intensity

Fully responsive UI with modern gauges & charts

Live deployment (frontend + backend running on Hetzner)

## Tech Stack

Frontend: HTML, CSS, JavaScript, Chart.js
Backend: Node.js, Express
Database: InfluxDB
Hosting: Vercel + Hetzner server (backend)
Architecture: Object-Oriented Simulation Engine (+ real-time data integration)

## Concept Overview

The simulator models an economic hydrogen-energy system by:

Buying electricity from the market when prices fall below a threshold

Using surplus electricity to run an electrolyzer → producing hydrogen

Converting hydrogen back to electricity via a fuel cell when prices rise

Selling electricity back to the market for monetary gain

Efficiencies, machine power ratings, and thermal recovery are modeled; real-world losses (startup, degradation, etc.) are simplified to keep the simulation primitive yet illustrative.

## Thermal Energy Recovery

The simulation models recoverable heat from the electrolyzer and fuel cell.
Heat is computed each tick based on:

recoverable_kWh ≈ (machine_power_kW * dt_hours)
                  * (1 - machine_efficiency)
                  * recoverable_fraction
                  * exchanger_efficiency


Heat is stored in a thermal storage buffer with configurable:

capacity

passive losses

overflow behavior

This provides realistic insight into combined electrical-thermal operation.

## File Structure Overview
File	Purpose
simulation.js	Core hydrogen-system engine (OOP)
server.js	Express backend (API endpoints)
main.js	Frontend charts & UI binding
db.js	InfluxDB connection and queries
graphIdentifiers.json	Graph configuration
counter.json	SMARD API timestamp management
## APIs Used
SMARD API (Electricity Market Data)

Dynamic weekly timestamps

Null-filtering logic

Handles negative market prices

WeatherAPI

Real-time solar irradiance estimation for PV system

ElectricityMaps API

CO₂ intensity for grid electricity

## Changelog (recent highlights)

Complete UI visual overhaul (gauges, layout, responsiveness)

Optimized DOM updates and gauge rendering

Improved simulation tick performance

Better SMARD price parsing and dynamic timestamp logic

Added thermal-energy modeling system

Improved chart performance & data filtering

## Author

Developed end-to-end (frontend, backend, architecture, deployment) by Zino da Costa