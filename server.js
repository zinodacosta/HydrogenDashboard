import express from 'express';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Korrigiere __dirname für ES-Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Pfad zur config.txt
const configPath = path.join(__dirname, 'config.txt');

// API-URL aus der Datei laden
let apiUrl = '';
try {
    // Laden der URL aus der config.txt
    apiUrl = fs.readFileSync(configPath, 'utf-8').trim();
    console.log('Gelesene API-URL:', apiUrl);  // Diese Zeile gibt den Wert von apiUrl aus

} catch (err) {
    console.error('Fehler beim Laden der API-URL aus der config.txt:', err.message);
    process.exit(1);
}

// Statische Dateien bereitstellen
app.use(express.static(path.join(__dirname, 'public')));

// Funktion: Daten von der API abrufen
async function fetchDataFromApi(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Fehler beim Abrufen der Daten: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API-Fehler:', error.message);
        return { error: 'Fehler beim Abrufen der Daten' };
    }
}

// Endpoint: API-Daten bereitstellen
app.get('/data', async (req, res) => {
    try {
        const response = await fetch(apiUrl); // API-URL aus config.txt
        if (!response.ok) {
            throw new Error(`API-Fehler: ${response.statusText}`);
        }

        const rawData = await response.json(); // API-Daten lesen

        if (!rawData.series || rawData.series.length === 0) {
            throw new Error("Keine Zeitreihen-Daten in den API-Daten gefunden.");
        }

        // Transformiere die Zeitreihen-Daten
        const transformedData = {
            labels: rawData.series.map(entry => new Date(entry[0]).toLocaleString()), // Zeitstempel formatieren
            values: rawData.series.map(entry => entry[1]) // Werte extrahieren
        };

        res.json(transformedData); // An Frontend senden
    } catch (error) {
        console.error('Fehler in /data-Route:', error.message);
        res.status(500).json({ error: 'Fehler beim Abrufen der Daten' });
    }
});




// Index-Seite bereitstellen
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Fehler beim Laden der Index-Seite:', err);
            res.status(500).send('Fehler beim Laden der Seite.');
        }
    });
});

// Server starten
app.listen(port, () => {
    console.log(`Server läuft unter http://localhost:${port}`);
});
